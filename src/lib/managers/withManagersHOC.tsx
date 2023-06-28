import { FC, memo, PropsWithChildren, useContext, useEffect, useState } from 'react'
import ManagerContext from '~/lib/managers/ManagerContext'
import { ManagerMap } from '~/lib/managers/types'
import Manager from '~/lib/managers/Manager'
import { Spinner } from '@chakra-ui/react'


export default function withManagers<Props = Record<string, any>>(
  names: string[],
  Component,
  Standin?
) {

  function Wrapped(props: PropsWithChildren<Props>) {
    const manager: Manager = useContext(ManagerContext);
    const [managerMap, setMM] = useState(new Map());
    useEffect(() => {
      if (!manager) return;
      (async () => {
        const foundMap = await manager.withManagers(names);
        setMM(foundMap);
      })()
    }, [manager]);

    if (managerMap.size > 0) {
      return <Component managers={managerMap} {...props} />
    }

    return Standin || <Spinner size='lg'/>
  }

  return Wrapped;
}
