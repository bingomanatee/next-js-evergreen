"use client"

import plansSchema from '~/lib/managers/packages/plansSchema'
import dataManager from '~/lib/managers/dataManager'
import {Dateable} from "~/types";

function incUpdated(record: Dateable) {
  record.updated = new Date().toISOString();
  if (!record.updated_from) {
    record.updated_from = record.updated;
  }
}

export default async function plansPackage() {
  const db = await (dataManager.db());
  if (db.plans) return;
  const schema = plansSchema(dataManager);
  await dataManager.addCollections(schema);

  // @TODO: buffer this activity for fewer round trips

  Object.keys(schema).forEach((collectionName) => {
     db[collectionName].preSave((record, doc) => {
       incUpdated(record)
     }, false);
     db[collectionName].postSave((record, doc) => {

     });
  });
}
