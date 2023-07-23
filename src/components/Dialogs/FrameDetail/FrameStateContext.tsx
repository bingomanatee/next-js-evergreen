import { createContext } from 'react'
import { leafI } from '@wonderlandlabs/forest/lib/types'
//@ts-ignore
export const FrameStateContext = createContext<leafI>(
  { value: { type: '' } }
)
