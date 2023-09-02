import { useEffect, useMemo, useState } from 'react';
/*import styles from './BlockerSwitch.module.scss';
import stateFactory from './BlockerSwitch.state.ts';
import useForest from '~/lib/useForest'*/
import blockManager, { BlockManagerValue, INITIAL } from '~/lib/managers/blockManager'
import dynamic from 'next/dynamic'
import { BlockMode } from '~/types'
import keyManager from '~/lib/managers/keyManager'
import { Spinner } from '@chakra-ui/react'
import { Suspense } from 'react';

type InViewBlockersProps = { inline?: boolean, role: string }
const views = new Map();

const INLINE_VIEWS = [
  BlockMode.MOVING_FRAME,
  BlockMode.LINKING_FRAME,
]

const NON_INLINE_VIEWS = [
  BlockMode.LIST_FRAMES,
  BlockMode.EDIT_FRAME,
]

export default function BlockerSwitch({ role, inline = false }: InViewBlockersProps) {
  const [blocker, setBlocker] = useState<BlockManagerValue>({ ...INITIAL });

  useEffect(() => {
    const sub = blockManager.subscribe(setBlocker);
    return () => {
      sub.unsubscribe();
    };

  }, []);

  const { type, id } = blocker;


  const validType = useMemo(() => {
      if (!type) {
        return null;
      }

      if ((!inline) && !NON_INLINE_VIEWS.includes(type)) {
        return null;
      }
      if (inline && !INLINE_VIEWS.includes(type)) {
        return null;
      }
      return type;
    },
    [type, inline, role]);


  useEffect(() => {
    keyManager.init();
    let keySub = keyManager.stream.subscribe((keys) => {
      if (keys.has('Escape') && validType) {
        blockManager.do.finish();
      }
    });
    return () => {
      keySub.unsubscribe();
    };
  }, [validType]);

  if (validType && !views.has(validType)) {
    switch (validType) {
      case BlockMode.MOVING_FRAME:
        views.set(validType,
          dynamic(() => import ('../MoveFrameView/MoveFrameView'), {
            suspense: true
          }))
        break;

      case BlockMode.EDIT_FRAME:
        views.set(validType,
          dynamic(() => import ('../FrameDetail/FrameDetail'), {
            suspense: true
          }))
        break;

      case BlockMode.LIST_FRAMES:
        views.set(validType,
          dynamic(() => import ('../FrameListPanel/FrameListPanel'), {
            suspense: true
          }))
        break;

      case BlockMode.LINKING_FRAME:
        views.set(validType,
          dynamic(() => import ('../LinkFrameView/LinkFrameView'), {
            suspense: true
          }))
        break;

      case null:
        break;

      default:
        throw new Error('cannot load ' + validType)
    }
  }

  let ViewComponent = views.get(validType);

  if (!ViewComponent) {
    return null;
  }

  return (
    <Suspense fallback={<Spinner/>}>
      <ViewComponent blockId={id}/>
    </Suspense>
  )
}
