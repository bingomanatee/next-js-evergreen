"use client"
import {addRxPlugin, createRxDatabase, RxDatabase, RxDocument} from 'rxdb';
import {wrappedValidateZSchemaStorage} from 'rxdb/plugins/validate-z-schema';
import {RxDBDevModePlugin} from 'rxdb/plugins/dev-mode';
import {RxDBQueryBuilderPlugin} from 'rxdb/plugins/query-builder';
import {getRxStorageDexie} from 'rxdb/plugins/storage-dexie';
import {RxDBMigrationPlugin} from 'rxdb/plugins/migration';
import {
  BehaviorSubject,
  combineLatest, interval,
  map, Observable, skip,
  Subscription, tap, timestamp,
} from 'rxjs'
import {Box2} from 'three'
import {asJson} from '~/lib/utils/schemaUtils'
import {userManager} from '~/lib/managers/userManager'
import {anonUserId, HOUR, SECONDS} from '~/constants'
import {DataStreamItem, Dateable, Frame, Link, Plan, Setting} from '~/types'
import {sortBy} from 'lodash';
import frameMover, {ShufflePos} from '~/lib/utils/frameMover'
import axios from 'axios';
import {v4} from "uuid";
import {NumberEnum} from "@wonderlandlabs/walrus/dist/enums";
import {type} from "@wonderlandlabs/walrus";

addRxPlugin(RxDBDevModePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBMigrationPlugin);

const dbPromise: Promise<RxDatabase<any>> = createRxDatabase(
    {
      name: 'planboard3',
      storage: wrappedValidateZSchemaStorage({storage: getRxStorageDexie()})
    });

type ImageData = {
  url: string,
  width: number,
  height: number
}

type Action = (db: RxDatabase<any>) => Promise<any> | Promise<void>

const framesMap: Map<string, Frame> = new Map();
const settingsMap: Map<string, string | number> = new Map();
const frames: Frame[] = [];
const links: Link[] = [];

class DataManager {

  constructor() {
    this.planStream = new BehaviorSubject(
        {
          plan: null,
          planId: null,
          framesMap,
          frames: frames,
          links: links,
          settingsMap
        });
  }

  polledPlanId(): string | null {
    return this.planStream.value.planId;
  }

  async imageError(id: string, error?: Error) {
    //@TODO: sync with remote
    const frame = await this.fetchFrame(id);
    return frame?.incrementalPatch({
      value: JSON.stringify({
        url: '',
        error: error?.message || 'unknown'
      }),
    });
  }

  moveFrame(frameId: string, direction: ShufflePos): any {
    const self = this;
    return this.do(async (db) => {
      const {frames, framesMap} = self.planStream.value;
      const frame = framesMap.get(frameId);
      if (!frame) {
        return;
      }
      let sorted: Frame[] = sortBy(frames, 'order');
      let newFrames = frameMover(frameId, sorted, direction);

      for (const frame1 of newFrames) {
        const index = newFrames.indexOf(frame1);
        if (frame1.order !== index + 1) {
          const doc = await db.frames.fetch(frame1.id);
          await doc?.incrementalPatch({order: index + 1});
          // @TODO: update to database
        }
      }
    });
  }

  deleteStyleScope(scope: string, tagName: string) {
    return this.do(async (db) => {
      const style = await db.style.findOne({
        selector: {
          $and: [
            {
              tag: {$eq: tagName},
            },
            {
              scope: {$eq: scope}
            }
          ]
        }
      }).exec();
      return style?.remove();
    })
  }

  async deleteFrame(id) {
    // @TODO: convert to is_deleted; persist
    const doc = await this.fetchFrame(id);
    return doc?.remove();
  }

  private _productSub?: Subscription
  private _remoteDataSub?: Subscription

  async do(action: Action) {
    if (typeof action !== 'function') {
      console.error('bad argument to dataManager.do:', action);
      return null;
    }
    const db = await dbPromise;
    return action(db);
  }

  endPoll() {
    this._productSub?.unsubscribe();
    this._remoteDataSub?.unsubscribe();
  }

  async userOwnsPlan(id) {
    return this.do(async (db) => {
      const plans = await db.plans.findByIds([id]).exec();
      return plans.get(id)?.user_id === userManager.$.currentUserId();
    })
  }

