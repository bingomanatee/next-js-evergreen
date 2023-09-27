import {typedLeaf} from '@wonderlandlabs/forest/lib/types'
import mapboxgl from "mapbox-gl";
import mapPoints from "~/lib/stateFragments/mapPoints";
import {v4} from "uuid";
import dataManager from "~/lib/managers/dataManager";
import {string} from "zod";

export type MapPointDlogStateValue = {
  lat: number,
  lng: number,
  zoom: number,
  description: string,
  pred: Record<string, any>[],
  loaded: boolean,
  infoPoint: string,
  linkPoint: string,
  mapLoaded: boolean,
  mapMode: 'drag' | 'click'
};

type leafType = typedLeaf<MapPointDlogStateValue>;

const MapPointDlogState = (props, linkState, planEditorState) => {
  const targetState = linkState!.child('target')!;
  const {openLinkDlog} = props;
  const {frame} = targetState.value;

  let $value: MapPointDlogStateValue = {
    loaded: false,
    lat: 0,
    lng: 0,
    description: '',
    pred: [],
    zoom: 9,
    infoPoint: '',
    linkPoint: '',
    mapLoaded: false,
    mapMode: 'drag',
  };

  try {
    const vJson = JSON.parse(frame.value);
    if ('lat' in vJson && 'lng' in vJson) {
      Object.keys($value).forEach((key) => {
        if (['infoPoint', 'placeSearch', 'interactive', 'mapMode'].includes(key)) {
          return;
        }
        if (key in $value) {
          $value[key] = vJson[key];
        }
      })
    }
  } catch (err) {
    // console.warn('cannot jsonify ', value);
  }

  return {
    name: "MapPointDlog",
    $value,

    selectors: {},

    actions: {
      savePoint(state: leafType) {
        targetState.do.set_mapPoint(state.value.linkPoint || '');
        openLinkDlog.off();
      },
      init(state: leafType) {
        let pointSub;
        state.child('mapPoints')!.do.init().then((sub) => pointSub = sub);
        state.do.set_loaded(true);
        state.do.refreshActiveIcon();
        return () => pointSub?.unsubscribe();
      },
      enterListItem(state: leafType, e: MouseEvent) {
        state.do.set_infoPoint(e.target?.id || '')
        state.do.refreshActiveIcon();
      },
      chooseListItem(state: leafType, e: MouseEvent) {
        const newId = e.target?.id || '';
        if (newId && newId === state.value.linkPoint) {
          state.do.set_linkPoint('');
        } else state.do.set_linkPoint(newId)
        state.do.refreshActiveIcon();
      },
      leaveListItem(state) {
        state.do.set_infoPoint('');
        state.do.refreshActiveIcon();
      },

      refreshActiveIcon(state: leafType) {
        const {infoPoint, linkPoint} = state.value;
        const map = new Map();
        if (linkPoint) map.set(linkPoint, 'map-point-active');
        if (infoPoint && linkPoint !== infoPoint) map.set(infoPoint, 'map-point-over');

        const mapPoints = state.child('mapPoints')!;
        mapPoints.do.set_pointIcons(map);
        mapPoints.do.updateSource();
      },

      changeMapMode(state: leafType, mode: string) {
        state.do.set_mapMode(mode);

        const map = state.getMeta('map');
        if (!map) {
          return;
        }
        if (map.touchZoomRotate) map.touchZoomRotate.disable();
        if (map.touchPitch) map.touchPitch.disable();
        map.doubleClickZoom.disable();
        map.dragRotate.disable();

        switch (mode) {
          case 'click':
            map.scrollZoom.disable();
            map.dragPan.disable();
            break;

          case 'drag':
            map.scrollZoom.enable();
            map.dragPan.enable();
            break;
        }
      },

      async initMap(state: leafType, element) {
        if (state.value.mapLoaded) return;
        if (!element) return;
        if (state.getMeta('map')) return;

        const {zoom, lng, lat} = state.value;

        const map = new mapboxgl.Map({
          container: element,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [lng, lat],
          zoom: zoom,
          boxZoom: true,
          scrollZoom: true,
          dragPan: true,
        });

        //  map.on('dragend', state.do.onMapMove);
        //  map.on('zoomend', state.do.onMapZoom);
        //  map.on('click', state.do.onMapClick);
        map.addControl(new mapboxgl.NavigationControl({showCompass: false}));
        map.on('style.load', state.child('mapPoints')!.do.initSource);
        map.on('click', state.do.onMapClick);
        state.setMeta('map', map);
        state.do.set_mapLoaded(true);
      },

      onMapClick(state: leafType, data) {
        const map = state.getMeta('map');
        if ((state.value.mapMode !== 'click') || !map) {
          return;
        }
        const info = {id: v4(), ...data.lngLat, plan_id: dataManager.polledPlanId(), label: ''};
        const mapPoints = state.child('mapPoints')!
        mapPoints.do.addPoint(info, true);
      },

    },

    children: {
      mapPoints: mapPoints(frame.id, planEditorState)
    }
  };
};

export default MapPointDlogState;
