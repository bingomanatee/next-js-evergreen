import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import axios from 'axios';
import { Vector2 } from 'three'
import dataManager from '~/lib/managers/dataManager'

export type ImageStateValue = { url: string, size: Vector2 | null };

type leafType = typedLeaf<ImageStateValue>;

const ImageState = (props) => {
  const {frame} = props;
  const $value: ImageStateValue = { url: '', size: null };
  return {
    name: "Image",
    $value,

    selectors: {},

    actions: {
      load(state: leafType) {
        dataManager.getImageUrl(frame.id);
      },
    }
  };
};

export default ImageState;
