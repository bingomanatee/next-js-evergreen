import { ComponentType, Suspense, useContext, useEffect } from 'react';
import styles from './FrameDetail.module.scss';
import stateFactory from './FrameDetail.state.ts';
import useForest from '~/lib/useForest';
import {
  Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel,
  Box, DrawerBody, DrawerFooter, Heading, Button, Flex,
  HStack, Input, Spinner, Text, VStack, InputGroup, InputLeftAddon, DrawerOverlay, DrawerContent, Drawer,
} from '@chakra-ui/react'
import { upperFirst } from 'lodash'
// site
import useForestInput from '~/lib/useForestInput'
import FieldGrid from '~/components/FieldGrid'
import DialogButton from '~/components/Dialogs/DialogButton'

// local
import { ChoiceWrapper } from './ChoiceWrapper'
import { FrameStateContext } from './FrameStateContext'
import { FrameDetailProps } from './types'
import StyleEditor from './StyleEditor/StyleEditor'
import dynamic from 'next/dynamic'
import FrameIcon from '~/components/icons/FrameIcon'

const resourceMap = new Map();

export default function FrameDetail(props: FrameDetailProps) {
  const [value, state] = useForest([stateFactory],
    (localState) => {
      const sub = localState.do.init();
      return () => sub?.unsubscribe();
    }, true);

  console.log('frameDetail value:', value);
  const frameState = state.child('frame')!;
  const type = frameState.value.type;

  const [left, setLeft] = useForestInput(frameState, 'left', { filter: (n) => Number(n) });
  const [top, setTop] = useForestInput(frameState, 'top', { filter: (n) => Number(n) });
  const [width, setWidth] = useForestInput(frameState, 'width', { filter: (n) => Number(n) });
  const [height, setHeight] = useForestInput(frameState, 'height', { filter: (n) => Number(n) });
  const [name, setName] = useForestInput(frameState, 'name');
  const [order, setOrder] = useForestInput(frameState, 'order');

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

  return (
    <FrameStateContext.Provider value={frameState}>
      <Drawer
        isOpen
        autoFocus={false}
        placement='right'
        size={['md', 'lg', 'lg']}
        onClose={state.do.cancel}
      >
        <DrawerOverlay/>
        <DrawerContent zIndex={1000}>
          <DrawerBody>
            <FieldGrid>
              <Text textStyle="fieldLabel">Name</Text>
              <Input value={name} onChange={setName}/>
            </FieldGrid>
            <Accordion defaultIndex={1}>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box as="span" flex='1' textAlign='left'>
                      <Heading variant="accordionHead"> Size and Position</Heading>
                    </Box>
                    <AccordionIcon/>
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} overflow="visible">
                  <HStack gap={4} overflow="visible" align="start">
                    <VStack flexBasis="50%">
                      <InputGroup size="sm">
                        <InputLeftAddon layerStyle="input-label">                          <Text textStyle="label">Left</Text>
                        </InputLeftAddon>
                        <Input value={left} onChange={setLeft} textAlign="right" type="number"/>
                      </InputGroup>
                      <InputGroup size="sm">
                        <InputLeftAddon layerStyle="input-label">                          <Text textStyle="label">Top</Text>
                        </InputLeftAddon>
                        <Input value={top} onChange={setTop} textAlign="right" ype="number"/>
                      </InputGroup>
                      <InputGroup size="sm">
                        <InputLeftAddon layerStyle="input-label">                          <Text textStyle="label">Order</Text>
                        </InputLeftAddon>
                        <Input readOnly value={order} type="number" onChange={setOrder} textAlign="right"
                               ype="number"/>
                      </InputGroup>
                    </VStack>
                    <VStack flexBasis="50%">
                      <InputGroup size="sm">
                        <InputLeftAddon layerStyle="input-label">                          <Text textStyle="label">Width</Text>
                        </InputLeftAddon>
                        <Input value={width} onChange={setWidth} textAlign="right" type="number" min={50}/>
                      </InputGroup>
                      <InputGroup size="sm">
                        <InputLeftAddon layerStyle="input-label">                          <Text textStyle="label">Height</Text>
                        </InputLeftAddon>
                        <Input value={height} size="sm" onChange={setHeight} textAlign="right" type="number"
                               min={50}/>
                      </InputGroup>
                    </VStack>
                  </HStack>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box as="span" flex='1' textAlign='left'>
                      <Heading variant="accordionHead">Content ({type})</Heading>
                    </Box>
                    <AccordionIcon/>
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <HStack gap={8} justify="center" fontSize="48px" mb={1}>
                    {['image', 'markdown', 'map'].map((fType) =>
                      (
                        <ChoiceWrapper
                          key={fType}
                          target={fType}
                          title={upperFirst(fType) + (fType === 'markdown' ? '(text)' : '')}
                        >
                        </ChoiceWrapper>
                      ))}
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
                    <StyleEditor id={value.id}/>
                  </AccordionPanel>
                </AccordionItem>
              )}
            </Accordion>
          </DrawerBody>

          <DrawerFooter>
            <DialogButton onClick={state.do.deleteFrame} colorScheme="red">Delete Frame</DialogButton>
            <DialogButton onClick={state.do.cancel}>Cancel</DialogButton>
            <DialogButton onClick={state.do.save} colorScheme="blue">Update Frame</DialogButton>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </FrameStateContext.Provider>
  );
}
