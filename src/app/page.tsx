"use client"

import HomePage from '~/components/pages/HomePage'
import NavLayout from '~/components/layouts/NavLayout'
import { NextPageWithLayout } from '~/app/types'
import ManagerContext from '~/lib/managers/ManagerContext'
import { useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { CanDI } from '@wonderlandlabs/can-di-land'
import { userManager } from '~/lib/managers/userManager'

const Home: NextPageWithLayout = () => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter()

  useEffect(() => {
  userManager.do.set_user(user);
  userManager.do.set_router(router);
  userManager.do.set_supabaseClient(supabaseClient);
  }, [user, router, supabaseClient])

  return <NavLayout><HomePage /></NavLayout>
}

export default Home
