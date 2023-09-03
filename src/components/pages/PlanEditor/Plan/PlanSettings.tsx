import stateFactory from './PlanSettings.state.ts';
import useForest from '~/lib/useForest'
import blockManager from '~/lib/managers/blockManager'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay
} from '@chakra-ui/react'
import DialogButton from '~/components/Dialogs/DialogButton'
import { Setting } from '~/components/pages/PlanEditor/Plan/Setting'
import { ProjectSettings } from '~/types'

type PlanSettingsProps = {}

export default function PlanSettings(props: PlanSettingsProps) {
  const [value, state] = useForest([stateFactory, props],
    (localState) => {
      localState.do.init();
    });

  const {} = value;

  return (
    <Drawer
      isOpen
      autoFocus={false}
      placement='right'
      size={['sm', 'md', 'md']}
      onClose={blockManager.do.finish}
    >
      <DrawerOverlay/>
      <DrawerContent zIndex={1000}>
        <DrawerCloseButton/>
        <DrawerHeader>Project Settings</DrawerHeader>
        <DrawerBody>
          <Setting
            state={state}
            name={ProjectSettings.GRID_SIZE}
            label="Grid Size (px)"
            type="number"
            min={8}
            max={100}
            description="the distance between grid lines"
          />
          <Setting
            state={state}
            name={ProjectSettings.GRID_SNAP}
            label="Snap to grid"
            type="boolean"
            description="Whether to constrain the position of frames to grid"
          />
          <Setting
            state={state}
            name={ProjectSettings.GRID_SHOW}
            label="Show grid"
            type="boolean"
            description="Whether to constrain the position of frames to grid"
          />
        </DrawerBody>
        <DrawerFooter>
          <DialogButton onClick={blockManager.do.finish}>Cancel</DialogButton>
          <DialogButton onClick={state.do.save} colorScheme="blue">Update</DialogButton>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
