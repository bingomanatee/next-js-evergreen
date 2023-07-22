import { useState, useEffect, useCallback } from 'react';
import styles from './Markdown.module.scss';
import stateFactory from './Markdown.state.ts';
import useForest from '~/lib/useForest';
import { Box, Heading, Spinner } from '@chakra-ui/react'
import { Frame, MarkdownContent } from '~/types'
import ReactMarkdown from "react-markdown";

type MarkdownProps = { frame: Frame }

export default function Markdown(props: MarkdownProps) {
  const [value, state] = useForest([stateFactory, props],
    (localState) => {
      localState.do.load();
    });

  const { loaded, frame } = value;
  if (!loaded) {
    return <Spinner/>
  }

  return (<>
    <style dangerouslySetInnerHTML={{__html: state.$.style()}} />
    <Box id={`frame-${frame?.id ?? 'unknown'}`}>
    <Heading size="xs"> Markdown: {frame?.id}</Heading>
    <ReactMarkdown className={`markdown local`}>{state.$.text()}</ReactMarkdown>
  </Box></>);
}
