import {leafI, typedLeaf} from '@wonderlandlabs/forest/lib/types'
import dataManager from '~/lib/managers/dataManager'
import {Area, Frame, Link} from '~/types'
import px, {areaDirToPoint, frameToPoint, frameToSize} from '~/lib/utils/px'
import {SVG} from '@svgdotjs/svg.js'

import {LineDefinition, LineManager} from "~/lib/managers/LineManager";
import {LinkViewProps} from "~/components/pages/PlanEditor/LinkView/LinkView";

export type LinkViewStateValue = {
  lines: LineDefinition[],
  zoom: number
};
type leafType = typedLeaf<LinkViewStateValue>;

const LinkViewState = (props: LinkViewProps, planEditorState: leafI) => {

  const $value: LinkViewStateValue = {lines: [], zoom: 100};
  return {
    name: "LinkView",
    $value,

    selectors: {

      drawLine(state, line: LineDefinition) {
        const draw: SVG = state.getMeta('draw');
        draw.line(
            line.from.x,
            line.from.y,
            line.to.x,
            line.to.y
        ).stroke({color: props.over ? 'rgba(0,0,0,0.125)' : 'black'})
            .css('stroke-width', px((props.over ? 150 : 300) / state.value.zoom, true))
      },
      draw(state) {
        const {lines} = state.value;
        const element = state.getMeta('element');
        if (!element) return;
        if (!state.getMeta('draw')) {
          const draw = SVG().addTo(element).size('100vw', '100vh');
          state.setMeta('draw', draw);
        } else {
          state.getMeta('draw').clear();
        }

        lines.forEach((line: LineDefinition) => {
          state.$.drawLine(line);
        })
      }
    },

    actions: {
      setRef(state: leafType, ele) {
        if (!ele) return;
        state.setMeta('element', ele, true);
        state.$.draw();
      },

      updateZoom(state: leafType, zoom: number) {
        state.do.set_zoom(zoom);
        if (state.getMeta('element'))
          state.$.draw();
      },

      updateLines(state: leafType, lines: LineDefinition[]) {
        state.do.set_lines(lines);
        state.$.draw();
      },

      init(state: leafType) {
        const sub = planEditorState.select((zoom) => state.do.updateZoom(zoom), (value) => value.zoom)
        const lmSub = LineManager.instance.subject.subscribe(state.do.updateLines);
        return () => {
          sub?.unsubscribe();
          lmSub?.unsubscribe();
        }
      }
    }
  };
};

export default LinkViewState;
