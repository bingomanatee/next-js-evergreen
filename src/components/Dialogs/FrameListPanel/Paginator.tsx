import { leafI } from '@wonderlandlabs/forest/lib/types'
import useForestFiltered from '~/lib/useForestFiltered'
import { HStack, IconButton, Text } from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'

export function Paginator(props: {
  state: leafI
}) {
  const { state } = props;
  const { offset } = useForestFiltered(state, ['offset', 'frames']);

  return <HStack layerStyle="pagination" justify="center">
    <IconButton
      variant="pagination-button"
      aria-label="page-back"
      icon={
        <ChevronLeftIcon boxSize="24px" color={state.$.atStart() ? 'blackAlpha.200' : "nav"}/>
      } onClick={state.do.prev}/>
    <Text textStyle="pagination-number">{offset + 1}</Text>
    <IconButton
      variant="pagination-button"
      aria-label="page-back"
      icon={
        <ChevronRightIcon boxSize="24px" color={state.$.atEnd() ? 'blackAlpha.200' : "nav"}/>}
      onClick={state.do.next}/>
  </HStack>
}
