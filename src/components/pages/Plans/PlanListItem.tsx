import { memo, useCallback } from 'react'
import { VERT } from '~/constants'
import { Button, Card, CardBody, CardFooter, CardHeader, Flex, Heading, HStack } from '@chakra-ui/react'
import OpenIcon from '~/components/icons/OpenIcon'
import DeleteIcon from '~/components/icons/DeleteIcon'
import { Orientation } from '~/types'
import { useRouter } from 'next/navigation'
import { string } from 'zod'

function PlanListItem({ id, name, orientation, onDelete }: {
  id: string,
  name: string,
  createdAt: any,
  userId: string,
  orientation: Orientation,
  onDelete: (id: string) => void
}) {
  const router = useRouter();
  const doDelete = useCallback(() => {
    onDelete(id);
  }, [onDelete, id]);

  const deleteBtn = <Button variant="delete" iconSpacing={[12, 18]} onClick={doDelete}
                            leftIcon={<DeleteIcon/>}>Delete</Button>;
  const openBtn = <Button variant="nav" iconSpacing={[12, 18]} onClick={() => router.push('/plans/' + id)}
                          rightIcon={<OpenIcon/>}>Open</Button>;
  const heading = (<Heading size="small" fontWeight="600">
    {name ? <>&quot;{name}&quot;</> : `(${id})`}</Heading>);


  return (orientation === VERT) ? (
    <Card variant="list-item">
      <CardHeader>
        <HStack gap={4}>
          {heading}
        </HStack>
      </CardHeader>
      <CardFooter>
        {deleteBtn}
        {openBtn}
      </CardFooter>
    </Card>
  ) : (
    <Card variant="list-item">
      <CardBody>
        <Flex justify="space-between" w="100%">
          <HStack gap={4}>
            {heading}
          </HStack>
          <HStack>
            {deleteBtn}
            {openBtn}
          </HStack>
        </Flex>
      </CardBody>
    </Card>
  );
}

export default PlanListItem
