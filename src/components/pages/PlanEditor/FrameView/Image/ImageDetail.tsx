import styles from './Image.module.scss';
import stateFactory from './Image.state.ts';
import useForest from '~/lib/useForest';
import { Frame } from '~/types'
import Image from 'next/image';
import { Alert, AlertDescription, AlertIcon, AlertTitle } from '@chakra-ui/alert'
import { useMemo } from 'react'

type ImageProps = { frame: Frame }

export default function ImageDetail(props: ImageProps) {
  const { frame } = props;
  const [value, _state] = useForest([stateFactory, props],
    (localState) => {
      localState.do.load();
    });

  const { url, width, height, error } = useMemo(() => {
    try {
      return JSON.parse(frame.value);
    } catch (err) {
      return {
        error: (err as Error).message
      }
    }
  }, [frame.value])

  return (<div className={styles.container}>
    {
      error ? <Alert status='error'>
        <AlertIcon/>
        <AlertTitle>Error loading url</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert> : null
    }
    {
      (url) ? <Image
        alt={props.frame.name || props.frame.id}
        src={url}
        width={width}
        height={height}
      /> : null
    }
  </div>);
}
