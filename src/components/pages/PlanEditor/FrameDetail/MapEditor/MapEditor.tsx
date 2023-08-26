"use client"
import { useState, useEffect, useCallback } from 'react';
import styles from './MapEditor.module.scss';
import stateFactory from './MapEditor.state.ts';
import useForest from '~/lib/useForest';
import {
  Box,
  Input,
  InputGroup,
  Button,
  HStack,
  InputLeftAddon,
  InputRightAddon,
  VStack,
  Text
} from '@chakra-ui/react'
import useForestInput from '~/lib/useForestInput'

type MapEditorProps = {}

function Prediction(props: { pred: window.google.maps.places.PlaceResult }) {
  console.log('pred:', props.pred)
  return (
    <Box layerStyle="list-item">
      <Text fontSize="sm" noOfLines={1}>{props.pred.description}</Text>
    </Box>
  )
}

export default function MapEditor(props: MapEditorProps) {
  const [value, state] = useForest([stateFactory, props],
    (localState) => {
    });

  const { pred } = value;

  const [lat, setLat] = useForestInput(state, 'lat');
  const [lon, setLon] = useForestInput(state, 'lat');
  const [placeSearch, setPlaceSearch] = useForestInput(state, 'placeSearch');

  return (
    <Box>
      <VStack>
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
        <HStack>
          <InputGroup size="sm">
            <InputLeftAddon pointerEvents="none">
              Latitude
            </InputLeftAddon>
            <Input value={lat} onChange={setLat}/>
            <InputRightAddon pointerEvents="none">
              &deg;
            </InputRightAddon>
          </InputGroup>
          <InputGroup size="sm">
            <InputLeftAddon pointerEvents="none">
              Longitude
            </InputLeftAddon>
            <Input value={lon} onChange={setLon}/>
            <InputRightAddon pointerEvents="none">
              &deg;
            </InputRightAddon>
          </InputGroup>
        </HStack>
      </VStack>

      <Box layerStyle="options-list" maxHeight={200}>
        {pred.length ? pred.map((pred) => {
          return <Prediction key={pred.place_id} pred={pred}/>
        }) : null}
      </Box>
    </Box>
  );
}
