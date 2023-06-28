"use client"
import {
  AlertDialog, AlertDialogBody,
  AlertDialogContent, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box, Button, Code,
  Text,
  useDisclosure,
  VStack
} from '@chakra-ui/react'
import PlanListItem from '~/components/pages/Plans/PlanListItem'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Orientation } from '~/types'
import { RxDocument } from 'rxdb'
import { DataManager } from '~/lib/managers/dataManager'

export default function PlanList({ plans, dataManager, orientation }:
                                   { plans: RxDocument[], dataManager: DataManager, orientation: Orientation }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef(null);

  const [toDelete, setToDelete] = useState(null);

  const deleteTarget = useMemo(() => {
    return plans.find((p) => p.get('id') === toDelete)
  }, [toDelete, plans])

  const doDelete = useCallback((id) => {
    setToDelete(id);
    onOpen();
  }, [setToDelete, onOpen])

  const commitDelete = useCallback(() => {
    deleteTarget?.remove();
    onClose();
  }, [toDelete])

  if (!plans.length) {
    return <Box pad={12} textAlign="center" width="100%" flex={1}>
      <Text size="lg">No Plans found</Text>
    </Box>
  }
  return (<>
      <VStack w="100%">
        {plans.map((plan) => (
          <PlanListItem {...plan.toJSON()} onDelete={doDelete} orientation={orientation} key={plan.get('id')}/>))}
      </VStack>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent w="800px" maxWidth="100%">
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete Project
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you you want to delete Plan {deleteTarget?.get('name') ? `"${deleteTarget.get('name')}"` : ''}
              <Code>{toDelete}</Code>?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme='red' onClick={commitDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
