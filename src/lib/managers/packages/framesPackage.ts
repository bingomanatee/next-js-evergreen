"use client"

import framesSchema from '~/lib/managers/packages/framesSchema'
import dataManager from '~/lib/managers/dataManager'

export default async function framesPackage() {
  await dataManager.addCollections(framesSchema(dataManager))
}
