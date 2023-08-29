import { useMemo } from 'react'
import { Vector2 } from 'three'
import { Frame } from '~/types'
import { boolean } from 'zod'
import { i } from '@chakra-ui/toast/dist/toast.types-f226a101'

export function isTooSmall(frame: Frame, zoom: number) {
  if (!frame) {
    return true;
  }
  const { width, height } = frame;
  let avg = (width + height) / 2;
  const avgSize = (avg * zoom / 100);
  if (frame.type === 'image') {
    if (avgSize < 20) {
      return true;
    }
  } else if (avgSize < 40) {
    return true;
  }
  return false;

}

const RADIUS = 20;

function framePlaceholder(frame: Frame, zoom: number, ) {
  const { left, top, width, height } = frame;
    const center = new Vector2(left + width / 2, top + height / 2).round();
    const radius = Math.round(RADIUS * 100 / zoom);
    return {
      left: center.x - radius,
      top: center.y - radius,
      width: 2 * radius,
      height: 2 * radius
    }
}

export default function frameRelativeSize(frame: Frame, zoom: number) {
  const tooSmall = isTooSmall(frame, zoom)
  const place = tooSmall ? framePlaceholder(frame, zoom) : {...frame};
  return { tooSmall, place }
}
