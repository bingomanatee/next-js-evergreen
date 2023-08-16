import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { SVG } from '@svgdotjs/svg.js'
import dataManager from '~/lib/managers/dataManager'
import { frameToPoint, frameToSize } from '~/lib/utils/px'

export type LineViewStateValue = {};

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
  const $value: LineViewStateValue = {};
  let element: HTMLDivElement | null = null;

  return {
    name: "LineView",
    $value,

    selectors: {
      canDraw() {
        const { id, spriteDir } = linkState.value;
        const { id: targetId, spriteDir: targetSpriteDir } = linkState.child('target')!.value;
        return id && spriteDir && targetSpriteDir && targetId && element;
      },
      async fromFrame(state: leafI) {
        const { id } = linkState.value;
        return cache(state, 'fromFrame', retriever(id), validator(id));
      },
      async toFrame(state: leafI) {
        const { id } = linkState.child('target')!.value;
        return cache(state, 'toFrame', retriever(id), validator(id));
      },
      async fromPoint(state: leafI) {
        const { spriteDir, id } = linkState.value;
        if (!(spriteDir && id)) return null;
        const frame = await state.$.fromFrame();
        return frame ? frameToPoint(frame, spriteDir) : null
      },
      async toPoint(state: leafI) {
        const { spriteDir, id } = linkState.child('target')!.value;
        if (!(spriteDir && id)) return null;
        const frame = await state.$.toFrame();
        return frame ? frameToPoint(frame, spriteDir) : null
      }
    },

    actions: {
      init(state: leafType) {
      },
      setRef(state: leafType, e: HTMLDivElement) {
        element = e;
      },
      async draw(state: leafType) {
        if (!state.$.canDraw()) {
          return
        }
        element!.innerHTML = '';

        const fromPoint = state.$.fromPoint();
        const toPoint = state.$.toPoint();

        const draw = SVG().addTo(element!).size('100%', '100%');
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
