import { useState, useEffect, useCallback, PropsWithChildren, useContext } from 'react';
import styles from './FrameAnchorView.module.scss';
import stateFactory from './FrameAnchorView.state.ts';
import useForest from '~/lib/useForest';
import useForestFiltered from '~/lib/useForestFiltered'
import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'

type FrameAnchorViewProps = PropsWithChildren<{}>

export default function FrameAnchorView(props: FrameAnchorViewProps) {
/*  const [value, state] = useForest([stateFactory, props],
    (localState) => {
    });

  const {} = value;*/

  const planEditorState = useContext(PlanEditorStateCtx);
  const { zoom } = useForestFiltered(planEditorState!, ['zoom']);

  return (<div className={styles.container} style={{
    transform: 'scale(' + zoom + ')',
  }}>
    {props.children}
  </div>);
}
