"use client"

import framesSchema from '~/lib/managers/packages/framesSchema'
import dataManager from '~/lib/managers/dataManager'

export default async function framesPackage() {
  const db = await(dataManager.db());
  if (db.plans) return;
  await dataManager.addCollections(framesSchema(dataManager))
}
