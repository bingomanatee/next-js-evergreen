import { useState, useEffect, useCallback } from 'react';
import styles from './EditorView.module.scss';
import stateFactory from './EditorView.state.ts';
import useForest from '~/lib/useForest';

type EditorViewProps = {}

export default function EditorView(props: EditorViewProps) {
  const [value, state] = useForest([stateFactory, props],
    (localState) => {
    });

  const {} = value;

  return (<div className={styles.container}>

  </div>);
}
