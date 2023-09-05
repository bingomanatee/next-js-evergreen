import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Box, HStack, Text } from '@chakra-ui/react'
import { vectorToStyle } from '~/lib/utils/px'
import Image from 'next/image'

export function Preview({ state }: { state: leafI, frameState?: leafI }) {
  const scaledSize = state.$.scaledSize();

  const { url, width, height } = state.value;
  return (
    <>
      <Text textStyle="info" textAlign="center">
        Image scaled to fit; real size is {width}px wide, {height}px high
      </Text>
      <HStack layerStyle="image-preview">
        <Box style={vectorToStyle(scaledSize)} overflow="hidden">
          <Image alt="preview" src={url} width={scaledSize.x} height={scaledSize.y}
          /></Box>
      </HStack>
    </>
  )

}
