"use client";

import { SVGComponent } from '~/components/helpers/SVGComponent'

export const GRID_SIZE = 24;
const STROKE = {color: 'rgb(0,0,0)', opacity: 0.125, width: 1};
export class GridView extends SVGComponent {

  private drawGrid() {
    this.draw.clear();
    const {zoom} = this.props;
    let gridSize = GRID_SIZE * zoom;
    while(gridSize < 8) gridSize *= 2;
    let width = Math.max(window.screen.width, 1000);
    width -= width % gridSize;
    let height = Math.max(window.screen.height, 1000);
    height -= height % gridSize;
    const MAX_Y = 2 * height;
    const MIN_Y = -height;
    const MIN_X = -(width);
    const MAX_X = 2 * width;
    for (let y = MIN_Y; y< MAX_Y; y += gridSize) {
      this.draw.path(`M ${MIN_X} ${y} L ${MAX_X} ${y}`).stroke(STROKE);
    }

    for(let x = MIN_X; x < MAX_X; x += gridSize) {
      this.draw.path(`M ${x} ${MIN_Y} L ${x} ${MAX_Y}`).stroke(STROKE);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.zoom !== this.props.zoom) {
      this.drawGrid();
    }
  }
  componentDidMount() {
    super.componentDidMount();
    this.drawGrid();
  }
}
