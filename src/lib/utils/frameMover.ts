import { Frame } from '~/types'
import { string } from 'zod'

enum FramesMapIndex {
  top0 = 'top',  // before any current frames (initially empty)
  above1 = 'above', // zero ... many frames from the first to the one 2 frames before the current
  before2 = 'before', // zero ... 1 frames immediately before the current
  at3 = 'at', // the current frame
  after4 = 'after', // zero ... 1 frames immediately after the current
  below5 = 'below', // ... many frames two frames after the current to the end
  bottom6 = 'bottom' // after all current frames (initially empty
}

type Desc = Map<FramesMapIndex, Frame[]>;

/**
 * populates a Desc instance by splitting the framesList into a series of arrays
 */
function describeArray(framesList: Frame[], frameId: string): Desc {
  const index = framesList.findIndex((fr) => fr.id === frameId);
  const map = new Map([
    [FramesMapIndex.top0, []],
    [FramesMapIndex.above1, []],
    [FramesMapIndex.before2, []],
    [FramesMapIndex.at3, []],
    [FramesMapIndex.after4, []],
    [FramesMapIndex.below5, []],
    [FramesMapIndex.bottom6, []]
  ])
  if (index === -1) {
    map.set(FramesMapIndex.above1, framesList)
    return map;
  }
  const above = framesList.slice(0, index);
  const below = framesList.slice(index + 1);

  map.set(FramesMapIndex.before2, [above.pop()]);
  map.set(FramesMapIndex.at3, [framesList[index]]);
  map.set(FramesMapIndex.after4, [below.shift()]);

  map.set(FramesMapIndex.above1, above);
  map.set(FramesMapIndex.below5, below);

  return map;
}

function switchDesc(desc: Desc, fromId: FramesMapIndex, toId: FramesMapIndex) {
  const fromValue = desc.get(fromId);
  const toValue = desc.get(toId);
  desc.set(fromId, toValue);
  desc.set(toId, fromValue);
}


function flatMap(map: Desc) {
  const values = [
    map.get(FramesMapIndex.top0),
    map.get(FramesMapIndex.above1),
    map.get(FramesMapIndex.before2),
    map.get(FramesMapIndex.at3),
    map.get(FramesMapIndex.after4),
    map.get(FramesMapIndex.below5),
    map.get(FramesMapIndex.bottom6),
  ];
  return values.flat().filter((value) => !!value);
}

export function up(framesList: Frame[], id: string) {
  let desc = describeArray(framesList, id);
  switchDesc(desc, FramesMapIndex.before2, FramesMapIndex.at3);
  return flatMap(desc);
}

export function top(framesList: Frame[], id: string) {
  let desc = describeArray(framesList, id);
  switchDesc(desc, FramesMapIndex.top0, FramesMapIndex.at3);
  return flatMap(desc);
}

export function down(framesList: Frame[], id: string) {
  let desc = describeArray(framesList, id);
  switchDesc(desc, FramesMapIndex.after4, FramesMapIndex.at3);
  return flatMap(desc);
}

export function bottom(framesList: Frame[], id: string) {
  let desc = describeArray(framesList, id);
  switchDesc(desc, FramesMapIndex.bottom6, FramesMapIndex.at3);
  return flatMap(desc);
}
