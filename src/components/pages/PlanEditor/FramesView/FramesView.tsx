import { useState, useEffect, useCallback } from 'react';
import styles from './FramesView.module.scss';
import stateFactory from './FramesView.state.ts';
import useForest from '~/lib/useForest';

type FramesViewProps = {}

export default function FramesView(props: FramesViewProps) {
  const [value, state] = useForest([stateFactory, props],
    (localState) => {
    });

  const {} = value;

  return (<div className={styles.container}>
FRAMES
  </div>);
}
