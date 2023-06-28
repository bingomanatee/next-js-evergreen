"use client"
import { MessageManager } from '~/lib/managers/messageManager'
import {  useEffect } from 'react'
import { useToast } from '@chakra-ui/react'
import withManagers from '~/lib/managers/withManagersHOC'

function Messages({managers}) {
  console.log('withManagers:', managers);
  const toast = useToast({
    containerStyle: {
      width: '500px',
      maxWidth: '100%',
    },
    position: 'bottom-right'
  })
  const messages = managers.get('messages');

  useEffect(() => {
    if (!messages) {
      return;
    }
    let sub = (messages as MessageManager).subject.subscribe(toast);
    return () => sub?.unsubscribe()
  }, [messages])

  return null;
}

export default withManagers<{}>(['messages'], Messages);
