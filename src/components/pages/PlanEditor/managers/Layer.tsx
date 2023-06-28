import { LayerManager } from '~/components/pages/PlanEditor/managers/layers'
import { FC } from 'react'
import { BehaviorSubject } from 'rxjs'

export type LayerConfig = {
  zIndex?: number,
  renderer: FC,
  fill?: boolean,
  initialProps: Record<string, any>,
}

export class Layer {
  constructor(public name: string, private manager: LayerManager, layerConfig: LayerConfig, public parent?) {
    this.zIndex = 'zIndex' in layerConfig ? Number(layerConfig.zIndex) : manager.maxZIndex + 1;
    this.renderer = layerConfig.renderer;
    this.fill = !!layerConfig.fill;
    this.propStream = new BehaviorSubject(layerConfig.initialProps);
  }

  public fill: boolean;
  public propStream: BehaviorSubject<Record<string, any>>
  public renderer: FC;
  public zIndex: number;

  public get children(): Layer[] {
    return Array.from(this.manager.layers.values()).filter((layer) => layer.parent === this.name);
  }
}
