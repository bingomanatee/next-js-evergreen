import {c} from "@wonderlandlabs/collect";
import {MapPoint} from "~/types";
import dataManager from "~/lib/managers/dataManager";
import {asJson} from "~/lib/utils/schemaUtils";
import {typedLeaf} from "@wonderlandlabs/forest/lib/types";
import {Vector2} from "three";
import shortId from "~/lib/utils/shortId";
import {userManager} from "~/lib/managers/userManager";
import {LngLat} from "mapbox-gl";

export type MapPointsStateValue = {
  points: Map<string, MapPoint>,
  editingLabel: string,
  pointsSourceLoaded: boolean,
}

type mapPointsLeafType = typedLeaf<MapPointsStateValue>;

export default function mapPoints(frameId, planEditorState) {
  return {
    $value: {
      points: new Map(),
      editingLabel: '',
      pointsSourceLoaded: false,
      pointIcons: new Map(),
    },
    meta: {
      markers: new Map()
    },
    selectors: {
      map(state: mapPointsLeafType) {
        return state.parent!.getMeta('map');
      },
      asList(state: mapPointsLeafType) {
        return Array.from(state.value.points.values());
      },
      mapPointNearest(state: mapPointsLeafType, location: LngLat) {
        const point = new Vector2(location.lng, location.lat);
        return c(state.value.points).getReduce((memo: MapPoint | null, pt: MapPoint) => {
          if (!memo) {
            return pt;
          }

          const memoPoint = new Vector2(memo.lng, memo.lat);
          const candidatePoint = new Vector2(pt.lng, pt.lat);
          if (point.distanceToSquared(candidatePoint) < point.distanceToSquared(memoPoint)) {
            console.log('point ', candidatePoint, 'near to ', point);
            return pt;
          }

          console.log('point', candidatePoint, 'farther than ', memoPoint, 'from', location);
          return memo;
        }, null);
      },
      pointsToFeatures(state: mapPointsLeafType) {
        const features = c(state.value.points)
            .getReduce((memo, point: MapPoint, id) => {
              const icon = state.value.pointIcons.get(id) || 'map-point'

              memo.push({
                'type': 'Feature',
                'geometry': {
                  'type': 'Point',
                  'coordinates': [point.lng, point.lat]
                },
                properties: {
                  ...point,
                  icon,
                  point_label: `${point.label || shortId(point.id)}`
                }
              });
              return memo;
            }, []);

        return {
          'type': 'FeatureCollection',
          'features': features
        }

      }
    },
    actions: {
      refreshPointCoordinates(state: mapPointsLeafType) {
        const {points} = state.value;
        if (!points.size) {
          return;
        }
        const map: mapboxgl.Map | null = state.$.map();
        if (!map) {
          return;
        }

        dataManager.do(async (db) => {
          for (const point of state.$.asList()) {
            const {lat, lng, x, y} = point;
            const location = map.project([lng, lat]);
            const vector = new Vector2(location.x, location.y).round();

            if (vector.x !== x || vector.y !== y) {
              let newPoint = {...point, plan_id: dataManager.polledPlanId(), x: vector.x, y: vector.y};
              await db.map_points.incrementalUpsert(newPoint);
            }
          }
        });
      },
      setPointLabel(state: mapPointsLeafType, id: string, label: string) {
        if (state.value.points.has(id)) {
          const point = state.value.points.get(id);
          const newPoint = {...point, label};
          const points = new Map(state.value.points);
          points.set(id, newPoint);
          state.do.set_points(points);
        }
      },
      removePoint(state: mapPointsLeafType, id: string) {
        const map = new Map(state.value.points);
        map.delete(id);
        state.do.set_points(map);
        const marker = state.getMeta('markers')?.get(id);
        if (marker) {
          marker.remove();
        }
      },
      clearEditingLabel(state: mapPointsLeafType) {
        state.do.set_editingLabel('');
      },
      updateLabel(state: mapPointsLeafType, id: string, label: string) {
        if (state.value.points.has(id)) {
          const point = state.value.points.get(id);
          point.label = label;
          state.do.addPoint(point);
        }
      },
      addPoint(state: mapPointsLeafType, point: MapPoint, save = false) {
        let now = new Date().toISOString();

        const newPoint = {
          ...point,
          plan_id: dataManager.polledPlanId(),
          user_id: userManager.$.currentUserId(),
          created: now, updated: now, updated_from: now
        };

        const points = new Map(state.value.points);
        points.set(point.id, newPoint);
        state.do.set_points(points);
        state.do.refreshPoints();
        if (save) {
          state.do.save();
        }
      },
      save(state: mapPointsLeafType) {
        console.log('mapEditor save')
        dataManager.do(async (db) => {
          const points = state.$.asList();
          return db.map_points.updatePoints(frameId, points, true);
        })
      },

      async loadPoints(state: mapPointsLeafType) {
        const findFrameQuery = await dataManager.do((db) => db.map_points.forFrame(
            frameId
        ));
        const points = findFrameQuery.exec();
        const map = new Map();
        asJson(points).forEach((point: MapPoint) => {
          map.set(point.id, point);
        });

        state.do.set_points(map);
        state.do.refreshPoints();

        return findFrameQuery.$.subscribe((points) => {
          const map = new Map();
          asJson(points).forEach((point: MapPoint) => {
            map.set(point.id, point);
          });

          state.do.set_points(map);
          state.do.refreshPoints();
        })
      },

      async initImage(state: mapPointsLeafType, name, url) {
        const map = state.$.map();
        if (!map) {
          return;
        } // should never happen;
        if (map.hasImage(name)) {
          return;
        }
        return new Promise((done, fail) => {
          map.loadImage(url,
              (error, image) => {
                if (error) {
                  return fail(error);
                }

                if (!map.hasImage(name)) {
                  map.addImage(name, image);
                }
                done();
              }
          );
        });
      },
      async initPointIcon(state: mapPointsLeafType) {
        await Promise.all(
            [
              state.do.initImage('map-point', '/img/icons/map-point.png'),
              state.do.initImage('map-point-over', '/img/icons/map-point-over.png'),
              state.do.initImage('map-point-active', '/img/icons/map-point-active.png'),
            ]
        )
      },

      async initSource(state: mapPointsLeafType) {
        if (state.value.pointsSourceLoaded) {
          return;
        }
        let map = state.$.map();
        if (!map) {
          return;
        }

        await state.do.initPointIcon();
        map = state.$.map();
        if (!map) {
          return;
        }
        if (!map.getSource('points')) {
          const points = {
            'type': 'geojson',
            'data': state.$.pointsToFeatures()
          };
          map.addSource('points', points);
        }

        if (!map.getLayer('point-labels')) {
          map.addLayer({
            'id': 'point-labels',
            'type': 'symbol',
            'source': 'points',
            'layout': {
              'text-field': ['get', 'point_label'],
              'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
              'text-radial-offset': 0.5,
              'text-justify': 'auto',
              'text-size': 8,
              'icon-image': ['get', 'icon']
            }
          });
        }
        state.do.set_pointsSourceLoaded(true);
      },
      updateSource(state: mapPointsLeafType) {
        try {
          const map = state.$.map();
          if (!map) {
            return;
          }
          map.getSource('points')?.setData(state.$.pointsToFeatures());
        } catch (err) {
          console.error('error updating source:', err);
        }
      },

      async refreshPoints(state: mapPointsLeafType) {
        const map = state.$.map();
        if (!map) {
          return;
        }
        if (state.value.pointsSourceLoaded) {
          return state.do.updateSource();
        }
      },
      async init(state: mapPointsLeafType) {
        return state.do.loadPoints();
      }
    }
  }
}
