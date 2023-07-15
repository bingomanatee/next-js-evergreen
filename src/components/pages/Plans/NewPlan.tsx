import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input
} from '@chakra-ui/react'
import useInputState from '~/lib/useInputState'
import { HORIZ } from '~/constants'
import { useCallback, useMemo } from 'react'
import useForestFiltered from '~/lib/useForestFiltered'
import { Orientation } from '~/types'
import dataManager from '~/lib/managers/dataManager'
import { userManager } from '~/lib/managers/userManager'

export default function NewPlan(props: { orientation: Orientation }) {
  const { orientation } = props;
  const [name, setName, setNameString] = useInputState('', '');
  const boxProps = useMemo(() => orientation === HORIZ ? {
    width: '80em',
    flex: 0,
    minWidth: '33vw'
  } : { width: '100%' }, [orientation])

  const { user } = useForestFiltered(userManager, ['user'])
  console.log('newPlan has user ', user, 'from', userManager);
  const createPlan = useCallback(async () => {
    const { plans } = await dataManager.db();
    plans.newPlan(name, user?.id);
    setNameString('');
  }, [user, name])

  return (
    <Box {...boxProps}>
      <Card variant="form-card">
        <CardHeader>
          <Heading mb={4} textAlign={orientation === HORIZ ? 'center' : 'left'}
                   size={orientation === HORIZ ? 'sm' : 'md'}>Create a new Plan</Heading>
        </CardHeader>
        <CardBody>
          <Flex direction={orientation === HORIZ ? 'row' : 'column'}
                justify="between"
                pad={8}
                align="end"
                gap={4}>
            <FormControl>
              <FormLabel textStyle="formLabel">Name</FormLabel>
              <Input value={name} onChange={setName}/>
            </FormControl>
          </Flex>
        </CardBody>
        <CardFooter>
          <Button variant="submit"
                  onClick={createPlan}
                  disabled={!name}>Create Plan</Button>
        </CardFooter>
      </Card>
    </Box>
  );
}
