'use client'
import axios from 'axios'
import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { MarkdownEditorStateValue } from '~/components/pages/PlanEditor/FrameDetail/MarkdownEditor/MarkdownEditor.state'
import googleMaps from '~/lib/googleMaps'

export type MapEditorStateValue = {
  lat: number,
  lon: number,
  placeSearch: string,
  pred: Record<string, any>[]
};

type leafType = typedLeaf<MapEditorStateValue>;

const MapEditorState = (props: { frameState: leafI }) => {
  const { frameState } = props;
  const $value: MarkdownEditorStateValue = {
    lat: 0,
    lon: 0,
    placeSearch: '',
    pred: [],
  };
  return {
    name: "MarkdownEditor",
    $value,

    selectors: {},

    actions: {
      async search(state: leafType) {
        const { placeSearch } = state.value;
        if (!placeSearch) {
          return state.do.set_pred([]);
        }

        if (!state.getMeta('googleMapService')) {
          const api = await googleMaps();
          console.log('api: ', api);
          state.setMeta('googleMapService', api);
        }

        const api = state.getMeta('googleMapService');
        const mapService = new api.maps.places.AutocompleteService();
        mapService.getQueryPredictions({ input: placeSearch },
          (
            pred: google.maps.places.QueryAutocompletePrediction[] | null,
          ) => {
            console.log('pred: ', pred);
            if (pred) {
              state.do.set_pred(pred);
            } else {
              state.do.set_pred([]);
            }
          }
        )
      },

      init(state: leafType) {
        const { value } = frameState.value.frame;

        try {
          const data = JSON.parse(value);
          const { lat, lon, placeSearch } = data;
          if (lat) {
            state.do.set_lat(lat);
          }
          if (lon) {
            state.do.set_lon(lon);
          }
          if (placeSearch) {
            state.do.set_placeSearch(placeSearch);
          }
        } catch (err) {
        }
      }
    }
  };
};

export default MapEditorState;
