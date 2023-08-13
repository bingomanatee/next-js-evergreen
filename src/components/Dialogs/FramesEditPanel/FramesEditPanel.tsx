import { DrawerBody, DrawerFooter, Text } from '@chakra-ui/react'
import { Fragment, useCallback, useContext, useEffect, useRef } from 'react';

// ---- libs
import useForest from '~/lib/useForest';
import sortByOrder from '~/lib/utils/SortByOrder'
import useForestFiltered from '~/lib/useForestFiltered'
import frameListHoverManager from '~/lib/managers/frameListHoverManager'

// ---- components
import DialogButton from '~/components/Dialogs/DialogButton'
import { DialogButtonProps } from '~/components/Dialogs/Dialog.state'
import DialogStateCtx from '~/components/Dialogs/DialogStateCtx'

// ---- local
import { FrameListProps } from './types'
import styles from './FramesEditPanel.module.scss';
import stateFactory from './FramesEditPanel.state.ts';

export default function FramesEditPanel(props: FrameListProps) {
  const dialogState = useContext(DialogStateCtx);
  const gridRef = useRef(null);
  const bodyRef = useRef(null);

  const [value, state] = useForest([stateFactory, props, gridRef, bodyRef],
    (localState) => {
      localState.do.init();
    });
  const { buttons } = useForestFiltered(dialogState, ['buttons'])

  const { frames, clickedId, overId, activeId } = value;

  const { clicked, hover } = useForestFiltered(frameListHoverManager);

  const itemTextStyle = useCallback((id) => {
    if (id === hover && id === clicked) {
      return 'framesListItem-hover-clicked';
    }
    if (id === clicked) {
      return 'framesListItem-clicked';
    }
    if (id === hover) {
      return 'framesListItem-hover';
    }
    return "framesListItem"
  }, [clicked, hover])
  const editTextStyle = useCallback((id) => {
    if (id === hover && id === clicked) {
      return 'framesListItem-edit-hover-clicked';
    }
    if (id === clicked) {
      return 'framesListItem-edit-clicked';
    }
    if (id === hover) {
      return 'framesListItem-edit-hover';
    }
    return "framesListItem-edit"
  }, [clicked, hover])

  return (<>
    <DrawerBody ref={bodyRef}>
      <div className={styles.grid} ref={gridRef}>
        <Text noOfLines={1} data-id="header" textStyle="framesListHead">ID</Text>
        <Text noOfLines={1} data-id="header" textStyle="framesListHead">Name</Text>
        <Text noOfLines={1} data-id="header" textStyle="framesListHead">Order</Text>
        <Text noOfLines={1} data-id="header" textStyle="framesListHead">&nbsp;</Text>
        {frames.sort(sortByOrder).reverse().map((frame) => {
          const { id } = frame;
          const mouseEnter = () => state.do.mouseEnter(id);
          const text = itemTextStyle(id);
          const editText = editTextStyle(id);
          return <Fragment key={id}>
            <Text
              data-id={id}
              onMouseDown={state.do.gridMouseDown}
              onMouseOver={mouseEnter}
              onMouseLeave={state.do.mouseLeave}
              noOfLines={1}
              textStyle={text}
              className={activeId === id ? styles['active-frame'] : null}
            >
              {activeId === id ? `*${frame.id}` : frame.id}
            </Text>
            <Text
              data-id={frame.id}
              onMouseDown={state.do.gridMouseDown}
              onMouseOver={mouseEnter}
              onMouseLeave={state.do.mouseLeave}
              noOfLines={1}
              textStyle={text}
              className={activeId === id ? styles['active-frame'] : null}
            >
              {frame.name}
            </Text>
            <Text
              data-id={frame.id} textAlign="right"
              onMouseDown={state.do.gridMouseDown}
              onMouseOver={mouseEnter}
              onMouseLeave={state.do.mouseLeave}
              noOfLines={1}
              textStyle={text}
              className={activeId === id ? styles['active-frame'] : null}
            >
              {frame.order}
            </Text>
            <Text
              onMouseOver={mouseEnter}
              onMouseLeave={state.do.mouseLeave}
              onClick={(e) => state.do.editFrame(id, e)}
              data-id={frame.id}
              textStyle={editText}
              className={activeId === id ? styles['active-frame'] : null}
            >
              Edit
            </Text>
          </Fragment>
        })}
      </div>
      <Text textStyle="info">Frames with high order appear on top of items with lower orders</Text>
      <div className={styles.flyover} style={state.$.flyoverStyle()}>{clickedId}</div>
    </DrawerBody>

    <DrawerFooter>
      {/*@TODO: make reusable*/}
      {
        buttons.map((buttonDef: DialogButtonProps) => {
          return <DialogButton key={buttonDef.key} {...buttonDef} />
        })
      }
    </DrawerFooter>
  </>);
}
