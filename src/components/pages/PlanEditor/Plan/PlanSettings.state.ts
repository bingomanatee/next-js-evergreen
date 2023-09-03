import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import dataManager from '~/lib/managers/dataManager'
import { Plan } from '~/types'

export type PlanSettingsStateValue = Plan;

type leafType = typedLeaf<PlanSettingsStateValue>;

const PlanSettingsState = (props) => {
  //@ts-ignore
  const $value: PlanSettingsStateValue = {
    id: '',
    name: '',
    created: number,
    ...dataManager.planStream.value.plan
  }

  return {
    name: "PlanSettings",
    $value,

    selectors: {
      alpha(state: leafType) {
      }
    },

    actions: {
      init(state: leafType) {
      }
    }
  };
};

export default PlanSettingsState;
