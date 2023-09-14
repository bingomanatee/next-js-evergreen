import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import dataManager from '~/lib/managers/dataManager'
import { Area, Frame, Link } from '~/types'
import px, { areaDirToPoint, frameToPoint, frameToSize } from '~/lib/utils/px'
import { SVG } from '@svgdotjs/svg.js'
import { from } from 'rxjs/src/internal/observable/from'
import { stringToDir } from '~/components/pages/PlanEditor/util'
import { combineAll, combineLatest, distinctUntilChanged, map } from 'rxjs'
import { isTooSmall } from '~/lib/utils/frameRelativeSize'
import { Vector2 } from 'three'

export type FrameMeta = {
  frame: Frame,
  area: Area,
  zoom: 100,
}
export type LinkMap = Map<string, Link>;
export type LinkViewStateValue = {
  links: LinkD
};
export type FrameDataMap = Map<string, FrameMeta>;
type leafType = typedLeaf<LinkViewStateValue>;

const LinkViewState = (props: { inBack: boolean }, planEditorState: leafI) => {
  let element: HTMLDivElement | null = null;

  const $value: LinkViewStateValue = { frames: new Map(), links: new Map() };
  return {
    name: "LinkView",
    $value,

    selectors: {
      setRef(state: leafType, ele) {
        element = ele;
        state.$.draw();
      },
      toPoint(_state, frameMeta: FrameMeta, dir: string, zoom) {
        const dirValue = stringToDir(dir);
        const { area, frame } = frameMeta;
        if (isTooSmall(frame, zoom)) {
          return new Vector2(frame.left, frame.top)
            .add(
              new Vector2(frame.width, frame.height)
                .multiplyScalar(0.5)
            ).round();
        }
        return areaDirToPoint(area, dirValue);
      },
      drawLine(state, draw: SVG, link: Link, fromFrame: FrameMeta, toFrame: FrameMeta, zoom) {
        const { start_at, end_at } = link;
        const fromPoint = state.$.toPoint(fromFrame, start_at, zoom);
        const toPoint = state.$.toPoint(toFrame, end_at, zoom);

        draw.line(
          fromPoint.x,
          fromPoint.y,
          toPoint.x,
          toPoint.y
        ).stroke({ color: 'black' }).css('stroke-width', px(400 / zoom, true))
      },
      draw(state, zoom: number) {
        const { links, frames } = state.value;
        if (!(element && frames.size && links.size)) {
          return;
        }

        element.innerHTML = '';
        const draw = SVG().addTo(element).size('100vw', '100vh');

        links.forEach((link: Link) => {
          const {
            start_frame, end_frame
          } = link;

          const fromFrame = frames.get(start_frame);
          const toFrame = frames.get(end_frame);

          if (!(fromFrame && toFrame)) {
            return;
          }
          state.$.drawLine(draw, link, fromFrame, toFrame, zoom);
        })
      }
    },

    actions: {
      update(state: leafType, frames: FrameDataMap, links: LinkMap, zoom: number) {
        state.do.set_frames(frames);
        state.do.set_links(links);
        state.$.draw(zoom);
      },
      init(state: leafType) {
        return combineLatest(
          [
            dataManager.planStream,
            planEditorState.observable.pipe(map((value) => value.zoom), distinctUntilChanged())
          ]
        ).subscribe(([{ frames, links }, zoom]) => {
          const frameData = frames.reduce((memo: FrameDataMap, frame) => {
            const area = frameToSize(frame)!;
            memo.set(frame.id, { frame, area })
            return memo;
          }, new Map);
          const linkMap = links.reduce((memo, link) => {
            memo.set(link.id, link);
            return memo;
          }, new Map<string, Link>)
          state.do.update(frameData, linkMap, zoom);
        });
      }
    }
  };
};

export default LinkViewState;
