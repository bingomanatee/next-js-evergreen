import { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './Map.module.scss';
import stateFactory from './Map.state.ts';
import useForest from '~/lib/useForest';
import { Frame } from '~/types'
import ReactMapboxGl from 'react-mapbox-gl'

type MapProps = { frame: Frame }
const Map = ReactMapboxGl({
  accessToken:
  process.env.NEXT_PUBLIC_MAPBOOK_API_PUBLIC_TOKEN
});

export default function MapView(props: MapProps) {
  const [value, state] = useForest([stateFactory, props],
    (localState) => {
    });

  const mapData = useMemo(() => {
    let data = {
      lat: 0,
      lng: 0,
      placeSearch: '',
      description: '',
      zoom: 9,
    };
    try {
      try {
        const vJson = JSON.parse(props.frame.value);
        if ('lat' in vJson && 'lng' in vJson) {
          Object.keys(data).forEach((key) => {
            if (key in data) {
              data[key] = vJson[key];
            }
          })
        }
      } catch (err) {
        console.warn('cannot jsonify ', props.frame.value);
      }
    } catch (err) {

    }
    return data;
  }, [
    props.frame.value
  ])

  return (
    <Map
      style="mapbox://styles/mapbox/streets-v9"
      center={[mapData.lng, mapData.lat]}
      zoom={[mapData.zoom]}
      interactive={false}
      containerStyle={{
        width: '100%',
        height: '100%'
      }}>
    </Map>);
}
