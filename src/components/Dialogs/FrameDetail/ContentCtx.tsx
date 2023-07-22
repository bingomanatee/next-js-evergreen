import { createContext } from 'react'
import { leafI } from '@wonderlandlabs/forest/lib/types'
//@ts-ignore
export const ContentCtx = createContext<leafI>(
  { value: { type: '' } }
)
