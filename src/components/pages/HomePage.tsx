"use client"

import { Box, Button, Heading, VStack } from '@chakra-ui/react'
import Link from 'next/link'
import { P } from '~/components/helpers/P'
import LogoIcon from '~/components/icons/LogoIcon'
import { userManager } from '~/lib/managers/userManager'
import useForestFiltered from '~/lib/useForestFiltered'

// @todo: change text for logged in user
 function HomePage({}) {
  const {user} = useForestFiltered(userManager, ['user']);
  return (
    <Box layerStyle="text-document">
      <Heading variant="textTitle">Welcome to Planboard</Heading>
      <P>Planboard is a &nbsp;link-based&nbsp; document creation engine.</P>
      {user ? null : (<P>You can create a Planboard without signing up / logging in, but it will only be saved
        in your browser</P>) }
      <VStack m="4">
        <Link href="/plans"><Button
          iconSpacing={6}
          leftIcon={<LogoIcon />
        }>My Planboards</Button></Link>
      </VStack>
    </Box>
  )
}

 export default HomePage
