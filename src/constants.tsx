import { FrameTypes } from '~/types'

export const HORIZ = 'horizontal';
export const VERT = 'vertical';
export const anonUserId = process.env.NEXT_PUBLIC_ANON_USER

export const frameTypeNames = [
  FrameTypes.markdown,
  FrameTypes.image,
  FrameTypes.map
]
export const SECONDS = 1000;
export const HOUR = 60 * 60 * SECONDS;
export const TO_RAD = Math.PI / 180;
