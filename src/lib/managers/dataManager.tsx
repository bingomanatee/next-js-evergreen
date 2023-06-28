"use client"
import { addRxPlugin, RxCollection, RxDatabase, RxDatabaseBase, RxDocument } from 'rxdb';
import { wrappedValidateZSchemaStorage } from 'rxdb/plugins/validate-z-schema';

import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';

addRxPlugin(RxDBDevModePlugin);
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';

addRxPlugin(RxDBQueryBuilderPlugin);
let count = 0;
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { createRxDatabase } from 'rxdb';
import Dexie, { DexieOptions } from 'dexie'
import Table = Dexie.Table
import { combineLatest, map, Observable, Subject } from 'rxjs'

const anonUserId = process.env.NEXT_PUBLIC_ANON_USER
export type DataManager = {
  db: any,
  anonUserId: string,
  addCollections(colls: Record<string, any>): Promise<any>,
  addCollection(name: string, colls: Record<string, any>): Promise<any>,
  initProject(id: string) : Observable<{frames: RxDocument[], links: RxDocument[]}>
}

export default async function dataManager(): Promise<DataManager> {
  const db = await createRxDatabase(
    {
      name: 'planboard3',
      storage: wrappedValidateZSchemaStorage({ storage: getRxStorageDexie() })
    });
  return {
    initProject(id) : Observable<{frames: RxDocument[], links: RxDocument[]}> {
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
    db,
    anonUserId,
    async addCollections(colls: Record<string, any>) {
      try {
        console.log('loading colls:', colls);
        await db.addCollections(colls)
      } catch (err) {
        console.warn('cannot process colls:', colls, err);
        throw err;
      }
    },
    async addCollection(name: string, colls: Record<string, any>) {
      return db.addCollections({ [name]: colls })
    }
  };

}
