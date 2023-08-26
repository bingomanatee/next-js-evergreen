import { distinctUntilChanged, map, Subject, takeUntil, takeWhile, } from 'rxjs'
import { genFn, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { leafType } from '~/components/pages/PlanEditor/FrameDetail/StyleEditor/types'
import { Forest } from '@wonderlandlabs/forest'
import { v4 as uuidV4 } from 'uuid'
import { historyStream } from '~/lib/managers/historyStream'
import { string } from 'zod'

/**
 * the BlockManager allows one activity to run until it completes (or errors);
 * any other activity submitted. As the nature of the blocker is not really important,
 * you can either submit a subject or allow one to spawn in its absence
 */

export type BlockManagerValue = {
  id: string,
  type: string,
  data: any,
  locked: boolean;
}
type leafTType = typedLeaf<BlockManagerValue>

export const INITIAL: BlockManagerValue = {
  id: '',
  type: '',
  data: {},
  locked: false
}

const blockManager = new Forest({
  $value: { ...INITIAL },
  actions: {
    forceUnblock(state){
      state.do._reset();
    },
    close(state) {
      state.do.finish();
    },
    finish(state: leafType, forId? : string) {
      const {id, locked} = state.value;

      if (locked && (id !== forId)) {
        throw new Error('cannot clear blocker -- can only be done by blocking context');
      }

      state.do._reset();
    },
    finishSlow(state: leafType) {
      state.do.finish();

      state.do.set_locked(true);
      setTimeout(() => {
        state.do.set_locked(false);
      }, 500)
    },
    _reset(state) {
      state.value = {...INITIAL};
      return;
    },
    block(state: leafType, type, data: any = {}, isLocked = false) {
      const { id, locked } = state.value;
      if (locked) return;

      if (id) {
        throw new Error('already blocking');
      }
      if (!type) {
        throw new Error('block requires type');
      }
      const newId = uuidV4();
      state.do.set_id(newId);
      state.do.set_type(type);
      state.do.set_data(data);
      state.do.set_locked(isLocked);
      // returns an observable that completes when the blocking is closed
      return [newId, state.observable.pipe(
        map(({ id }) => id),
        distinctUntilChanged(),
        takeWhile((id) => id === newId)
      )];
    }
  },
  selectors: {
    isBlocked(state: leafTType) {
      return !!state.value.id;
    }
  }
});

historyStream.subscribe(() => {
  blockManager.do.forceUnblock();
})
export default blockManager;
