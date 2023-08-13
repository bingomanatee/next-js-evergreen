import { useContext, useEffect, useRef, useState } from 'react'
import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import styles from '~/components/pages/PlanEditor/MoveFrameView/MoveFrameView.module.scss'
import stateFactory from './MoveFrameSprite.state';
import { dirToString, } from '~/components/pages/PlanEditor/managers/resizeManager.types'
import useForest from '~/lib/useForest'
import { MFSProps } from '~/components/pages/PlanEditor/MoveFrameView/types'
import { cornerStyle } from '~/lib/managers/packages/framesSchema'
import { MoveFrameStateContext } from '~/components/pages/PlanEditor/MoveFrameView/MoveFrameView'
import { vectorToStyle } from '~/lib/utils/px'
import { Vector2 } from 'three'

export function MoveFrameSprite(props: MFSProps) {
  const planEditorState = useContext(PlanEditorStateCtx);
  const moveState = useContext(MoveFrameStateContext);

  const spriteRef = useRef(null);
  const { dir } = props;

  const [value, state] = useForest([stateFactory,
      props,
      planEditorState,
      moveState],
    (localState) => {
      setTimeout(() => {
        localState.do.init(spriteRef.current);
      }, 100)
    });

  const { offset, frame, frameId } = value;

  return <div
    data-role="move-frame-sprite"
    data-name={dirToString(dir)}
    className={state.$.className(styles)}
    style={
      vectorToStyle(moveState.$.point(dir, POINT_OFFSET))
    }
    ref={spriteRef}
  >
    &nbsp;
  </div>
}

const SPRITE_BOX_WIDTH = 12;

const POINT_OFFSET = new Vector2(-SPRITE_BOX_WIDTH/2, -SPRITE_BOX_WIDTH/2);