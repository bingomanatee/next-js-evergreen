import { Frame } from '~/types'
import {sortBy} from 'lodash';

export enum ShufflePos {
  top0 = 'top', // before any other items
  above1 = 'above', // zero ... many frames from the first to the one 2 frames before the current
  before2 = 'before', // zero ... 1 frames immediately before the current
  at3 = 'at', // the current frame
  after4 = 'after', // zero ... 1 frames immediately after the current
  below5 = 'below', // ... many frames two frames after the current to the end
  bottom6 = 'bottom'  // after any other items
}

class Shuffler {
  public index: number;
  private frames: Frame[];
  constructor(id: string, public input: Frame[]) {
    this.frames = sortBy(input, 'order');
    this.frames.reverse();
    this.index = this.frames.findIndex((fr) => fr.id === id);
    console.log('shuffling', id, this.isFound, 'i=', this.index, 'f=', this.frames);
  }

  get isFound() {
    return this.index !== -1;
  }

  get [ShufflePos.above1]() {
    if (this.isFound) {
      return this.index <= 1 ? [] : this.frames.slice(0, this.index - 1)
    } else {
      return this.frames;
    }
  }

  get [ShufflePos.before2]() {
    if (this.isFound && this.index >= 1) {
      return [this.frames[this.index - 1]]
    }
    return [];
  }

  get [ShufflePos.at3]() {
    if (this.isFound) return [this.frames[this.index]]
  }

  get [ShufflePos.after4] () {
    if (this.isFound && (this.index + 1) < this.frames.length) {
      return [this.frames[this.index + 1]]
    }
    return [];
  }

  get [ShufflePos.below5]() {
    return this.isFound ? this.frames.slice(this.index + 2) : []
  }

  private [ShufflePos.top0]: Frame[] = []
  private [ShufflePos.bottom6]: Frame[] = []

  /**
   * swaps the content of the newAtPlace slot with the slot containing the current record(ShufflePos.at3).
   * This works with top/bottom, as they have no content, and after/before as they have one item.
   * @param newAtPlace
   */
  public resuffle(newAtPlace: ShufflePos) {
    if (newAtPlace === ShufflePos.above1 || newAtPlace === ShufflePos.below5) {
      throw new Error(`Cannot reshuffle to ${newAtPlace}`);
    }
    return [
      ShufflePos.top0,
      ShufflePos.above1,
      ShufflePos.before2,
      ShufflePos.at3,
      ShufflePos.after4,
      ShufflePos.below5,
      ShufflePos.bottom6
    ].map((pos: ShufflePos) => {
      let out = this[pos]
      if (pos === newAtPlace) {
        out = this[ShufflePos.at3].concat(out);
      }
      if (pos === ShufflePos.at3) {
        out = this[newAtPlace];
      }
      return out;
    }).flat().filter((item) => !!item).reverse();
  }
}

export default function frameMover(id: string, frames: Frame[], dir: ShufflePos) {
  const s = new Shuffler(id, frames);
  return s.resuffle(dir);
}
