import styles from './ImageEditor.module.scss';
import stateFactory from './ImageEditor.state.ts';
import useForest from '~/lib/useForest';
import { Box, Text } from '@chakra-ui/react'
import Dropzone from 'react-dropzone';
import { Preview } from '~/components/pages/PlanEditor/FrameDetail/ImageEditor/Preview'

type ImageEditorProps = {}

export default function ImageEditor(props: ImageEditorProps) {
  const [value, state] = useForest([stateFactory, props],
    (localState) => {
      localState.do.init();
    });

  const {  url, is_valid } = value;

  return (<Box className={styles.container}>
    {url && is_valid ? (<Preview state={state} frameState={props.frameState} />) : null}
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
