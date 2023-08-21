"use client"
import { Box, VStack } from '@chakra-ui/react'
import useForestFiltered from '~/lib/useForestFiltered'
import { userManager } from '~/lib/managers/userManager'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { historyStream } from '~/lib/managers/historyStream'
import { NavBar } from '~/components/layouts/NavBar'

export default function NavLayout({ children }) {
  const { user } = useForestFiltered(userManager, ['user'])
  const pathname = usePathname()
  useEffect(() => {
    historyStream.next(pathname);
  }, [pathname])
  return (
    <VStack w="100%" h="100%" overflow="hidden" align="stretch" as="main">
      <NavBar pathName={pathname} user={user}/>

      <Box flex="1" backgroundColor="blackAlpha.50" overflow="hidden">
        {children}
      </Box>

    </VStack>
  )
}
