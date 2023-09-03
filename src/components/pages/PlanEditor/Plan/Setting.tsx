import { useCallback, useState } from 'react'
import {
  Checkbox,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Box
} from '@chakra-ui/react'
import { leafI } from '@wonderlandlabs/forest/lib/types'

type ProjectSettingProps = {
  min?: number,
  max?: number,
  name: string,
  description: string,
  step?: number,
  state: leafI,
  label: string,
  type: string
};

export function Setting(props: ProjectSettingProps) {
  const { state, name, type, label, min, max } = props;

  const [value, setValue] = useState(state.child('settings')!.get(name));
  const settingsState = state.child('settings')!;

  const update = useCallback(({ target }) => {
    let newValue;
    const { value, checked } = target;

    switch (type) {
      case 'number':
        newValue = Number(value);
        setValue(value);
        if ('min' in props) {
          newValue = Math.max(min, newValue);
        }
        if ('max' in props) {
          newValue = Math.min(max, newValue);
        }
        break;

      case 'boolean':
        newValue = checked ? 1 : 0;
        setValue(!!newValue);
        break;
    }
    settingsState.set(name, newValue);
  }, [name, settingsState, type]);

  return <InputGroup size="sm" my={2}>
    <InputLeftAddon layerStyle="input-label">
      {label}
    </InputLeftAddon>
    {type === 'number' ? (

      <Input type="number" value={value} onChange={update}/>
    ) : null}
    {type === 'boolean' ? (
      <Checkbox colorScheme="blue" iconSize="12px" layerStyle="input-group-item-wrapper" isChecked={!!value}
                onChange={update}> {label}</Checkbox>
    ) : null}
    {((type !== 'boolean') && (`${value}` !== `${settingsState.get(name)}`)) ? (
      <InputRightAddon>
        {settingsState.get(name)}
      </InputRightAddon>
    ) : null}
  </InputGroup>
}
