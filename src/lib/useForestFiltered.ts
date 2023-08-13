import { leafI } from '@wonderlandlabs/forest/lib/types'
import { useCallback, useEffect, useState } from 'react'
import { c } from '@wonderlandlabs/collect'
import isEqual from 'lodash.isequal'

export type oneParamFunction<Input, Output> = (input: Input) => Output;
export type Filter = oneParamFunction<any, any> | any[] | any;

export default function useForestFiltered<InputElement = HTMLInputElement>(
  state: leafI,
  filter?: Filter,
): any {

  /**
   * returns an observer for a reduced/focused set of parameters
   * of the state's value.
   *  - if the filter is a function, it returns the output of the function
   *    when fed (value, store).
   *  - if the filter is an array, it 'picks' the fields
   *    into an object and returns it.
   *  - if neither condition is true it picks one parameter
   *    using the filter as a field name.
   *
   *  -- in all cases it only emits a new value when the parameter values
   *  are not equivalent to the previous edition.
   *
   *  the emitted values are objects, regardless of the state's type
   *  unless you pass a filter in which case the filter's output type is used.
   */

  const pick = useCallback((value) => {
      if (!value) {
        console.warn('cannot get value for leaf ', state);
        return {};
      }
      if (filter === undefined) {
        return value;
      }
      if (Array.isArray(filter)) {
        return c(value)
          .getReduce((data, value, field) => {
            if ((filter as any[]).includes(field)) {
              data[field] = value;
            }
            return data;
          }, {})
      }
      if (filter && typeof filter === 'function') {
        return filter!(value, state);
      }
      return c(value).get(filter);
    },
    [state, filter]
  );
  const [result, setResult] = useState(pick(state.value));

  useEffect(() => {
    let sub = state.select((summary) => {
      if (!isEqual(summary, result)) {
        setResult(summary);
      }
    }, pick);

    return () => sub.unsubscribe();
  }, [state, pick])

  return result;
}

