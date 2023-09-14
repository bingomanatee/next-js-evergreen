import {leafI} from "@wonderlandlabs/forest/lib/types";

/**
 * returns a value from the state's meta -- or generates it if it is no longer current
 * @param state {leafI}
 * @param key {string} the place to store the value
 * @param retriever {function} how to generate a new value
 * @param validator {function} whether the current value is valid
 */
export async function cache(state: leafI, key: string,
                            retriever: () => Promise<any>,
                            validator: (value: any) => boolean) {
  const current = state.getMeta(key);
  if (validator(current)) {
    return current;
  }
  const newValue = await retriever();
  state.setMeta(key, newValue, true);
  return newValue;
}
