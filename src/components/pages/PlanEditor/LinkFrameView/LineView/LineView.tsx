import {useContext, useEffect} from 'react';
import styles from './LineView.module.scss';
import stateFactory from './LineView.state.ts';
import useForest from '~/lib/useForest'
import {LinkFrameStateContext} from '~/components/pages/PlanEditor/LinkFrameView/LinkFrameView'

type LineViewProps = {}

export default function LineView(props: LineViewProps) {
  const linkState = useContext(LinkFrameStateContext);

  const [value, state] = useForest([stateFactory, props, linkState],
      (localState) => {
        let sub = localState.do.init();

        return () => {
          sub?.unsubscribe();
        }
      });

  const {fromPoint, toPoint} = value;

  useEffect(() => {
    state.do.draw();
  }, [state, fromPoint, toPoint])

  const visibility = state.$.canDraw() ? 'visible' : 'hidden';

  return (
      <div data-role="preview-line" className={styles.container} ref={state.do.setRef} style={{visibility}}>
      </div>
  );
}
