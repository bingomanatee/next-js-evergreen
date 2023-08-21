import { Frame } from '~/types'

export default function searchFrames(frames: Frame[], text: string) {
  const searchStr = text.toLowerCase().trim();
  if (!searchStr) {
    return [];
  }
  return frames.filter((frame: Frame) => {
    const { name, content, id } = frame;
    return [name, content, id].some((text) => `${text}`
      .toLowerCase().includes(searchStr));
  })
}
