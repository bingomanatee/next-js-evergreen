"use client"
import { Box, Flex, Heading, HStack, Spacer, VStack } from '@chakra-ui/react'
import Link from 'next/link'
import UserMenuItem from '~/components/layouts/UserMenuItem'
import Image from 'next/image';
import useForestFiltered from '~/lib/useForestFiltered'
import { userManager } from '~/lib/managers/userManager'
import navManager from '~/lib/managers/navManager'

function NavBar ({user}) {

  const {subTitle} = useForestFiltered(navManager, ['subTitle'])

  return <Flex direction="row" justify="space-between" align="center" h={8} px="4" w="100%" as="header">
    <Image src="/img/logo.svg" width={24} height={24} />
    <HStack><Link href="/">
      <Heading size="sm">Planboard</Heading></Link>
      {subTitle ? <Heading fontWeight="normal" size="sm">{subTitle}</Heading> : null}
    </HStack>
    <UserMenuItem user={user}/>
  </Flex>
}

export default function NavLayout ({children}) {
  const {user} = useForestFiltered(userManager, ['user'])

  return (
      <VStack w="100%" h="100%" overflow="hidden" align="stretch" as="main">
        <NavBar user={user} />

        <Box flex="1" background="blackAlpha.50" overflow="auto">
          {children}
        </Box>

      </VStack>
    )
}
