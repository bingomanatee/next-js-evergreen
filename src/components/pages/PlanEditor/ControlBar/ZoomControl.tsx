import { useContext } from 'react'
import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import useForestInput from '~/lib/useForestInput'
import {
  Box,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Text
} from '@chakra-ui/react'
import Image from 'next/image'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'

export function ZoomControl() {
  const planEditorState = useContext(PlanEditorStateCtx);
  const [zoom, setZoom] = useForestInput(planEditorState!, 'zoom');

  return (
    <InputGroup w="210px"
      size="sm">
      <InputLeftAddon p={0}>
        <HStack h="100%">
          <Image src="/img/icons/page-zoom.svg" width={20} height={20} alt="zoom-icon"/>
          <Text fontSize="xs" size="xs">Zoom</Text>
          <IconButton
            size="sm"
            p={0}
            m={0}
            h="100%"
            w="auto"
            minWidth={6}
            background="white"
            aria-label="zoomIn"
            icon={<ChevronLeftIcon/>}
            onClick={planEditorState.do.zoomIn}
          />
        </HStack>
      </InputLeftAddon>
      <Input
        textAlign="center"
        size="sm"
        fontSize="xs"
        value={zoom}
        variant="outline"
        onChange={setZoom}/>
      <InputRightAddon p={0}>
        <IconButton
          m={0}
          size="sm"
          p={0}
          minWidth={6}
          background="white"
          h="100%"
          aria-label="zoomOut"
          onClick={planEditorState.do.zoomOut}
          icon={<ChevronRightIcon/>}/>
      </InputRightAddon>
    </InputGroup>
  )

}
