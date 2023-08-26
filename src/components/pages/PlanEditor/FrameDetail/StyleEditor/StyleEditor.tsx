import { useContext, Fragment } from 'react';
import cssStyles from './StyleEditor.module.scss';
import stateFactory from './StyleEditor.state.ts';
import useForest from '~/lib/useForest';
import { Box, Button, Checkbox, HStack, IconButton, Select, Text } from '@chakra-ui/react'
import useForestInput from '~/lib/useForestInput'
import { DeleteIcon } from '@chakra-ui/icons'
import DialogStateCtx from '~/components/Dialogs/DialogStateCtx'
import { StyleItem } from '~/components/pages/PlanEditor/FrameDetail/StyleEditor/StyleItem'
import { FrameStateContext } from '~/components/pages/PlanEditor/FrameDetail/FrameStateContext'
import useForestFiltered from '~/lib/useForestFiltered'

export type StyleEditorProps = { id: string }

export default function StyleEditor(props: StyleEditorProps) {
  const { id } = props;

  const frameDetailState = useContext(FrameStateContext);

  const [value, state] = useForest([stateFactory, props, frameDetailState],
    (localState) => {
       return localState.do.init(frameDetailState);
    });

  const [tagName, setTagName] = useForestInput<HTMLSelectElement>(state, 'tagName')

  if (!id) {
    return;
  }

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
          const localStyle = def.get(id) ?? '';
          return (
            <Fragment key={tag}>
              <span className={cssStyles.id}>
                {tag}
              </span>

              <span className={cssStyles.global}>
                <StyleItem id={tag} scope="global" state={state}/>
              </span>

              <span className={cssStyles.delete}>
                 <IconButton
                   variant="controlIcon" aria-label={'delete'}
                   onClick={() => state.do.delete(tag, 'global')}
                   icon={<DeleteIcon color={globalStyle ? "red.700" : 'blackAlpha.100'}/>}
                 />
              </span>

              <Box
                className={cssStyles.local}
                backgroundColor="cyan.100"
                sx={{ boxEnd: 'end' }}
              >
                <StyleItem
                  id={tag}
                  scope={id}
                  state={state}
                />
              </Box>

              <Box
                className={cssStyles.delete}
                backgroundColor="cyan.100"
              >

                <IconButton
                  variant="controlIcon"
                  aria-label={'delete'}
                  onClick={() => state.do.delete(tag, 'local')}
                  icon={<DeleteIcon color={localStyle ? "red.700" : 'blackAlpha.100'}/>}
                />
              </Box>
            </Fragment>
          )

        })}
      </section>
      <HStack justify="stretch" my={4}>
        <Select value={tagName} onChange={setTagName} size="sm" color="cyan.700" fontWeight={500}>
          <option value=".markdown-frame" label="(container)"/>
          <option value="h1" label="heading 1"/>
          <option value="h2" label="heading 2"/>
          <option value="h3" label="heading 3"/>
          <option value="p" label="paragraph"/>
          <option value="ol" label="ordered list"/>
          <option value="ul" label="unordered list"/>
          <option value="strong" label="bold/strong"/>
          <option value="em" label="italic/emphasis"/>
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
    </section>
  );
}
