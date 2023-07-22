import { useState, useEffect, useCallback } from 'react';
import styles from './ImageEditor.module.scss';
import stateFactory from './ImageEditor.state.ts';
import useForest from '~/lib/useForest';

type ImageEditorProps = {}

export default function ImageEditor(props: ImageEditorProps) {
  const [value, state] = useForest([stateFactory, props],
    (localState) => {
    });

  const {} = value;

  return (<div className={styles.container}>

  </div>);
}
