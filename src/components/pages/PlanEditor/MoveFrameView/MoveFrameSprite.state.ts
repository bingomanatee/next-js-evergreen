import { Vector2 } from 'three'
import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { MFSProps } from '~/components/pages/PlanEditor/MoveFrameView/types'
import { BlockMode, Frame, X_DIR, Y_DIR } from '~/types'

type MoveFrameSpriteStateValue = {
  offset: Vector2,
  start: Vector2 | null,
  frame: Frame | null,
  frameId: null,
}
type leafType = typedLeaf<MoveFrameSpriteStateValue>;

export default function MoveFrameSpriteState(props: MFSProps, planEditorState: leafI, moveState: leafI) {

  const { dir } = props;
  const $value: MoveFrameSpriteStateValue = {
    offset: new Vector2(),
    start: null,
    frame: null,
    frameId: moveState.value.id,
  }

  return {
    $value,
    actions: {
      init(state: leafI, element: HTMLDivElement) {
        if (!element) {
      //    console.error('cannot initialize MoveFrameSprite - no element');
          return;
        }
        element.addEventListener('mousedown', state.do.onMouseDown);
      },

      onMouseDown(state: leafType, e: MouseEvent) {
        console.log('starting drag', dir);
        e.stopPropagation();
        //@TODO: use rxjs event streams
        state.do.set_start(new Vector2(e.pageX, e.pageY));

        window.addEventListener('mousemove', state.do.onMouseMove);
        window.addEventListener('mouseup', state.do.onMouseUp, { once: true });
      },
      onMouseMove(state: leafType, e: MouseEvent) {
        if (!state.value.start) {
          return;
        }
        const {zoom} = planEditorState.value;
        state.do.set_offset(
          new Vector2(
            e.pageX, e.pageY
          ).sub(state.value.start)
            .multiplyScalar(100/zoom)
        );
        moveState.do.set_deltas(state.$.deltas())
      },
      onMouseUp(state: leafType) {
        window.removeEventListener('mousemove', state.do.onMouseMove);
        state.do.set_start(null);
        state.do.set_offset(null);
        moveState.do.updateFrame();
      }
    },
    selectors: {
      isActive() {

        const { mode, modeTarget } = planEditorState.value;

        return mode === BlockMode.MOVING_FRAME && (!!modeTarget);
      },
      deltas(state: leafType) {
        const { offset } = state.value;
        if (!offset) {
          return new Map();
        }

        let map = new Map();
        switch (dir.x) {
          case X_DIR.X_DIR_C:
            //  center point --
            switch (dir.y) {
              case Y_DIR.Y_DIR_B:
                // bottom center edge -- affects bottom only
                map.set('bottom', offset.y)
                break;
              case Y_DIR.Y_DIR_M:
                // center drag (move)
                map.set('bottom', offset.y)
                map.set('top', offset.y)
                map.set('right', offset.x);
                map.set('left', offset.x);
                break;
              case Y_DIR.Y_DIR_T:
                // bottom center edge -- affects top only
                map.set('top', offset.y)
                break;
            }
            break;
          case X_DIR.X_DIR_R:
            // any right point -- affects right edge
            map.set('right', offset.x);

            switch (dir.y) {
              case Y_DIR.Y_DIR_B:
                // bottom right corner - affects bottom and right edge
                map.set('bottom', offset.y);
                break;
              case Y_DIR.Y_DIR_M:
                break;
              case Y_DIR.Y_DIR_T:
                map.set('top', offset.y);
                break;
            }
            break;
          case X_DIR.X_DIR_L:
            // left edge
            map.set('left', offset.x);
            switch (dir.y) {
              case Y_DIR.Y_DIR_B:
                map.set('bottom', offset.y);
                break;
              case Y_DIR.Y_DIR_M:
                break;
              case Y_DIR.Y_DIR_T:
                map.set('top', offset.y);
                break;
            }
            break;
        }
        return map;
      },
    }
  }

}
