"use client"
import { addRxPlugin, RxCollection, RxDatabase, RxDatabaseBase, RxDocument } from 'rxdb';
import { wrappedValidateZSchemaStorage } from 'rxdb/plugins/validate-z-schema';

import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';

import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { createRxDatabase } from 'rxdb';
import { combineLatest, map, Observable, Subject } from 'rxjs'

addRxPlugin(RxDBDevModePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);

const anonUserId = process.env.NEXT_PUBLIC_ANON_USER
export type DataManager = {
  db(): Promise<any>,
  anonUserId: string,
  addCollections(colls: Record<string, any>): Promise<any>,
  addCollection(name: string, colls: Record<string, any>): Promise<any>,
  initProject(id: string): Observable<{ frames: RxDocument[], links: RxDocument[] }>
}
const dbPromise: Promise<RxDatabase<any>> = createRxDatabase(
  {
    name: 'planboard3',
    storage: wrappedValidateZSchemaStorage({ storage: getRxStorageDexie() })
  });

const dataManager = {
  async initProject(id): Observable<{ frames: RxDocument[], links: RxDocument[] }> {
    const db = await dbPromise;
    console.log('initProject with db:', db);
    const frames = db.frames.find().where('projectId').eq(id).$;
    const links = db.links.find().where('projectId').eq(id).$;
    return combineLatest([frames, links])
      .pipe(
        map(
          ([frames, links]) => ({ frames, links })
        )
      );
  },
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
    const db = await dbPromise;
    return db.addCollections({ [name]: colls })
  }
}

export default dataManager;
