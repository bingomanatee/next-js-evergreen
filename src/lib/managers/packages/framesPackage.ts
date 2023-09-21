"use client"

import framesSchema from '~/lib/managers/packages/framesSchema'
import dataManager from '~/lib/managers/dataManager'

function incUpdated(record: Dateable) {
  record.updated = Date.now();
}

export default async function framesPackage() {
  const db = await (dataManager.db());
  if (db.plans) return;
  const schema = framesSchema(dataManager);
  await dataManager.addCollections(schema);
  Object.keys(schema).forEach((collectionName) => {
     db[collectionName].preSave((record, doc) => {incUpdated(record)}, false);
     db[collectionName].postSave((record, doc) => dataManager.syncRecord(collectionName, record, document));
  });
}
