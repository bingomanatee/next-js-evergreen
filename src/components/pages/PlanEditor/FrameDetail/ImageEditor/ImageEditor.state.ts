import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import axios from 'axios';
import { Vector2 } from 'three'
import dataManager from '~/lib/managers/dataManager'

export type ImageEditorStateValue = {
  imageData: Record<string, any> | null,
  imageUrl: string | null,
  loaded: boolean,
  size: Vector2 | null
};

type leafType = typedLeaf<ImageEditorStateValue>;

const IMAGER_SIZE_TARGET = 250;

const ImageEditorState = (props) => {
  const { frameState } = props;
  const id = frameState.value.id;
  const IMAGE_API_URL = `/api/images/${id}`;

  const $value: ImageEditorStateValue = {
    imageData: null,
    imageUrl: null,
    loaded: false,
    size: null
  };
  return {
    name: "ImageEditor",
    $value,

    selectors: {
      scaledSize(state: leafType) {
        const { size } = state.value;
        if (!size) {
          return null;
        }

        let maxDimension = Math.max(size.x, size.y);
        if (maxDimension <= IMAGER_SIZE_TARGET) {
          return size;
        }
        const scalar = IMAGER_SIZE_TARGET / maxDimension;
        return size.clone().multiplyScalar(scalar).round();
      }
    },

    actions: {
      async sizeImage(state: leafType) {
        let img = new Image();
        img.src = state.value.imageUrl;
        img.onload = () => {
          const size = new Vector2(img.width, img.height);
          state.do.setImageSize(size);
        }
      },

      setImageSize(state: leafType, size: Vector2) {
        state.do.set_size(size);
        frameState.do.updateSize(size.x, size.y);
      },

      async upload(state: leafType, files: File[]) {
        const [file] = files;
        const { name, type, size } = file;

       await axios.post(IMAGE_API_URL, file, {
          headers: {
            'Content-Type': type,
            'file-type': type,
            'file-name': name,
            'file-size': size
          }
        });
        state.do.set_loaded(false);
        return state.do.init();
      },
      async init(state: leafType) {

        const data = await dataManager.getImageUrl(id);
        state.do.set_imageUrl(data?.url);
        if (data?.url) {
          state.do.sizeImage();
        }
        state.do.set_loaded(true);
      }
    }
  };
};

export default ImageEditorState;
