import { useCallback, useContext } from 'react'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import useForestFiltered from '~/lib/useForestFiltered'
import { Box, Heading, VStack , Text, HStack} from '@chakra-ui/react'
import { FrameStateContext } from '~/components/pages/PlanEditor/FrameDetail/FrameStateContext'
import FrameIcon from '~/components/icons/FrameIcon'

export function ChoiceWrapper({ target, children, title }) {

  const frameState = useContext<leafI>(FrameStateContext);
  const { type } = useForestFiltered(frameState, ['type']);

  const choose = useCallback((e) => {
    try {
      frameState.do.set_type(target);
    } catch (err) {
      console.log('error in choice:', err);
    }
  }, [frameState]);
  return (
    <Box>
      <HStack justify="center"
              spacing={2}
              color={target === type ? 'active-button' : 'inactive-button'}
              onClick={choose}
      >
        <FrameIcon type={target} active={type === target} size={25}/>
        <Text textStyle={target === type ? '' : 'info'} fontSize="sm">{title}</Text>
      </HStack>
    </Box>
  )
}
