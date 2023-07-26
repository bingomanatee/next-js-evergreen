  "use client"

  import { useEffect, useMemo, useRef, useState } from 'react'
  import { Forest } from '@wonderlandlabs/forest'
  import { leafConfig, leafI } from '@wonderlandlabs/forest/lib/types'
  import { useConst } from '@chakra-ui/hooks'
  import { isPromise } from '~/types'

  type configArray = [initializer: (...args: any) => leafConfig, ...rest: any];

  export default function useForest<valueType>(
    config: leafConfig | configArray,
    onCreate?: (leaf: leafI) => unknown,
    debug?: any
  )
    : [value: valueType, state: leafI] {

    let [value, setValue] = useState<valueType>(null);

    const onComplete = useRef<any>(null);
    const state = useConst(() => {
      if (debug) {
        console.log('---- useForest -- creating state', debug)
      }
      let initializer = config;
      if (Array.isArray(config)) {
        initializer = config[0](...config.slice(1))
      }
      const localState = new Forest(initializer);
      value = localState.value;

      if (onCreate) {
        if (debug) {
          console.log('---- useForest -- calling onCreate', onCreate, debug)
        }
        onComplete.current = onCreate(localState);
        if (isPromise(onComplete.current)) {
          onComplete.current.then((result) => {
            onComplete.current = result
          });
        }
      } else {
        if (debug) {
          console.log('--- usesForest --- ', debug,  'no on create');
        }
      }
      localState.subscribe(setValue);
      return localState
    });

    return [value || state.value, state];
  }
