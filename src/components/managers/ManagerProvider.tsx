"use client"
import Manager from '~/components/managers/Manager'
import { useEffect, useState } from 'react'
import ManagerContext from '~/components/managers/ManagerContext'

export default function ManagerProvider({onManager, children}: {onManager?: (manager: Manager) => void}) {

  const [manager] = useState(new Manager());

  useEffect(() => {
    onManager && onManager(manager);
  }, [manager, onManager])

  return <ManagerContext value={manager}>
    {children}
  </ManagerContext>
}
