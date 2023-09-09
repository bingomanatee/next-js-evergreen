'use client'
import {leafI, typedLeaf} from '@wonderlandlabs/forest/lib/types'
import {MarkdownEditorStateValue} from '~/components/pages/PlanEditor/FrameDetail/MarkdownEditor/MarkdownEditor.state'
import googleMaps from '~/lib/googleMaps'
import QueryAutocompletePrediction = google.maps.places.QueryAutocompletePrediction
import {v4} from 'uuid'
import dataManager from '~/lib/managers/dataManager'
import {MapPoint} from '~/types'
import mapboxgl from 'mapbox-gl';
import blockManager from "~/lib/managers/blockManager";
import {asJson} from "~/lib/utils/schemaUtils";

export type MapEditorStateValue = {
  lat: number,
  lng: number,
  zoom: number,
  interactive: number,
  placeSearch: string,
  pred: Record<string, any>[],
  loaded: boolean,
  infoPoint: string,
};

type leafType = typedLeaf<MapEditorStateValue>;

const MapEditorState = (props: { frameState: leafI }) => {
  const {frameState} = props;
  const frameId = frameState.value.id;

  const {value} = frameState.value;
  let $value: MarkdownEditorStateValue = {
    loaded: false,
    lat: 0,
    lng: 0,
    interactive: 0,
    placeSearch: '',
    description: '',
    pred: [],
    zoom: 9,
    infoPoint: '',
  };
  try {
    const vJson = JSON.parse(value);
    if ('lat' in vJson && 'lng' in vJson) {
      Object.keys($value).forEach((key) => {
        if (key in $value) {
          $value[key] = vJson[key];
        }
      })
    }
  } catch (err) {
    console.warn('cannot jsonify ', value);
  }

  return {
    name: "MapEditor",
    $value,
    type: true,
    selectors: {
      async locationInfo(state: leafType, point: MapPoint | null) {
        if (!point) return;
        if (!state.getMeta('mapAC')) {
          const api = await state.$.api();
          const service = new api.maps.Geocoder();
          // await api.maps.importLibrary('places');
          state.setMeta('google-maps-places', service);
        }
        const ac = state.getMeta('google-maps-places');
        return new Promise((done, fail) => {
          ac.geocode({
            location: {
              lat: point.lat, lng: point.lng
            }
          }, (results) => {
            if (Array.isArray(results)) {
              done(results[0]);
            }
            done(null);
          });
        })
      },
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
      onTabChange(state: leafType, option = null) {
        const map = state.getMeta('map');
        if (!map) {
          console.log('--- no map');
          return;
        }
        if (option !== null) {
          state.do.set_interactive(option);
        } else {
          return state.do.onTabChange(state.value.interactive);
        }

        if (map.touchZoomRotate) map.touchZoomRotate.disable();
        if (map.touchPitch) map.touchPitch.disable();
        map.doubleClickZoom.disable();
        map.dragRotate.disable();

        switch (option) {
          case 0:
            map.scrollZoom.disable();
            map.dragPan.disable();
            break;

          case 1:
            map.scrollZoom.enable();
            map.dragPan.enable();
            break;
        }
      },

      onMapMove(state: leafType, {target: map}) {
        const {lng, lat} = map.getCenter();
        state.do.set_lng(lng);
        state.do.set_lat(lat);
      },

      updateZoom(state: leafType, zoom: number) {
        state.do.set_zoom(zoom);
        state.getMeta('map')?.setZoom(zoom);
      },

      onMapZoom(state: leafType, {target: map}) {
        const zoom = map.getZoom();
        state.do.set_zoom(zoom);
      },

      async choosePred(state: leafType, pred: QueryAutocompletePrediction) {
        const api = await state.$.api();
        const service = new api.maps.Geocoder();

        const {results: [data]} = await service.geocode({
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
        const {placeSearch} = state.value;
        if (!placeSearch) {
          return state.do.set_pred([]);
        }

        const api = await state.$.api();
        const mapService = new api.maps.places.AutocompleteService();
        mapService.getQueryPredictions({input: placeSearch},
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
      onMapClick(state: leafType, data) {
        const map = state.getMeta('map');
        if (state.value.interactive || !map) {
          return;
        }
        const info = {id: v4(), ...data.lngLat, label: ''};
        const mapPoints = state.child('mapPoints')!
        mapPoints.do.addPoint(info);
      },

      dataToFrame(state: leafType) {
        return state.select((data) => {
              frameState.do.set_value(JSON.stringify(data));
            },
            (data) => {
              const out = {...data}
              delete out.pred;
              return out;
            })
      },
      frameToState(state: leafType) {
        try {
          const data = JSON.parse(frameState.value.frame);
          const {lat, lng, placeSearch} = data;
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
      },
      observeSaving(state: leafType) {
        console.log('--- observeSaving')
        const sub = frameState.parent.subscribe((value) => {
          if (value.saving) {
            state.child('mapPoints')!.do.save();
            sub.unsubscribe();
          }
        });
        return sub;
      },

      init(state: leafType) {
        state.do.frameToState();
        const subLocal = state.do.dataToFrame();
        state.child('mapPoints')!.do.init();
        const sub = state.do.observeSaving();
        state.do.set_loaded(true);
        return () => {
          setTimeout(() => {
            sub?.unsubscribe();
            subLocal?.unsubscribe();
          }, 100);
        }
      },
      async initMap(state: leafType, element) {

        const lastMap = state.getMeta('map')
        if (lastMap) {
          try {
            lastMap.remove();
          } catch (err) {
            console.log('error removing last map:', lastMap, err);
          }
        }
        if (!element) return;

        if (!state.value.loaded) {
          await new Promise((done, fail) => {
            const sub = state.select((loaded) => {
              if (loaded) {
                sub.unsubscribe();
                done(true);
              }
            }, (value) => value.loaded)
          });
        }


        const {zoom, lng, lat} = state.value;

        const map = new mapboxgl.Map({
          container: element,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [lng, lat],
          zoom: zoom,
          boxZoom: false,
          scrollZoom: false,
          dragPan: false,
        });

        map.on('dragend', state.do.onMapMove);
        map.on('zoomend', state.do.onMapZoom);
        map.on('click', state.do.onMapClick);

        state.setMeta('map', map);

        state.do.onTabChange(0);
      }
    },

    children: {
      mapPoints: {
        $value: {
          points: new Map(),
          editingLabel: '',
        },
        meta: {
          markers: new Map()
        },
        selectors: {
          asList(state) {
            return Array.from(state.value.points.values());
          }
        },
        actions: {
          setPointLabel(state: leafType, id: string, label: string) {
            if (state.value.points.has(id)) {
              const point = state.value.points.get(id);
              const newPoint = {...point, label};
              const points = new Map(state.value.points);
              points.set(id, newPoint);
              state.do.set_points(points);
            }
          },
          removePoint(state: leafType, id: string) {
            const map = new Map(state.value.points);
            map.delete(id);
            state.do.set_points(map);
            const marker = state.getMeta('markers')?.get(id);
            if (marker) {
              marker.remove();
            }
          },
          clearEditingLabel(state: leafType) {
            state.do.set_editingLabel('');
          },
          updateLabel(state: leafType, id: string, label: string) {
            if (state.value.points.has(id)) {
              const point = state.value.points.get(id);
              point.label = label;
              state.do.addPoint(point);
            }
          },
          addPoint(state: leafType, point: MapPoint) {
            const points = new Map(state.value.points);
            points.set(point.id, point);
            state.do.set_points(points);
            const map = state.parent.getMeta('map');

            const marker = new mapboxgl.Marker()
                .setLngLat(point)
                .addTo(map);
            state.getMeta('markers')?.set(point.id, marker);
          },
          save(state: leafType) {
            console.log('mapEditor save')
            dataManager.do(async (db) => {
              const points = state.$.asList();
              console.log('points are ', points, 'from list', state.value);
              return db.map_points.updatePoints(frameId, points, true);
            })
          },
          async init(state: leafType) {
            const points = await dataManager.do((db) => db.map_points.forFrame(
                frameId
            ));
            const map = new Map();
            asJson(points).forEach((point: MapPoint) => {
              state.do.addPoint(point);
            });
          }
        }
      }
    },
  };
};

export default MapEditorState;
