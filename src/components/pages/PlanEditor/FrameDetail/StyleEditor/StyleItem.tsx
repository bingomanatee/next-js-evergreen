import { Button, HStack, IconButton, Text, Textarea, useBoolean, VStack } from '@chakra-ui/react'
import { useCallback } from 'react'
import { EditIcon } from '@chakra-ui/icons'

export function StyleItem({ id, scope, state }) {
  const value = state.child(scope)?.get(id);
  const [editContent, setEditContent] = useBoolean(false);


  const updateValue = useCallback((e) => {
    state.child(scope)?.set(id, e.target.value);
  }, [state, id, scope])

  if (editContent) {
    return <VStack spacing={3} align="stretch">
      <Textarea value={value} textStyle="code" onChange={updateValue} onBlur={setEditContent.off}/>
      <Button size="sm" onClick={setEditContent.off}>Done</Button>
    </VStack>
  }

  return <HStack>
    <IconButton
      onClick={setEditContent.toggle}
      aria-label="edit"
      variant="controlIcon"
      icon={<EditIcon color={value ? 'green.400' : "blackAlpha.300"}/>}
    />
    <Text
      as="span"
      textStyle="code"
      color={value ? 'inherit' : 'blackAlpha.100'}
      maxHeight="100px"
      overflow="hidden"
    >
      {value ?? '——'}
    </Text>
  </HStack>
}
