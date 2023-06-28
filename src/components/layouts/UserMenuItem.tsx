"use client"
import Link from 'next/link'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Image from 'next/image'
import { HStack, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react'
import { useCallback, useContext } from 'react'
import ManagerContext from '~/lib/managers/ManagerContext'
import Manager from '~/lib/managers/Manager'

export default function UserMenuItem({ user = null }) {
  const manager = useContext<Manager>(ManagerContext);

  const signOut = useCallback(async () => {
    const userManager = await manager.withManager('user');
    userManager.do.signOut();
  }, [manager])

  if (user) {
    return (
      <HStack spacing="4">
        <Menu>
          <MenuButton rightIcon={<ChevronDownIcon />}>
            {user.email}
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
