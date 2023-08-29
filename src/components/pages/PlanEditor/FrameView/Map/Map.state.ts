import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { Frame } from '~/types'
import {isEqual} from 'lodash';

export type MapStateValue = {};

type leafType = typedLeaf<MapStateValue>;

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
            console.warn('cannot jsonify ', frame.value);
          }
        } catch (err) {

        }
        if (!isEqual(data, state.value.mapData))
        state.do.set_mapData(data);
      }

    }
  };
};

export default MapState;
