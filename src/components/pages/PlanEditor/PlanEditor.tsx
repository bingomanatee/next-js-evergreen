"use client"
import { useState, useEffect, useContext, memo } from 'react';
import styles from './PlanEditor.module.scss';
import stateFactory from './PlanEditor.state.ts';
import useForest from '~/lib/useForest';
/*
import ManagerContext from '~/components/managers/ManagerContext'*/
import EditorView from '~/components/EditorView/EditorView'
import FrameAnchorView from '~/components/pages/PlanEditor/FrameAnchorView/FrameAnchorView'
import FramesView from '~/components/pages/PlanEditor/FramesView/FramesView'
import { GridView } from '~/components/pages/PlanEditor/GridView/GridView'
import { ManagerMap } from '~/lib/managers/types'

type PlanEditorProps = { id: string, managers: ManagerMap }

function PlanEditor(props: PlanEditorProps) {
  const { id } = props;

  const [_value, _state] = useForest([stateFactory, id],
    (localState) => {
      localState.do.load();
    }, 'PLAN EDITOR ');

 // const {} = value;

  return (<div className={styles.container}>
    <EditorView/>
    <FrameAnchorView>
      <FramesView/>
      <GridView/>
    </FrameAnchorView>
  </div>);
}

export default memo(PlanEditor)
