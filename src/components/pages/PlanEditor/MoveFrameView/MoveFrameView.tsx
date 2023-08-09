"use client"

import { useContext, useEffect } from 'react';
import stateFactory from './MoveFrameView.state.ts';
import useForest from '~/lib/useForest';
import { PlanEditorStateValue } from '~/components/pages/PlanEditor/PlanEditor.state'
import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { Spinner } from '@chakra-ui/react'
import { X_DIR, Y_DIR } from '~/components/pages/PlanEditor/managers/resizeManager.types'
import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import { MoveFrameSprite } from '~/components/pages/PlanEditor/MoveFrameView/MoveFrameSprite'

type MoveFrameViewProps = { planEditorState: typedLeaf<PlanEditorStateValue> };

/**
 * AS the style initializer is async,
 * we can't use the standard Forest hooks here
 */
export default function MoveFrameView(props: MoveFrameViewProps) {
  const planEditorState = useContext(PlanEditorStateCtx);

  const [value, state] = useForest([stateFactory] );

  useEffect(() => {
    if (state && planEditorState) {
      state.do.init(planEditorState);
    }
  }, [state, planEditorState])

  return (<>
    {(!(state && planEditorState)) ? <Spinner/> : null}
    <MoveFrameSprite
      dir={{ x: X_DIR.X_DIR_R, y: Y_DIR.Y_DIR_M }}
      moveState={state}
    />
    <MoveFrameSprite
      dir={{ x: X_DIR.X_DIR_L, y: Y_DIR.Y_DIR_M }}
      moveState={state}
    />
  </>);
}
