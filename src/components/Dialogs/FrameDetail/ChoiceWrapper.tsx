import { useContext } from 'react'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import useForestFiltered from '~/lib/useForestFiltered'
import { Box, Heading, VStack } from '@chakra-ui/react'
import { ContentCtx } from '~/components/Dialogs/FrameDetail/ContentCtx'

export function ChoiceWrapper({ target, children, title }) {

  const content = useContext<leafI>(ContentCtx);
  const { type } = useForestFiltered(content, ['type'])
  return (
    <Box flexBasis="33%">
      <VStack justify="center" gap="sm"
              color={target === type ? 'active-button' : 'inactive-button'}
              onClick={() => content.do.set_type(target)}
      >
        {children}
        <Heading size="sm" fontWeight="normal" color="black">{title}</Heading>
      </VStack>
    </Box>
  )
}
