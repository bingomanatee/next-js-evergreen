"use client"

import { Spinner, useBoolean } from '@chakra-ui/react'
import NavLayout from '~/components/layouts/NavLayout'
import { NextPageWithLayout } from '~/app/types'
import ManagerContext from '~/lib/managers/ManagerContext'
import { useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import Plans from '~/components/pages/Plans/Plans'
import framesPackage from '~/lib/managers/packages/framesPackage'
import { userManager } from '~/lib/managers/userManager'

const Home: NextPageWithLayout = () => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const [loaded, setLoaded] = useBoolean(false);

  const manager = useContext(ManagerContext);
  useEffect(() => {
    userManager.do.set_user(user);
    userManager.setMeta('router', router, true);
    userManager.setMeta('supabaseClient', supabaseClient, true);
  }, [user, router, supabaseClient])

  useEffect(() => {
    framesPackage().then(() => setLoaded.on())
  }, [])
  return loaded ? <NavLayout><Plans/></NavLayout> : <Spinner size="xl" pad={8}/>
}

export default Home
