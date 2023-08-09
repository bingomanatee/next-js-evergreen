import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { PlanEditorStateCtx } from '~/components/pages/PlanEditor/PlanEditor'
import useForestFiltered from '~/lib/useForestFiltered'
import { planEditorMode } from '~/components/pages/PlanEditor/PlanEditor.state'
import styles from '~/components/pages/PlanEditor/MoveFrameView/MoveFrameView.module.scss'
import {
  Direction,
  dirToString,
} from '~/components/pages/PlanEditor/managers/resizeManager.types'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { filter, map, switchMap, combineLatest, distinctUntilChanged } from 'rxjs'
import dataManager from '~/lib/managers/dataManager'
import isEqual from 'lodash.isequal'
type MFSProps = {
  moveState: leafI,
  dir: Direction
}

export function MoveFrameSprite(props: MFSProps) {
  const planEditorState = useContext(PlanEditorStateCtx);
  const { dir, moveState } = props;
  const boxRef = useRef(null);
  const { mode } = useForestFiltered(planEditorState!, ['mode'])
  const klass = styles[mode === planEditorMode.MOVING_FRAME ? 'move-frame-sprite' : 'move-frame-sprite-hidden'];

  const [pos, setPosition] = useState(null);

  useEffect(() => {
    let sub;
    dataManager.do(
      async (db) => {
        const frameSubject = moveState.observable.pipe(
          map((value) => value.id),
          distinctUntilChanged(),
          switchMap((id) => {
            console.log('fetching frame ', id);
            return db.frames.findByIds([id]).$
              .pipe(
                map((m) => m.get(id))
              )
          }),
        );

        const positionObs = combineLatest(
          [
            frameSubject,
            moveState.observable.pipe(
              map((value) => {
                console.log('mapping moveState value: ', value);
                return value.offset
              }),
              distinctUntilChanged(isEqual)
            )
          ]
        )
          .pipe(
            map(([frame, {offset}]) => {
              console.log(
                '--- watching frame', frame, 'and offset', offset, 'dir:', dir
              );
              return frame.position(dir, offset, true);
            }),
          );
        sub = positionObs.subscribe(setPosition);
      }
    );

    return () => {
      sub?.unsubscribe();
    }
  }, [moveState, dir])

  if (!pos) {
    return null;
  }
  return <div
    data-role="move-frame-sprite"
    data-name={dirToString(dir)}
    className={klass}
    style={pos}
  >
    &nbsp;
  </div>
}
