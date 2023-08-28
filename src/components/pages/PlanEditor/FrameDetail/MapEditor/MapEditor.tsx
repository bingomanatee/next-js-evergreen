"use client"
import stateFactory from './MapEditor.state.ts';
import useForest from '~/lib/useForest';
import { Box } from '@chakra-ui/react'
import { PlaceInfo } from '~/components/pages/PlanEditor/FrameDetail/MapEditor/PlaceInfo'
import { PlaceSearch } from '~/components/pages/PlanEditor/FrameDetail/MapEditor/PlaceSearch'
import { useContext } from 'react'
import { FrameStateContext } from '~/components/pages/PlanEditor/FrameDetail/FrameStateContext'

type MapEditorProps = {}

export default function MapEditor(props: MapEditorProps) {
  const frameDetailState = useContext(FrameStateContext);

  const [value, state] = useForest([stateFactory, props],
    (localState) => {
      const sub = localState.select((data) => {
          frameDetailState.do.set_value(JSON.stringify(data));
        },
        (data) => {
          const out = { ...data }
          delete out.pred;
          return out;
        })
      return () => sub?.unsubscribe();
    });

  const { description } = value;

  return (
    <Box>
      {!description ? <PlaceSearch state={state}/> : <PlaceInfo state={state}/>}
    </Box>
  );
}
