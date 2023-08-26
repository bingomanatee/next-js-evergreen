import { leafI } from '@wonderlandlabs/forest/lib/types'
import dataManager from '~/lib/managers/dataManager'
import { Vector2 } from 'three'
import { leafType } from '~/components/pages/PlanEditor/FrameDetail/StyleEditor/types'
import { DimensionValue, Direction, dirToString, Frame, isDirection, X_DIR, Y_DIR } from '~/types'
import blockManager from '~/lib/managers/blockManager'
import { string } from 'zod'

export const DIMENSION_ACTIONS = {
  async updateId(state: leafI, id: string) {
    state.do.set_id(id);
    await state.do.readFrame(id);
    state.do.set_loaded(!!id);
  },
  fromFrame(state: leafI, frame: Frame) {
    state.do.set_left(frame.left);
    state.do.set_top(frame.top);
    state.do.set_right(frame.left + frame.width);
    state.do.set_bottom(frame.top + frame.height);
    state.do.set_type(frame.type);
    state.do.set_loaded(true);
  },

  /**
   * save the frame with the dimensions' information
   * @param state
   */
  async updateFrame(state: leafI) {
    if (!state.value.id) {
      return;
    }
    const update = {
      left: state.$.left(),
      top: state.$.top(),
      width: state.$.width(),
      height: state.$.height()
    }
    const frame = await state.$.frame();
    try {
      await frame?.incrementalPatch(update);
    } catch (err) {
      console.error('cannot incremental update ', update, 'frame', frame, err);
    }

    blockManager.do.finish();
    // may not be necessary
    state.do.updateId(null);
    state.do.set_loaded(false);
    state.do.set_deltas(new Map());
  },

  async readFrame(state: leafI, id: string | null) {
    if (id === null) {
      return;
    }
    const frame = await state.$.frame();
    if (frame && (state.value.id === frame.id)) {
      // has not been synchronously changed
      state.do.fromFrame(frame);
    }
  }
}

export const DIMENSION_SELECTORS = {
  async frame(state: leafI) {
    const { id } = state.value;
    if (!id) {
      return null;
    }
    return await dataManager.do((db) => db.frames.fetch(id));
  },
  centerX(state: leafType) {
    return Math.round((state.$.left() + state.$.right()) / 2);
  },
  middleY(state: leafType) {
    return Math.round((state.$.top() + state.$.bottom()) / 2);
  },
  width(state: leafType) {
    return Math.max(0, state.$.right() - state.$.left());
  },
  height(state) {
    return Math.max(0, state.$.bottom() - state.$.top());
  },
  left(state: leafType) {
    const { left, deltas } = state.value;
    return Math.round(left + (deltas?.get('left') || 0));
  },
  right(state: leafType) {
    const { right, deltas } = state.value;
    return Math.round(right + (deltas?.get('right') || 0));
  },
  top(state: leafType) {
    const { top, deltas } = state.value;
    return Math.round(top + (deltas?.get('top') || 0));
  },
  bottom(state: leafType) {
    const { bottom, deltas } = state.value;
    return Math.round(bottom + (deltas?.get('bottom') || 0));
  },
  point(state: leafType, dir: Direction, offset ?: Vector2) {
    let x = 0;
    let y = 0;
    switch (dir.y) {
      case Y_DIR.Y_DIR_B:
        y = state.$.bottom();
        break;
      case Y_DIR.Y_DIR_M:
        y = state.$.middleY();
        break;
      case Y_DIR.Y_DIR_T:
        y = state.$.top();
        break;
    }
    switch (dir.x) {
      case X_DIR.X_DIR_C:
        x = state.$.centerX();
        break;
      case X_DIR.X_DIR_R:
        x = state.$.right();
        break;
      case X_DIR.X_DIR_L:
        x = state.$.left();
        break;
    }
    let point = new Vector2(x, y);
    if (offset) {
      return point.add(offset);
    }
    return point.round();
  }
}

export function dimensionValue(): DimensionValue {
  return {
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    id: '',
    type: '',
    deltas: new Map(),
    loaded: false
  }
}

export function sameDir(d1: any, d2: any) {
  if (isDirection(d1) && isDirection(d2)) {
    return (d1.x === d2.x) && (d1.y === d2.y);
  }
  return false;
}

const stdMap = new Map();
[X_DIR.X_DIR_C, X_DIR.X_DIR_L, X_DIR.X_DIR_R]
  .forEach((x) => {
    [Y_DIR.Y_DIR_B, Y_DIR.Y_DIR_M, Y_DIR.Y_DIR_T]
      .forEach((y) => {
        const dir = {x, y};
        const str = dirToString(dir);
        stdMap.set(str, dir);
      })
  })
export function stringToDir(name: string) {
  if (!stdMap.has(name)) {
    throw new Error('cannot find dir ' + name);
  }
  return stdMap.get(name);
}
