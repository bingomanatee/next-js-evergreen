import { useMemo } from 'react'
import { LayerManager } from '~/components/pages/PlanEditor/managers/layers'
import { c } from '@wonderlandlabs/collect'
import LayerView from '~/components/pages/PlanEditor/LayerView/LayerView'
import { Layer } from '~/components/pages/PlanEditor/managers/Layer'

// depreacated
 function LayersVew({managers}) {

  const layers : LayerManager = useMemo(() => managers.get('layers'), [managers]);

  return <>
    {c(layers.layers).getReduce((memo, layer: Layer) => {
      if (!layer.parent) { memo.push(layer) }
      return memo;
    }, []).map((layer) => (
      <LayerView key={layer.name} layer={layer} />
    ))}
    </>
}

export default LayersVew;
