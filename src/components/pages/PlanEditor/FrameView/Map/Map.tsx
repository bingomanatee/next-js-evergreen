import { useState, useEffect, useCallback } from 'react';
import styles from './Map.module.scss';
import stateFactory from './Map.state.ts';
import useForest from '~/lib/useForest';

type MapProps = {}

export default function Map(props: MapProps) {
  const [value, state] = useForest([stateFactory, props],
    (localState) => {
    });

  const {} = value;

  return (<div className={styles.container}>

  </div>);
}
