import { useEffect, useRef, useState } from 'react';
/*import styles from './MoveFrameView.module.scss';
import stateFactory from './MoveFrameView.state.ts';
import useForest from '~/lib/useForest';*/
import { PlanEditorStateValue } from '~/components/pages/PlanEditor/PlanEditor.state'
import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import resizeManagerFactory from '~/components/pages/PlanEditor/managers/resizeManager'
import { Subscription } from 'rxjs'
import { Forest } from '@wonderlandlabs/forest'
import { Box, Spinner } from '@chakra-ui/react'
import { c } from '@wonderlandlabs/collect'
import { AllDirections, Direction, X_DIR, Y_DIR } from '~/components/pages/PlanEditor/managers/resizeManager.types'

type MoveFrameViewProps = { planEditorState: typedLeaf<PlanEditorStateValue> };

type MFSProps = {
  planEditorState: leafI,
  name: string,
  dir: Direction
}

function MoveFrameSprite(props: MFSProps) {
  const { dir, planEditorState, name, moveState } = props;
  const boxRef = useRef(null);
  return <Box
    backgroundColor="purple"
    position="absolute"
    w={4}
    h={4}
    overflow="hidden"
    zIndex={100000}
    {...moveState.$.posStyle(dir, boxRef)}
    ref={boxRef}
  >
    {name}
  </Box>
}

/**
 * AS the style initializer is async,
 * we can't use the standard Forest hooks here
 */
export default function MoveFrameView(props: MoveFrameViewProps) {
  const { planEditorState } = props;
  const [value, setValue] = useState(null)
  const [state, setState] = useState<leafI | null>(null);
  useEffect(() => {
    let sub: Subscription | undefined;
    const { modeTarget } = props.planEditorState.value;
    resizeManagerFactory(modeTarget).then((config) => {
      let localState = new Forest(config)
      setState(localState);
      sub = localState.subscribe(setValue);
    });
    return () => {
      sub?.unsubscribe();
    }
  }, [props.planEditorState]);

  if (!state) {
    return <Spinner/>
  }

  return (<>
    {c(AllDirections).getReduce((memo, dir: Direction, key: string) => {
      if (dir.x === X_DIR.X_DIR_C && dir.y === Y_DIR.Y_DIR_M) {
        return memo;
      }
      memo.push(
        <MoveFrameSprite
          key={key}
          name={key}
          dir={dir}
          moveState={state}
          planEditorState={planEditorState}/>
      )
      return memo;
    }, [])}
  </>);
}
