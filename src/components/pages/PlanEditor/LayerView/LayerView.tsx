import { useState, useEffect } from 'react';
import styles from './LayerView.module.scss';
import stateFactory from './LayerView.state.ts';
import useForest from '~/lib/useForest';
import { Layer } from '~/components/pages/PlanEditor/managers/Layer'
import { Box } from '@chakra-ui/react'

type LayerViewProps = { layer: Layer }

export default function LayerView(props: LayerViewProps) {
  const { layer } = props;
  const [layerProps, setLP] = useState(layer.propStream.value);

  useEffect(() => {
    const sub = layer.propStream.subscribe(setLP);

    return () => sub.unsubscribe();
  }, [layer.propStream]);

  return (
    <section
      className={[styles.container, layer.fill ? styles['container__fullscreen'] : ''].join(' ')}
      data-layer-name={layer.name}>
      {layer.renderer(layerProps)}
      {layer.children.map((child) => (<LayerView key={child.name} layer={child}/>))}
    </section>
  );
}
