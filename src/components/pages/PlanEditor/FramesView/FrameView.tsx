import { Frame } from '~/types'
import { useContext, useMemo, useRef } from 'react'
import { Box, Heading } from '@chakra-ui/react'
import px from '~/lib/utils/px'
import dynamic from 'next/dynamic'
import styles from './FramesView.module.scss'
import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import { FrameControls } from '~/components/pages/PlanEditor/FramesView/FrameControls'
import frameListHoverManager from '~/lib/managers/frameListHoverManager'
import useForestFiltered from '~/lib/useForestFiltered'

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
  const planEditorState = useContext(PlanEditorStateCtx);
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
          resourceMap.set(frame.type, dynamic(() => import ( './Image/Image')))
        }
        break;
    }
  }

  const { clicked, hover } = useForestFiltered(frameListHoverManager, ['clicked', 'hover']);

  const layerStyle = useMemo(() => {
    if (frame) {
      const { id, name } = frame;
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
      ref={boxRef}
      left={px(frame.left)}
      top={px(frame.top)}
      width={px(frame.width)}
      height={px(frame.height)}
      layerStyle={layerStyle}
      zIndex={frame.order}
      className={styles['frame-view']}
    >
      {<FrameControls planEditorState={planEditorState!} frameId={frame.id} frameName={frame.name}/>}
      <Box as="div" layerStyle={"frameDetailWrapper"} data-id="frame-detail-wrapper">
        <DetailView frame={frame}/>
      </Box>
    </Box>
  )
}
