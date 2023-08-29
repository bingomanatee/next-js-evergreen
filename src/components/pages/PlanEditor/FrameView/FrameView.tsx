import { BlockMode, Frame } from '~/types'
import { useCallback, useContext, useMemo, useRef } from 'react'
import { Box, Heading, Text } from '@chakra-ui/react'
import px from '~/lib/utils/px'
import dynamic from 'next/dynamic'
import frameListHoverManager from '~/lib/managers/frameListHoverManager'
import useForestFiltered from '~/lib/useForestFiltered'

import styles from './FramesView.module.scss'
import blockManager from '~/lib/managers/blockManager'
import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import { Vector2 } from 'three'
import frameRelativeSize from '~/lib/utils/frameRelativeSize'

const resourceMap = new Map();

function NullView({ frame: frame }) {
  return (<Box>
    <Heading size="xs">
      untyped frame {frame.name ?? frame.id}
    </Heading>
  </Box>)
}

export function FrameView(props: { frame: Frame }) {
  const { frame } = props;
  const planEditorState = useContext(PlanEditorStateCtx);
  const { zoom } = useForestFiltered(planEditorState!, ['zoom'])
  const boxRef = useRef<HTMLDivElement | null>(null);
  /**
   * edit on click handler
   */

  let DetailView;
  if (frame.type) {
    switch (frame.type) {
      case 'markdown':
        if (!resourceMap.has(frame.type)) {
          resourceMap.set(frame.type, dynamic(() => import ( './Markdown/Markdown')))
        }
        break;

      case 'map':
        if (!resourceMap.has(frame.type)) {
          resourceMap.set(frame.type, dynamic(() => import ( './Map/Map')))
        }
        break;

      case 'image':
        if (!resourceMap.has(frame.type)) {
          resourceMap.set(frame.type, dynamic(() => import ( './Image/ImageDetail')))
        }
        break;
    }
  }

  const { clicked, hover } = useForestFiltered(frameListHoverManager, ['clicked', 'hover']);

  const { tooSmall, place } = useMemo(() =>frameRelativeSize(frame, zoom), [frame, zoom]);

  const layerStyle = useMemo(() => {
    if (tooSmall) {
      return 'frameView-tooSmall'
    }
    if (frame) {
      const { id } = frame;

      if (clicked === id && hover === id) {
        return "frameView-clicked-hover";
      }
      if (clicked === id) {
        return "frameView-clicked"
      }
      if (hover === id) {
        return "frameView-hover"
      }
    }
    return "frameView";
  }, [clicked, frame, hover, zoom, tooSmall]);

  DetailView = resourceMap.get(frame.type ?? null) || NullView

  const lastClicked = useRef(0);
  const frameClicked = useCallback(() => {
    if (frameListHoverManager.value.clicked !== frame.id) {
      frameListHoverManager.do.set_clicked(frame.id);
    }
    if ((Date.now() - lastClicked.current) < 800) {
      blockManager.do.block(BlockMode.EDIT_FRAME, { frameId: frame.id });
    }
    lastClicked.current = Date.now();
  }, []);

  const borderWidth = useMemo(() => {
      if (tooSmall) {
        return px(300 / zoom, true);
      }
      return px(((clicked === frame.id) ? 250 : 125) / zoom, true);
    },
    [clicked, frame.id, zoom, tooSmall])
  return (
    <Box
      as="section"
      id={`frame:${frame.id}`}
      left={px(place.left)}
      top={px(place.top)}
      width={px(place.width)}
      height={px(place.height)}
      layerStyle={layerStyle}
      zIndex={frame.order}
      className={tooSmall ? styles['frame-view-hidden'] : styles['frame-view']}
      data-frame-container={frame.id}
      onClick={frameClicked}
      ref={boxRef}
      borderWidth={borderWidth}
    >
      <DetailView frame={frame}/>
      {tooSmall ?
        <Text textStyle="frame-placeholder" layerStyle="frame-placeholder-text"
              fontSize={px(1000 / zoom)}>
          {frame.name || frame.id}
        </Text> : null}
    </Box>
  )
}
