import { ComponentType, Suspense, useContext, useEffect, useState } from 'react';
import styles from './FrameDetail.module.scss';
import stateFactory from './FrameDetail.state.ts';
import useForest from '~/lib/useForest';
import {
  Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel,
  Box, DrawerBody, DrawerFooter, Heading,
  HStack, Input, Spinner, Text,
} from '@chakra-ui/react'
import dynamic from 'next/dynamic'

// site
import useForestInput from '~/lib/useForestInput'
import FieldGrid from '~/components/FieldGrid'
import { ImageIcon } from '~/icons/ImageIcon'
import { MapIcon } from '~/icons/MapIcon'
import { MarkdownIcon } from '~/icons/MarkdownIcon'
import DialogButton from '~/components/Dialogs/DialogButton'
import { DialogButtonProps } from '~/components/Dialogs/Dialog.state'

// local
import { ChoiceWrapper } from './ChoiceWrapper'
import { FrameStateContext } from './FrameStateContext'
import { FrameDetailProps } from './types'
import StyleEditor from './StyleEditor/StyleEditor'
import useForestFiltered from '~/lib/useForestFiltered'
import DialogStateCtx from '~/components/Dialogs/DialogStateCtx'

const resourceMap = new Map();

export default function FrameDetail(props: FrameDetailProps) {
  const dialogState = useContext(DialogStateCtx)
  const { id } = props.value;

  useEffect(() => {
    console.log('-=------ FrameDetail unique id / dialog state', id, dialogState.id)
  }, [id, dialogState])

  const [value, state] = useForest([stateFactory, id, dialogState],
    (localState) => {
      localState.do.load();
    }, true);

  const frameState = state.child('frame')!;
  const { frame: { type } } = value;

  const [left, setLeft] = useForestInput(frameState, 'left', { filter: (n) => Number(n) });
  const [top, setTop] = useForestInput(frameState, 'top', { filter: (n) => Number(n) });
  const [width, setWidth] = useForestInput(frameState, 'width', { filter: (n) => Number(n) });
  const [height, setHeight] = useForestInput(frameState, 'height', { filter: (n) => Number(n) });
  const [name, setName] = useForestInput(frameState, 'name');
  let DetailView: ComponentType<any> | null = null;

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
        break;

      case 'image':
        if (!resourceMap.has(type)) {
          resourceMap.set(type, dynamic(() => import ( './ImageEditor/ImageEditor')))
        }
        break;
    }
    DetailView = resourceMap.get(type);
  } else {
    DetailView = null;
  }

  const { buttons } = useForestFiltered(dialogState, ['buttons'])

  return (
    <FrameStateContext.Provider value={frameState}>
      <DrawerBody>
        <div className={styles.container}>
          <FieldGrid>
            <Text textStyle="fieldLabel">Name</Text>
            <Input value={name} onChange={setName} />
          </FieldGrid>
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
                      <DetailView frameState={frameState}/>
                    </Suspense>
                  </div>
                ) : (
                  <Text>Select the content style for this frame from the buttons above</Text>
                )
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
                  <StyleEditor id={id}/>
                </AccordionPanel>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </DrawerBody>

      <DrawerFooter>
        <DialogButton onClick={state.do.deleteFrame} colorScheme="red">Delete Frame</DialogButton>
        {
          buttons.map((buttonDef: DialogButtonProps) => {
            return <DialogButton key={buttonDef.key} {...buttonDef} />
          })
        }
      </DrawerFooter>
    </FrameStateContext.Provider>
  );
}
