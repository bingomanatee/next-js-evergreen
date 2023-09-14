import {Suspense, useCallback, useContext} from 'react'
import {Frame, X_DIR, Y_DIR} from '~/types'
import useForestFiltered from '~/lib/useForestFiltered'
import {Box, Button, CloseButton, HStack, Select, Spinner, Text, useBoolean} from '@chakra-ui/react'
import {frameToStyle} from '~/lib/utils/px'
import LinkFrameSprite from '~/components/pages/PlanEditor/LinkFrameView/LinkFrameSprite/LinkFrameSprite'
import {LinkFrameStateContext} from '~/components/pages/PlanEditor/LinkFrameView/LinkFrameView'
import UnZoom from "~/components/pages/UnZoom";
import dynamic from "next/dynamic";
import Image from 'next/image';

let MapPointDlog = null;

export function TargetView({isEnd}) {
  const linkState = useContext(LinkFrameStateContext);
  const targetState = linkState!.child('target')!;

  const {locked, frame, mapPoint} = useForestFiltered(targetState,
      ['locked', 'frame', 'mapPoint'])

  const [openLink, openLinkDlog] = useBoolean(false);

  if (openLink && !MapPointDlog) {
    MapPointDlog = dynamic(() => import ('./MapPointDlog/MapPointDlog'), {
      suspense: true
    });
  }

  if (!frame) return <span/>

  return <>
    <Box
        onClick={targetState.do.lock}
        data-role="target-frame"
        pointerEvents="all"
        layerStyle={locked ? 'link-frame-target-locked' : "link-frame-target"}
        {...frameToStyle(frame)}>
      <UnZoom>
        <HStack
            spacing={2}
        >
          {locked ? <>
                <CloseButton
                    color="red"
                    aria-label="cancel lock"
                    style={{pointerEvents: 'all'}}
                    onClick={targetState.do.clearLock}
                />
                <Text textStyle="frame-target-text">Link target</Text>

              </>
              : (
                  <Button
                      textStyle="frame-target-text"
                      variant="frame-target-link-button">
                    Click to link
                  </Button>
              )
          }
        </HStack>
        {locked && frame?.type === 'map' ? (
            <Button
                variant="map-link-button"
                {...(mapPoint) ? {
                  leftIcon: <Image alt="active-indicator" src="/img/icons/edit-confirm.svg" height={20} width={20}/>
                } : {}
                }
                onMouseDown={openLinkDlog.on}>
              Point on map...</Button>
        ) : ''}
      </UnZoom>

    </Box>
    {
      locked ? <>
        <LinkFrameSprite isEnd dir={{x: X_DIR.X_DIR_R, y: Y_DIR.Y_DIR_T}}/>
        <LinkFrameSprite isEnd dir={{x: X_DIR.X_DIR_R, y: Y_DIR.Y_DIR_M}}/>
        <LinkFrameSprite isEnd dir={{x: X_DIR.X_DIR_R, y: Y_DIR.Y_DIR_B}}/>

        <LinkFrameSprite isEnd dir={{x: X_DIR.X_DIR_L, y: Y_DIR.Y_DIR_T}}/>
        <LinkFrameSprite isEnd dir={{x: X_DIR.X_DIR_L, y: Y_DIR.Y_DIR_M}}/>
        <LinkFrameSprite isEnd dir={{x: X_DIR.X_DIR_L, y: Y_DIR.Y_DIR_B}}/>

        <LinkFrameSprite isEnd dir={{x: X_DIR.X_DIR_C, y: Y_DIR.Y_DIR_T}}/>
        <LinkFrameSprite isEnd dir={{x: X_DIR.X_DIR_C, y: Y_DIR.Y_DIR_M}}/>
        <LinkFrameSprite isEnd dir={{x: X_DIR.X_DIR_C, y: Y_DIR.Y_DIR_B}}/>
        {locked && openLink ? (
            <Suspense fallback={<Spinner/>}>
              <MapPointDlog openLinkDlog={openLinkDlog}/>
            </Suspense>
        ) : null}
      </> : null
    }

  </>
}
