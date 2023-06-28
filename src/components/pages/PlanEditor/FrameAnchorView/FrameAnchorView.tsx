import { useState, useEffect, useCallback, PropsWithChildren } from 'react';
import styles from './FrameAnchorView.module.scss';
import stateFactory from './FrameAnchorView.state.ts';
import useForest from '~/lib/useForest';

type FrameAnchorViewProps = PropsWithChildren<{}>

export default function FrameAnchorView(props: FrameAnchorViewProps) {
  const [value, state] = useForest([stateFactory, props],
    (localState) => {
    });

  const {} = value;

  return (<div className={styles.container}>
    {props.children}
  </div>);
}
