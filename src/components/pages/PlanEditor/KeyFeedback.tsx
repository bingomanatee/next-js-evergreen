import { Flex, Kbd, Text, VStack } from '@chakra-ui/react'
import { memo } from 'react'
import styles from '~/components/pages/PlanEditor/PlanEditor.module.scss'
import useForestFiltered from '~/lib/useForestFiltered'
import blockManager from '~/lib/managers/blockManager'
import { planEditorMode } from '~/components/pages/PlanEditor/PlanEditor.state'

function KeyFeedbackItem(props: { value: string }) {
  switch (props.value) {
    case ('f'):
      return (
        <Flex direction="row" layerStyle="keyHintRow">
        <Kbd>F</Kbd>
        <Text textStyle="keyHint" size="sm">Draw a frame with a mouse drag</Text>
      </Flex>
      )
      break;
  }
  return null;
}

const KeyFeedbackItemM = memo(KeyFeedbackItem);

export function KeyFeedback({ keys }) {

  const {type} = useForestFiltered(blockManager, ['type'])

  switch(type) {
    case planEditorMode.MOVING_FRAME:
      return (
        <section className={styles['key-feedback']}>
          Drag the selected frame&apos;s corners to resize it, or the center to move the frame.
         <br />hit the <Kbd>ESC</Kbd> key to cancel.
        </section>
      )
    break;
  }

  const keyValues = Array.from(keys);
  if (!keyValues.length) {
    return null;
  }

  return <section className={styles['key-feedback']}>
    <VStack>
      {keyValues.map((key: string) => (<KeyFeedbackItemM  key={key} value={key}/>))}
    </VStack>
  </section>
}
