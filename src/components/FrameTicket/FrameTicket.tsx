import { useState, useEffect, useCallback } from 'react';
/*import styles from './FrameTicket.module.scss';
import stateFactory from './FrameTicket.state.ts';
import useForest from '~/lib/useForest'*/
import dataManager from '~/lib/managers/dataManager'
import { map } from 'rxjs'
import { Heading, HStack, Spinner, Text } from '@chakra-ui/react'
import { Frame } from '~/types'
import FrameIcon from '~/components/icons/FrameIcon'

type FrameTicketProps = { id: string, size: string}

export default function FrameTicket(props: FrameTicketProps) {
  const [frame, setFrame] = useState<Frame | null>(null);

  useEffect(() => {
    const sub = dataManager.planStream.pipe(map(({ framesMap }) => {
        return framesMap.get(props.id);
      })
    ).subscribe({
      next(frame) {
        setFrame(frame);
      }
    })

    return () => sub?.unsubscribe();
  }, [props.id]);

  if (!frame) {
    return <Spinner/>
  }

  switch (props.size) {
    case 'sm':
      return (
        <HStack layerStyle="ticket-small" spacing={3}>
          <FrameIcon active type={frame.type} size={20} />
          <Heading textStyle="ticket-small">
            {frame.name ? `Frame "${frame.name}"` : 'Frame'}
          </Heading>
          <Text noOfLines={1} textStyle="info-sm">{frame.id}</Text>
        </HStack>
      )
      break;

    default:
      return (
        <HStack layerStyle="ticket">
          <FrameIcon active type={frame.type} size={20} />
          <Heading textStyle="ticket-small">
            {frame.name ? `Frame "${frame.name}"` : 'Frame'}
          </Heading>
          <Text noOfLines={1} textStyle="info-sm">{frame.id}</Text>
        </HStack>
      )

  }
}
