import { v4 } from 'uuid'
import { BehaviorSubject, switchMap } from 'rxjs'
import { ID_PROP, LINK_POINT, sampleId, STYLE } from '~/lib/utils/schemaUtils'

const userStore = {value: {}, observable: {subscribe(ub: any) {}}};

export default function framesSchema(dataManager) {
  return ({
    plans: {
      statics: {
        newPlan(name, userId) {
          // noinspection TypeScriptUnresolvedFunction
          return this.incrementalUpsert({
            id: v4(),
            name,
            createdAt: new Date().toISOString(),
            userId: userId || dataManager.anonUserId
          });
          //@TODO: open new record
        },
        async currentUserPlans$() {
          try {
            const ub = new BehaviorSubject(userStore.value);
            userStore.observable.subscribe(ub);
            return ub.pipe(
              switchMap(({ user }) => {
                const userId = user.id ?? dataManager.anonUserId;
                console.log('looking for user id', userId, 'for user', user);
                return dataManager.db.plans.find()
                  .where('userId').eq(userId).$
              })
            )
          } catch (err) {
            console.log('cup error:', err);
          }
        }
      },
      schema: {
        version: 0,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: {
            type: 'string',
            maxLength: sampleId.length,
          },
          name: {
            type: 'string'
          },
          userId: {
            type: 'string'
          },
          created: {
            type: 'date-time'
          }
        },
        required: ['id', 'name', 'userId']
      },

    },
    frames: {
      schema: {
        version: 0,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: ID_PROP,
          name: {
            type: 'string'
          },
          projectId: {
            type: 'string'
          },
          created: {
            type: 'date-time'
          },
          linkMode: {
            type: 'string',
            default: 'corner or side'
          },
          top: {
            type: 'integer',
          },
          left: {
            type: 'integer',
          },
          width: {
            type: 'integer',
            minimum: 0
          },
          height: {
            type: 'integer',
            minimum: 0
          },
          styles: STYLE
        },
        required: ['id', 'projectId', 'linkMode', 'top', 'left', 'width', 'height']
      },
    },
    links: {
      schema: {
        version: 0,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: ID_PROP,
          name: {
            type: 'string',
          },
          start_frame: ID_PROP,
          end_frame: ID_PROP,
          start_point: LINK_POINT,
          end_point: LINK_POINT,
          style: STYLE,
        },
        required: ['id', 'project_id', 'start_frame', 'end_frame']
      }
    }
  });
}
