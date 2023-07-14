"use client"
import messages, { MessageManager } from '~/lib/managers/messageManager'
import {  useEffect } from 'react'
import { useToast } from '@chakra-ui/react'

function Messages() {
  const toast = useToast({
    containerStyle: {
      width: '500px',
      maxWidth: '100%',
    },
    position: 'bottom-right'
  })

  useEffect(() => {
    let sub = messages.notifySubject.subscribe(toast);
    return () => sub?.unsubscribe()
  }, [toast])

  return null;
}

export default Messages
