import { useState, useEffect, useCallback, useMemo, useRef, useContext } from 'react';
import styles from './Map.module.scss';
import stateFactory from './Map.state.ts';
import useForest from '~/lib/useForest';
import { Frame } from '~/types'
import ReactMapboxGl from 'react-mapbox-gl'
import px, { vectorToStyle } from '~/lib/utils/px'
import { Vector2 } from 'three'
import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import useForestFiltered from '~/lib/useForestFiltered'

type MapProps = { frame: Frame }
const Map = ReactMapboxGl({
  accessToken:
  process.env.NEXT_PUBLIC_MAPBOOK_API_PUBLIC_TOKEN,
  interactive: false
});

export default function MapView(props: MapProps) {
  const { frame } = props;
  const planEditorState = useContext(PlanEditorStateCtx);
  const { zoom } = useForestFiltered(planEditorState!, ['zoom'])

  const [value, state] = useForest([stateFactory, props, planEditorState],
    (localState) => {
      localState.do.init(props.frame);
    });

  useEffect(() => {
    state.do.mergeFrame(frame);
  }, [frame])

  const {mapData} = value;

  const size = useMemo(() => new Vector2(frame.width, frame.height).round(),
    [frame.width, frame.height]);

  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.resize();
        mapRef.current.setCenter(mapData.lng, mapData.lat);
        mapRef.current.triggerRepaint();
      }, 100);
    }
  }, [size])

  if (!(mapData.lng && mapData.lat)) return null;
  return (
      <div style={{ width: px(size.x), height: px(size.y) }}>
        <Map
          style="mapbox://styles/mapbox/streets-v9"
          onStyleLoad={(map) => {
            console.log('map object', map);
            mapRef.current = map;
          }}
          center={[mapData.lng, mapData.lat]}
          zoom={[mapData.zoom]}
          containerStyle={{
            width: '100%',
            height: '100%'
          }}/>
      </div>
  )
}
