import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { Subject } from 'rxjs'
import { GenFunction } from '@wonderlandlabs/can-di-land/lib/types'
import { MessageTypeValue } from '~/lib/managers/types'

export type DialogButtonProps = { label: string, key: string | number, onClick: GenFunction, colorScheme?: string, variant?: string }
type CloseAction = { mode: string, value?: any }
type ClosedValue = false | CloseAction;
export type DialogStateValue = {
  buttons: DialogButtonProps[],
  closed: ClosedValue
};
type leafType = typedLeaf<DialogStateValue>;

const DialogState = (props) => {
  const { value, closeDialog } = props;
  const propsView: MessageTypeValue = value.view;
  const { onClose, onSave, cancelPrompt, actionPrompt } = propsView;
  const $value: DialogStateValue = {
    buttons: [],
    closed: false,
  };
  return {
    name: "Dialog",
    $value,

    selectors: {},

    actions: {
      cancel(state: leafType, value?: any) {
        console.log('Dialog.state cancel')
        if (state.value.closed) {
          return;
        }
        state.do.set_closed({
          mode: 'cancel',
          value
        });

        try {
          if (onClose) {
            onClose();
          }
        } catch (err) {
          console.error('error closing dialog', err);
        }

        console.log('Dialog.state cancel closing dialog')
        closeDialog();
      },

      save(state: leafType, value?: any) {
        console.log('Dialog.save');
        if (state.value.closed) {
          return;
        }
        state.do.set_closed({
          mode: 'save',
          value
        });

        try {
          if (onSave) {
            onSave();
          }
        } catch (err) {
          console.error('error saving dialog', err);
        }

        closeDialog();
      },

      addButton(state: leafType, label, onClick, key, rest = {}) {
        state.do.set_buttons([{ label, onClick, key, ...rest }, ...state.value.buttons]);
      },

      load(state: leafType) {

        state.do.addButton(
          actionPrompt || 'Done',
          state.do.save,
          'done',
          { colorScheme: 'blue' }
        )

        if (cancelPrompt) {
          state.do.addButton(
            cancelPrompt,
            state.do.cancel,
            'close',
            { variant: 'outline' }
          )
        }
      }
    }
  };

};

export default DialogState;
