"use client"

import { Spinner, useBoolean } from '@chakra-ui/react'
import NavLayout from '~/components/layouts/NavLayout'
import { NextPageWithLayout } from '~/app/types'
import ManagerContext from '~/lib/managers/ManagerContext'
import { useContext, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import userManager from '~/lib/managers/userManager'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import PlanEditor from '~/components/pages/PlanEditor/PlanEditor'
import framesPackage from '~/lib/managers/packages/framesPackage'

const PlanEditorPage: NextPageWithLayout = (props: { params: { planId: string } }) => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const [loaded, setLoaded] = useBoolean(false);

  const manager = useContext(ManagerContext);
  useEffect(() => {
    if (manager && !manager.has('user')) {
      manager.set('user', userManager, {
        type: 'comp', args: [
          user, supabaseClient, router
        ]
      });
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
