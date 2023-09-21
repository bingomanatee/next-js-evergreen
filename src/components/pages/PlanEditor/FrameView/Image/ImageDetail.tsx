import styles from './Image.module.scss';
import stateFactory, {ImageStateValue} from './Image.state.ts';
import useForest from '~/lib/useForest';
import {Frame} from '~/types'
import Image from 'next/image';
import {forwardRef, useEffect, useMemo} from 'react'
import {VStack, Text, Spinner} from '@chakra-ui/react'
import withForest from "~/lib/withForest";
import {leafI} from "@wonderlandlabs/forest/lib/types";

type ImageProps = { frame: Frame, state?: leafI, value: ImageStateValue, witForest?(forest: leafI): void }

function NoImage({state, frame}) {
  return <VStack w="100%" alignContent="center" py={12} px={4}>
    <Image width={120} height={120} alt="no-image-icon" src="/img/icons/no-image.svg"/>
    <Text textStyle="info-sm">No image has been saved for frame {frame.id}</Text>
  </VStack>
}


const ImageDetail = forwardRef(function ImageDetailBase(props: ImageProps, ref) {
  const {frame, value, state, createForest} = props;

  useEffect(() => {
    state?.do.load();
  }, [state]);

  if (createForest) {
    createForest(stateFactory(props));
    return null;
  }

  const {url, width, height, loaded} = value;

  let content = <Spinner/>

  if (url || loaded) {
    content = (url) ? <Image
        alt={props.frame.name || props.frame.id}
        src={url}
        width={width}
        height={height}
    /> : <NoImage frame={frame} state={state}/>
  }
  return (<div className={styles.container} ref={ref}>
    {content}
  </div>);
})

export default withForest(ImageDetail)
