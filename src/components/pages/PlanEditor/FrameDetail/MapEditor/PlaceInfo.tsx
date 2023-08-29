import { leafI } from '@wonderlandlabs/forest/lib/types'
import useForestFiltered from '~/lib/useForestFiltered'
import {
  Button,
  Heading,
  HStack, IconButton,
  Input,
  InputGroup,
  InputLeftAddon,
  Box,
  InputRightAddon,
  Text,
  VStack, Slider, SliderTrack, SliderThumb, SliderFilledTrack
} from '@chakra-ui/react'
import { formatLatitude, formatLongitude } from 'latlon-formatter';
import ReactMapboxGl from 'react-mapbox-gl'
import { useRef } from 'react'
import useForestInput from '~/lib/useForestInput'

export const TO_RAD = Math.PI / 180;

const Map = ReactMapboxGl({
  accessToken:
  process.env.NEXT_PUBLIC_MAPBOOK_API_PUBLIC_TOKEN
});

export function PlaceInfo(props: { state: leafI }) {
  const { state } = props;
  const { lat, lng, zoom } = useForestFiltered(state,
    ['description', 'lat', 'lng', 'zoom']);

  const [desc, setDesc] = useForestInput(state, 'description');

  const mapRef = useRef(null);
  return (
    <VStack spacing={[1, 2, 2]}>
      <HStack width="100%" justify="stretch">
        <VStack spacing={0} flex={1}>
          <InputGroup size="sm">
            <InputLeftAddon pointerEvents="none">
              Lat
            </InputLeftAddon>
            <Input value={Number(lat).toFixed(4)} readOnly/>
          </InputGroup>
          <Text fontSize="xs" p={0}>
            ({formatLatitude(lat * TO_RAD)}) </Text>
        </VStack>
        <VStack spacing={0} flex={1}>
          <InputGroup size="sm">
            <InputLeftAddon pointerEvents="none">
              Lon
            </InputLeftAddon>
            <Input value={Number(lng).toFixed(4)} readOnly/>
          </InputGroup>
          <Text fontSize="xs" textStyle="info-" p={0}>
            ({formatLongitude(lng * TO_RAD)}) </Text>
        </VStack>
      </HStack>
      <HStack spacing={2} width="100%" alignContent="center">
        <Box py={2}> <Text fontSize="sm">Zoom</Text></Box>
        <Box flex={1}>
          <Slider aria-label='zoom' max={20} min={1}
                  onChange={state.do.set_zoom}
                  defaultValue={zoom} size="lg" value={zoom}>
            <SliderTrack h={2.5}>
              <SliderFilledTrack h={2.5}/>
            </SliderTrack>
            <SliderThumb/>
          </Slider>
        </Box>
        <Box py={2}> <Text fontSize="sm">{Number(zoom).toFixed(2)}</Text></Box>
      </HStack>
      <Map
        style="mapbox://styles/mapbox/streets-v9"
        center={[lng, lat]}
        zoom={state.$.zoomArray()}
        onMoveEnd={state.do.onMapMove}
        onZoomEnd={state.do.onMapZoom}
        movingMethod="jumpTo"
        containerStyle={{
          width: '100%',
          height: '300px'
        }} ref={mapRef}>
      </Map>
    </VStack>
  )
}
