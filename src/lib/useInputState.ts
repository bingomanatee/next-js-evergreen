import { FormEvent, useCallback, useMemo, useState } from 'react'

export default function useInputState<InputType>(
  fieldName: string, initial = ''):
  [value: any, handler: (e: FormEvent<InputType>) => void] {

  const [value, setValue] = useState(initial)

  const handler = useCallback((e: FormEvent<InputType>) => {
    setValue(e.target.value)
  }, [])

  return [value, handler]
}
