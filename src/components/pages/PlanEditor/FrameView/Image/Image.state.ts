import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import axios from 'axios';
import { Vector2 } from 'three'
export type ImageStateValue = {url: string, size: Vector2 | null};

type leafType = typedLeaf<ImageStateValue>;

const ImageState = (props) => {
  const $value: ImageStateValue = {url: '', size: null};
  return {
    name: "Image",
    $value,

    selectors: {},

    actions: {
      loadImageSize(state: leafType) {
        let img = new Image();
        img.src = state.value.url;
        img.onload = () => {
          const size = new Vector2(img.width, img.height);
          state.do.set_size(size);
        }
      },
      async getImageUrl(state: leafType) {
        const id = props.frame?.id;
        if (id) {
          const {data} = await axios.get('/api/images/' + id);
          console.log('data for ', id, 'is', data);
          let url = data?.url || '';
          state.do.set_url(url);
          state.do.loadImageSize();
        }
      },
      load(state: leafType) {
        state.do.getImageUrl();
      }
    }
  };
};

export default ImageState;
