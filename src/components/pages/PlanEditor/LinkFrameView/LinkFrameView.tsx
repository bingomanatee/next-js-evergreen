import { createContext, memo, useContext, useEffect, useMemo, useState } from 'react';
import { Button, CloseButton, HStack, IconButton, Text } from '@chakra-ui/react'
import { leafI } from '@wonderlandlabs/forest/lib/types'

import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import { X_DIR, Y_DIR } from '~/components/pages/PlanEditor/managers/resizeManager.types'
import { Frame } from '~/types'
import useForest from '~/lib/useForest'
import dataManager from '~/lib/managers/dataManager'
import { frameToStyle } from '~/lib/utils/px'

// --------- local

import LinkFrameSprite from './LinkFrameSprite/LinkFrameSprite'
import stateFactory from './LinkFrame.state.ts';
import styles from './LinkFrame.module.scss';
import useForestFiltered from '~/lib/useForestFiltered'

type LinkFrameProps = {}

export const LinkFrameStateContext = createContext<leafI | null>(null)

function TargetView({ state }) {
  const [frame, setFrame] = useState<Frame | null>(null);

  const { id, targetFrameId, lockedTarget } = useForestFiltered(
    state,
    ['id', 'targetFrameId', 'lockedTarget']
  );

  const targetId = useMemo(() => {
    return lockedTarget || targetFrameId
  }, [targetFrameId, lockedTarget])

  useEffect(() => {
    if (!targetId || targetId === id) {
      setFrame(null);
      return;
    }

    if (frame?.id === targetId) {
      return;
    }

    dataManager.do(async (db) => {
      if (!targetId) {
        setFrame(null);
        return;
      }
      const fr = await db.frames.fetch(targetId);
      if (fr?.id === targetId) { // hasn't changed due to async
        setFrame(fr.toJSON());
      }
    })
  }, [frame, targetId])

  console.log('TFID:', targetFrameId, 'locked:', lockedTarget);

  if (!frame) {
    return null;
  }

  return <HStack layerStyle={lockedTarget ? 'link-frame-target' : "link-frame-target"}
                 {...frameToStyle(frame)}
                 spacing={4}
  >
    {lockedTarget ? <>
        <Text textStyle="link-frame-target">LinkTarget</Text>
        <CloseButton
          color="red"
          aria-label="cancel lock"
          style={{ pointerEvents: 'all' }}
          onClick={() => state.do.clearLock()}
        />
      </>
      : (
        <Button
          variant="frame-link-locker"
          onClick={() => state.do.lockTarget(targetFrameId)}>
          Click to link</Button>
      )
    }
  </HStack>
}

export default function LinkFrameView(props: LinkFrameProps) {
  const planEditorState = useContext(PlanEditorStateCtx);

  const [value, state] = useForest([stateFactory]);
  const { loaded, id, targetFrameId, lockedTarget } = value;
  useEffect(() => {
    if (planEditorState && state) {
      const sub = state.do.init(planEditorState);

      return () => {
        sub?.unsubscribe();
      }
    }
  }, [state, planEditorState])

  useEffect(() => {
    if (!loaded || lockedTarget) {
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
  }, [loaded, id, state, lockedTarget])

  return !(planEditorState && loaded) ? null : (
    <LinkFrameStateContext.Provider value={state}>
      <TargetView state={state} data-role="frame-link-target"/>

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
