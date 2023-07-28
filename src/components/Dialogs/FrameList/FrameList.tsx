import { Fragment, useContext, useRef } from 'react';
import styles from './FrameList.module.scss';
import stateFactory from './FrameList.state.ts';
import useForest from '~/lib/useForest';
import { DrawerBody, DrawerFooter, Text } from '@chakra-ui/react'
import DialogButton from '~/components/Dialogs/DialogButton'
import { DialogButtonProps } from '~/components/Dialogs/Dialog.state'
import useForestFiltered from '~/lib/useForestFiltered'
import DialogStateCtx from '~/components/Dialogs/DialogStateCtx'
import sortByOrder from '~/lib/utils/SortByOrder'
import { FrameListProps } from '~/components/Dialogs/FrameList/types'
import { act } from 'react-dom/test-utils'

export default function FrameList(props: FrameListProps) {
  const dialogState = useContext(DialogStateCtx);
  const gridRef = useRef(null);
  const bodyRef = useRef(null);

  const [value, state] = useForest([stateFactory, props, gridRef, bodyRef],
    (localState) => {
      localState.do.init();
    });
  const { buttons } = useForestFiltered(dialogState, ['buttons'])

  const { frames, clickedId, overId, activeId } = value;

  console.log('active id: ', activeId);

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
          const textStyle = clickedId && (overId === id) ? 'framesListHover' : "framesList"
          const editTextStyle = clickedId && (overId === id) ? 'framesListHoverEdit' : "framesListEdit"
          return <Fragment key={id}>
            <Text
              data-id={id}
              onMouseDown={state.do.gridMouseDown}
              onMouseOver={mouseEnter}
              onMouseLeave={state.do.mouseLeave}
              noOfLines={1}
              textStyle={textStyle}
              className={activeId === id ? styles['active-frame'] : null}
            >
              {activeId === id ? `*${frame.id}` : frame.id}
            </Text>
            <Text
              data-id={frame.id}
              textStyle={textStyle}
              className={activeId === id ? styles['active-frame'] : null}
            >
              {frame.name}
            </Text>
            <Text
              data-id={frame.id} textAlign="right"
              textStyle={textStyle}
              className={activeId === id ? styles['active-frame'] : null}
            >
              {frame.order}
            </Text>
            <Text
              color="editLink"
              onClick={(e) => state.do.editFrame(id, e)}
              data-id={frame.id} textStyle={editTextStyle}
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
