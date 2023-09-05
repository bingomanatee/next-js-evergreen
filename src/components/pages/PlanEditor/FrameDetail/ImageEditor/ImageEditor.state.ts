import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import axios from 'axios';
import { Vector2 } from 'three'
import dataManager from '~/lib/managers/dataManager'

export type ImageEditorStateValue = {
  url: string,
  is_valid: boolean,
  width: number,
  height: number,
  loaded: boolean
};

type leafType = typedLeaf<ImageEditorStateValue>;

const IMAGER_SIZE_TARGET = 250;

const ImageEditorState = (props) => {
  const { frameState } = props;
  const id = frameState.value.id;
  const plan_id = frameState.value.plan_id;
  const IMAGE_API_URL = `/api/images/${id}`;

  const $value: ImageEditorStateValue = {
    url: '',
    is_valid: false,
    width: 0,
    height: 0,
    loaded: false
  };
  return {
    name: "ImageEditor",
    $value,

    selectors: {
      scaledSize(state: leafType) {
        const { width, height } = state.value;

        let maxDimension = Math.max(width, height);
        if (maxDimension <= IMAGER_SIZE_TARGET) {
          return new Vector2(width, height);
        }
        const scalar = IMAGER_SIZE_TARGET / maxDimension;
        return new Vector2(width, height).multiplyScalar(scalar).round();
      }
    },

    actions: {

      async upload(state: leafType, files: File[]) {
        const [file] = files;
        const { name, type, size } = file;
        try {
          await axios.post(IMAGE_API_URL, file, {
            headers: {
              'Content-Type': type,
              'file-type': type,
              'file-name': name,
              'file-size': size
            }
          });
          return state.do.init(true);
        } catch (err) {
          console.log('error in upload:', err.message);
        }

      },
      async init(state: leafType, update = false) {
        const imageData = await dataManager.do((db) => {
          return update ? db.frame_images.updateImageData(id, plan_id):
            db.frame_images.fetchImageData(id, plan_id);
        });

        console.log('initialized imageEditor:', imageData, 'update = ', update);
        const info = imageData.toJSON()
        frameState.do.set_value(JSON.stringify(info));
        if (imageData.is_valid) {
          frameState.do.set_width(imageData.width);
          frameState.do.set_height(imageData.height);
        }
        state.value = info;
        state.do.set_loaded(true);
      }
    }
  };
};

export default ImageEditorState;
