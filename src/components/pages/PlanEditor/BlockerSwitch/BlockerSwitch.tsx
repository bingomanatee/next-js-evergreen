import { useState, useEffect, useCallback } from 'react';
/*import styles from './BlockerSwitch.module.scss';
import stateFactory from './BlockerSwitch.state.ts';
import useForest from '~/lib/useForest'*/
import blockManager, { BlockManagerValue, INITIAL } from '~/lib/managers/blockManager'
import dynamic from 'next/dynamic'
import { BlockMode } from '~/types'

type InViewBlockersProps = { inline: boolean }
const views = new Map();

const INLINE_VIEWS = [
  BlockMode.MOVING_FRAME,
  BlockMode.LINKING_FRAME
]

const NON_INLINE_VIEWS = [
  BlockMode.LIST_FRAMES
]
export default function BlockerSwitch(props: InViewBlockersProps) {
  /*  const [value, state] = useForest([stateFactory, props],
      (localState) => {
      });

    const {} = value;*/

  const [blocker, setBlocker] = useState<BlockManagerValue>({ ...INITIAL });

  useEffect(() => {
    const sub = blockManager.subscribe(setBlocker);
    return () => sub.unsubscribe();
  }, [])

  const { type, id } = blocker;
  if (!type) {
    return null;
  }

  //@ts-ignore
  if (props.inline && !(INLINE_VIEWS.includes(type))
    || !props.inline && !(NON_INLINE_VIEWS.includes(type))) {
    return null;
  }

  if (!views.has(type)) {
    switch (type) {
      case BlockMode.MOVING_FRAME:
        views.set(BlockMode.MOVING_FRAME,
          dynamic(() => import ('../MoveFrameView/MoveFrameView'), {
          suspense: true
        }))
        break;

      case BlockMode.EDIT_FRAME:
        views.set(BlockMode.EDIT_FRAME,
          dynamic(() => import ('../FrameDetail/FrameDetail'), {
          suspense: true
        }))
        break;

      case BlockMode.LIST_FRAMES:
        views.set(BlockMode.EDIT_FRAME,
          dynamic(() => import ('../FrameListPanel/FrameListPanel'), {
            suspense: true
          }))
        break;

      case BlockMode.LINKING_FRAME:
        views.set(BlockMode.LINKING_FRAME,
          dynamic(() => import ('../LinkFrameView/LinkFrameView'), {
          suspense: true
        }))
        break;
    }
  }

  let ViewComponent = views.get(type);

  if (!ViewComponent) return null;

  return <ViewComponent blockId={id}/>;
}