import { leafI } from '@wonderlandlabs/forest/lib/types'
import useForestInput from '~/lib/useForestInput'
import useForestFiltered from '~/lib/useForestFiltered'
import { Box, Button, Input, InputGroup, InputLeftAddon, InputRightAddon, Text, VStack } from '@chakra-ui/react'
import { TO_RAD } from '~/components/pages/PlanEditor/FrameDetail/MapEditor/PlaceInfo'
import QueryAutocompletePrediction = google.maps.places.QueryAutocompletePrediction
import { formatLatitude, formatLongitude } from 'latlon-formatter';

function Prediction(props: { pred: QueryAutocompletePrediction, state: leafI }) {
  const { pred, state } = props;
  return (
    <Box layerStyle="list-item" onClick={() => state.do.choosePred(props.pred)}>
      <Text fontSize="sm" noOfLines={1}>{pred.description}</Text>
    </Box>
  )
}

export function PlaceSearch(props: { state: leafI }) {
  const { state } = props;
  const [lat, setLat] = useForestInput(state, 'lat');
  const [lng, setLon] = useForestInput(state, 'lat');
  const [placeSearch, setPlaceSearch] = useForestInput(state, 'placeSearch');

  const { pred } = useForestFiltered(state, ['pred'])

  return (
    <VStack spacing={[1, 2, 2]}>
      <InputGroup>
        <InputLeftAddon size="sm" pointerEvents="none">
          Search
        </InputLeftAddon>
        <Input value={placeSearch} onChange={setPlaceSearch}/>
        <InputRightAddon px={1}>
          <Button colorScheme="teal" size="sm" onClick={() => state.do.search()}>
            Find
          </Button>
        </InputRightAddon>
      </InputGroup>
      <InputGroup size="sm">
        <InputLeftAddon pointerEvents="none">
          Latitude
        </InputLeftAddon>
        <Input value={lat} onChange={setLat}/>
        <InputRightAddon pointerEvents="none">
          <Text> ({formatLatitude(lat * TO_RAD)}) </Text>
        </InputRightAddon>
      </InputGroup>
      <InputGroup size="sm">
        <InputLeftAddon pointerEvents="none">
          Longitude
        </InputLeftAddon>
        <Input value={lng} onChange={setLon}/>
        <InputRightAddon pointerEvents="none">
          <Text> ({formatLongitude(lng * TO_RAD)}) </Text>
        </InputRightAddon>
      </InputGroup>
      <Box layerStyle="options-list" maxHeight={200}>
        {pred?.map((pred) => {
          return <Prediction key={pred.place_id} pred={pred} state={state}/>
        })}
      </Box>
    </VStack>
  )
}
