import { distinctUntilChanged, map, Subject, takeUntil, takeWhile, } from 'rxjs'
import { genFn, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { leafType } from '~/components/Dialogs/FrameDetail/StyleEditor/types'
import { Forest } from '@wonderlandlabs/forest'
import { v4 as uuidV4 } from 'uuid'
import { historyStream } from '~/lib/managers/historyStream'
import { string } from 'zod'

/**
 * the BlockManager allows one activity to run until it completes (or errors);
 * any other activity submitted. As the nature of the blocker is not really important,
 * you can either submit a subject or allow one to spawn in its absence
 */

type BlockManagerValue = {
  id: string,
  type: string,
  data: any,
  locked: boolean;
}
type leafTType = typedLeaf<BlockManagerValue>

const INITIAL: BlockManagerValue = {
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
    _reset(state) {
      state.value = {...INITIAL};
      return;
    },
    block(state: leafType, type, data: any = {}, locked = false) {
      const { id } = state.value;
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
      state.do.set_locked(locked);
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
