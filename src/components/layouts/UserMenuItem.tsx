"use client"
import Link from 'next/link'
import { ChevronDownIcon } from '@chakra-ui/icons'
import Image from 'next/image'
import { HStack, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react'
import { useCallback } from 'react'
import { userManager } from '~/lib/managers/userManager'

export default function UserMenuItem({ user = null }) {

  const signOut = useCallback(async () => {
    userManager.do.signOut()
  }, [])

  if (user) {
    return (
      <HStack spacing="4">
        <Menu zIndex={1}>
          <MenuButton rightIcon={<ChevronDownIcon/>} sx={{height: '100%', margin: 0}}>
            <Text fontSize="xs"> {user.email}</Text>
          </MenuButton>
          <MenuList>
            <MenuItem onClick={signOut}>Sign Out</MenuItem>
          </MenuList>
        </Menu>

        <Image alt="user-logged-in-icon" src="/img/icons/nav-user.svg" width={24} height={24}/>
      </HStack>
    )
    /*<Menu
      dropAlign={{
        top: 'bottom',
        right: 'right'
      }}
      icon={<Img
        src={`/img/icons/nav-user.svg`}/>}
      items={[
        { label: 'Sign Out', onClick: () => {
            globalState.getMeta('supabaseClient')!.auth.signOut();
          }}
      ]}
    />*/
  }
  return <Link href="/login">
    <Image alt="user-not-logged-in-icon" width={24} height={24}
           src="/img/icons/nav-user-inactive.svg"/>
  </Link>
}
