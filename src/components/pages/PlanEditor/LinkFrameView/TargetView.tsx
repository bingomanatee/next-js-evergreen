import { useContext, useEffect, useMemo, useState } from 'react'
import { Frame, X_DIR, Y_DIR } from '~/types'
import useForestFiltered from '~/lib/useForestFiltered'
import dataManager from '~/lib/managers/dataManager'
import { Button, CloseButton, HStack, Text } from '@chakra-ui/react'
import { frameToStyle } from '~/lib/utils/px'
import LinkFrameSprite from '~/components/pages/PlanEditor/LinkFrameView/LinkFrameSprite/LinkFrameSprite'
import { LinkFrameStateContext } from '~/components/pages/PlanEditor/LinkFrameView/LinkFrameView'

export function TargetView({ isEnd }) {
  const linkState = useContext(LinkFrameStateContext);
  const targetState = linkState!.child('target')!;


  const { id } = useForestFiltered(linkState!, ['id']);

  const { locked, frame } = useForestFiltered(targetState, ['id', 'locked', 'frame'])

  if (!frame) {
    return null;
  }

  return <HStack layerStyle={locked ? 'link-frame-target-locked\'' : "link-frame-target"}
                 {...frameToStyle(frame)}
                 spacing={4}
  >
    {locked ? <>
        <Text textStyle="link-frame-target">LinkTarget</Text>
        <CloseButton
          color="red"
          aria-label="cancel lock"
          style={{ pointerEvents: 'all' }}
          onClick={linkState!.do.clearLock}
        />
        <LinkFrameSprite isEnd dir={{ x: X_DIR.X_DIR_R, y: Y_DIR.Y_DIR_T }}/>
        <LinkFrameSprite isEnd dir={{ x: X_DIR.X_DIR_R, y: Y_DIR.Y_DIR_M }}/>
        <LinkFrameSprite isEnd dir={{ x: X_DIR.X_DIR_R, y: Y_DIR.Y_DIR_B }}/>

        <LinkFrameSprite isEnd dir={{ x: X_DIR.X_DIR_L, y: Y_DIR.Y_DIR_T }}/>
        <LinkFrameSprite isEnd dir={{ x: X_DIR.X_DIR_L, y: Y_DIR.Y_DIR_M }}/>
        <LinkFrameSprite isEnd dir={{ x: X_DIR.X_DIR_L, y: Y_DIR.Y_DIR_B }}/>

        <LinkFrameSprite isEnd dir={{ x: X_DIR.X_DIR_C, y: Y_DIR.Y_DIR_T }}/>
        <LinkFrameSprite isEnd dir={{ x: X_DIR.X_DIR_C, y: Y_DIR.Y_DIR_B }}/>
      </>
      : (
        <Button
          variant="frame-link-locker"
          onClick={linkState!.do.lockTarget}>
          Click to link</Button>
      )
    }
  </HStack>
}
