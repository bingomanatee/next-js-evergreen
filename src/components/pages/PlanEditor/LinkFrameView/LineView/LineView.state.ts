import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { SVG } from '@svgdotjs/svg.js'
import dataManager from '~/lib/managers/dataManager'
import { frameToPoint } from '~/lib/utils/px'
import { LFSummary } from '~/types'
import { Vector2 } from 'three'

export type LineViewStateValue = { fromPoint: Vector2 | null, toPoint: Vector2 | null } & LFSummary;

type leafType = typedLeaf<LineViewStateValue>;

/**
 * returns a value from the state's meta -- or generates it if it is no longer current
 * @param state {leafI}
 * @param key {string} the place to store the value
 * @param retriever {function} how to generate a new value
 * @param validator {function} whether the current value is valid
 */
async function cache(state: leafI, key: string, retriever: () => Promise<any>, validator: (value: any) => boolean) {
  const current = state.getMeta(key);
  if (validator(current)) {
    return current;
  }
  const newValue = await retriever();
  state.setMeta(key, newValue, true);
  return newValue;
}

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
    targetId: null,
    targetSpriteDir: null,
    fromPoint: null, toPoint: null
  };
  let element: HTMLDivElement | null = null;

  return {
    name: "LineView",
    $value,

    selectors: {
      canDraw(state: leafType) {
        const { id, spriteDir, targetId, targetSpriteDir } = state.value;
        const out = !!(id && spriteDir && targetSpriteDir && targetId && element);
        return out;
      },
      async fromFrame(state: leafType) {
        const { id } = linkState.value;
        return cache(state, 'fromFrame', retriever(id), validator(id));
      },
      async toFrame(state: leafType) {
        const { id } = linkState.child('target')!.value;
        return cache(state, 'toFrame', retriever(id), validator(id));
      },
      async genFromPoint(state: leafType) {
        const { spriteDir, id } = linkState.value;
        if (!(spriteDir && id)) {
          return null;
        }
        const frame = await state.$.fromFrame();
        return frame ? frameToPoint(frame, spriteDir) : null
      },
      async genToPoint(state: leafI) {
        const { spriteDir, id } = linkState.child('target')!.value;
        if (!(spriteDir && id)) {
          return null;
        }
        const frame = await state.$.toFrame();
        return frame ? frameToPoint(frame, spriteDir) : null
      }
    },

    actions: {
      save(state: leafType) {
        linkState.do.save(state.value);
      },
      cancel(state: leafType) {
        linkState.do.cancel(state.value);
      },
      init(state: leafType) {
        return linkState.select((summary) => {
          state.value = { ...state.value, ...summary }
        }, (value) => {
          const { id, spriteDir, target } = value;
          const { id: targetId, spriteDir: targetSpriteDir } = target;
          return { id, spriteDir, targetSpriteDir, targetId }
        })
      },
      setRef(state: leafType, e: HTMLDivElement) {
        element = e;
        state.value = { ...state.value }
      },
      async draw(state: leafType) {
        const { fromPoint, toPoint } = state.value;
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
        ).stroke({ color: 'black', width: 4 });
      }
    }
  };
};

export default LineViewState;
