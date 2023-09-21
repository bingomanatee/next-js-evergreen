"use client"

import HomePage from '~/components/pages/HomePage'
import NavLayout from '~/components/layouts/NavLayout'
import { NextPageWithLayout } from '~/app/types'
import { useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { userManager } from '~/lib/managers/userManager'

const Home: NextPageWithLayout = () => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter()

  useEffect(() => {
    userManager.do.set_user(user);
    userManager.setMeta('router', router, true);
    userManager.setMeta('supabaseClient', supabaseClient, true);
  }, [user, router, supabaseClient])

  return <NavLayout><HomePage/></NavLayout>
}

export default Home
