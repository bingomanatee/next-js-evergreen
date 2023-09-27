import { createContext, useContext, useEffect } from 'react';
import { leafI } from '@wonderlandlabs/forest/lib/types'

import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import useForest from '~/lib/useForest'

// --------- local
import LinkFrameSprite from './LinkFrameSprite/LinkFrameSprite'
import stateFactory from './LinkFrame.state.ts';
import { TargetView } from '~/components/pages/PlanEditor/LinkFrameView/TargetView'
import { X_DIR, Y_DIR } from '~/types'
import LineView from '~/components/pages/PlanEditor/LinkFrameView/LineView/LineView'
import { sub } from 'three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements'

type LinkFrameProps = {}

export const LinkFrameStateContext = createContext<leafI | null>(null)

export default function LinkFrameView() {
  const planEditorState = useContext(PlanEditorStateCtx);

  const [value, state] = useForest([stateFactory],
    (localState) => {
    localState.do.init(planEditorState);
    });
  const { loaded, id, target, type } = value;
  const {locked, id: targetId} = target;

  useEffect(() => {
    if (state.$.canDraw() && locked) {
      state.do.enableSaveQuery();
    } else {
      state.do.disableSaveQuery();
    }

  }, [id, targetId, locked, state])

  useEffect(() => {
    const elements = window.document.querySelectorAll('[data-frame-container]')

    elements.forEach(
      (e) => {
        e.addEventListener('mouseenter', state.do.onMouseEnter);
       // e.addEventListener('mouseleave', state.do.onMouseLeave);
      });

    return () => {
      elements.forEach(
        (e) => {
          e.removeEventListener('mouseenter', state.do.onMouseEnter);
       //   e.removeEventListener('mouseleave', state.do.onMouseLeave);
        });
    }
  }, [state])

  return !loaded ? null : (
    <LinkFrameStateContext.Provider value={state}>
      <TargetView data-role="frame-link-target"/>

      <LineView/>
      <LinkFrameSprite dir={{ x: X_DIR.X_DIR_R, y: Y_DIR.Y_DIR_T }}/>
      <LinkFrameSprite dir={{ x: X_DIR.X_DIR_R, y: Y_DIR.Y_DIR_M }}/>
      <LinkFrameSprite dir={{ x: X_DIR.X_DIR_R, y: Y_DIR.Y_DIR_B }}/>

      <LinkFrameSprite dir={{ x: X_DIR.X_DIR_L, y: Y_DIR.Y_DIR_T }}/>
      <LinkFrameSprite dir={{ x: X_DIR.X_DIR_L, y: Y_DIR.Y_DIR_M }}/>
      <LinkFrameSprite dir={{ x: X_DIR.X_DIR_L, y: Y_DIR.Y_DIR_B }}/>

      <LinkFrameSprite dir={{ x: X_DIR.X_DIR_C, y: Y_DIR.Y_DIR_T }}/>
      <LinkFrameSprite dir={{ x: X_DIR.X_DIR_C, y: Y_DIR.Y_DIR_M }}/>
      <LinkFrameSprite dir={{ x: X_DIR.X_DIR_C, y: Y_DIR.Y_DIR_B }}/>

    </LinkFrameStateContext.Provider>
  );
}
