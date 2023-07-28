import { useState, useEffect, useCallback, Fragment, useContext, useRef } from 'react';
import styles from './FrameList.module.scss';
import stateFactory from './FrameList.state.ts';
import useForest from '~/lib/useForest';
import { Button, DrawerBody, DrawerFooter, Text } from '@chakra-ui/react'
import DialogButton from '~/components/Dialogs/DialogButton'
import { DialogButtonProps } from '~/components/Dialogs/Dialog.state'
import useForestFiltered from '~/lib/useForestFiltered'
import DialogStateCtx from '~/components/Dialogs/DialogStateCtx'
import sortByOrder from '~/lib/utils/SortByOrder'

type FrameListProps = {}

export default function FrameList(props: FrameListProps) {
  const dialogState = useContext(DialogStateCtx);
  const gridRef = useRef(null);
  const bodyRef = useRef(null);
  const [value, state] = useForest([stateFactory, props, gridRef, bodyRef],
    (localState) => {
      localState.do.init();
    });
  const { buttons } = useForestFiltered(dialogState, ['buttons'])

  const { frames, clickedId, overId } = value;

  return (<>
    <DrawerBody ref={bodyRef}>
      <div className={styles.grid} ref={gridRef}>
        <Text noOfLines={1} data-id="header" textStyle="framesListHead">ID</Text>
        <Text noOfLines={1} data-id="header" textStyle="framesListHead">Name</Text>
        <Text noOfLines={1} data-id="header" textStyle="framesListHead">Order</Text>
        <Text noOfLines={1} data-id="header" textStyle="framesListHead">&nbsp;</Text>
        {frames.sort(sortByOrder).map((frame) => {
          const { id } = frame;
          const mouseEnter = () => state.do.mouseEnter(id);
          const textStyle = clickedId && (overId === id) ? 'framesListHover' : "framesList"
          const editTextStyle = clickedId && (overId === id) ? 'framesListHoverEdit' : "framesListEdit"
          return <Fragment key={id}>
            <Text data-id={id}
                  onMouseDown={state.do.gridMouseDown}
                  onMouseOver={mouseEnter}
                  onMouseLeave={state.do.mouseLeave}
                  noOfLines={1} textStyle={textStyle}>{frame.id}</Text>
            <Text data-id={frame.id} textStyle={textStyle}>{frame.name}</Text>
            <Text data-id={frame.id} textAlign="right" textStyle={textStyle}>{frame.order}</Text>
            <Text color="editLink" onClick={(e) => state.do.editFrame(id, e)}
                  data-id={frame.id} textStyle={editTextStyle}>Edit</Text>
          </Fragment>
        })}
      </div>
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
