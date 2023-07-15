import { v4 } from 'uuid'
import { BehaviorSubject, switchMap } from 'rxjs'
import { ID_PROP, LINK_POINT, sampleId, STYLE } from '~/lib/utils/schemaUtils'
import { userManager } from '~/lib/managers/userManager'

export default function framesSchema(dataManager) {
  return ({
    plans: {
      statics: {
        newPlan(name, userId) {
          // noinspection TypeScriptUnresolvedFunction
          return this.incrementalUpsert({
            id: v4(),
            name,
            created: Date.now(),
            userId: userId || dataManager.anonUserId
          });
          //@TODO: open new record
        },
        async currentUserPlans$() {
          try {
            const ub = new BehaviorSubject(userManager.value);
            userManager.observable.subscribe(ub);
            const db = await dataManager.db();
            return ub.pipe(
              switchMap(({ user }) => {
                const userId = user.id ?? dataManager.anonUserId;
                console.log('looking for user id', userId, 'for user', user);
                return db.plans.find()
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
            type: 'integer'
          }
        },
        required: ['id', 'name', 'userId']
      },

    },
    frames: {
      schema: {
        version: 3,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: ID_PROP,
          name: {
            type: 'string'
          },
          project_id: {
            type: 'string'
          },
          created: {
            type: 'integer'
          },
          linkMode: {
            type: 'string',
            default: 'corner or side'
          },
          order: {
            type: 'integer',
            min: 0
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
        required: ['id', 'project_id', 'linkMode', 'top', 'left', 'width', 'order', 'height']
      },
      migrationStrategies: {
        1: (oldDoc) => {
          console.log('cloning f 1', oldDoc);
          if (!(oldDoc.created && (typeof oldDoc.created === 'number'))) {
            oldDoc.created = Date.now();
          }
          return oldDoc;
        },
        2: (oldDoc) => {
          console.log('cloning  f 2', oldDoc);
          if (oldDoc.projectId) {
            oldDoc.project_id = oldDoc.projectId;
            delete oldDoc.projectId;
          }
          return oldDoc;
        },
        3: (oldDoc) => {
          return oldDoc;
        }
      }
    },
    links: {
      schema: {
        version: 1,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: ID_PROP,
          name: {
            type: 'string',
          },
          project_id: ID_PROP,
          start_frame: ID_PROP,
          end_frame: ID_PROP,
          start_point: LINK_POINT,
          end_point: LINK_POINT,
          style: STYLE,
        },
        required: ['id', 'project_id', 'start_frame', 'end_frame'],

      },
      migrationStrategies: {
        1: (oldDoc) => {
          console.log('cloning l 1', oldDoc);
          if (!('project_id' in oldDoc)) {
            oldDoc.projectId = v4();
            delete oldDoc.project_id;
          }
          return oldDoc;
        }
      }
    }
  });
}
