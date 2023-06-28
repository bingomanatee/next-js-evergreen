import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import layers from './managers/layers';
import Manager from '~/lib/managers/Manager'
import { ManagerMap } from '~/lib/managers/types'
import { DataManager } from '~/lib/managers/dataManager'

export type PlanEditorStateValue = {};

type leafType = typedLeaf<PlanEditorStateValue>;

const PlanEditorState = ({ id }, managers: ManagerMap) => {
  const $value: PlanEditorStateValue = {};
  const data : DataManager = managers.get('data');
  return {
    name: "PlanEditor",
    $value,

    selectors: {},

    actions: {
      async load(state: leafType) {
        await data.initProject(id);
      }
    }
  };
};

export default PlanEditorState;
