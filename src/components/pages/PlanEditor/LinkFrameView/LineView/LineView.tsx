import { useState, useEffect, useCallback, useContext } from 'react';
import styles from './LineView.module.scss';
import stateFactory from './LineView.state.ts';
import useForest from '~/lib/useForest'
import { LinkFrameStateContext } from '~/components/pages/PlanEditor/LinkFrameView/LinkFrameView'
import useForestFiltered from '~/lib/useForestFiltered'

type LineViewProps = {}

export default function LineView(props: LineViewProps) {
  const linkState = useContext(LinkFrameStateContext);

  const [value, state] = useForest([stateFactory, props, linkState],
    (localState) => {
    });

  const {} = value;

  const { spriteDir, id } = useForestFiltered(linkState!, ['spriteDir', 'id']);
  const {
    spriteDir: targetSpriteDir,
    id: targetId
  } = useForestFiltered(linkState!.child('target')!, ['spriteDir', 'id']);

  const visibility = (spriteDir && id && targetSpriteDir && targetId) ? 'visible' : 'hidden';

  useEffect(() => state.$.draw(), [
    id,
    targetId,
    spriteDir,
    targetSpriteDir
  ]);

  return (<div className={styles.container} ref={state.do.setRef} style={{visibility}}>

  </div>);
}
