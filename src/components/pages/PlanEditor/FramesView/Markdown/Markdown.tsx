// import { useState, useEffect, useCallback } from 'react';
// import styles from './Markdown.module.scss';
import stateFactory from './Markdown.state.ts';
import useForest from '~/lib/useForest';
import { Box, Heading, Spinner } from '@chakra-ui/react'
import { Frame } from '~/types'
import ReactMarkdown from "react-markdown";
import { useEffect } from 'react'

type MarkdownProps = { frame: Frame }

export default function Markdown(props: MarkdownProps) {
  const { frame } = props;

  const [value, state] = useForest([stateFactory, props],
    (localState) => {
      setTimeout(() => {
        localState.do.init()
      }, 500);
    });

  const { loaded, styles } = value;

  // update the state's frame data if it changes.
  useEffect(() => {
    if (loaded && state.value.frame !== frame) {
      state.do.set_frame(frame);
    }
  }, [state, frame, loaded]);

  if (!loaded) {
    return <Spinner/>
  }


  return <>
    <style dangerouslySetInnerHTML={{ __html: styles }}/>
    <Box id={`frame-${frame.id ?? 'unknown'}`} layerStyle="markdownOuter">
      <Heading position="absolute" width="100%" textStyle="markdownHead" variant="markdownHead"
               size="xs">{frame.name ?? frame.id}</Heading>
      <ReactMarkdown className="markdown-frame">{frame.value}</ReactMarkdown>
    </Box></>;
}
