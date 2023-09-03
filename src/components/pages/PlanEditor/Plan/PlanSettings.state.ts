import { leafI, typedLeaf } from '@wonderlandlabs/forest/lib/types'
import dataManager from '~/lib/managers/dataManager'
import { Plan } from '~/types'
import blockManager from '~/lib/managers/blockManager'

export type PlanSettingsStateValue = Plan;

type leafType = typedLeaf<PlanSettingsStateValue>;

const PlanSettingsState = (props) => {
  //@ts-ignore
  const $value: PlanSettingsStateValue = {
    id: '',
    name: '',
    created: 0,
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
        const stateSettings = state.child('settings')!;
        if (!stateSettings.value.has('grid-size')) {
          stateSettings.set('grid-size', 24);
        }
        if (!stateSettings.value.has('grid-snap')) {
          stateSettings.set('grid-snap', 0);
        }
      },
      save(state: leafType) {
        const stateSettings = state.child('settings')!;
        const { planId } = dataManager.planStream.value;
        if (planId) {
          stateSettings.value.forEach((value, key) => {
            dataManager.do((db) => {
              db.settings.assertSetting(planId, key, value);
            });
          });
        }
        blockManager.do.finish();
      }
    },

    children: {
      settings: {
        $value: new Map(dataManager.planStream.value.settingsMap)
      }
    }
  };
};

export default PlanSettingsState;
