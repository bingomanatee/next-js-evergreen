import { BlockMode, Frame } from '~/types'
import { useCallback, useContext, useMemo, useRef } from 'react'
import { Box, Heading } from '@chakra-ui/react'
import px from '~/lib/utils/px'
import dynamic from 'next/dynamic'
import frameListHoverManager from '~/lib/managers/frameListHoverManager'
import useForestFiltered from '~/lib/useForestFiltered'

import styles from './FramesView.module.scss'
import blockManager from '~/lib/managers/blockManager'
import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'

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
  const planEditorState = useContext(PlanEditorStateCtx);
  const { zoom } = useForestFiltered(planEditorState!, ['zoom']);
  const borderWidth = useMemo(() => {
      const width = px(((clicked === frame.id) ? 250 : 125) / zoom, true);
      return width;
    },
    [clicked, frame.id, zoom])
  return (
    <Box
      as="section"
      id={`frame:${frame.id}`}
      left={px(frame.left)}
      top={px(frame.top)}
      width={px(frame.width)}
      height={px(frame.height)}
      layerStyle={layerStyle}
      zIndex={frame.order}
      className={styles['frame-view']}
      data-frame-container={frame.id}
      onClick={frameClicked}
      ref={boxRef}
      borderWidth={borderWidth}
    >
      <Box as="div" data-clicked={clicked === frame.id ? 1 : undefined}
           layerStyle={'frame-detail-wrapper'}
           data-id="frame-detail-wrapper">
        <DetailView frame={frame}/>
      </Box>
    </Box>
  )
}
