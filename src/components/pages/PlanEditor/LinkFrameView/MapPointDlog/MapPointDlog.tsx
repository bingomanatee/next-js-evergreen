import {useContext} from 'react';
import styles from './MapPointDlog.module.scss';
import stateFactory from './MapPointDlog.state.ts';
import useForest from "~/lib/useForest";
import {LinkFrameStateContext} from "~/components/pages/PlanEditor/LinkFrameView/LinkFrameView";
import {
  Box,
  Button,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Text
} from "@chakra-ui/react";
import mapboxgl from "mapbox-gl";
import {MapPoint} from "~/types";
import {MapPointListItem} from "~/components/pages/PlanEditor/LinkFrameView/MapPointDlog/MapPointListItem";
import {PlanEditorStateCtx} from "~/components/pages/PlanEditor/PlanEditor";

type MapPointDlogProps = {
  openLinkDlog: { off: () => void }
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOOK_API_PUBLIC_TOKEN;

export default function MapPointDlog(props: MapPointDlogProps) {
  const linkState = useContext(LinkFrameStateContext);
  const planEditorState = useContext(PlanEditorStateCtx);
  const [value, state] = useForest([stateFactory, props, linkState, planEditorState],
      (localState) => {
        localState.do.init();
      });

  const {mapPoints, mapMode, linkPoint} = value;
  const {points} = mapPoints;

  const {openLinkDlog} = props;

  return (
      <Modal scrollBehavior="inside" size="full" isOpen onClose={openLinkDlog.off}>
        <ModalOverlay/>
        <ModalContent>
          <ModalHeader p={0}>Link to Map Point</ModalHeader>
          <ModalCloseButton/>
          <ModalBody>
            <HStack justify="stretch" alignItems="stretch" spacing={2} data-role="map-container"
                    className={mapMode === 'click' ? styles['map-container']: ''}>
              <Box
                  flex={1}
                  height="max(80vh, 300px)"
                  ref={state.do.initMap}
              >
              </Box>
              <Box w="300px" overflowY="hidden">
                <Heading mb={2} size="md">Points</Heading>
                {Array.from(points.values()).map((point: MapPoint) => (
                    <MapPointListItem key={point.id} state={state} point={point}/>
                ))}
              </Box>
            </HStack>
            <HStack justify="stretch" w="100%" flex={0} spacing={4} my={2}>
              <RadioGroup onChange={state.do.changeMapMode} value={mapMode} flex={0}>
                <HStack direction="row">
                  <Radio value="click">
                    <Text whiteSpace="nowrap">click to add points
                    </Text>
                  </Radio>
                  <Radio value="drag">
                    <Text whiteSpace="nowrap">
                      drag to pan
                    </Text>
                  </Radio>
                </HStack>
              </RadioGroup>
              <Text textStyle="info-sm">Moving/zooming in this view doesn&apos;t change
                the map on the plan; it allows you to add/edit your points.
              </Text>
            </HStack>
          </ModalBody>

          <ModalFooter justifyContent="space-between">
            <Button onClick={openLinkDlog.off} variant="ghost">Cancel</Button>
            <Button colorScheme="blue" mr={3} onClick={state.do.savePoint}>
              {linkPoint ? 'Use Map Point' : 'Clear map point'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  )
}
