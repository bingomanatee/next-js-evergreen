"use client";

import { SVGComponent } from '~/components/helpers/SVGComponent'

export const GRID_SIZE = 24;
const STROKE = {color: 'rgb(0,0,0)', opacity: 0.125, width: 1};
export class GridView extends SVGComponent {

  private drawGrid() {
    let width = Math.max(window.screen.width, 1000);
    width -= width % GRID_SIZE;
    let height = Math.max(window.screen.height, 1000);
    height -= height % GRID_SIZE;
    const MAX_Y = 2 * height;
    const MIN_Y = -height;
    const MIN_X = -(width);
    const MAX_X = 2 * width;
    for (let y = MIN_Y; y< MAX_Y; y += GRID_SIZE) {
      this.draw.path(`M ${MIN_X} ${y} L ${MAX_X} ${y}`).stroke(STROKE);
    }

    for(let x = MIN_X; x < MAX_X; x += GRID_SIZE) {
      this.draw.path(`M ${x} ${MIN_Y} L ${x} ${MAX_Y}`).stroke(STROKE);
    }
  }
  componentDidMount() {
    super.componentDidMount();
    this.drawGrid();
  }
}
