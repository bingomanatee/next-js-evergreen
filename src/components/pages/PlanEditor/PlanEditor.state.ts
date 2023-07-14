import { typedLeaf } from '@wonderlandlabs/forest/lib/types'
import dataManager from '~/lib/managers/dataManager'

export type PlanEditorStateValue = {};

type leafType = typedLeaf<PlanEditorStateValue>;

const PlanEditorState = (id) => {
  const $value: PlanEditorStateValue = {};
  return {
    name: "PlanEditor",
    $value,

    selectors: {},

    actions: {
      async load() {
        await dataManager.initProject(id);
      }
    }
  };
};

export default PlanEditorState;
