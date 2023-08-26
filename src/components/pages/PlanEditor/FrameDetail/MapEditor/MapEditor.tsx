import { useState, useEffect, useCallback } from 'react';
import styles from './MapEditor.module.scss';
import stateFactory from './MapEditor.state.ts';
import useForest from '~/lib/useForest';

type MapEditorProps = {}

export default function MapEditor(props: MapEditorProps) {
  const [value, state] = useForest([stateFactory, props],
    (localState) => {
    });

  const {} = value;

  return (<div className={styles.container}>

  </div>);
}
