import { useCallback, useContext } from 'react'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import useForestFiltered from '~/lib/useForestFiltered'
import { Box, Heading, VStack } from '@chakra-ui/react'
import { FrameStateContext } from '~/components/pages/PlanEditor/FrameDetail/FrameStateContext'
import { context } from 'three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements'

export function ChoiceWrapper({ target, children, title }) {

  const frameState = useContext<leafI>(FrameStateContext);
  const { type } = useForestFiltered(frameState, ['type']);

  const choose = useCallback((e) => {
    try {
      console.log('setting type as ', target);
      frameState.do.set_type(target);
    } catch (err) {
      console.log('error in choice:', err);
    }
  }, [frameState]);
  return (
    <Box flexBasis="33%">
      <VStack justify="center" gap="sm"
              color={target === type ? 'active-button' : 'inactive-button'}
              onClick={choose}
      >
        {children}
        <Heading size="sm" fontWeight="normal" color="black">{title}</Heading>
      </VStack>
    </Box>
  )
}
