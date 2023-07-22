import { useState, useEffect, useCallback } from 'react';
import cssStyles from './StyleEditor.module.scss';
import stateFactory from './StyleEditor.state.ts';
import useForest from '~/lib/useForest';
import { leafI } from '@wonderlandlabs/forest/lib/types'
import { Button, HStack, IconButton, Select, Text, Box, useBoolean, VStack, Textarea } from '@chakra-ui/react'
import useForestInput from '~/lib/useForestInput'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'

type StyleEditorProps = { id: string }

function StyleItem({ id, scope, state }) {
  const value = state.child(scope)?.get(id);
  const [editContent, setEditContent] = useBoolean(false);

  const updateValue = useCallback((e) => {
    state.child(scope)?.set(id, e.target.value);
  }, [state, id, scope])

  if (editContent) {
    return <VStack spacing={3} align="stretch">
      <Textarea value={value} tetStyle="code" onChange={updateValue} onBlur={setEditContent.off}/>
      <Button size="sm" onClick={setEditContent.off}>Done</Button>
    </VStack>
  }

  return <HStack>
    <IconButton onClick={setEditContent.toggle} aria-label="edit" variant="controlIcon"
                icon={<EditIcon color={value ? 'green.400' : "blackAlpha.300"}/>}/>
    <Text as="span" tetStyle="code" color={value ? 'inherit' : 'blackAlpha.100'} maxHeight="100px"
          overflow="hidden">{value ?? '————'}</Text>
  </HStack>
}

export default function StyleEditor(props: StyleEditorProps) {
  const [value, state] = useForest([stateFactory, props],
    (localState) => {
      localState.do.load();
    });

  const frameId = props.id;
  const [tagName, setTagName] = useForestInput<HTMLSelectElement>(state, 'tagName')
  console.log('-------- inverted styles:', state.$.invert());
  return (
    <section className={cssStyles.container}>
      <section className={cssStyles.grid}>
        <span className={cssStyles.head}>Tag</span>
        <span className={cssStyles['head-centered']}>Global</span>
        <span className={cssStyles['head-blank']}>&nbsp;</span>
        <span className={cssStyles['head-centered']}>Local</span>
        <span className={cssStyles['head-blank']}>&nbsp;</span>

        {state.$.invert().map(([tag, def]) => {
          const globalStyle = def.get('global') ?? '';
          const localStyle = def.get(frameId) ?? '';
          return (
            <>
              <span className={cssStyles.id}>
                {tag}
              </span>


              <span className={cssStyles.global}>
                <StyleItem id={tag} scope="global" state={state}/>
              </span>

              <span className={cssStyles.delete}>
                 <IconButton variant="controlIcon" aria-label={'delete'}
                             icon={<DeleteIcon color={globalStyle ? "red.700" : 'blackAlpha.100'}/>}/>
              </span>

              <Box className={cssStyles.local} backgroundColor="cyan.100" sx={{ boxEnd: 'end' }}>
                <StyleItem id={tag} scope={frameId} state={state}/>
              </Box>

              <Box className={cssStyles.delete} backgroundColor="cyan.100">

                <IconButton variant="controlIcon" aria-label={'delete'}
                            icon={<DeleteIcon color={localStyle ? "red.700" : 'blackAlpha.100'}/>}/>
              </Box>
            </>
          )

        })}
      </section>
      <HStack justify="stretch" my={4}>
        <Select value={tagName} onChange={setTagName} size="sm" color="cyan.700" fontWeight={500}>
          <option value=".frame" label="(container)"/>
          <option value="h1" label="heading 1"/>
          <option value="h2" label="heading 2"/>
          <option value="h3" label="heading 3"/>
          <option value="p" label="paragraph"/>
          <option value="code" label="code (inline)"/>
          <option value="pre > code" label="code (block)"/>
          <option value="*" label="other / style class:"/>
        </Select>
        <Button variant="outline" flexShrink={0} size="sm" onClick={state.do.addGlobalStyle}>Add Global Style</Button>
        <Button colorScheme="cyan" flexShrink={0} size="sm" onClick={state.do.addLocalStyle}>Add Local Style</Button>
      </HStack>
      <HStack justify="center" spacing={6}>
        <Box basis="50%"><Text padding={0} textStyle="info">Global styles apply to <i>all frames</i>. </Text></Box>
        <Box basis="50%"> <Text color="cyan.700" padding={0} textStyle="info">Local styles apply to <b>This
          frame</b> only.</Text></Box>
      </HStack>
      <Button onClick={state.do.save} colorScheme="cyan">Save</Button>
    </section>
  );
}
