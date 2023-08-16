import { useRouter } from 'next/navigation'
import useForestFiltered from '~/lib/useForestFiltered'
import navManager from '~/lib/managers/navManager'
import { useCallback, useEffect, useMemo } from 'react'
import messageManager from '~/lib/managers/messageManager'
import { Button, Flex, Heading, HStack, Menu, MenuButton, MenuItem, MenuList, useBoolean, Box } from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
import Image from 'next/image'
import Link from 'next/link'
import UserMenuItem from './UserMenuItem'
import blockManager from '~/lib/managers/blockManager'

function BlockerWatcher() {
  const {id, type} = useForestFiltered(blockManager, ['id', 'type']);

  return id ? (
    <Box
      position="absolute"
      top={4}
      right="20vw"
      p={1}
      fontWeight="bold"
      backgroundColor="yellow"
    >
      {type || '- blocked - '} - {id}
    </Box>
  ) : null;
}

export function NavBar({ user, pathName }) {
  const router = useRouter();

  const { subTitle } = useForestFiltered(navManager, ['subTitle']);
  const showHelp = useCallback(() => {
    messageManager.dialog({
      title: 'How To Create and Edit Frames',
      view: 'help',
      actionPrompt: 'OK',
      cancelPrompt: ''
    })
  }, []);
  const goHome = useCallback(() => {
    router.push('/')
  }, [router])

  const isPlanEditor = useMemo(() => {
    return /plans\/[\w\-]{12,}/.test(pathName);
  }, [pathName])

  return <Flex layerStyle="nav-fame">
    <Menu zIndex={100000}>
      <MenuButton as={Button} leftIcon={<HamburgerIcon boxSize={6}/>} backgroundColor="transparent">
        Menu
      </MenuButton>
      <MenuList>
        <MenuItem onClick={goHome}>Home Page</MenuItem>
        {isPlanEditor ? <MenuItem onClick={showHelp}>Help</MenuItem> : null}
        {isPlanEditor ? <MenuItem onClick={() => messageManager.listFrames('all')}>List Frames</MenuItem> : null}
      </MenuList>
    </Menu>
    <HStack>
      <Image alt="logo" src="/img/logo.svg" width={24} height={24}/>
      <Link href="/"> <Heading size="sm">Planboard</Heading></Link>
      {subTitle ? <Heading fontWeight="normal" size="sm">{subTitle}</Heading> : null}
    </HStack>
    <BlockerWatcher/>
    <UserMenuItem user={user}/>
  </Flex>
}
