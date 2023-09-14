import {memo} from "react";
import {MapPoint} from "~/types";
import {leafI} from "@wonderlandlabs/forest/lib/types";
import useForestFiltered from "~/lib/useForestFiltered";
import {Box, HStack, Text} from "@chakra-ui/react";
import styles from "~/components/pages/PlanEditor/LinkFrameView/MapPointDlog/MapPointDlog.module.scss";
import {TO_RAD} from "~/constants";
import {formatLatitude, formatLongitude} from 'latlon-formatter';

export const MapPointListItem = memo(function MapPointListItemBase(props: { point: MapPoint, state: leafI }) {
  const {point, state} = props;
  const {id, label, lat, lng} = point;
  const {infoPoint, linkPoint} = useForestFiltered(state, ['infoPoint', 'linkPoint']);
  return (
      <Box layerStyle={linkPoint === id ? 'list-item-active' : "list-item"} id={id}
           onMouseLeave={state.do.leaveListItem}
           className={styles['list-item']}
           onMouseEnter={state.do.enterListItem}
           ref={(element) => {
             element?.addEventListener('click', state.do.chooseListItem, true);
           }}
      >
        <Text noOfLines={1} textStyle="info-xs">{id}</Text>
        {label ? <Text noOfLines={1} fontSize="sm">{label}</Text> : ''}
        {infoPoint === id || linkPoint === id ? (<HStack>
          <Box flexBasis="50%"><Text fontSize="xs">{formatLatitude(lat * TO_RAD)}</Text></Box>
          <Box flexBasis="50%"><Text fontSize="xs">{formatLongitude(lng * TO_RAD)}</Text></Box>
        </HStack>) : null}
      </Box>
  )
})
