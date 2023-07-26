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
  const {frame} = props;

  const [value, state] = useForest([stateFactory, props],
    (localState) => {
      setTimeout(() => {
        localState.do.load()
      }, 500);
    });

  const { loaded, styles } = value;

  useEffect(() => {
    console.log('setting frame with content', frame.value)
    state.do.set_frame(frame);
  }, [state, frame, loaded]);

  if (!loaded) {
    return <Spinner/>
  }


  return <>
    <style dangerouslySetInnerHTML={{ __html: styles }}/>
    <Box id={`frame-${frame?.id ?? 'unknown'}`} layerStyle="markdownOuter">
      <Heading size="xs"> Markdown: {frame?.id}</Heading>
      <ReactMarkdown className="markdown-frame">{frame.value}</ReactMarkdown>
    </Box></>;
}
