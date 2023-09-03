import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { Vector2 } from 'three'
import dataManager from '~/lib/managers/dataManager'
import { HOUR } from '~/constants'

export type ImageStateValue = {
  url: string,
  size: Vector2 | null,
  time: number,
  error?: string,
  height: number,
  width: number
};

type leafType = typedLeaf<ImageStateValue>;

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
          const cutoff = Date.now() + HOUR;
          try {
            const info = JSON.parse(value);
            state.value = info;
            if ('time' in state.value && state.value.time < cutoff) {
              console.log('image info', info , 'cutoff', cutoff, 'reloading');
              dataManager.getImageUrl(frame.id);
            } else {

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
