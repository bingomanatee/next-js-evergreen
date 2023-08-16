import { useState, useEffect, useCallback, useContext } from 'react';
import styles from './LinkFrameSprite.module.scss';
import stateFactory from './LinkFrameSprite.state.ts';
import useForest from '~/lib/useForest'
import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import { LinkFrameStateContext } from '~/components/pages/PlanEditor/LinkFrameView/LinkFrameView'
import { dirToString } from '~/components/pages/PlanEditor/managers/resizeManager.types'
import { vectorToStyle } from '~/lib/utils/px'
import { Vector2 } from 'three'

type LinkFrameSpriteProps = {}

export default function LinkFrameSprite(props: LinkFrameSpriteProps) {
  const planEditorState = useContext(PlanEditorStateCtx);
  const linkState = useContext(LinkFrameStateContext);

  const { dir } = props;

  const [value, state] = useForest([stateFactory,
    props,
    planEditorState,
    linkState]);

  const { } = value;
  return <div
    data-role="move-frame-sprite"
    data-name={dirToString(dir)}
    className={styles.sprite}
    style={
      vectorToStyle(linkState.$.point(dir, POINT_OFFSET))
    }
    ref={state.do.init}
  >
    &nbsp;
  </div>
}

const SPRITE_BOX_WIDTH = 20;

const POINT_OFFSET = new Vector2(-SPRITE_BOX_WIDTH / 2, -SPRITE_BOX_WIDTH / 2);
