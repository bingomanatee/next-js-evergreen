import { Frame } from '~/types'
import { useContext, useMemo, useRef } from 'react'
import { Box, Heading } from '@chakra-ui/react'
import px from '~/lib/utils/px'
import dynamic from 'next/dynamic'
import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import frameListHoverManager from '~/lib/managers/frameListHoverManager'
import useForestFiltered from '~/lib/useForestFiltered'

import { FrameControls } from './FrameControls'
import styles from './FramesView.module.scss'

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
  const boxRef = useRef(null);
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

  const layerStyle = useMemo(() => {
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
  }, [clicked, frame, hover]);

  DetailView = resourceMap.get(frame.type ?? null) || NullView
  return (
    <Box
      as="section"
      id={`frame:${frame.id}`}
      ref={boxRef}
      left={px(frame.left)}
      top={px(frame.top)}
      width={px(frame.width)}
      height={px(frame.height)}
      layerStyle={layerStyle}
      zIndex={frame.order}
      className={styles['frame-view']}
      data-frame-container={frame.id}
      onMouseDown={() => frameListHoverManager.do.set_clicked(frame.id)}
    >
      <Box as="div" layerStyle={'frame-detail-wrapper'} data-id="frame-detail-wrapper">
        <DetailView frame={frame}/>
      </Box>
    </Box>
  )
}