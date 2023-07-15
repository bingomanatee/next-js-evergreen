"use client"

import { Spinner, useBoolean } from '@chakra-ui/react'
import NavLayout from '~/components/layouts/NavLayout'
import { NextPageWithLayout } from '~/app/types'
import ManagerContext from '~/lib/managers/ManagerContext'
import { useContext, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import PlanEditor from '~/components/pages/PlanEditor/PlanEditor'
import framesPackage from '~/lib/managers/packages/framesPackage'
import { userManager } from '~/lib/managers/userManager'
import dataManager from '~/lib/managers/dataManager'
import navManager from '~/lib/managers/navManager'

const PlanEditorPage: NextPageWithLayout = (props: { params: { planId: string } }) => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const [loaded, setLoaded] = useBoolean(false);
  const [schemaLoaded, setSchemaLoaded] = useBoolean(false);
  const { planId } = props.params;

  useEffect(() => {
    userManager.do.set_user(user);
    userManager.do.set_router(router);
    userManager.do.set_supabaseClient(supabaseClient);
  }, [user, router, supabaseClient])

  useEffect(() => {
    if (planId) {
      navManager.do.set_subTitle(`plan "${planId}"`)
    }
    if (schemaLoaded) {
      dataManager.initProject(planId)
    } else {
      framesPackage().then(async () => {
        setSchemaLoaded.on();
        await dataManager.initProject(planId)
        setLoaded.on();
      })
    }
  }, [planId, schemaLoaded, setSchemaLoaded])

  return loaded ? <NavLayout user={user}><PlanEditor id={props.params.planId}/></NavLayout> :
    <Spinner size="xl" pad={8}/>
}

export default PlanEditorPage
