import {
  DrawerBody,
  HStack,
  Box,
  CloseButton,
  Input,
  InputGroup,
  Button,
  DrawerFooter,
  Text,
  InputLeftAddon,
  InputRightAddon, DrawerOverlay, DrawerContent, Drawer
} from '@chakra-ui/react'
import { useCallback, useContext, useRef } from 'react';

// ---- libs
import useForest from '~/lib/useForest';
import useForestFiltered from '~/lib/useForestFiltered'
import frameListHoverManager from '~/lib/managers/frameListHoverManager'

// ---- components
import DialogButton from '~/components/Dialogs/DialogButton'
import { DialogButtonProps } from '~/components/Dialogs/Dialog.state'
import DialogStateCtx from '~/components/Dialogs/DialogStateCtx'

// ---- local
import { FrameListProps } from './types'
import styles from './FrameListPanel.module.scss';
import stateFactory from './FrameListPanel.state.ts';
import { Paginator } from '~/components/pages/PlanEditor/FrameListPanel/Paginator'
import {
  leafI,
} from '@wonderlandlabs/forest/lib/types'
import useForestInput from '~/lib/useForestInput'
import { Frame } from '~/types'
import FrameIcon from '~/components/icons/FrameIcon'
import blockManager from '~/lib/managers/blockManager'

function Search(props: {
  state: leafI
}) {
  const { state } = props;
  const [search, setSearch] = useForestInput(state, 'search');

  return <HStack>
    <InputGroup size="sm">
      <InputLeftAddon>Search</InputLeftAddon>
      <Input variant="outline" fontSize="0.8em" value={search} onChange={setSearch} placeholder="search"/>
      <InputRightAddon>
        <CloseButton size="sm" boxSize="10pt" onClick={() => state.do.clearSearch()}/>
      </InputRightAddon>
    </InputGroup>
  </HStack>
}

function LinkTarget(props: {
  state: leafI
}) {
  const { state } = props;
  const { frames, linkTarget } = useForestFiltered(state, ['frames', 'linkTarget']);

  if (!linkTarget) {
    return null;
  }

  const frame: Frame = frames.find((fr) => fr.id === linkTarget);

  return <HStack
    borderWidth={2}
    align="center"
    borderColor="accent"
    mb={2}
    width="100%"
    justify="stretch">
    <Box py={1} px={2} flex={1}>
      <Text>Links for <b>&quot;{frame.name}&quot;</b></Text>
      <Text textStyle="info-small" fontSize="0.8em">{frame.id}</Text>
    </Box>
    <CloseButton onClick={() => state.do.set_linkTarget(null)} color="red" m={4}/>
  </HStack>
}

export default function FrameListPanel(props: FrameListProps) {
  const gridRef = useRef(null);
  const bodyRef = useRef(null);

  const [value, state] = useForest([stateFactory, props],
    (localState) => {
      localState.do.init();
    });
  const { activeId, linkTarget } = value;

  const targetLinks = linkTarget ? state.$.targetLinks() : new Map();
  return (
    <Drawer
      isOpen
      autoFocus={false}
      placement='right'
      size={['md', 'md', 'lg']}
      onClose={state.do.cancel}
    >
      <DrawerOverlay/>
      <DrawerContent zIndex={1000}>
        <DrawerBody ref={bodyRef}>
          <LinkTarget state={state}/>
          <Search state={state}/>
          <table className={styles['frame-table']} cellPadding={0} cellSpacing={0} border={0}>
            <thead>
            <tr>
              <th className={styles['count-cell']}>
                <Text noOfLines={1} data-id="header" textStyle="frames-list-head">&nbsp;</Text>
              </th>
              <th className={styles['id-cell']}>
                <Text noOfLines={1} data-id="header" textStyle="frames-list-head">ID</Text>
              </th>
              <th className={styles['type-cell']}>
                <Text noOfLines={1} data-id="header" textStyle="frames-list-head">Type</Text>
              </th>
              <th>
                <Text noOfLines={1} data-id="header" textStyle="frames-list-head">Name</Text>
              </th>
              {
                linkTarget ? (
                  <>
                    <th colSpan={2} className={styles['link-cell-2']}>
                      <Text noOfLines={1} data-id="header" textStyle="frames-list-head">Links</Text>
                    </th>
                  </>
                ) : (
                  <>
                    <th className={styles['link-cell']}>
                      <Text noOfLines={1} data-id="header" textStyle="frames-list-head">Links</Text>
                    </th>
                    <th className={styles['edit-cell']}>
                      <Text noOfLines={1} data-id="header" textStyle="frames-list-head">&nbsp;</Text>
                    </th>
                  </>
                )
              }
            </tr>
            </thead>
            <tbody>
            {state.$.framesList().map((frame, index) => {
              const { id, type } = frame;
              return <tr
                key={id}
                onMouseEnter={() => state.do.mouseEnter(id)}
                onMouseLeave={state.do.mouseLeave}
              >
                <td className={styles['count-cell']}>
                  <Text
                    data-id={id}
                    noOfLines={1}
                    textStyle="frame-list-item"
                    className={activeId === id ? styles['active-frame'] : null}
                  >
                    {state.$.count(index)}
                  </Text>
                </td>

                <td className={styles['id-cell']}>
                  <Text
                    data-id={id}
                    noOfLines={1}
                    textStyle={'frame-list-item'}
                    className={activeId === id ? styles['active-frame'] : null}
                  >
                    {activeId === id ? `*${frame.id}` : frame.id}
                  </Text>
                </td>

                <td className={styles['type-cell']}>
                  <Box justifyContent="center" h={6} w={6}>
                    <FrameIcon active={true} color="white" type={frame.type} size={16}/>
                  </Box>
                </td>
                <td>
                  <Text
                    data-id={frame.id}
                    noOfLines={1}
                    textStyle={'frame-list-item'}
                    className={activeId === id ? styles['active-frame'] : null}
                  >
                    {frame.name}
                  </Text>
                </td>
                {linkTarget ? (<>
                  <td className={styles['link-ctrl']}>
                    {targetLinks.has(id) ? null : (
                      <Button
                        variant='frame-list-button'
                        onClick={() => state.do.addLink(id)}
                      >
                        Link
                      </Button>
                    )}
                  </td>
                  <td className={styles['link-ctrl']}>
                    {targetLinks.has(id) ? (<Button
                      variant='frame-list-button'
                      onClick={() => state.do.addLink(id)}
                    >
                      Unlink
                    </Button>) : null}
                  </td>
                </>) : (<>
                  <td className={styles['link-cell']}>
                    <Button
                      variant='frame-list-button'
                      onClick={() => state.do.set_linkTarget(id)}
                    >
                      {state.$.links(id) || '-'}
                    </Button>
                  </td>
                  <td className={styles['edit-cell']}>
                    <Button
                      variant='frame-list-button'
                      onClick={(e) => state.do.editFrame(id, e)}
                    >
                      Edit
                    </Button>
                  </td>
                </>)
                }
              </tr>
            })}
            </tbody>
          </table>
          <Paginator state={state}/>
          <Text textStyle="info">
            Frames at the top of the list appear over the ones below.
          </Text>
        </DrawerBody>

        <DrawerFooter>
          <DialogButton onClick={blockManager.do.finish} colorScheme="blue">Done</DialogButton>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
