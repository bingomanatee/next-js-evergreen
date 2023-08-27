"use client"
import { useState, useEffect, useCallback, ReactNode } from 'react';
import { formatLatitude, formatLongitude } from 'latlon-formatter';

import stateFactory from './MapEditor.state.ts';
import useForest from '~/lib/useForest';
import {
  Box,
  Input,
  InputGroup,
  Button,
  InputLeftAddon,
  InputRightAddon,
  VStack,
  Text, Heading
} from '@chakra-ui/react'
import useForestInput from '~/lib/useForestInput'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import QueryAutocompletePrediction = google.maps.places.QueryAutocompletePrediction
import useForestFiltered from '~/lib/useForestFiltered'
import ReactMapboxGl from "react-mapbox-gl";

const Map = ReactMapboxGl({
  accessToken:
  process.env.NEXT_PUBLIC_MAPBOOK_API_PUBLIC_TOKEN
});

type MapEditorProps = {}

function Prediction(props: { pred: QueryAutocompletePrediction, state: leafI }) {
  const { pred, state } = props;
  return (
    <Box layerStyle="list-item" onClick={() => state.do.choosePred(props.pred)}>
      <Text fontSize="sm" noOfLines={1}>{pred.description}</Text>
    </Box>
  )
}

const TO_RAD = Math.PI / 180;

function PlaceSearch(props: { state: leafI }) {
  const { state } = props;
  const [lat, setLat] = useForestInput(state, 'lat');
  const [lon, setLon] = useForestInput(state, 'lat');
  const [placeSearch, setPlaceSearch] = useForestInput(state, 'placeSearch');

  const { pred } = useForestFiltered(state, ['pred'])

  return (
    <VStack spacing={[1,2,2]}>
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
        <Input value={lon} onChange={setLon}/>
        <InputRightAddon pointerEvents="none">
          <Text> ({formatLongitude(lon * TO_RAD)}) </Text>
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

function PlaceInfo(props: { state: leafI }) {
  const { state } = props;
  const { description, lat, lon, zoom } = useForestFiltered(state,
    ['description', 'lat', 'lon', 'zoom']);

  return (
    <VStack spacing={[1,2,2]}>
      <Heading size="sm">
        {description}
      </Heading>
      <InputGroup size="sm">
        <InputLeftAddon pointerEvents="none">
          Latitude
        </InputLeftAddon>
        <Input value={lat} readOnly/>
        <InputRightAddon pointerEvents="none">
          <Text> ({formatLatitude(lat * TO_RAD)}) </Text>
        </InputRightAddon>
      </InputGroup>
      <InputGroup size="sm">
        <InputLeftAddon pointerEvents="none">
          Longitude
        </InputLeftAddon>
        <Input value={lon} readOnly/>
        <InputRightAddon pointerEvents="none">
          <Text> ({formatLongitude(lon * TO_RAD)}) </Text>
        </InputRightAddon>
      </InputGroup>

      <Map
        style="mapbox://styles/mapbox/streets-v9"
        center={[lon, lat]}
        zoom={[zoom]}
        containerStyle={{
          width: '100%',
          height: '300px'
        }}
        />
    </VStack>
  )
}

export default function MapEditor(props: MapEditorProps) {
  const [value, state] = useForest([stateFactory, props],
    (localState) => {
    });

  const { description } = value;

  return (
    <Box>
      {!description ? <PlaceSearch state={state}/> : <PlaceInfo state={state}/>}
    </Box>
  );
}
