"use client"

import blockManagerFactory from '~/lib/managers/blockManager'
import { CanDI } from '@wonderlandlabs/can-di-land'
import framesSchema from '~/lib/managers/packages/framesSchema'

export default async function framesPackage(manager: CanDI, mode) {
  manager.add('blocker', blockManagerFactory, 'comp');
  manager.when(['data', 'user']).subscribe( ([dataManager, userStore]) => {
     dataManager.addCollections(framesSchema(dataManager, userStore))
  });
}
