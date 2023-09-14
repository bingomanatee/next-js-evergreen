import {leafI,} from '@wonderlandlabs/forest/lib/types'
import {
  Box,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  VStack, TabPanel, TabPanels, Tab, Tabs, TabList, useBoolean
} from '@chakra-ui/react'
import {formatLatitude, formatLongitude} from 'latlon-formatter';
import {memo, useEffect} from 'react'

import useForestFiltered from '~/lib/useForestFiltered'
import {TO_RAD} from '~/constants'
import {MapLocationsM} from '~/components/pages/PlanEditor/FrameDetail/MapEditor/MapLocations'
import styles from "~/components/pages/PlanEditor/FrameDetail/MapEditor/MapEditor.module.scss";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOOK_API_PUBLIC_TOKEN;


const MapWrapper = memo(function MapWrapperBase({state}) {
  const [loaded, loadedState] = useBoolean(false)
  useEffect(() => {
    if (!loaded) setTimeout(() => {
      loadedState.on()
    }, 100);

  }, [loaded, loadedState, state]);

  if (!loaded) return <Box w="100%" h="250px" id="placeholder"/>
  return (<Box w="100%" h="250px" ref={state.do.initMap}/>)
})

export function PlaceInfo(props: { state: leafI }) {
  const {state} = props;
  const {lat, lng, zoom} = useForestFiltered(state,
      ['description', 'lat', 'lng', 'zoom']);

  const {interactive} = useForestFiltered(state, ['interactive']);

  return (
      <VStack spacing={[1, 2, 2]} className={styles['map-container' + (interactive ? '-interactive' : '')]}>
        <HStack justify="center" mt={2}>
          <Box flex={1}>
            <Text whiteSpace="nowrap" fontSize="xs" textStyle="info-sm" textAlign="center">
              ({formatLatitude(lat * TO_RAD)}) </Text>
          </Box>
          <Box flex={1}>
            <Text whiteSpace="nowrap" fontSize="xs" textStyle="info-sm" textAlign="center">
              ({formatLongitude(lng * TO_RAD)}) </Text>
          </Box>
        </HStack>
        <MapWrapper state={state}/>

        <Tabs w="100%" onChange={state.do.onTabChange}>
          <TabList>
            <Tab>Points</Tab>
            <Tab>Location</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <MapLocationsM state={state}/>
            </TabPanel>
            <TabPanel p={0}>
              <HStack width="100%" justify="stretch">
                <Box flex={1}>
                  <InputGroup size="sm">
                    <InputLeftAddon pointerEvents="none">
                      Lat
                    </InputLeftAddon>
                    <Input value={Number(lat).toFixed(4)} readOnly/>
                  </InputGroup>
                </Box>
                <Box flex={1}>
                  <InputGroup size="sm">
                    <InputLeftAddon pointerEvents="none">
                      Long
                    </InputLeftAddon>
                    <Input value={Number(lng).toFixed(4)} readOnly/>
                  </InputGroup>
                </Box>
              </HStack>
              <HStack spacing={2} width="100%" alignContent="center">
                <Box py={2}> <Text fontSize="sm">Zoom</Text></Box>
                <Box flex={1}>
                  <Slider aria-label="zoom" max={20} min={1}
                          onChange={state.do.updateZoom}
                          defaultValue={zoom} size="lg" value={zoom}>
                    <SliderTrack h={2.5}>
                      <SliderFilledTrack h={2.5}/>
                    </SliderTrack>
                    <SliderThumb/>
                  </Slider>
                </Box>
                <Box py={2}> <Text fontSize="sm">{Number(zoom).toFixed(2)}</Text></Box>
              </HStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

      </VStack>
  )
}
