import useForestFiltered from '~/lib/useForestFiltered'
import { Button, Kbd, Text } from '@chakra-ui/react'
import Image from 'next/image'

export function PanControl({ state }) {
  const { panning } = useForestFiltered(state, ['panning'])
  return <Button
    size="sm"
    onClick={state.do.pan}
    {
      ...panning ? {
          borderColor: 'accent',
          borderWidth: '1px'
        }
        : {}
    }
    leftIcon={
      <Image
        width={20}
        height={20}
        alt="pan-icon"
        src="/img/icons/page-move.svg"/>
    }>
    <Text size="xs">Pan</Text>
    {panning ? (<Text textStyle="info-sm"><Kbd>Esc</Kbd> to cancel</Text>) : null}
  </Button>
}
