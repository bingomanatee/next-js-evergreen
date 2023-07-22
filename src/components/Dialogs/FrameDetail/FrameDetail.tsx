import { Suspense, useEffect, useState } from 'react';
import styles from './FrameDetail.module.scss';
import stateFactory from './FrameDetail.state.ts';
import useForest from '~/lib/useForest';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box, Heading,
  HStack,
  Input,
  Spinner,
  Text, Textarea
} from '@chakra-ui/react'
import useForestInput from '~/lib/useForestInput'
import FieldGrid from '~/components/FieldGrid'
import { ImageIcon } from '~/icons/ImageIcon'
import { MapIcon } from '~/icons/MapIcon'
import { MarkdownIcon } from '~/icons/MarkdownIcon'
import dynamic from 'next/dynamic'
import { ChoiceWrapper } from '~/components/Dialogs/FrameDetail/ChoiceWrapper'
import { ContentCtx } from '~/components/Dialogs/FrameDetail/ContentCtx'
import { FrameDetailProps } from '~/components/Dialogs/FrameDetail/types'
import StyleEditor from '~/components/Dialogs/FrameDetail/StyleEditor/StyleEditor'

const resourceMap = new Map();

export default function FrameDetail(props: FrameDetailProps) {

  const id = props.value.id;

  const [value, state] = useForest([stateFactory, props],
    (localState) => {
      localState.do.load();
    });

  const frameState = state.child('frame')!;
  const contentState = frameState.child('content')!;
  const { frame } = value;
  const type = frame?.content.type;

  const [left, setLeft] = useForestInput(frameState, 'left', { filter: (n) => Number(n) });
  const [top, setTop] = useForestInput(frameState, 'top', { filter: (n) => Number(n) });
  const [width, setWidth] = useForestInput(frameState, 'width', { filter: (n) => Number(n) });
  const [height, setHeight] = useForestInput(frameState, 'height', { filter: (n) => Number(n) });

  let DetailView;
  try {
    if (type) {
      switch (type) {
        case 'markdown':
          if (!resourceMap.has(type)) {
            resourceMap.set(type, dynamic(() => import ( './MarkdownEditor/MarkdownEditor')))
          }
          break;

        case 'map':
          if (!resourceMap.has(type)) {
            resourceMap.set(type, dynamic(() => import ( './MapEditor/MapEditor')))
          }

        case 'image':
          if (!resourceMap.has(type)) {
            resourceMap.set(type, dynamic(() => import ( './ImageEditor/ImageEditor')))
          }
          break;

        default:
          console.error('----- NO DETAIL in FrameDetail', type);
      }
      DetailView = resourceMap.get(type);
    } else {
      console.log('--- no type ')
    }
  } catch (err) {
    console.error('laod error: ', err)
  }

  console.log('----- DETAIL VIEW = ', DetailView);

  return (<div className={styles.container}>
    <ContentCtx.Provider value={contentState}>
      <Accordion defaultIndex={0}>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex='1' textAlign='left'>
                <Heading variant="accordionHead"> Size and Position</Heading>
              </Box>
              <AccordionIcon/>
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <HStack gap={4}>
              <FieldGrid>
                <Text>Left</Text>
                <Input value={left} onChange={setLeft} textAlign="right" type="number"/>
                <Text>Top</Text>
                <Input value={top} onChange={setTop} textAlign="right" ype="number"/>
              </FieldGrid>
              <FieldGrid>
                <Text>Width</Text>
                <Input value={width} onChange={setWidth} textAlign="right" type="number" min={50}/>
                <Text>Height</Text>
                <Input value={height} onChange={setHeight} textAlign="right" type="number" min={50}/>
              </FieldGrid>
            </HStack>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex='1' textAlign='left'>
                <Heading variant="accordionHead">Content</Heading>
              </Box>
              <AccordionIcon/>
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <HStack gap={8} justify="center" fontSize="48px" mb={8}>

              <ChoiceWrapper target="markdown" title="Markdown (text)">
                <MarkdownIcon active={type === 'markdown'}/>
              </ChoiceWrapper>

              <ChoiceWrapper target="image" title="Image">
                <ImageIcon active={type === 'image'}/>
              </ChoiceWrapper>

              <ChoiceWrapper target="map" title="Map (location)">
                <MapIcon active={type === 'map'}/>
              </ChoiceWrapper>
            </HStack>

            {type && DetailView ? (
              <div>
                <Suspense fallback={<Spinner/>}>
                  <DetailView contentState={contentState}/>
                </Suspense>
              </div>
            ) : (<p>
              <Text>Select a content type from the buttons above</Text>
            </p>)
            }
          </AccordionPanel>
        </AccordionItem>

        {(type !== 'markdown') ? null : (
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box as="span" flex='1' textAlign='left'>
                  <Heading variant="accordionHead">CSS Style</Heading>
                </Box>
                <AccordionIcon/>
              </AccordionButton>
            </h2>
            <AccordionPanel>
              <StyleEditor id={id} />
            </AccordionPanel>
          </AccordionItem>
        )}
      </Accordion>
    </ContentCtx.Provider>
  </div>);

  return <div>Frame Detail</div>
}
