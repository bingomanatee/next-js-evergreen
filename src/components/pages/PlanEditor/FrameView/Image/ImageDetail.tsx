import styles from './Image.module.scss';
import stateFactory from './Image.state.ts';
import useForest from '~/lib/useForest';
import {Frame} from '~/types'
import Image from 'next/image';
import {useEffect, useMemo} from 'react'
import {VStack, Text} from '@chakra-ui/react'

type ImageProps = { frame: Frame }

function NoImage({state, frame}) {
  return <VStack w="100%" alignContent="center" py={12} px={4}>
    <Image width={120} height={120} alt="no-image-icon" src="/img/icons/no-image.svg"/>
    <Text textStyle="info-sm">No image has been saved for frame {frame.id}</Text>
  </VStack>
}


export default function ImageDetail(props: ImageProps) {
  const {frame} = props;
  const [value, state] = useForest([stateFactory, props],
      (localState) => {
        setTimeout(() => {
          localState.do.load();
        }, 100);
      });
  const {url, width, height} = value;

  return (<div className={styles.container}>
    {
      (url) ? <Image
          alt={props.frame.name || props.frame.id}
          src={url}
          width={width}
          height={height}
      /> : <NoImage frame={frame} state={state}/>
    }
  </div>);
}
