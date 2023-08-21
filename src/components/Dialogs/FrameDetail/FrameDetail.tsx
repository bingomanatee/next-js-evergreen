import { ComponentType, Suspense, useContext, useEffect } from 'react';
import styles from './FrameDetail.module.scss';
import stateFactory from './FrameDetail.state.ts';
import useForest from '~/lib/useForest';
import {
  Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel,
  Box, DrawerBody, DrawerFooter, Heading, Button, Flex,
  HStack, Input, Spinner, Text, VStack, InputGroup, InputLeftAddon,
} from '@chakra-ui/react'
import Image from 'next/image';
import { upperFirst } from 'lodash'
// site
import useForestInput from '~/lib/useForestInput'
import FieldGrid from '~/components/FieldGrid'
import DialogButton from '~/components/Dialogs/DialogButton'
import { DialogButtonProps } from '~/components/Dialogs/Dialog.state'

// local
import { ChoiceWrapper } from './ChoiceWrapper'
import { FrameStateContext } from './FrameStateContext'
import { FrameDetailProps } from './types'
import StyleEditor from './StyleEditor/StyleEditor'
import useForestFiltered from '~/lib/useForestFiltered'
import DialogStateCtx from '~/components/Dialogs/DialogStateCtx'
import dynamic from 'next/dynamic'
import { Frame } from '~/types'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import FrameTicket from '~/components/FrameTicket/FrameTicket'
import FrameIcon from '~/components/icons/FrameIcon'

const resourceMap = new Map();

function ChooseOrder(props: { state: leafI }) {
  const { state } = props;
  const afterChoices = state.$.afterChoices();
  const [search, setSearch] = useForestInput(state, 'search');

  const { move } = useForestFiltered(state, ['move'])

  if (move) {
    const { order, frameId } = move;

    return <Box layerStyle="choice">
      Frame will be moved <b>{order}</b>
      {frameId ? <FrameTicket id={frameId} size="sm"/> : null}
    </Box>
  }
  return (
    <>
      <HStack justify="end" width="100%">
        <Button leftIcon={<Image src="/img/icons/to-top.svg" alt="top icon" width={18} height={18}/>}
                size="sm">Top</Button>
        <Button leftIcon={<Image src="/img/icons/to-bottom.svg" alt="top icon" width={18} height={18}/>}
                size="sm">Bottom</Button>
      </HStack>

      <HStack spacing={2} width="100%" justify="stretch">
        <Box> <Button size="sm">After Frame: </Button></Box>
        <Input size="sm" value={search} onChange={setSearch}/>
      </HStack>
      {afterChoices.length ? (
        <Box borderColor="blackAlpha.600"
             borderWidth={1}
             backgroundColor="white"
             width="100%"
             shadow="md" l={0} t={40}>
          {
            afterChoices.slice(0, 4).map((frame: Frame) => {
              return (
                <Box key={frame.id} layerStyle="popup-item" onClick={() => {
                  state.do.reorder(frame, 'after')
                }}>
                  <Text textStyle="popup-item">
                    {frame.name ? <><b>{frame.name}</b><br/></> : null}
                    <small>{frame.id}</small>
                  </Text>
                </Box>
              )
            })
          }
        </Box>) : null}
    </>
  )
}

export default function FrameDetail(props: FrameDetailProps) {
  const dialogState = useContext(DialogStateCtx)
  const { id } = props.value;

  const [value, state] = useForest([stateFactory, id, dialogState],
    (localState) => {
      localState.do.init();
    }, true);

  const frameState = state.child('frame')!;
  const { frame: { type } } = value;

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

  const { buttons } = useForestFiltered(dialogState, ['buttons'])

  return (
    <FrameStateContext.Provider value={frameState}>
      <DrawerBody>
        <div className={styles.container}>
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
                      <InputLeftAddon>
                        <Text textStyle="label">Left</Text>
                      </InputLeftAddon>
                      <Input value={left} onChange={setLeft} textAlign="right" type="number"/>
                    </InputGroup>
                    <InputGroup size="sm">
                      <InputLeftAddon>
                        <Text textStyle="label">Top</Text>
                      </InputLeftAddon>
                      <Input value={top} onChange={setTop} textAlign="right" ype="number"/>
                    </InputGroup>
                    <InputGroup size="sm">
                      <InputLeftAddon>
                        <Text textStyle="label">Order</Text>
                      </InputLeftAddon>
                      <Input readOnly value={order} type="number" onChange={setOrder} textAlign="right" ype="number"/>
                    </InputGroup>
                  </VStack>
                  <VStack flexBasis="50%">
                    <InputGroup size="sm">
                      <InputLeftAddon>
                        <Text textStyle="label">Width</Text>
                      </InputLeftAddon>
                      <Input value={width} onChange={setWidth} textAlign="right" type="number" min={50}/>
                    </InputGroup>
                    <InputGroup size="sm">
                      <InputLeftAddon>
                        <Text textStyle="label">Height</Text>
                      </InputLeftAddon>
                      <Input value={height} size="sm" onChange={setHeight} textAlign="right" type="number" min={50}/>
                    </InputGroup>

                    <ChooseOrder state={state}/>
                  </VStack>
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
                  {['image', 'markdown', 'map'].map((fType) =>
                    (
                      <ChoiceWrapper
                        key={fType}
                        target={type}
                        title={upperFirst(fType) + (fType === 'markdown' ? '(text)' : '')}
                      >
                        <FrameIcon type={fType} active={type === fType} size={30}/>
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
