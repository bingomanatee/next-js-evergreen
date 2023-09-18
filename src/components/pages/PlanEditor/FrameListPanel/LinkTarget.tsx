import {leafI} from "@wonderlandlabs/forest/lib/types";
import useForestFiltered from "~/lib/useForestFiltered";
import {Frame} from "~/types";
import {Box, CloseButton, HStack, Text} from "@chakra-ui/react";
import Image from 'next/image';

export function LinkTarget(props: {
  state: leafI
}) {
  const {state} = props;
  const {frames, linkTarget} = useForestFiltered(state, ['frames', 'linkTarget']);

  if (!linkTarget) {
    return null;
  }

  const frame: Frame = frames.find((fr) => fr.id === linkTarget);

  return <HStack
      borderWidth={2}
      align="center"
      borderColor="accent"
      mb={2}
      px={4}
      width="100%"
      justify="stretch">

    <Image src="/img/icons/link-top.svg" width="20" height="32" alt="link-icon" />
    <Box py={1} px={2} flex={1}>
      <Text>Links for <b>&quot;{frame.name}&quot;</b></Text>
      <Text textStyle="info-small" fontSize="0.8em">{frame.id}</Text>
    </Box>
    <CloseButton onClick={() => state.do.set_linkTarget(null)} color="red" m={4}/>
  </HStack>
}
