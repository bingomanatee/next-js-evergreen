import { useCallback, useContext, useMemo } from 'react';
import stateFactory from './ControlBar.state.ts';
import useForest from '~/lib/useForest';
import styles from './ControlBar.module.scss';
import { GrClear } from 'react-icons/gr';

import { Box, Button, Flex, HStack, IconButton, Portal } from '@chakra-ui/react'
import Image from 'next/image';
import messageManager from '~/lib/managers/messageManager'
import FrameIcon from '~/components/icons/FrameIcon'
import { frameTypeNames } from '~/constants'
import useForestFiltered from '~/lib/useForestFiltered'
import dataManager from '~/lib/managers/dataManager'
import stopPropagation from '~/lib/utils/stopPropagation'
import frameListHoverManager from '~/lib/managers/frameListHoverManager'
import { ZoomControl } from '~/components/pages/PlanEditor/ControlBar/ZoomControl'
import { vectorToStyle } from '~/lib/utils/px'
import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import blockManager from '~/lib/managers/blockManager'
import { BlockMode } from '~/types'
import { PanControl } from '~/components/pages/PlanEditor/ControlBar/PanControl'
import { FrameControlBar } from '~/components/pages/PlanEditor/ControlBar/FrameControlBar'
import ControlBarItem from '~/components/pages/PlanEditor/ControlBar/ControlBarItem'

type ControlBarProps = {}

function Panner({ state, panPosition }) {
  const pos = vectorToStyle(panPosition);
  return (<div className={styles['pan-context']}
  >
    <section style={pos}
    >
      <Image ref={state.do.onPanImage} src="/img/icons/page-move.svg" alt="panner" style={{
        width: '80px', height: '80px',
      }}
             width="20" height="20"/>
    </section>
  </div>)
}

export default function ControlBar(props: ControlBarProps) {
  const planEditorState = useContext(PlanEditorStateCtx);
  const [value, state] = useForest([stateFactory, props, planEditorState],
    (localState) => {
    });

  const { newFrame, panning, panPosition } = value;

  const listFrames = useCallback(() => {
    messageManager.listFrames();
  }, [])

  const { clicked } = useForestFiltered(frameListHoverManager!, ['clicked']);

  const frame = useMemo(() => {
    return clicked ? dataManager.planStream.value.framesMap?.get(clicked) : null
  }, [clicked]);

  return (
    <Box
      layerStyle="control-bar"
      as="nav"
      data-role="control-bar"
      h="3em"
      onMouseDown={stopPropagation}
    >
      <HStack
        justify="space-between"
        spacing={[1, 2, 3]}
        alignItems="center">
        <HStack spacing={2}>

          <ControlBarItem
            onClick={() => blockManager.do.block(BlockMode.SETTINGS)}
            icon={"/img/icons/settings.svg"}
            label="Project Settings"/>

          <ControlBarItem
            label="Add Frame"
            height={40}
            icon="/img/icons/add-frame.svg" alt="add-frame-icon">
            <HStack
              px={2}
              py={1}
              backgroundColor="white"
            >
              {frameTypeNames.map((type) => (
                <Button size="sm" key={type} leftIcon={<FrameIcon type={type} size={20}/>}
                onClick={() => state.do.addFrame(type)}
                >
                  Add {type} Frame
                </Button>
              ))}
            </HStack>
          </ControlBarItem>

          <ControlBarItem
            onClick={() => blockManager.do.block(BlockMode.LIST_FRAMES)}
            icon={"/img/icons/frame-list.svg"}
            label="frames"/>

          <ControlBarItem
            icon={"/img/icons/page-zoom.svg"}
            label="Zoom">
            <ZoomControl/>
          </ControlBarItem>
          <ControlBarItem
            onClick={state.do.pan}
            showOpen={blockManager.value.type === BlockMode.PANNING}
            icon={"/img/icons/page-move.svg"}
            label="Pan"/>
          <ControlBarItem
            onClick={planEditorState.do.clearTransform}
            showOpen={blockManager.value.type === BlockMode.PANNING}
            icon={"/img/icons/page-move.svg"}
            iconItem={<GrClear />}
            label="Reset View"/>
        </HStack>
        {frame ? <FrameControlBar frame={frame}/> : null}
      </HStack>
      {
        panning ? <Portal><Panner state={state} panPosition={panPosition}/></Portal> : null
      }
    </Box>
  );
}
