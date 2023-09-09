import {leafI} from '@wonderlandlabs/forest/lib/types'
import {Box, Heading, Table, Tbody, Td, Th, Thead, Tr, Text, CloseButton, HStack, Button, Flex} from '@chakra-ui/react'
import {memo, useEffect, useMemo, useState} from 'react'
import Image from 'next/image';
import {formatLatitude, formatLongitude} from 'latlon-formatter';
import styles from './MapEditor.module.scss';
import {MapPointLabelEditor} from '~/components/pages/PlanEditor/FrameDetail/MapEditor/MapPointLabelEditor'
import {TO_RAD} from '~/constants'
import useForestFiltered from "~/lib/useForestFiltered";
import {MapPoint} from "~/types";

const PointInfo = memo(function PointInfoBase({state}) {

  const {infoPoint, points} = useForestFiltered(state, (value) => {
    return ({
      infoPoint: value.infoPoint,
      points: value.mapPoints.points
    })
  });

  const currentPoint = useMemo<MapPoint | null>(() => {
    if (!infoPoint) return null;
    return points.get(infoPoint) || null;
  }, [infoPoint, points]);

  const [pointInfoData, setPID] = useState(null);

  useEffect(() => {
    if (currentPoint) {
      let id = currentPoint.id;
      state.$.locationInfo(currentPoint)
          .then((result) => {
            if (currentPoint?.id === id) {
              setPID({id, result});
            }
          });
    }
  }, [currentPoint, state])

  console.log('pointInfoData', pointInfoData?.result);
  if (!currentPoint) {
    return <></>
  }

  return (
      <Box w="100%" my={2} p={3} shadow="lg">
        <Heading textAlign="center" size="sm">Map Point
        <CloseButton float="right" onClick={() => {
          state.do.set_infoPoint('');
        }} />
        </Heading>
        <Table size="sm" variant="unstyled" w="100%">
          <Tbody>
            <Tr>
              <Th w={50}>ID</Th>
              <td><Text fontSize="xs">{currentPoint.id}</Text></td>
            </Tr>
            <Tr>
              <Th>location</Th>
              <td><Text fontSize="xs">
                {formatLatitude(currentPoint.lat)}, {formatLongitude(currentPoint.lng)}
              </Text></td>
            </Tr>
            <Tr>
              <Th>Label</Th>
              <td><Text fontSize="xs">
                <MapPointLabelEditor
                    state={state.child('mapPoints')!}
                    pointId={currentPoint.id}/>
              </Text>
              </td>
            </Tr>
            {
              pointInfoData?.result?.formatted_address ? (
                  <Tr>
                    <Th>Info</Th>
                    <Td p={0}>
                      <Flex
                          alignItems="center"
                          direction="row"
                          w="100%"
                          justifyContent="stretch"
                          spacing={0}
                          p={0}
                          m={0}>
                        <Text flex={1} m={0} fontSize="xs">{pointInfoData?.result?.formatted_address}</Text>
                        <Button
                            onClick={() => {
                              let label = pointInfoData?.result?.formatted_address;
                              if (label && currentPoint)
                                state.child('mapPoints')!
                                    .do.setPointLabel(currentPoint.id, label);
                            }}
                            py={1} h="auto" fontSize="xs" size="sm">As Label</Button>
                      </Flex>
                    </Td>
                  </Tr>
              ) : null
            }
          </Tbody>
        </Table>
      </Box>
  )

});


function MapLocations(props: { state: leafI }) {
  const {state} = props

  const mapPoints = state.child('mapPoints')!;
  const {points} = useForestFiltered(mapPoints, ['points', 'infoPoint'])

  const pointList = Array.from(points.values());

  return (
      <Box w="100%">
        <PointInfo state={state}/>
        <Table w="100%" size="xs" variant="unstyled" className={styles['point-table']}>
          <Thead>
            <Tr>
              <Th textStyle="table-head" w={35}>&nbsp;</Th>
              <Th textStyle="table-head" w={120}>Lat</Th>
              <Th textStyle="table-head" w={120}>Lon</Th>
              <Th textStyle="table-head">Label</Th>
              <Th textStyle="table-head" w={35}>&nbsp;</Th>
            </Tr>
          </Thead>
          <Tbody>
            {pointList.map((point) => {
              return (
                  <Tr key={point.id}>
                    <Td>
                      <CloseButton
                          size="sm" color="red" h="auto"
                          onClick={() => mapPoints.do.removePoint(point.id)}
                      />
                    </Td>
                    <Td>
                      <Text fontSize="xs">{formatLatitude(TO_RAD * point.lat)}</Text>
                    </Td>
                    <Td>
                      <Text fontSize="xs">{formatLongitude(TO_RAD * point.lng)}</Text>
                    </Td>
                    <Td>
                      <MapPointLabelEditor
                          state={state.child('mapPoints')!}
                          pointId={point.id}/>
                    </Td>
                    <Td>
                      <Image
                          onClick={() => state.do.set_infoPoint(point.id)}
                          width={14}
                          height={14}
                          alt={'map-info'}
                          src={'/img/icons/info.svg'}/>
                    </Td>
                  </Tr>
              )
            })}
          </Tbody>
        </Table>
      </Box>
  )
}

export const MapLocationsM = memo(MapLocations);
