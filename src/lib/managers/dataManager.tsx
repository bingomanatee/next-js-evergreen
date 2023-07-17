"use client"
import { addRxPlugin, createRxDatabase, RxDatabase } from 'rxdb';
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
import { Frame, Plan } from '~/types'

addRxPlugin(RxDBDevModePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBMigrationPlugin);

type PlanData = { plan: Plan | null, links: any[], frames: Frame[] }

const dbPromise: Promise<RxDatabase<any>> = createRxDatabase(
  {
    name: 'planboard3',
    storage: wrappedValidateZSchemaStorage({ storage: getRxStorageDexie() })
  });

type DataManager = {
  addCollections(colls: Record<string, any>): Promise<void>;
  initPlan(id): Promise<void>;
  addCollection(name: string, colls: Record<string, any>): Promise<any>;
  plan: null;
  anonUserId: string;
  addFrame(planId: string, bounds: Box2): Promise<void>;
  _productSub?: Subscription;
  poll(id: string, userId): Promise<void>;
  planStream: BehaviorSubject<PlanData>;
  plan: Plan | null;
  db(): Promise<RxDatabase<any>>;
  userOwnsPlan(planId: string): boolean;
}

const dataManager: { initPlan(id: string): Promise<void>; anonUserId: any; _productSub: undefined; endPoll(): void; poll(id: string): Promise<void>; loadPlan(id): Promise<void>; userOwnsPlan(id): Promise<boolean>; addCollections(colls: Record<string, any>): Promise<void>; planStream: BehaviorSubject<{ frames: any[]; links: any[]; plan: null }>; addCollection(name: string, colls: Record<string, any>): Promise<any>; addFrame(planId: string, bounds: Box2): Promise<void>; plan: null; db(): Promise<RxDatabase<any>> } = {
  _productSub: undefined,
  async initPlan(id: string) {
    if (!id) {
      throw new Error('initPlan: id must be nonempty string')
    }
    const isOwned = await dataManager.userOwnsPlan(id);
    if (!isOwned) throw new Error(`current user does not own plan ${id}`)
    await dataManager.poll(id);
  },
  plan: null,
  endPoll() {
    dataManager._productSub?.unsubscribe();
    console.log('ending poll');
  },
  async userOwnsPlan(id) {
    const db = await dataManager.db();
    const plans = await db.plans.findByIds([id]).exec();
    console.log('userOwnsPlan.plans are ', plans);
    const plan = plans.get(id);
    if (!plan) throw (`cannot find plan ${id}`)
    const userId = userManager.$.currentUserId();
    if (plan.user_id === userId) return true;
    console.error(plan?.toJSON(), 'plan is not owned by user:', userManager.value.user);
    return false;
  },
  async poll(id: string) {
    await dataManager.endPoll();
    const db = await dataManager.db();
    const frames = await db.frames.find().where('plan_id').eq(id).$;
    const links = await db.links.find().where('plan_id').eq(id).$;
    console.log('db plans = ', db.plans);
    const plans = await db.plans.findByIds([id]).$;
    dataManager._productSub = combineLatest([
      frames,
      links,
      plans
    ])
      .pipe(
        // convert documents to POJO
        map(([frames, links, plan]) => {
          const planJson = plan.has(id) ? plan.get(id).toJSON() : null;
          //@ts-ignore
          return ({ plan: planJson, frames: asJson(frames), links: asJson(links) })
        }),
      )
      .subscribe(async (data) => {
        console.log('--- poll data plan = ', data.plan, data, 'comp user id = ', userManager.$.currentUserId());
        if (data.plan?.user_id === userManager.$.currentUserId()) {
          console.log('sending data', data);
          dataManager.planStream.next(data);
        } else {
          console.log('ending poll');
          dataManager.endPoll();
        }
      });
  },
  planStream: new BehaviorSubject({ plan: null, frames: [], links: [] }),
  async db() {
    return dbPromise;
  },
  anonUserId,
  async addCollections(colls: Record<string, any>) {
    const db = await dbPromise;
    try {
      console.log('loading colls:', colls);
      await db.addCollections(colls)
    } catch (err) {
      console.warn('cannot process colls:', colls, err);
      throw err;
    }
  },
  async addCollection(name: string, colls: Record<string, any>) {
    const db = await dataManager.db();
    return db.addCollections({ [name]: colls })
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
  }
}

export default dataManager;
