import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import axios from 'axios';
import { Vector2 } from 'three'
import dataManager from '~/lib/managers/dataManager'

export type ImageStateValue = {
  url: string,
  size: Vector2 | null,
  time: number,
  error?: string,
  height: number,
  width: number
};

type leafType = typedLeaf<ImageStateValue>;

const HOUR = 60 * 60 * 1000;
const ImageState = (props) => {
  const { frame } = props;
  const $value: ImageStateValue = {
    url: '',
    size: null,
    time: 0,
    height: 0,
    width: 0
  };
  return {
    name: "Image",
    $value,

    selectors: {},

    actions: {
      tryToDecodeFrame(state: leafType, value) {
        if (!value) {
          dataManager.getImageUrl(frame.id);
        } else {
          try {
            state.value = JSON.parse(value);
            if ('time' in state.value && state.value.time < Date.now() - HOUR) {
              dataManager.getImageUrl(frame.id);
            }
          } catch (err) {
            state.do.setError(err.message)
          }
        }
      },
      load(state: leafType) {
      },
    }
  };
};

export default ImageState;
