'use client'
import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { MarkdownEditorStateValue } from '~/components/pages/PlanEditor/FrameDetail/MarkdownEditor/MarkdownEditor.state'
import googleMaps from '~/lib/googleMaps'
import QueryAutocompletePrediction = google.maps.places.QueryAutocompletePrediction

export type MapEditorStateValue = {
  lat: number,
  lng: number,
  zoom: number,
  placeSearch: string,
  pred: Record<string, any>[]
};

type leafType = typedLeaf<MapEditorStateValue>;

const MapEditorState = (props: { frameState: leafI }) => {
  const { frameState } = props;
  const {value} = frameState.value;
  let $value: MarkdownEditorStateValue = {
    lat: 0,
    lng: 0,
    placeSearch: '',
    description : '',
    pred: [],
    zoom: 9,
  };
  try {
    const vJson = JSON.parse(value);
    if ('lat' in vJson && 'lng' in vJson) {
      Object.keys($value).forEach((key)  => {
        if (key in $value) {
          $value[key] = vJson[key];
        }
      })
    }
  } catch (err) {
    console.warn('cannot jsonify ', value);
  }

  console.log('$value for ', value, 'is', $value);

  return {
    name: "MarkdownEditor",
    $value,

    selectors: {
      zoomArray(state: leafType) {
        return [state.value.zoom];
      },
      async api(state: leafType) {
        if (!state.getMeta('googleMapService')) {
          const api = await googleMaps();
          state.setMeta('googleMapService', api);
          return api;
        }
        return state.getMeta('googleMapService');
      }
    },


    actions: {

      onMapMove(state: leafType, map){
        const {lng, lat} = map.getCenter();
        state.do.set_lng(lng);
        state.do.set_lat(lat);
      },

      onMapZoom(state: leafType, map){
        const zoom = map.getZoom();
        state.do.set_zoom(zoom);
      },

      async choosePred(state: leafType, pred: QueryAutocompletePrediction) {
        const api = await state.$.api();
        const service = new api.maps.Geocoder();

        const { results: [data] } = await service.geocode({
          placeId: pred.place_id,
        });
        if (data) {
          try {
            const {geometry, formatted_address} = data;
            state.do.set_lat(geometry.location.lat());
            state.do.set_lng(geometry.location.lng());
            state.do.set_description(formatted_address);
            state.do.set_placeSearch('');
            state.do.set_pred([]);
          } catch (err) {
            console.error('cannot get location', err.message);
          }
        }
      },
      async search(state: leafType) {
        const { placeSearch } = state.value;
        if (!placeSearch) {
          return state.do.set_pred([]);
        }

        const api = await state.$.api();
        const mapService = new api.maps.places.AutocompleteService();
        mapService.getQueryPredictions({ input: placeSearch },
          (
            pred: QueryAutocompletePrediction[] | null,
          ) => {
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
          const { lat, lng, placeSearch } = data;
          if (lat) {
            state.do.set_lat(lat);
          }
          if (lng) {
            state.do.set_lng(lng);
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
