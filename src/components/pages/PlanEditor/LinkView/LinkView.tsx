import { useState, useEffect, useCallback, useContext } from 'react';
import styles from './LinkView.module.scss';
import stateFactory from './LinkView.state.ts';
import useForest from '~/lib/useForest'
import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import useForestFiltered from '~/lib/useForestFiltered'

type LinkViewProps = {}

export default function LinkView(props: LinkViewProps) {
  const planEditorState = useContext(PlanEditorStateCtx);
  const [value, state] = useForest([stateFactory, props, planEditorState],
    (localState) => {
      const sub = localState.do.init();
      return () => sub.unsubscribe();
    });

  const {} = value;

  return (<div className={styles.container} ref={state.$.setRef}>
  </div>);
}
