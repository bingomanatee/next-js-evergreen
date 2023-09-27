import {distinctUntilChanged, distinctUntilKeyChanged, map, takeWhile} from 'rxjs'
import { genFn, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { leafType } from '~/components/pages/PlanEditor/FrameDetail/StyleEditor/types'
import { Forest } from '@wonderlandlabs/forest'
import { v4 as uuidV4 } from 'uuid'
import { historyStream } from '~/lib/managers/historyStream'
import {isEqual} from "lodash";

/**
 * the ConfirmManager allows one activity to run until it completes (or errors);
 * any other activity submitted. As the nature of the blocker is not really important,
 * you can either submit a subject or allow one to spawn in its absence
 */

export type ConfirmManagerValue = {
  message: string,
  show: boolean,
  id: string,
  response: boolean | null,
  data: Record<string, any>
}
type leafTType = typedLeaf<ConfirmManagerValue>

export const INITIAL: ConfirmManagerValue = {
  message: '',
  id: '',
  show: false,
  response: null,
  data: {}
}

const confirmManager = new Forest({
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
    confirm(state: leafType) {
      console.log('confirmDialog - setting response to true')
      state.do.set_response(true)
    },
    reject(state: leafType) {
      console.log('rejecting response to confirmManager with id', state.id);
      state.do.set_response(false)
    },
    resetResponse(state: leafType) {
      state.do.set_response(null);
    },
    _reset(state: leafType) {
      state.value = {...INITIAL};
      return;
    },
    query(state: leafType, message: string, data: any = {}, isLocked = false) {
      console.log('querying:', message);
      const { id, locked } = state.value;
      if (id && locked) {
        console.error('attempt to query while query is in place:',
          message, data, 'current state', state.value
          )
        throw new Error('already querying');
      }
      const newId = uuidV4();
      state.do.set_id(newId);
      state.do.set_message(message);
      state.do.set_data(data);

      console.log('creating configManager observer');

      const observable = state.observable.pipe(
          map(({id, response}) => ({id, response})),
          takeWhile((value) => {
            if (!(value.id === newId)) {
              console.log(newId, 'observable --- query id changed, cancelling');
            }
            return (value.id === newId);
          }),
          map(({response}) => response),
          distinctUntilChanged()
      );

      const debugSub = observable.subscribe({
        next(value) {
          console.log(newId, 'configManager observable response = ', value);
        },
        error(err) {
          console.log('error in  cm: ', err);
        },
        complete() {
          console.log(newId, 'configManager observable completed');
        }
      })

      // returns an observable that completes when the blocking is closed
      return [newId, observable];
    }
  },
  selectors: {
    isQuerying(state: leafTType) {
      return !!state.value.id;
    }
  }
});

historyStream.subscribe(() => {
  confirmManager.do.forceUnblock();
})

export default confirmManager;
