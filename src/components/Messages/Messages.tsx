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
      localState.do.init();
    });

  const { dialog, shelf } = value;

/*
  if (dialog) {
   return (<div className={styles.container}>
        <Dialog value={dialog} closeDialog={state.do.closeDialog}/>
    </div>);
  }
  if (shelf) return (<div className={styles.container}>
    <Dialog value={shelf} form="shelf" closeDialog={state.do.closeShelf} />
  </div>);
*/

  return <div className={styles.container}>&nbsp;</div>
}
