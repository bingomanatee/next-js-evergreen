import {leafI, typedLeaf} from '@wonderlandlabs/forest/lib/types'
import {SVG} from '@svgdotjs/svg.js'
import dataManager from '~/lib/managers/dataManager'
import {frameToPoint} from '~/lib/utils/px'
import {LFSummary, X_DIR, Y_DIR} from '~/types'
import {Vector2} from 'three'
import {isEqual} from "lodash";
import {cache} from "./LineViewCache";

export type LineViewStateValue = {
  fromPoint: Vector2 | null,
  toPoint: Vector2 | null
} & LFSummary;

type leafType = typedLeaf<LineViewStateValue>;

const validator = (id) => (frame) => {
  if (!id) {
    return !frame;
  }
  return frame?.id === id;
}

const retriever = (id) => async () => {
  if (!id) {
    return null;
  }
  return dataManager.do(async (db) => {
    let fromFrame = await db.frames.fetch(id);
    return fromFrame ? fromFrame.toJSON() : null;
  })
}

const LineViewState = (props, linkState) => {
  const $value: LineViewStateValue = {
    id: null,
    spriteDir: null,
    mapPoint: null,
    targetId: null,
    targetSpriteDir: null,
    targetMapPoint: null,
    fromPoint: null,
    toPoint: null,
  };
  let element: HTMLDivElement | null = null;

  return {
    name: "LineView",
    $value,

    selectors: {
      canDraw(state: leafType) {
        const {id, spriteDir, targetId, targetSpriteDir, targetMapPoint} = state.value;
        return !!(id && spriteDir && (targetSpriteDir || targetMapPoint) && targetId && element);
      },
      async fromFrame(state: leafType) {
        const {id} = linkState.value;
        return cache(state, 'fromFrame', retriever(id), validator(id));
      },
      async toFrame(state: leafType) {
        const {id} = linkState.child('target')!.value;
        return cache(state, 'toFrame', retriever(id), validator(id));
      },
      async genFromPoint(state: leafType) {
        const {spriteDir, id} = linkState.value;
        if (!(spriteDir && id)) {
          return null;
        }
        const frame = await state.$.fromFrame();
        return frame ? frameToPoint(frame, spriteDir) : null
      },
      async genToPoint(state: leafI) {
        const {spriteDir, id, mapPoint} = linkState.child('target')!.value;

        if (!((spriteDir || mapPoint) && id)) {
          return null;
        }
        const frame = linkState.value.target.frame;
        if (mapPoint) {
          const point = await dataManager.do(async (db) => {
            return db.map_points.fetch(mapPoint);
          })
          if (!point) return null;

          const {x, y} = point;
          const vector = frameToPoint(frame, {x: X_DIR.X_DIR_L, y: Y_DIR.Y_DIR_T})!
          return vector.add(new Vector2(x, y)).round();

        }
        if (spriteDir) {
          return frame ? frameToPoint(frame, spriteDir) : null
        }
        return null;
      }
    },

    actions: {
      save(state: leafType) {
        linkState.do.save(state.value);
      },
      cancel() {
        linkState.do.clearLock();
      },
      init(state: leafType) {
        return linkState.subscribe((value) => {

          const {id, spriteDir, target} = value;
          const {id: targetId, spriteDir: targetSpriteDir, mapPoint: targetMapPoint} = target;
          state.value = {...state.value, ...{id, spriteDir, targetSpriteDir, targetId, targetMapPoint} };

          state.$.genFromPoint().then((p) => {
            if (!isEqual(state.value.fromPoint, p)) {
              state.do.set_fromPoint(p);
            }
          });

          state.$.genToPoint().then((p) => {
            if (!isEqual(state.value.toPoint, p)) {
              state.do.set_toPoint(p);
            }
          });

        })
      },
      setRef(state: leafType, e: HTMLDivElement) {
        element = e;
        state.value = {...state.value}
      },
      async draw(state: leafType) {
        const {fromPoint, toPoint} = state.value;
        if (!(fromPoint && toPoint && element)) {
          return null;
        }
        element!.innerHTML = '';

        const draw = SVG().addTo(element!).size('100vw', '100vh');
        draw.line(
            fromPoint.x,
            fromPoint.y,
            toPoint.x,
            toPoint.y
        ).stroke({color: 'black', width: 4});
      }
    }
  };
};

export default LineViewState;
