import {useCallback, useContext} from 'react'
import {Frame, X_DIR, Y_DIR} from '~/types'
import useForestFiltered from '~/lib/useForestFiltered'
import dataManager from '~/lib/managers/dataManager'
import {Box, Button, CloseButton, HStack, Select, Text} from '@chakra-ui/react'
import {frameToStyle} from '~/lib/utils/px'
import LinkFrameSprite, {
  POINT_OFFSET
} from '~/components/pages/PlanEditor/LinkFrameView/LinkFrameSprite/LinkFrameSprite'
import {LinkFrameStateContext} from '~/components/pages/PlanEditor/LinkFrameView/LinkFrameView'
import {Vector2} from "three";
import UnZoom from "~/components/pages/UnZoom";

function LinkMapSprite({isEnd}) {
  const linkState = useContext(LinkFrameStateContext);
  const offset = new Vector2(-20, 30).add(POINT_OFFSET);
  const frameStyle = linkState!.$.style({x: X_DIR.X_DIR_C, y: Y_DIR.Y_DIR_M}, offset, isEnd);

  return (
      <Box position="absolute" style={frameStyle}>
        <Text>Link to map point</Text>
        <Select>
          <option key="center">Center</option>
        </Select>
      </Box>
  )
}

export function TargetView({isEnd}) {
  const linkState = useContext(LinkFrameStateContext);
  const targetState = linkState!.child('target')!;


  const {id} = useForestFiltered(linkState!, ['id']);

  const {locked, frame} = useForestFiltered(targetState, ['id', 'locked', 'frame'])

  if (!frame) {
    return null;
  }

  console.log('target --- frame = ', frame.type, 'locked = ', locked, 'target state = ', targetState.value);

  return <>
    <Box
        onClick={targetState.do.lock}
        data-role="target-frame"
        pointerEvents="all"
        layerStyle={locked ? 'link-frame-target-locked' : "link-frame-target"}
        {...frameToStyle(frame)}>
      <UnZoom>
      <HStack
          spacing={4}
      >
          {locked ? <>
                <Text textStyle="link-frame-target">LinkTarget</Text>
                <CloseButton
                    color="red"
                    aria-label="cancel lock"
                    style={{pointerEvents: 'all'}}
                    onClick={targetState.do.clearLock}
                />
              </>
              : (
                  <Button
                      variant="frame-link-locker">
                    Click to link
                  </Button>
              )
          }
      </HStack>
    </UnZoom>

      {frame.type === 'map' ? <LinkMapSprite/> : ''}
    </Box>
    {locked ? <>
      <LinkFrameSprite isEnd dir={{x: X_DIR.X_DIR_R, y: Y_DIR.Y_DIR_T}}/>
      <LinkFrameSprite isEnd dir={{x: X_DIR.X_DIR_R, y: Y_DIR.Y_DIR_M}}/>
      <LinkFrameSprite isEnd dir={{x: X_DIR.X_DIR_R, y: Y_DIR.Y_DIR_B}}/>

      <LinkFrameSprite isEnd dir={{x: X_DIR.X_DIR_L, y: Y_DIR.Y_DIR_T}}/>
      <LinkFrameSprite isEnd dir={{x: X_DIR.X_DIR_L, y: Y_DIR.Y_DIR_M}}/>
      <LinkFrameSprite isEnd dir={{x: X_DIR.X_DIR_L, y: Y_DIR.Y_DIR_B}}/>

      <LinkFrameSprite isEnd dir={{x: X_DIR.X_DIR_C, y: Y_DIR.Y_DIR_T}}/>
      <LinkFrameSprite isEnd dir={{x: X_DIR.X_DIR_C, y: Y_DIR.Y_DIR_M}}/>
      <LinkFrameSprite isEnd dir={{x: X_DIR.X_DIR_C, y: Y_DIR.Y_DIR_B}}/>
    </> : null}

  </>
}
