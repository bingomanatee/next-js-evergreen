import {useEffect, useContext} from 'react';
import styles from './LineView.module.scss';
import stateFactory from './LineView.state.ts';
import useForest from '~/lib/useForest'
import {LinkFrameStateContext} from '~/components/pages/PlanEditor/LinkFrameView/LinkFrameView'
import {leafI} from '@wonderlandlabs/forest/lib/types'
import {LFSummary} from '~/types'
import {vectorToStyle} from '~/lib/utils/px'
import {Button, HStack, Box} from '@chakra-ui/react'
import {Vector2} from 'three'
import {PlanEditorStateCtx} from '~/components/pages/PlanEditor/PlanEditor'

type LineViewProps = {}

function SavePanel(props: {
  state: leafI,
  fromPoint: Vector2
} & LFSummary) {
  const {state, fromPoint} = props;
  const planEditorState = useContext(PlanEditorStateCtx);

  if (!(state.$.canDraw() && fromPoint)) {
    return null;
  }
  const {zoom} = planEditorState!.value;

  return <Box
      layerStyle="line-view-button"
      style={vectorToStyle(fromPoint!)}>
    <div style={{
      transform: `scale(${100 / zoom})`
    }}>
      <HStack
          data-role="line-view-buttons"
          spacing={3}
          layerStyle="line-view-flex">
        <Button colorScheme="blue" onClick={state.do.save}>Save Line</Button>
        <Button onClick={state.do.cancel}>Cancel</Button>
      </HStack>
    </div>
  </Box>
}

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

  return (<>
    <div data-role="preview-line" className={styles.container} ref={state.do.setRef} style={{visibility}}>
    </div>
    <SavePanel state={state} {...value} />
  </>);
}
