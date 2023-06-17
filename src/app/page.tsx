"use client"

import HomePage from '~/components/pages/HomePage'
import NavLayout from '~/components/layouts/NavLayout'
import { NextPageWithLayout } from '~/app/types'
import ManagerContext from '~/components/managers/ManagerContext'
import { useContext } from 'react'
import { useRouter } from 'next/navigation'
import UserManager from '~/components/managers/UserManager'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import Manager from '~/components/managers/Manager'

const Home: NextPageWithLayout = () => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter()

  const manager: Manager = useContext(ManagerContext);
  console.log('home pag user = ', user);
  manager.addManager('user', UserManager(user, supabaseClient, router));
  return <NavLayout user={user}><HomePage user={user}/></NavLayout>
}

export default Home
