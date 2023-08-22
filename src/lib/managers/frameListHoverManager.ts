import { BehaviorSubject } from 'rxjs'
import { Forest } from '@wonderlandlabs/forest'
import { leafI } from '@wonderlandlabs/forest/lib/types'

/**
 * a simple tracker to coordinate the hover factor of
 */

const frameListHoverManager = new Forest({
  $value: {
    clicked: null,
    hover: null,
  },
  actions: {
    clear(state: leafI) {
      state.do.set_clicked(null);
      state.do.set_hover(null);
    },
    clearClicked(state: leafI) {
      state.do.set_clicked(null);
    }
  }
});

export default frameListHoverManager;
