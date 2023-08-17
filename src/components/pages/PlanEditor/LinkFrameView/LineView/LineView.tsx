import { useEffect, useContext } from 'react';
import styles from './LineView.module.scss';
import stateFactory from './LineView.state.ts';
import useForest from '~/lib/useForest'
import { LinkFrameStateContext } from '~/components/pages/PlanEditor/LinkFrameView/LinkFrameView'
import useForestFiltered from '~/lib/useForestFiltered'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { LFSummary } from '~/types'
import { vectorToStyle } from '~/lib/utils/px'
import { Button, HStack } from '@chakra-ui/react'
import { Vector2 } from 'three'

type LineViewProps = {}

function SaveButton(props: {
  state: leafI,
  fromPoint: Vector2
} & LFSummary) {
  const { state, fromPoint } = props;

  if (!(state.$.canDraw() && fromPoint)) {
    console.log('no save button');
    return null;
  }

  return <HStack
    data-role="line-view-buttons"
    spacing={3}
    style={vectorToStyle(fromPoint!)}
    layerStyle="line-view-button"
  >
    <Button colorScheme="blue">Save Line</Button>
    <Button>Cancel</Button>
  </HStack>
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

  useEffect(() => {
    const sub1 = state.select((subset) => {
      state.$.genFromPoint().then((p) => {
        return state.do.set_fromPoint(p)
      });
    }, (value) => {
      return [value.id, value.spriteDir]
    })

    const sub2 = state.select((subset) => {
        state.$.genToPoint().then((p) => {
          state.do.set_toPoint(p)
        });
      },
      (value) => ([value.targetId, value.targetSpriteDir])
    )

    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe()
    }
  }, [state])
  const { fromPoint, toPoint } = value;

  useEffect(() => {
    state.do.draw();
  }, [state, fromPoint, toPoint])

  const { spriteDir, id } = useForestFiltered(linkState!, ['spriteDir', 'id']);
  const {
    spriteDir: targetSpriteDir,
    id: targetId
  } = useForestFiltered(linkState!.child('target')!, ['spriteDir', 'id']);

  const visibility = (spriteDir && id && targetSpriteDir && targetId) ? 'visible' : 'hidden';

  return (<>
    <div className={styles.container} ref={state.do.setRef} style={{ visibility }}>

    </div>
    <SaveButton state={state} {...value} />
  </>);
}
