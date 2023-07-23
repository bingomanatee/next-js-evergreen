import { Frame } from '~/types'
import { useEffect, useRef } from 'react'
import messageManager from '~/lib/managers/messageManager'
import { Box, Heading, Text } from '@chakra-ui/react'
import px from '~/lib/utils/px'
import dynamic from 'next/dynamic'

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
  useEffect(() => {
    //@ts-ignore
    boxRef.current?.addEventListener('mousedown', (e) => {
      if (!e.shiftKey) {
        messageManager.sidebar(
          { view: 'frame-detail', id: frame.id, title: `Edit frame ${frame.name ?? frame.id}` }
        );
      }
    })
  }, []);

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

      case 'image':
        if (!resourceMap.has(frame.type)) {
          resourceMap.set(frame.type, dynamic(() => import ( './Image/Image')))
        }
        break;
    }
  }

  DetailView = resourceMap.get(frame.type ?? null) || NullView
  return (
    <Box
      ref={boxRef}
      left={px(frame.left)}
      top={px(frame.top)}
      width={px(frame.width)}
      height={px(frame.height)}
      overflow="hidden"
      position="absolute"
      border="1px solid black"
      borderColor="gray.300"
      paddingX={2}
      paddingY={1}
      zIndex={frame.order}
      backgroundColor="white">
      <DetailView frame={frame}/>
    </Box>
  )
}
