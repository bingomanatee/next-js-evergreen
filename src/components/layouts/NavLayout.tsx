"use client"
import { Box, Flex, Heading, Spacer, VStack } from '@chakra-ui/react'
import Link from 'next/link'
import UserMenuItem from '~/components/layouts/UserMenuItem'

function NavBar ({user}) {
  return <Flex direction="row" justify="space-between" align="center" h={8} px="4" w="100%">
    <Link href="/"><Heading size="sm">Planboard</Heading></Link>
    <UserMenuItem user={user}/>
  </Flex>
}

export default function NavLayout ({user = null, children}) {
  return (
      <VStack w="100%" h="100%" overflow="hidden" align="stretch" as="main">
        <NavBar user={user} />

        <Box flex="1" background="blackAlpha.50">
          {children}
        </Box>

      </VStack>
    )
}
