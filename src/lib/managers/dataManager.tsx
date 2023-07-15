"use client"
import { addRxPlugin, RxDatabase, RxDocument } from 'rxdb';
import { wrappedValidateZSchemaStorage } from 'rxdb/plugins/validate-z-schema';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { createRxDatabase } from 'rxdb';
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration';
import { BehaviorSubject, combineLatest, map, Observable, Subscription } from 'rxjs'
import { Box2 } from 'three'
import { v4 } from 'uuid';

addRxPlugin(RxDBDevModePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBMigrationPlugin);

function asJson(items: RxDocument[]) {
  if (!Array.isArray(items)) return [];
  return items.map((doc) => {
    try {
      return doc.toJSON();
    } catch(err) {
      return null;
    }
  }).filter((a) => !!a);
}

const anonUserId = process.env.NEXT_PUBLIC_ANON_USER

const dbPromise: Promise<RxDatabase<any>> = createRxDatabase(
  {
    name: 'planboard3',
    storage: wrappedValidateZSchemaStorage({ storage: getRxStorageDexie() })
  });

const dataManager: {
  addCollections(colls: Record<string, any>): Promise<void>;
  initProject(id): Promise<any>;
  addCollection(name: string,
                    colls: Record<string, any>): Promise<any>;
  anonUserId: any;
  poll(id): void;
  addFrame(id: string, bounds: Box2): Promise<void>;
  _productSub: Subscription | null;
  projectStream: BehaviorSubject<{ frames: any[]; links: any[] }>;
  db(): Promise<RxDatabase<any>>
}
  = {
  _productSub: null,
  async initProject(id) {
    if (dataManager._productSub) {
      dataManager._productSub.unsubscribe()
    }
    await dataManager.poll(id);
  },
  async poll(id: string) {
    const db = await dbPromise;

    const frames = await db.frames.find().where('project_id').eq(id).exec();
    const links = await db.links.find().where('project_id').eq(id).exec();
    //@ts-ignore
    dataManager.projectStream.next({ frames: asJson(frames), links: asJson(links) });
  },
  projectStream: new BehaviorSubject({ frames: [], links: [] }),
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
  async addFrame(projectId: string, bounds: Box2) {
    try {
      const db = await dataManager.db();

      let order = 0;
      if (Array.isArray(dataManager.projectStream.value.frames)) {
        dataManager.projectStream.value.frames.forEach((frame) => {
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
        project_id: projectId,
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
      dataManager.poll(projectId);
    } catch (err) {
      console.log('error in adding frame:', err);
    }

  }
}

export default dataManager;
