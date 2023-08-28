import { useMemo } from 'react';
import styles from './ImageEditor.module.scss';
import stateFactory from './ImageEditor.state.ts';
import useForest from '~/lib/useForest';
import { Box, HStack, Text } from '@chakra-ui/react'
import Dropzone from 'react-dropzone';
import Image from 'next/image';
import { vectorToStyle } from '~/lib/utils/px'
import { leafI } from '@wonderlandlabs/forest/lib/types'

type ImageEditorProps = {}

function Preview({state}: {state: leafI, frameState?: leafI}) {
  const scaledSize = state.$.scaledSize();

  const { size, imageUrl } = state.value;
  return (
    <>
      <Text textStyle="info" textAlign="center">
        Image scaled to fit; real size is {size.x}px wide, {size.y}px high
      </Text>
      <HStack layerStyle="image-preview">
        <Box style={vectorToStyle(scaledSize)} overflow="hidden">
          <Image alt="preview" src={imageUrl} width={scaledSize.x} height={scaledSize.y}
          /></Box>
      </HStack>
      </>
  )

}

export default function ImageEditor(props: ImageEditorProps) {
  const [value, state] = useForest([stateFactory, props],
    (localState) => {
      localState.do.init();
    });

  const {  imageUrl, size } = value;

  return (<Box className={styles.container}>
    {imageUrl && size ? (<Preview state={state} frameState={props.frameState} />) : null}
    <Dropzone onDrop={state.do.upload}>
      {({ getRootProps, getInputProps }) => (
        <Box layerStyle="drop-target" data-role="dropzone-inner">
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <Text textStyle="info-dropzone"> Drag image files here to upload an image
              <br/>or click here</Text>
          </div>
        </Box>
      )}
    </Dropzone>
    <Text layerStyle="info">
      Adding a new image file saves <b>immediately</b>
      - whether or not you click the save button
    </Text>
  </Box>);
}
