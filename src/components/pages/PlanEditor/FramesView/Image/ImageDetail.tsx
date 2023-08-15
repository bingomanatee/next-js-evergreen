import styles from './Image.module.scss';
import stateFactory from './Image.state.ts';
import useForest from '~/lib/useForest';
import { Frame } from '~/types'
import Image from 'next/image';

type ImageProps = { frame: Frame }

export default function ImageDetail(props: ImageProps) {
  console.log('image detail for ', props.frame);
  const [value, _state] = useForest([stateFactory, props],
    (localState) => {
      localState.do.load();
    });

  const { url, size } = value;

  return (<div className={styles.container}>
    {(url && size) ? <Image
      alt={props.frame.name || props.frame.id}
      src={url}
      width={size.x}
      height={size.y}
    /> : null}
  </div>);
}
