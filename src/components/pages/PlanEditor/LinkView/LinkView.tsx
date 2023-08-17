import { useState, useEffect, useCallback } from 'react';
import styles from './LinkView.module.scss';
import stateFactory from './LinkView.state.ts';
import useForest from '~/lib/useForest'

type LinkViewProps = {}

export default function LinkView(props: LinkViewProps) {
  const [value, state] = useForest([stateFactory, props],
    (localState) => {
      const sub = localState.do.init();
      return () => sub.unsubscribe();
    });

  const {} = value;

  return (<div className={styles.container} ref={state.$.setRef}>
  </div>);
}
