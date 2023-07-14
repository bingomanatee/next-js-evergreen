/* eslint-disable react-hooks/rules-of-hooks */
import { PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react'
import ManagerContext from '~/lib/managers/ManagerContext'
import { Spinner, VStack, Text } from '@chakra-ui/react'


/**
 * @TODO: include timeout
 *
 * wraps a component with a set of required menagers; returns null until
 * the first time the imports are present, then passes them through
 * to the component in the 'managers' prop.
 *
 * Displays spinner while managers are pending
 */

export default function withManagers<Props = Record<string, any>>(
  names: string[],
  Component,
  Standin?
) {

  function Wrapped(props: PropsWithChildren<Props>) {
    const manager = useContext(ManagerContext);
    const [managerMap, setMM] = useState(new Map());
    const [pkg, usePkg] = useState([]);

    useEffect(() => {
      const sub = manager.when(names).subscribe((list) => {
        const map = new Map();
        names.forEach((name, index) => map.set(name, list[index]))
        sub?.unsubscribe();
      });
      return () => sub?.unsubscribe();
    }, [manager, names]);

    if (names.every((n) => manager?.has(n))) {
      return <Component managers={managerMap} {...props} />
    }

    return Standin ||(
      <VStack>
      <Spinner size='lg'/>
      <Text>Waiting for {names.filter(n => !pkg.includes(n)).join(', ')}</Text>
    </VStack>
    )
  }

  return Wrapped;
}
