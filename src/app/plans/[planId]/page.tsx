"use client"

import { Spinner, useBoolean } from '@chakra-ui/react'
import NavLayout from '~/components/layouts/NavLayout'
import { NextPageWithLayout } from '~/app/types'
import ManagerContext from '~/lib/managers/ManagerContext'
import { useContext, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import userManager from '~/lib/managers/userManager'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import Manager from '~/lib/managers/Manager'
import PlanEditor from '~/components/pages/PlanEditor/PlanEditor'
import framesPackage from '~/lib/managers/packages/framesPackage'

const PlanEditorPage: NextPageWithLayout = (props: { params: { id: string } }) => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const [loaded, setLoaded] = useBoolean(false);

  const manager: Manager | null = useContext(ManagerContext);
  useEffect(() => {
    if (manager && !manager.managerMap.has('user')) {
      manager.addManager('user', userManager, user, supabaseClient, router);
    }
  }, [manager, user])
  useEffect(() => {
      if (manager) {
        framesPackage(manager, 'list').then(() => setLoaded.on())
      }
    },
    [manager, setLoaded])
  return loaded ? <NavLayout user={user}><PlanEditor id={props.params.planId}/></NavLayout> :
    <Spinner size="xl" pad={8}/>
}

export default PlanEditorPage
