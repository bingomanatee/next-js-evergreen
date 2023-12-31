import { useState, useEffect, useCallback, useContext } from 'react';
import styles from './LinkFrameSprite.module.scss';
import stateFactory from './LinkFrameSprite.state.ts';
import useForest from '~/lib/useForest'
import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import { LinkFrameStateContext } from '~/components/pages/PlanEditor/LinkFrameView/LinkFrameView'
import px, { vectorToStyle } from '~/lib/utils/px'
import { Vector2 } from 'three'
import planEditorState from '~/components/pages/PlanEditor/PlanEditor.state'
import { sameDir } from '~/components/pages/PlanEditor/util'
import useForestFiltered from '~/lib/useForestFiltered'
import { Direction, dirToString } from '~/types'

type LinkFrameSpriteProps = { dir: Direction, isEnd?: boolean }

export default function LinkFrameSprite(props: LinkFrameSpriteProps) {
  const linkState = useContext(LinkFrameStateContext);
  const planEditorState = useContext(PlanEditorStateCtx);
  const {zoom} = useForestFiltered(planEditorState!, ['zoom'])


  const { dir, isEnd } = props;

  const [_value, state] = useForest([stateFactory, props, linkState]);

  const frameStyle = linkState!.$.style(dir, POINT_OFFSET, isEnd, zoom);

  const spriteDir = useForestFiltered(linkState!, 'spriteDir');
  const targetSpriteDir = useForestFiltered(linkState!.child('target')!, 'spriteDir');

  const active = sameDir(dir, isEnd ? targetSpriteDir : spriteDir);

  const size = px(Math.round(SPRITE_BOX_WIDTH * 100 / zoom), true);

  return (
    <div
      data-role="link-frame-sprite"
      data-name={dirToString(dir)}
      className={active ? styles['sprite-active'] : styles.sprite}
      style={
        {...vectorToStyle(frameStyle), width: size, height: size, borderWidth: px(200 / zoom, true)}
      }
      ref={state.do.init}
      onClick={state.do.onClick}
    >
      &nbsp;
    </div>
  )
}

const SPRITE_BOX_WIDTH = 20;

export const POINT_OFFSET = new Vector2(-SPRITE_BOX_WIDTH / 2, -SPRITE_BOX_WIDTH / 2);
