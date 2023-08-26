import { useState, useEffect, useCallback } from 'react';
/*import styles from './BlockerSwitch.module.scss';
import stateFactory from './BlockerSwitch.state.ts';
import useForest from '~/lib/useForest'*/
import { planEditorMode } from './../PlanEditor.state'
import blockManager, { BlockManagerValue, INITIAL } from '~/lib/managers/blockManager'
import dynamic from 'next/dynamic'

type InViewBlockersProps = { inline: boolean }
const views = new Map();

const INLINE_VIEWS = [
  planEditorMode.MOVING_FRAME,
  planEditorMode.LINKING_FRAME
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
  if (props.inline && !(INLINE_VIEWS.includes(type))) {
    return null;
  }
  //@ts-ignore
  if (!props.inline && INLINE_VIEWS.includes(type)) {
    return null;
  }

  if (!views.has(type)) {
    switch (type) {
      case planEditorMode.MOVING_FRAME:
        views.set(planEditorMode.MOVING_FRAME,
          dynamic(() => import ('../MoveFrameView/MoveFrameView'), {
          suspense: true
        }))
        break;

      case planEditorMode.EDIT_FRAME:
        views.set(planEditorMode.EDIT_FRAME,
          dynamic(() => import ('../FrameDetail/FrameDetail'), {
          suspense: true
        }))
        break;

      case planEditorMode.LINKING_FRAME:
        views.set(planEditorMode.LINKING_FRAME,
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
