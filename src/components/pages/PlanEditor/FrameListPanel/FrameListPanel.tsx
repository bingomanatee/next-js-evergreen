import {
  Box,
  Button,
  CloseButton,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon, Td,
  Text
} from '@chakra-ui/react'
import {useRef} from 'react';
import Image from 'next/image';

// ---- libs
import useForest from '~/lib/useForest';

// ---- components
import DialogButton from '~/components/Dialogs/DialogButton'

// ---- local
import {FrameListProps} from './types'
import styles from './FrameListPanel.module.scss';
import stateFactory from './FrameListPanel.state.ts';
import {Paginator} from '~/components/pages/PlanEditor/FrameListPanel/Paginator'
import {leafI,} from '@wonderlandlabs/forest/lib/types'
import useForestInput from '~/lib/useForestInput'
import FrameIcon from '~/components/icons/FrameIcon'
import blockManager from '~/lib/managers/blockManager'
import {LinkTarget} from "~/components/pages/PlanEditor/FrameListPanel/LinkTarget";
import shortId from "~/lib/utils/shortId";
import EditIcon from "~/components/icons/EditIcon";
import SelectIcon from "~/components/icons/SelectIcon";

function Search(props: {
  state: leafI
}) {
  const {state} = props;
  const [search, setSearch] = useForestInput(state, 'search');

  return <HStack>
    <InputGroup size="sm">
      <InputLeftAddon layerStyle="input-label">Search</InputLeftAddon>
      <Input variant="outline" fontSize="0.8em" value={search} onChange={setSearch} placeholder="search"/>
      <InputRightAddon>
        <CloseButton size="sm" boxSize="10pt" onClick={() => state.do.clearSearch()}/>
      </InputRightAddon>
    </InputGroup>
  </HStack>
}

export default function FrameListPanel(props: FrameListProps) {
  const bodyRef = useRef(null);

  const [value, state] = useForest([stateFactory, props],
      (localState) => {
        localState.do.init();
      });
  const {activeId, linkTarget} = value;

  const targetLinks = linkTarget ? state.$.targetLinks() : new Map();
  return (
      <Drawer
          isOpen
          autoFocus={false}
          placement="right"
          size={['md', 'md', 'lg']}
          onClose={blockManager.do.finish}
      >
        <DrawerOverlay/>
        <DrawerContent zIndex={1000}>
          <DrawerCloseButton/>
          <DrawerHeader>Frames</DrawerHeader>
          <DrawerBody ref={bodyRef}>
            <LinkTarget state={state}/>
            <Search state={state}/>
            <table className={styles['frame-table']} cellPadding={0} cellSpacing={0} border={0}>
              <thead>
              <tr>
                {linkTarget ? (<th className={styles['link-icon-cell']}>
                  &nbsp;
                </th>) : null}
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
                     null
                  ) : (
                      <>
                        <th className={styles['link-cell']}>
                          <Text noOfLines={1} data-id="header" textStyle="frames-list-head">Links</Text>
                        </th>
                        <th className={styles['edit-cell']}>
                          <Text noOfLines={1} data-id="header" textStyle="frames-list-head">&nbsp;</Text>
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
                const {id, type} = frame;
                return <tr
                    key={id}
                    onMouseEnter={() => state.do.mouseEnter(id)}
                    onMouseLeave={state.do.mouseLeave}
                >
                  {linkTarget ? (
                      <td><Box pl={4}>
                        {targetLinks.has(id) ? (<Image src="/img/icons/link-on.svg" alt="link-on" width={20} height={20}
                                                       onClick={() => state.do.unLink(id)}
                        />) : <Image src="/img/icons/link-off.svg"
                                     alt="link-off" width={20} height={20}
                                     onClick={() => state.do.addLink(id)} />  }
                      </Box></td>
                      )
                  : null}

                  <td className={styles['id-cell']}>
                    <Text
                        data-id={id}
                        noOfLines={1}
                        fontSize="xs"
                        textStyle={'frame-list-item'}
                        className={activeId === id ? styles['active-frame'] : null}
                    >
                      {activeId === id ? `*${shortId(frame.id)}` : shortId(frame.id)}
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
                  {linkTarget ? null : (<>
                    <td className={styles['link-cell']}>
                      <Button
                          variant="frame-list-button"
                          onClick={() => state.do.set_linkTarget(id)}
                      >
                        {state.$.links(id) || '-'}
                      </Button>
                    </td>
                    <td className={styles['edit-cell']}>
                      <EditIcon width="16px" height="16px"
                                onClick={(e) => state.do.editFrame(id, e)}
                      />
                    </td>
                    <td className={styles['edit-cell']}>
                      <SelectIcon width="16px" height="16px"
                                  onClick={(e) => state.do.selectFrame(id, e)}
                      />
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
