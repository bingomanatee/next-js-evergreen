"use client"
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack, Menu,
  MenuButton,
  MenuIcon,
  MenuItem,
  MenuList,
  Spacer,
  VStack
} from '@chakra-ui/react'
import Link from 'next/link'
import UserMenuItem from '~/components/layouts/UserMenuItem'
import Image from 'next/image';
import useForestFiltered from '~/lib/useForestFiltered'
import { userManager } from '~/lib/managers/userManager'
import navManager from '~/lib/managers/navManager'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo } from 'react'
import { historyStream } from '~/lib/managers/historyStream'
import { HamburgerIcon } from '@chakra-ui/icons'
import messageManager from '~/lib/managers/messageManager'

function NavBar ({user, pathName}) {
  const router = useRouter();

  const {subTitle} = useForestFiltered(navManager, ['subTitle']);
  const showHelp = useCallback(() => {
     messageManager.dialog({
      title: 'How To Create and Edit Frames',
      view: 'help',
      actionPrompt: 'OK',
      cancelPrompt: ''
    })
  }, []);
  const goHome = useCallback(() => {router.push('/')}, [router])

  const isPlanEditor = useMemo(() => {
    return /plans\/[\w\-]{12,}/.test(pathName);
  }, [pathName])

  return <Flex direction="row" justify="space-between" align="center" py={0} pt={2} h={8} px={4} w="100%" as="header" zIndex={100000}>
    <Menu zIndex={100000}>
      <MenuButton as={Button} leftIcon={<HamburgerIcon boxSize={6} />} backgroundColor="transparent">
        Menu
      </MenuButton>
      <MenuList>
        <MenuItem onClick={goHome}>Home Page</MenuItem>
        {isPlanEditor ? <MenuItem onClick={showHelp}>Help</MenuItem> : null}
        {isPlanEditor ? <MenuItem onClick={() => messageManager.listFrames('all')}>List Frames</MenuItem> : null}
      </MenuList>
    </Menu>
    <HStack>
      <Image alt="logo" src="/img/logo.svg" width={24} height={24} />
      <Link href="/"> <Heading size="sm">Planboard</Heading></Link>
      {subTitle ? <Heading fontWeight="normal" size="sm">{subTitle}</Heading> : null}
    </HStack>
    <UserMenuItem user={user}/>
  </Flex>
}

export default function NavLayout ({children}) {
  const {user} = useForestFiltered(userManager, ['user'])
  const pathname = usePathname()
  useEffect(() => {
    historyStream.next(pathname);
  }, [pathname])
  return (
      <VStack w="100%" h="100%" overflow="hidden" align="stretch" as="main">
        <NavBar pathName={pathname} user={user} />

        <Box flex="1" background="blackAlpha.50" overflow="auto">
          {children}
        </Box>

      </VStack>
    )
}
