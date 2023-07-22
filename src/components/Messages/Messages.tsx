import { useState, useEffect, useCallback } from 'react';
import styles from './Messages.module.scss';
import stateFactory from './Messages.state.ts';
import useForest from '~/lib/useForest';
import Dialog from '~/components/Dialogs/Dialog'
import { useToast } from '@chakra-ui/react'

type MessagesProps = {}

export default function Messages(props: MessagesProps) {
  const toast = useToast({
    containerStyle: {
      width: '500px',
      maxWidth: '100%',
    },
    position: 'bottom-right'
  })

  const [value, state] = useForest([stateFactory, props, toast],
    (localState) => {
      localState.do.load();
    });

  const { dialog, shelf } = value;

  return (<div className={styles.container}>
    {dialog ? (
      <Dialog value={dialog} closeDialog={state.do.closeDialog}/>
    ) : null}
    {shelf ? <Dialog value={shelf} form="shelf" closeDialog={state.do.closeShelf} /> : null}
  </div>);
}
