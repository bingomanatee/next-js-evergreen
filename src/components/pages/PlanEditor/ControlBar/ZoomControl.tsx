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
  Text, useBoolean
} from '@chakra-ui/react'
import Image from 'next/image'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import useForestFiltered from '~/lib/useForestFiltered'
import swallowEvent from '~/lib/swallowEvent'

export function ZoomControl() {
  const planEditorState = useContext(PlanEditorStateCtx);
 const {zoom} = useForestFiltered(planEditorState!, ['zoom'])

  return (
    <HStack gap={1}>
      <IconButton
        size="sm"
        p={0}
        m={0}
        h="20px"
        w="auto"
        minWidth={6}
        aria-label="zoomIn"
        icon={<ChevronLeftIcon/>}
        onClick={(e) => {
          planEditorState.do.zoomIn(e);
        }}
      />
      <Text value="zoom" textStyle="control-panel-label">
        {zoom}
      </Text>
      <IconButton
        m={0}
        size="sm"
        p={0}
        minWidth={6}
        h='20px'
        aria-label="zoomOut"
        onClick={(e) => planEditorState.do.zoomOut(e)}
        icon={<ChevronRightIcon/>}/>
    </HStack>
  )

}
