"use client"
import { useContext, useEffect, useMemo, useState } from 'react'
import ManagerContext from '~/lib/managers/ManagerContext'
import Manager from '~/lib/managers/Manager'
import { Box, Flex, Heading, HStack, useBreakpoint, useBreakpointValue, VStack } from '@chakra-ui/react'
import { P } from '~/components/helpers/P'
import { leafI } from '@wonderlandlabs/forest/lib/types'
import useForestFiltered from '~/lib/useForestFiltered'
import NewPlan from '~/components/pages/Plans/NewPlan'
import PlanList from '~/components/pages/Plans/PlanList'
import { HORIZ, VERT } from '~/constants'

function Plans() {
  const manager = useContext<Manager | null>(ManagerContext);

  const orientation = useBreakpointValue({ base: VERT, md: HORIZ },
    { ssr: false, fallback: HORIZ })
  const dataManager = manager?.managerMap.get('data');
  const userManager: leafI = manager?.managerMap.get('user');

  const { user } = useForestFiltered(userManager, 'user');

  const [plans, setPlans] = useState([]);

  useEffect(() => {
    let sub;
    try {
      if (!dataManager?.db?.plans) {
        console.log('no plans');
        return;
      }
      const obs = dataManager.db.plans.currentUserPlans$();
      obs.then((obs$) => {
        console.log('obs$:', obs$);
        obs$.subscribe((plans) => {
          console.log('plans set to ', plans);
          setPlans(plans);
        });
      }).catch(err => {
        console.log('error in obs 2:', err);
      });
    } catch (err) {
      console.log('plan error:', err);
    }

    return () => sub?.unsubscribe();
  }, [dataManager?.db, dataManager?.db.plans]);

  const prompt = useMemo(() => {
    if (plans.length) {
      if (user) {
        return `Choose one of your ${plans.length} plans 
        associated with the user "${user.email}"
         or create a new plan with the Create Plan button`;
      } else {
        return `Choose one of the ${plans.length} plans 
        stored on this browser
         or create a new plan with the Create Plan button`;
      }
    } else {
      if (user) {
        return `There ar no plans 
        associated with the user "${user.email}". 
        Click the Create Plan button below to create a new one`
      } else {
        return `There ar no plans 
        stored on this browser.
        Click the Create Plan button below to create a new one`
      }
    }
  }, [user, plans])

  return (<Box layerStyle="text-document">
    <Heading variant="textTitle">Your Plans</Heading>
    <P>{prompt} - {orientation}</P>

    {orientation === HORIZ ? (<Flex justify="space-between" gap={8}>
      <PlanList plans={plans}/>
      <NewPlan user={user} dataManager={dataManager}
               userManager={userManager}
               orientation={orientation}/>
    </Flex>) : (<VStack align="stretch" gap={8}>
      <PlanList plans={plans} dataManager={dataManager} orientation={orientation | HORIZ}/>
      <NewPlan user={user} dataManager={dataManager}
               userManager={userManager}
               orientation={orientation || HORIZ}/>
    </VStack>)}
  </Box>);
}


export default Plans;
