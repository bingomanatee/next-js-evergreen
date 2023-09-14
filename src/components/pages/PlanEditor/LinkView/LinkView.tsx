"use client"
import { useContext } from 'react';
import styles from './LinkView.module.scss';
import stateFactory from './LinkView.state.ts';
import useForest from '~/lib/useForest'
import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'


export type LinkViewProps = {over ?  : boolean}

export default function LinkView(props: LinkViewProps) {
  const planEditorState = useContext(PlanEditorStateCtx);
  const [_value, state] = useForest([stateFactory, props, planEditorState],
    (localState) => {
      return localState.do.init();
    });

  return (<div className={styles.container} style={props.over ? {zIndex: 100000} : {}} ref={state.do.setRef}>
  </div>);
}
