"use client"
import { addRxPlugin, createRxDatabase, RxDatabase, RxDocument } from 'rxdb';
import { wrappedValidateZSchemaStorage } from 'rxdb/plugins/validate-z-schema';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration';
import { BehaviorSubject, combineLatest, map, Subscription, tap } from 'rxjs'
import { Box2 } from 'three'
import { v4 } from 'uuid';
import { asJson } from '~/lib/utils/schemaUtils'
import { userManager } from '~/lib/managers/userManager'
import { anonUserId } from '~/constants'
import { Frame, Link, Plan } from '~/types'
import {sortBy} from 'lodash';
import * as frameMover from '~/lib/utils/frameMover';
import { link } from 'fs'

addRxPlugin(RxDBDevModePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBMigrationPlugin);

type PlanData = { plan: Plan | null, links: any[], frames: Frame[] }

const dbPromise: Promise<RxDatabase<any>> = createRxDatabase(
  {
    name: 'planboard3',
    storage: wrappedValidateZSchemaStorage({ storage: getRxStorageDexie() })
  });

type DataStreamItem = {
  frames: any[];
  links: any[];
  framesMap: Map<string, Frame>
  planId: string | null,
  plan: Plan | null
}
type DataManager = {
  userOwnsPlan(id): Promise<boolean>;
  addCollections(colls: Record<string, any>): Promise<void>;
  planStream: BehaviorSubject<DataStreamItem>;
  initPlan(id: string): Promise<void>;
  addCollection(name: string, colls: Record<string, any>): Promise<any>;
  anonUserId: any;
  addFrame(planId: string, bounds: Box2): Promise<void>;
  _productSub?: Subscription;
  endPoll(): void;
  poll(id: string): Promise<void>;
  plan: null;
  db(): Promise<RxDatabase<any>>
  do(action: Action)
  deleteFrame(id): Promise<void>
  deleteState(scope: string, tagName: string): void
  moveFrame(currentFrameId: string, direction: string): any
}

type Action = (db: RxDatabase<any>) => Promise<any> | Promise<void>

const framesMap: Map<string, Frame> = new Map();
const frames: Frame[] = [];
const links: Link[] = [];

const planStream: BehaviorSubject<DataStreamItem> = new BehaviorSubject(
  {
    plan: null,
    planId: null,
    framesMap,
    frames: frames,
    links: links
  })

const dataManager: DataManager = {
  moveFrame(frameId: string, direction: string): any {
    dataManager.do(async (db) => {
      const {frames, framesMap} = dataManager.planStream.value;
      const frame = framesMap.get(frameId);
      if (!frame) {
        return;
      }
      let sorted = sortBy(frames, 'order');
      let newFrames = frameMover[direction](sorted, frameId);

      newFrames.forEach((frame, index) => {
        if (frame.order !== index + 1) {
          db.frames.incrementalPatch({id: frame.id, order: index + 1})
        }
      })
    });
  },
  deleteState(scope: string, tagName: string) {
    dataManager.do(async (db) => {
      const style = await db.style.findOne({
        selector: {
          $and: [
            {
              tag: {
                $eq: tagName
              },
            },
            {
              scope: {
                $eq: scope
              }
            }
          ]
        }
      }).exec();

      if (style) {
        console.log('removing document ', style);
        return style.remove();
      } else {
        console.log('cannot find style to delete:', scope, tagName);
      }
    })
  },
  async deleteFrame(id) {
    return dataManager.do(async (db) => {
      const doc = await db.frames.findOne()
        .where('id')
        .eq(id).exec();

      return doc?.remove();
    })
  },
  _productSub: undefined,
  async initPlan(id: string) {
    if (!id) {
      throw new Error('initPlan: id must be nonempty string')
    }
    const isOwned = await dataManager.userOwnsPlan(id);
    if (!isOwned) {
      throw new Error(`current user does not own plan ${id}`)
    }
    await dataManager.poll(id);
  },
  async do(action: Action) {
    if (typeof action !== 'function') {
      console.error('bad argument to dataManager.do:', action);
      return null;
    }
    const db = await dbPromise;
    return action(db);
  },
  plan: null,
  endPoll() {
    dataManager._productSub?.unsubscribe();
  },
  async userOwnsPlan(id) {
    const db = await dataManager.db();
    const plans = await db.plans.findByIds([id]).exec();
    const plan = plans.get(id);
    if (!plan) {
      throw (`cannot find plan ${id}`)
    }
    const userId = userManager.$.currentUserId();
    if (plan.user_id === userId) {
      return true;
    }
    console.error(plan?.toJSON(), 'plan is not owned by user:', userManager.value.user);
    return false;
  },
  async poll(planId: string) {
    await dataManager.endPoll();
    dataManager.do(async (db) => {
      const frames = await db.frames.find().where('plan_id').eq(planId).$;
      const links = await db.links.find().where('plan_id').eq(planId).$;
      const plans = await db.plans.findByIds([planId]).$;
      dataManager._productSub = combineLatest([
        frames,
        links,
        plans,
        planId
      ])
        .pipe(
          // convert documents to POJO
          map(([frames, links, plans]) => {
            const planJson = plans.get(planId)?.toJSON();

            const framesMap = new Map();
            frames.forEach((frame: Frame) => {
              framesMap.set(frame.id, frame);
            })

            const data: DataStreamItem = {
              plan: planJson,
              frames: asJson(frames as RxDocument[]),
              framesMap,
              links: asJson(links as RxDocument[]),
              planId
            }
            return (data)
          }),
        )
        .subscribe(async (data) => {
          if (data.plan?.user_id === userManager.$.currentUserId()) {
            dataManager.planStream.next(data);
          } else {
            dataManager.endPoll();
          }
        });
    })

  },
  planStream,
  async db() {
    return dbPromise;
  },
  anonUserId,
  async addCollections(colls: Record<string, any>) {
    return dataManager.do((db) => {
      try {
        return db.addCollections(colls)
      } catch (err) {
        console.warn('cannot process colls:', colls, err);
        throw err;
      }
    });
  },
  async addCollection(name: string, colls: Record<string, any>) {
    return dataManager.do((db) => {
      return db.addCollections({ [name]: colls })
    })
  },
  async addFrame(planId: string, bounds: Box2) {
    try {
      const db = await dataManager.db();

      let order = 0;
      if (Array.isArray(dataManager.planStream.value.frames)) {
        dataManager.planStream.value.frames.forEach((frame) => {
          if (frame.order > order) {
            order = frame.order;
          }
        })
      }
      if (Number.isNaN(order)) {
        order = 0;
      } else {
        order += 1;
      }

      const newFrame = {
        id: v4(),
        plan_id: planId,
        top: Math.min(bounds.min.y, bounds.max.y),
        left: Math.min(bounds.min.x, bounds.max.x),
        width: Math.round(Math.abs(bounds.min.x - bounds.max.x)),
        height: Math.round(Math.abs(bounds.min.y - bounds.max.y)),
        created: Date.now(),
        linkMode: 'center',
        order
      }

      console.log('adding frame', newFrame);
      await db.frames.incrementalUpsert(newFrame);
    } catch (err) {
      console.log('error in adding frame:', err);
    }
  },
  async fetchFrame(frameId) {
    return dataManager.do(async (db) => {
      const map = await db.frames.findByIds([frameId])
      return map.get(frameId);
    })
  }
}

export default dataManager;
