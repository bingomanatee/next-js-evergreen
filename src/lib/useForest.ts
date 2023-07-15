  "use client"

  import { useEffect, useMemo, useRef, useState } from 'react'
  import { Forest } from '@wonderlandlabs/forest'
  import { leafConfig, leafI } from '@wonderlandlabs/forest/lib/types'
  import { useConst } from '@chakra-ui/hooks'

  type configArray = [initializer: (...args: any) => leafConfig, ...rest: any];

  export default function useForest<valueType>(
    config: leafConfig | configArray,
    onCreate?: (leaf: leafI) => unknown,
    debug?: any
  )
    : [value: valueType, state: leafI] {

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
      if (onCreate) {
        if (debug) {
          console.log('---- useForest -- calling onCreate', onCreate, debug)
        }
        onComplete.current = onCreate(localState);
        if (typeof (onComplete.current?.then) === 'function') {
          onComplete.current.then((result) => {
            onComplete.current = result
          });
        }
      } else {
        if (debug) {
          console.log('--- usesForest --- ', debug,  'no on create');
        }
      }
      return localState
    });
    const [value, setValue] = useState<valueType>(state.value);

    useEffect(() => {
        if (!state) {
          return;
        }
        if (debug) {
          console.log('---- useForest -- subscribing to state', debug)
        }
        const sub = state.subscribe(setValue);
        return () => {
          sub.unsubscribe()
          if (typeof onComplete.current === 'function') {
            onComplete.current();
          } else if (typeof (onComplete.current?.then) === 'function') {
            onComplete.current.then((result) => {
              if (typeof result === 'function') {
                result();
              }
            });
          }
          onComplete.current = null;
        };
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [state]);

    return [value, state];
  }
