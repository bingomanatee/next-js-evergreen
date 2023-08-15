"use client"

import { createContext, useContext, useEffect } from 'react';
import { Box } from '@chakra-ui/react'
import { X_DIR, Y_DIR } from '~/components/pages/PlanEditor/managers/resizeManager.types'
import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import { MoveFrameSprite } from '~/components/pages/PlanEditor/MoveFrameView/MoveFrameSprite'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import useForest from '~/lib/useForest'
import stateFactory from './MoveFrameView.state'
import px from '~/lib/utils/px'
import { DragFrameSprite } from '~/components/pages/PlanEditor/MoveFrameView/DragFrameSprote'
import keyManager from '~/lib/managers/keyManager'
import blockManager from '~/lib/managers/blockManager'

//@ts-ignore
export const MoveFrameStateContext = createContext<leafI>(null);

export default function MoveFrameView() {
  const planEditorState = useContext(PlanEditorStateCtx);

  const [value, state] = useForest([stateFactory]);
  const { id, loaded, type} = value;
  useEffect(() => {
    if (planEditorState && state) {
      const sub = state.do.init(planEditorState);
      keyManager.init();
      let keySub = keyManager.stream.subscribe((keys) => {
        if (keys.has('Escape')) {
          blockManager.do.finish();
        /*  if (blockManager.value.type === planEditorMode.MOVING_FRAME) {
          }*/
        }
      });
      return () => {
        sub?.unsubscribe();
        keySub?.unsubscribe();
      }
    }
  }, [state, planEditorState])

  return !(planEditorState && loaded) ? null : (
    <MoveFrameStateContext.Provider value={state}>
      {id ? <Box layerStyle="move-outline"
                 data-role="move-outline"
                 left={px(state.$.left())}
                 top={px(state.$.top())}
                 w={px(state.$.width())}
                 h={px(state.$.height())}
      /> : null}

      {type === 'image' ? null : (
        <>
          <MoveFrameSprite
            dir={{ x: X_DIR.X_DIR_R, y: Y_DIR.Y_DIR_M }}
          />
          <MoveFrameSprite
            dir={{ x: X_DIR.X_DIR_L, y: Y_DIR.Y_DIR_M }}
          />
          <MoveFrameSprite
            dir={{ x: X_DIR.X_DIR_C, y: Y_DIR.Y_DIR_T }}
          />
          <MoveFrameSprite
            dir={{ x: X_DIR.X_DIR_C, y: Y_DIR.Y_DIR_B }}
          />
        </>
      )}

      <DragFrameSprite/>
    </MoveFrameStateContext.Provider>
  );
}
