import { useState, useEffect, useCallback } from 'react';
/*import styles from './MarkdownEditor.module.scss';
import stateFactory from './MarkdownEditor.state.ts';
import useForest from '~/lib/useForest';*/
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Heading, Box, Text, Textarea } from '@chakra-ui/react'
import useForestInput from '~/lib/useForestInput'
// import Markdown from '~/components/pages/PlanEditor/FrameView/Markdown/Markdown'

type MarkdownEditorProps = {
  contentState: leafI
}

export default function MarkdownEditor(props: MarkdownEditorProps) {
  const { frameState } = props;

  const [value, setValue] = useForestInput<HTMLTextAreaElement>(frameState, 'value')

  return (
    <Box>
    <Heading size="md" textAlign="center" mb={4}>Markdown (text) </Heading>
    <Text variant="info">Enter in the text you want to appear in your frame.
      It will be formatted as Markdown</Text>

    <Textarea minHeight="50vh" value={value} onChange={setValue} />
  </Box>
  );
}
