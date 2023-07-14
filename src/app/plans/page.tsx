"use client"

import { Spinner, useBoolean } from '@chakra-ui/react'
import NavLayout from '~/components/layouts/NavLayout'
import { NextPageWithLayout } from '~/app/types'
import ManagerContext from '~/lib/managers/ManagerContext'
import { useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import userManager from '~/lib/managers/userManager'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import Plans from '~/components/pages/Plans/Plans'
import framesPackage from '~/lib/managers/packages/framesPackage'

const Home: NextPageWithLayout = () => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const [loaded, setLoaded] = useBoolean(false);

  const manager = useContext(ManagerContext);
  useEffect(() => {
    userManager.do.set_user(user);
    userManager.do.set_router(router);
    userManager.do.set_supabaseClient(supabaseClient);
  }, [user, router, supabaseClient])

  useEffect(() => {
    framesPackage().then(() => setLoaded.on())
  }, [])
  return loaded ? <NavLayout><Plans/></NavLayout> : <Spinner size="xl" pad={8}/>
}

export default Home
