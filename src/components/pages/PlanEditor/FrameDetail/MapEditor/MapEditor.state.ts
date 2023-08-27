'use client'
import axios from 'axios'
import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { MarkdownEditorStateValue } from '~/components/pages/PlanEditor/FrameDetail/MarkdownEditor/MarkdownEditor.state'
import googleMaps from '~/lib/googleMaps'
import PlaceResult = google.maps.places.PlaceResult
import QueryAutocompletePrediction = google.maps.places.QueryAutocompletePrediction

export type MapEditorStateValue = {
  lat: number,
  lon: number,
  zoom: number,
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
    description : '',
    pred: [],
    zoom: 9,
  };
  return {
    name: "MarkdownEditor",
    $value,

    selectors: {
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
      async initMapbox(state: leafType, container) {
        const {lon, lat, zoom} = state.value;
        const map =  new mapboxgl.Map({
          container: container,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [lon, lat],
          zoom: zoom
        });
        state.setMeta('map', map,true);
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
            state.do.set_lon(geometry.location.lng());
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
