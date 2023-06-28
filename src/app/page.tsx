"use client"

import HomePage from '~/components/pages/HomePage'
import NavLayout from '~/components/layouts/NavLayout'
import { NextPageWithLayout } from '~/app/types'
import ManagerContext from '~/lib/managers/ManagerContext'
import { useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import userManaager from '~/lib/managers/userManager'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import Manager from '~/lib/managers/Manager'

const Home: NextPageWithLayout = () => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter()

  const manager: Manager | null = useContext(ManagerContext);
  useEffect(() => {
    if (manager && !manager.managerMap.has('user')) {
      manager.addManager('user', userManaager, user, supabaseClient, router);
    }
  }, [manager, user])
  return <NavLayout user={user}><HomePage user={user}/></NavLayout>
}

export default Home