  async poll(planId: string) {
    if (!planId) {
      throw new Error('dataManager.poll: id must be nonempty string')
    }
    const isOwned = await this.userOwnsPlan(planId);
    if (!isOwned) {
      this.endPoll();
      throw new Error(`current user does not own plan ${planId}`)
    }
    if (planId === this.polledPlanId()) {
      return;
    }
    this.endPoll();

    const self = this;

    return this.do(async (db) => {
      const [frames, links, plans, settings] = await Promise.all([
        db.frames.find().where('plan_id').eq(planId).$,
        db.links.find().where('plan_id').eq(planId).$,
        db.plans.findByIds([planId]).$,
        db.settings.find().where('plan_id').eq(planId).$
      ]);

      self._productSub = combineLatest([frames, links, plans, planId, settings])
          .pipe(
              // convert documents to POJO
              map(([frames, links, plans, _planId, settings]) => {
                const planJson = plans.get(planId)?.toJSON();
                // @TODO: handle null

                const framesMap = new Map();
                frames.forEach((frame: Frame) => {
                  framesMap.set(frame.id, frame.toJSON());
                })
                const settingsMap: Map<string, string | number> = new Map();
                settings.forEach((setting: Setting) => {
                  settingsMap.set(
                      setting.name,
                      setting.is_number ? setting.number : setting.string
                  )
                });
                const data: DataStreamItem = {
                  plan: planJson,
                  frames: asJson(frames as RxDocument[]) as Frame[],
                  framesMap,
                  links: asJson(links as RxDocument[]) as Link[],
                  planId,
                  settingsMap
                }
                return (data)
              }),
          )
          .subscribe({
            next: async (data) => {
              if (data.plan?.user_id === userManager.$.currentUserId()) {
                self.planStream.next(data);
              } else {
                self.endPoll();
              }
            },
            complete() {
              frames.complete();
              links.complete();
              plans.complete();
              settings.complete();
            }
          });

      Promise.all([
        self.listenForUpdates(planId),
        self.loadRemoteData(planId)
      ]); // note - not waiting for async here intentionally
    });
  }

  private _updateTrigger?: Subscription

  listenForUpdates(planId) {
    try {
      this._updateTrigger?.unsubscribe();
      this._updateTrigger = interval(30 * SECONDS).pipe(
          timestamp(),
          skip(1)
      ).subscribe(() => this.checkRemoteUpdates(planId));
    } catch (err) {
      console.warn('---- error listening to updates:', err);
      eval('debugger');
    }
  }

  private checkRemoteUpdates(planId) {
    axios.get(`/api/updated/${planId}`)
        .then(({data}) => {
          if (data.plan_id === this.polledPlanId()) {
            console.log('updates for ', planId, 'are:', data);
          }
        })
        .catch((err) => {
          console.warn('error getting updates:', err);
        })
  }

  async loadRemoteData(planId) {
    const {data} = await axios.get(`/api/plans/${planId}`);
    if ((planId === this.polledPlanId()) && data.plan) {
      this.do(async (db) => {
        const {frames, links, map_points, frame_images} = data.plan
        db.frames.syncWithServer(frames, planId);
        db.links.syncWithServer(links, planId);
        db.frame_images.syncWithServer(frame_images, planId);
        db.map_points.syncWithServer(map_points, planId);
      });
    }
  }

  planStream: BehaviorSubject<DataStreamItem>

  async db() {
    return dbPromise
  }

  anonUserId = anonUserId

  async addCollections(colls: Record<string, any>) {
    return this.do((db) => {
      try {
        return db.addCollections(colls)
      } catch (err) {
        console.warn('cannot process colls:', colls, err);
        throw err;
      }
    });
  }

  async addCollection(name: string, colls: Record<string, any>) {
    return this.do((db) => {
      if (db[name]) {
        console.error('attempt to redefine existing collection ', name);
        return;
      }
      return db.addCollections({[name]: colls})
    })
  }

  private _nextFrameOrder() {
    const maxOrder = (this.planStream.value.frames ?? [])
        .reduce((maxOrder, frame: Frame) => {
          if (type.describeNumber(frame.order) === NumberEnum.integer) {
            return Math.max(frame.order, maxOrder);
          }
          return maxOrder;
        }, 0);
    return maxOrder + 1;
  }

  async addFrame(plan_id: string, bounds: Box2) {
    // @TODO: move to frame schema
    const self = this;
    await this.do(async (db) => {
      if ((plan_id !== self.polledPlanId())) {
        console.warn('cannot add frame --- poll id has shifted;')
        return;
      }
      let order = self._nextFrameOrder();
      const created = Date.now();
      const newFrame = {
        id: v4(),
        plan_id,
        top: Math.min(bounds.min.y, bounds.max.y),
        left: Math.min(bounds.min.x, bounds.max.x),
        width: Math.round(Math.abs(bounds.min.x - bounds.max.x)),
        height: Math.round(Math.abs(bounds.min.y - bounds.max.y)),
        created,
        updated: created,
        updated_from: created,
        is_deleted: false,
        linkMode: 'center',
        order
      }
      await db.frames.incrementalUpsert(newFrame);
    })
  }

  // getPollFrame gets the frame data (JSON) from the current poll - it is synchronous
  getPollFrame(frameId): Frame | null {
    // returns a frame from the planStream. Synchronous
    return this.planStream.value.framesMap.get(frameId);
  }

// fetchFrame gets a frame DOCUMENT from the store; it is async
  async fetchFrame(frameId): Promise<RxDocument> {
    return this.do(async (db) => {
      const map = await db.frames.findByIds([frameId]).exec();

      //@TODO: validate plan/user access?
      return map?.get(frameId);
    })
  }
}

const dataManager = new DataManager()
export default dataManager;
