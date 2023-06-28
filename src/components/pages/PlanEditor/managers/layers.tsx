import { Layer, LayerConfig } from '~/components/pages/PlanEditor/managers/Layer'

export class LayerManager {
  public layers = new Map<string, Layer>();

  addLayer(name: string, layerConfig: LayerConfig, parent?: string) {
    if (!this.layers.has(name)) {
      this.layers.set(name, new Layer(name, this, layerConfig, parent));
    }
  }

  get maxZIndex() {
    let index = 0;
    this.layers.forEach((layer) => {
      index = Math.max(index, layer.zIndex);
    });
    return index;
  }
}

function layers() : LayerManager {
  return new LayerManager();
}

export default layers
