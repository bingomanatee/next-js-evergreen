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

type LinkFrameProps = {}

export const LinkFrameStateContext = createContext<leafI | null>(null)

export default function LinkFrameView() {
  const planEditorState = useContext(PlanEditorStateCtx);

  const [value, state] = useForest([stateFactory]);
  const { loaded, id, target } = value;

  useEffect(() => {
    if (planEditorState && state) {
      const sub = state.do.init(planEditorState);

      return () => {
        sub?.unsubscribe();
      }
    }
  }, [state, planEditorState])

  useEffect(() => {
    if (!loaded || target.locked) {
      return;
    }
    const elements = window.document.querySelectorAll('[data-frame-container]')

    elements.forEach(
      (e) => {
        e.addEventListener('mouseenter', state.do.onMouseEnter);
        e.addEventListener('mouseleave', state.do.onMouseLeave);
      });

    return () => {
      elements.forEach(
        (e) => {
          e.removeEventListener('mouseenter', state.do.onMouseEnter);
          e.removeEventListener('mouseleave', state.do.onMouseLeave);
        });
    }
  }, [loaded, id, state, target.locked])

  return !(planEditorState && loaded) ? null : (
    <LinkFrameStateContext.Provider value={state}>
      <TargetView data-role="frame-link-target"/>

      <LineView />
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
