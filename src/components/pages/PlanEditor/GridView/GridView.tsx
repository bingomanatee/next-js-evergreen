"use client";

import { SVGComponent } from '~/components/helpers/SVGComponent'
import dataManager from '~/lib/managers/dataManager'
import { ProjectSettings } from '~/types'

const STROKE = { color: 'rgb(0,0,0)', opacity: 0.125, width: 1 };

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

    this.sub = dataManager.planStream.subscribe(({ settingsMap }) => {
      this.setState((state) => {
        const newState = { ...state };
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
    const { zoom } = this.props;
    console.log('drawing grid with zoom of ', zoom);

    let size = this.state[ProjectSettings.GRID_SIZE];
    while (size < 8) size *= 2; // on zoom-out, double the grid size to prevent lines from getting too close.
    let width = Math.max(window.screen.width, 1000);
    width -= width % size;
    let height = Math.max(window.screen.height, 1000);
    height -= height % size;
    const MAX_Y = 2 * height;
    const MIN_Y = -height;
    const MIN_X = -(width);
    const MAX_X = 2 * width;

    const stroke = {...STROKE};

    stroke.width *= 100/zoom;

    for (let y = MIN_Y; y < MAX_Y; y += size) {
      this.draw.path(`M ${MIN_X} ${y} L ${MAX_X} ${y}`).stroke(stroke);
    }

    for (let x = MIN_X; x < MAX_X; x += size) {
      this.draw.path(`M ${x} ${MIN_Y} L ${x} ${MAX_Y}`).stroke(stroke);
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
