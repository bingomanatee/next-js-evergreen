import { useContext, useRef } from 'react'
import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import styles from '~/components/pages/PlanEditor/MoveFrameView/MoveFrameView.module.scss'
import stateFactory from './MoveFrameSprite.state';
import useForest from '~/lib/useForest'
import { MFSProps } from '~/components/pages/PlanEditor/MoveFrameView/types'
import { MoveFrameStateContext } from '~/components/pages/PlanEditor/MoveFrameView/MoveFrameView'
import { vectorToStyle } from '~/lib/utils/px'
import { Vector2 } from 'three'
import { dirToString } from '~/types'

export function MoveFrameSprite(props: MFSProps) {
  const planEditorState = useContext(PlanEditorStateCtx);
  const moveState = useContext(MoveFrameStateContext);

  const { dir } = props;

  const [value, state] = useForest([stateFactory,
      props,
      planEditorState,
      moveState],
    (localState) => {
    });

  const {} = value;
  const point = moveState.$.point(dir, POINT_OFFSET);

  return <div
    data-role="move-frame-sprite"
    data-name={dirToString(dir)}
    className={styles['move-frame-sprite']}
    style={vectorToStyle(point)}
    ref={state.do.init}
  >
    &nbsp;
  </div>
}

const SPRITE_BOX_WIDTH = 12;

const POINT_OFFSET = new Vector2(-SPRITE_BOX_WIDTH / 2, -SPRITE_BOX_WIDTH / 2);
