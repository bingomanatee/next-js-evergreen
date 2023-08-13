import { useContext, useEffect, useRef, useState } from 'react'
import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import styles from '~/components/pages/PlanEditor/MoveFrameView/MoveFrameView.module.scss'
import stateFactory from './MoveFrameSprite.state';
import { dirToString, X_DIR, Y_DIR, } from '~/components/pages/PlanEditor/managers/resizeManager.types'
import useForest from '~/lib/useForest'
import { MoveFrameStateContext } from '~/components/pages/PlanEditor/MoveFrameView/MoveFrameView'
import { vectorToStyle } from '~/lib/utils/px'
import { Vector2 } from 'three'
import Image from 'next/image';

const CENTER = { x: X_DIR.X_DIR_C, y: Y_DIR.Y_DIR_M };

export function DragFrameSprite() {
  const planEditorState = useContext(PlanEditorStateCtx);
  const moveState = useContext(MoveFrameStateContext);

  const spriteRef = useRef(null);

  const [value, state] = useForest([stateFactory,
      { dir: CENTER },
      planEditorState,
      moveState],
    (localState) => {
      setTimeout(() => {
        localState.do.init(spriteRef.current);
      }, 100)
    });

  return <div
    data-role="move-frame-sprite"
    data-name={dirToString(CENTER)}
    className={styles.center}
    style={
      vectorToStyle(
        moveState.$.point(CENTER, POINT_OFFSET))
    }
    ref={spriteRef}
  >
    <Image src="/img/icons/widget-move.svg" width={20} height={20} alt="drag icon"/>
  </div>
}

const CENTER_SPRITE_SIZE = 20;
const POINT_OFFSET = new Vector2(-CENTER_SPRITE_SIZE/2, -CENTER_SPRITE_SIZE/2);
