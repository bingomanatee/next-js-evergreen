"use client"
import stateFactory from './MapEditor.state.ts';
import useForest from '~/lib/useForest';
import {Box} from '@chakra-ui/react'
import {PlaceInfo} from '~/components/pages/PlanEditor/FrameDetail/MapEditor/PlaceInfo'
import {PlaceSearch} from '~/components/pages/PlanEditor/FrameDetail/MapEditor/PlaceSearch'
import {useContext} from 'react'
import {FrameStateContext} from '~/components/pages/PlanEditor/FrameDetail/FrameStateContext'
import styles from './MapEditor.module.scss';

type MapEditorProps = {}

export default function MapEditor(props: MapEditorProps) {
  const frameDetailState = useContext(FrameStateContext);

  const [value, state] = useForest([stateFactory, props, frameDetailState],
      (localState) => {
        console.log('map editor init');
        return localState.do.init();
      });

  const {description} = value;

  return (
      <Box>
        {!description ? <PlaceSearch state={state}/> : <PlaceInfo state={state}/>}
      </Box>
  );
}
