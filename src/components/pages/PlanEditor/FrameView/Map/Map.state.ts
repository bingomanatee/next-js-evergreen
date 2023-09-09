import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { Frame } from '~/types'
import {isEqual} from 'lodash';

export type MapStateValue = {};

type leafType = typedLeaf<MapStateValue>;
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOOK_API_PUBLIC_TOKEN

const MapState = (props) => {
  const $value: MapStateValue = {
    mapData: false,
    ratio: 1
  };
  return {
    name: "Map",
    $value,

    selectors: {},

    actions: {
      init(state: leafType, frame: Frame) {
        state.do.mergeFrame(frame);
      },
      mergeFrame(state: leafType, frame: Frame) {
        let data = {
          lat: 0,
          lng: 0,
          placeSearch: '',
          description: '',
          zoom: 9,
          viewZoom: 100
        };
        try {
          try {
            const vJson = JSON.parse(frame.value);
            if ('lat' in vJson && 'lng' in vJson) {
              Object.keys(data).forEach((key) => {
                if (key in data) {
                  data[key] = vJson[key];
                }
              })
            }
          } catch (err) {
           // console.warn('cannot jsonify ', frame.value);
          }
        } catch (err) {

        }
        if (!isEqual(data, state.value.mapData))
        state.do.set_mapData(data);
      },

      setRef(state: leafType, container: HTMLDivElement) {
        const {lng, lat, zoom} = state.value.mapData;


        if (container && !state.getMeta('map') && zoom) {
          const map = new mapboxgl.Map({
            container,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [lng, lat],
            zoom,
            antialias: true,
            interactive: false,
            compact: true
          });

          state.setMeta('map', map)
        }
      }
    }
  };
};

export default MapState;
