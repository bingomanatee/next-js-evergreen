import { useState, useEffect, useCallback } from 'react';
import styles from './HelpPrompt.module.scss';
import stateFactory from './HelpPrompt.state.ts';
import useForest from '~/lib/useForest';
import { Box, IconButton, Text, VStack } from '@chakra-ui/react'

import { QuestionIcon } from '@chakra-ui/icons'

type HelpPromptProps = {}

export default function HelpPrompt(props: HelpPromptProps) {
  const [value, state] = useForest([stateFactory, props],
    (localState) => {
    });

  const { showHelp } = value;

  return showHelp ? null :  (<VStack spacing={2} className={styles.container}>
    <IconButton aria-label={"help creating frames and links"}
                onClick={state.do.showHelp}
                icon={<QuestionIcon boxSize='40px'/>} size="md"/>
    <Box layerStyle="label"><Text fontSize="xs">Creating Frames and Links</Text></Box>
  </VStack>);
}
