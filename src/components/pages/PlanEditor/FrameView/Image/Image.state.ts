import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import { Vector2 } from 'three'
import dataManager from '~/lib/managers/dataManager'
import { HOUR } from '~/constants'

export type ImageStateValue = {
  frame_id: string,
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
    frame_id: frame.id,
    url: '',
    size: null,
    time: 0,
    height: 0,
    width: 0,
  };
  return {
    name: "Image",
    $value,

    selectors: {},

    actions: {
      async load(state: leafType) {
        let sub;
        try {
          const imageFile = await dataManager.do((db) => {
            return db.frame_images
              .fetchImageData(frame.id, frame.plan_id);
          });
          if (imageFile) {
            state.value = imageFile.toJSON();
          }
          //@TODO: observe
        } catch(err) {
          console.log('error getting image data:', err, 'for frame', frame.id);
        }

        return () => sub?.unsubscribe();
      },
    }
  };
};

export default ImageState;
