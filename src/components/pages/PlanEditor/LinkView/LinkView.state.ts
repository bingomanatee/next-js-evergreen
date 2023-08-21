import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import dataManager from '~/lib/managers/dataManager'
import { Area, Frame, Link } from '~/types'
import { areaDirToPoint, frameToPoint, frameToSize } from '~/lib/utils/px'
import { SVG } from '@svgdotjs/svg.js'
import { from } from 'rxjs/src/internal/observable/from'
import { stringToDir } from '~/components/pages/PlanEditor/util'

export type FrameMeta = {
  frame: Frame,
  area: Area
}
export type LinkMap = Map<string, Link>;
export type LinkViewStateValue = {
  frames: FrameDataMap,
  links: LinkMap
};
export type FrameDataMap = Map<string, FrameMeta>;
type leafType = typedLeaf<LinkViewStateValue>;

const LinkViewState = (props: {inBack: boolean}) => {
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
      toPoint(_state, frameMeta: FrameMeta, dir: string) {
        const dirValue = stringToDir(dir);
        const {area, frame} = frameMeta;
        return areaDirToPoint(area, dirValue);
      },
      drawLine(state, draw: SVG, link: Link, fromFrame: FrameMeta, toFrame: FrameMeta) {
        const {start_at, end_at} = link;
        const fromPoint = state.$.toPoint(fromFrame, start_at);
        const toPoint = state.$.toPoint(toFrame, end_at);


          draw.line(
            fromPoint.x,
            fromPoint.y,
            toPoint.x,
            toPoint.y
          ).stroke({ color: 'black', width: 4 });
      },
      draw(state) {
        const {links, frames} = state.value;
        if (! (element && frames.size && links.size)) return;

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
          state.$.drawLine(draw, link, fromFrame, toFrame);
        })

      }
    },

    actions: {
      update(state: leafType, frames: FrameDataMap, links: LinkMap) {
        state.do.set_frames(frames);
        state.do.set_links(links);
        state.$.draw();
      },
      init(state: leafType) {
        return dataManager.planStream.subscribe((value) => {
          const { frames, links } = value;
          const frameData = frames.reduce((memo: FrameDataMap, frame) => {
            const area = frameToSize(frame)!;
            memo.set(frame.id, { frame, area })
            return memo;
          }, new Map);
          const linkMap = links.reduce((memo, link) => {
            memo.set(link.id, link);
            return memo;
          }, new Map<string, Link>)
          state.do.update(frameData, linkMap);
        });
      }
    }
  };
};

export default LinkViewState;
