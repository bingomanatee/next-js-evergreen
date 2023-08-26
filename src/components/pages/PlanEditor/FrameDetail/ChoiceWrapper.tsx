import { useContext } from 'react'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import useForestFiltered from '~/lib/useForestFiltered'
import { Box, Heading, VStack } from '@chakra-ui/react'
import { FrameStateContext } from '~/components/pages/PlanEditor/FrameDetail/FrameStateContext'

export function ChoiceWrapper({ target, children, title }) {

  const content = useContext<leafI>(FrameStateContext);
  const { type } = useForestFiltered(content, ['type'])
  return (
    <Box flexBasis="33%">
      <VStack justify="center" gap="sm"
              color={target === type ? 'active-button' : 'inactive-button'}
              onClick={() => content.set('type', target)}
      >
        {children}
        <Heading size="sm" fontWeight="normal" color="black">{title}</Heading>
      </VStack>
    </Box>
  )
}
