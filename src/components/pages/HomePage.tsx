"use client"

import { Box, Button, Heading, VStack } from '@chakra-ui/react'
import Link from 'next/link'
import Image from 'next/image'
import { P } from '~/components/helpers/P'
import LogoIcon from '~/components/icons/LogoIcon'

// @todo: change text for logged in user
export default function HomePage({ user }) {
  return (
    <Box layerStyle="text-document">
      <Heading variant="textTitle">Welcome to Planboard</Heading>
      <P>Planboard is a &nbsp;link-based&nbsp; document creation engine.</P>
      <P>You can create a Planboard without signing up / logging in, but it will only be saved
        in your browser</P>
      <VStack m="4">
        <Link href="/plans"><Button
          iconSpacing={6}
          leftIcon={<LogoIcon />
        }>My Planboards</Button></Link>
      </VStack>
    </Box>
  )
}
