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
import useForestFiltered from '~/lib/useForestFiltered'
import dynamic from 'next/dynamic'
import { ChoiceWrapper } from '~/components/Dialogs/FrameDetail/ChoiceWrapper'
import { ContentCtx } from '~/components/Dialogs/FrameDetail/ContentCtx'
import { FrameDetailProps } from '~/components/Dialogs/FrameDetail/types'
import ErrorTrapper from '~/components/ErrorTrapper'

const resourceMap = new Map();

export default function FrameDetail(props: FrameDetailProps) {

  const [value, state] = useForest([stateFactory, props],
    (localState) => {
     // localState.do.load();
    });

  const frameState = state.child('frame')!;
  const contentState = frameState.child('content')!;
  const { type, styles } = useForestFiltered(contentState, ['type', 'styles']);

  const [left, setLeft] = useForestInput(frameState, 'left',);
  const [top, setTop] = useForestInput(frameState, 'top',);
  const [width, setWidth] = useForestInput(frameState, 'width',);
  const [height, setHeight] = useForestInput(frameState, 'height',);

  const [DetailView, setDetailView] = useState(null)

  useEffect(() => {
    setTimeout(() => {
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
        }
        setDetailView(resourceMap.get(type));
      }
    }, 500)

  }, [type, DetailView])

  return (<div className={styles.container}>
    <ContentCtx.Provider value={contentState}>
      <Accordion defaultIndex={0}>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex='1' textAlign='left'>
                Size and Position
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
                Content
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

            <ErrorTrapper boundry="Detail View">
              {type ? (
                <Suspense fallback={<Spinner/>}>
                  <DetailView contentState={contentState}/>
                </Suspense>
              ) : (<p>
                <Text>Select a content type from the buttons above</Text>
              </p>)
              }
            </ErrorTrapper>
          </AccordionPanel>
        </AccordionItem>

        {(!styles || type !== 'markdown') ? null : (
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box as="span" flex='1' textAlign='left'>
                  Size and Position
                </Box>
                <AccordionIcon/>
              </AccordionButton>
            </h2>
            <AccordionPanel>
              {Array.from(styles.keys()).map((styleId) => {
                let title = styleId;
                if (title === props.value.id) {
                  title = 'Local';
                }
                return (
                  <>
                    <Heading size="sm">
                      {title}
                    </Heading>
                    <Textarea minHeight="33vh" value={styles.get(styleId)}
                              onChange={(e) => {
                                styles.set(styleId, e.target.value);
                                state.do.updateStyles(styles);
                              }}
                    />

                  </>
                )
              })}
              <Text style="info">
                Do not include outer braces. The outer container is styled as <code>
                {`.frame { margin: 1em}`}
              </code>
                example: <pre>
                {`.frame {background-color: yellow; margin: 1em}
            h1: {color: "red"} 
            p {font-size: 10px}`}
              </pre>
              </Text>
            </AccordionPanel>
          </AccordionItem>
        )}
      </Accordion>
    </ContentCtx.Provider>
  </div>);
}
