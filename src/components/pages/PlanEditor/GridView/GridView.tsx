"use client";

import {SVGComponent} from '~/components/helpers/SVGComponent'
import dataManager from '~/lib/managers/dataManager'
import {ProjectSettings} from '~/types'

const STROKE = {color: 'rgb(0,0,0)', opacity: 0.125, width: 1};
const STROKE_HEAVY = {...STROKE, opacity: 0.25}

export class GridView extends SVGComponent {

  constructor(props) {
    super(props);
    this.state = {
      [ProjectSettings.GRID_SIZE]: 50,
      [ProjectSettings.GRID_SHOW]: true,
    };

    this.watchSettings();
  }

  private sub: any;

  private watchSettings() {

    this.sub = dataManager.planStream.subscribe(({settingsMap}) => {
      this.setState((state) => {
        const newState = {...state};
        if (settingsMap.has(ProjectSettings.GRID_SIZE)) {
          newState[ProjectSettings.GRID_SIZE] = settingsMap.get(ProjectSettings.GRID_SIZE)
        }
        if (settingsMap.has(ProjectSettings.GRID_SHOW)) {
          newState[ProjectSettings.GRID_SHOW] = settingsMap.get(ProjectSettings.GRID_SHOW)
        }
        setTimeout(() => this.drawGrid(), 300);
        return newState;
      })
    });
  }

  private drawGrid() {
    this.draw.clear();
    if (!this.state[ProjectSettings.GRID_SHOW]) {
      return;
    }
    const {zoom} = this.props;

    let heavyInc = 16;

    let size = this.state[ProjectSettings.GRID_SIZE];
    while (size < 800 / zoom) {
      size *= 2;
      if (heavyInc >= 2) heavyInc /= 2;
    } // on zoom-out, double the grid size to prevent lines from getting too close.
    let width = Math.max(window.screen.width, 1000);
    width -= width % size;
    let height = Math.max(window.screen.height, 1000);
    height -= height % size;
    const MAX_Y = 2 * height;
    const MIN_Y = -height;
    const MIN_X = -(width);
    const MAX_X = 2 * width;

    const stroke = {...STROKE};
    const heavyStroke = {...STROKE_HEAVY}
    stroke.width *= 100 / zoom;
    heavyStroke.width *= 100 / zoom;

    let inc = 0;
    for (let y = MIN_Y; y < MAX_Y; y += size) {
      let lineStroke = stroke;
      if (heavyInc >= 2 && (!(inc % heavyInc))) {
        lineStroke = heavyStroke;
      }
      ++inc;
      this.draw.path(`M ${MIN_X} ${y} L ${MAX_X} ${y}`).stroke(lineStroke);
    }

    inc = 0;
    for (let x = MIN_X; x < MAX_X; x += size) {
      let lineStroke = stroke;
      if (heavyInc >= 2 && (!(inc % heavyInc))) {
        lineStroke = heavyStroke;
      }
      ++inc;    this.draw.path(`M ${x} ${MIN_Y} L ${x} ${MAX_Y}`).stroke(lineStroke);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.zoom !== this.props.zoom) {
      this.drawGrid();
    }
  }

  componentDidMount() {
    super.componentDidMount();
    setTimeout(() => {
      this.drawGrid();
    }, 100)
  }
}
