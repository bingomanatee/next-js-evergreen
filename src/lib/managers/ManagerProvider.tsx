"use client"
import Manager from '~/lib/managers/Manager'
import { useEffect, useState } from 'react'
import ManagerContext from '~/lib/managers/ManagerContext'
import { CanDI } from '@wonderlandlabs/can-di-land'
import dataManager from '~/lib/managers/dataManager'
import messageManager from '~/lib/managers/messageManager'

export default function ManagerProvider({ children }) {

  const [manager, setManager] = useState<CanDI | null>(null);

  useEffect(() => {
    if (!manager) {
      setManager(new CanDI([
        {
          name: 'data', value: dataManager, type: 'comp'
        },
        {
          name: 'messages', value: messageManager, type: 'comp'
        }
      ]));
    }
  }, [setManager, manager])


  return <ManagerContext.Provider value={manager}>
    {children}
  </ManagerContext.Provider>
}
