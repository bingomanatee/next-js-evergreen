import { GenFunction } from '@wonderlandlabs/can-di-land/lib/types'

export type ManagerMap = Map<string, any>;

export type MessageTypeValue = {
  cancelPrompt?: string
  actionPrompt?: string
  title: string,
  view?: string | {view: string}
  size?: string,
  onClose?: GenFunction,
  onSave?: GenFunction,
};

export type MessageType = 'dialog'  | 'shelf'  | 'toast'
export type MessageEvent = {
  type: MessageType,
  value: MessageTypeValue,
}
