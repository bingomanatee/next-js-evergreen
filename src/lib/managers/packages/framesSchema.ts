import { v4 } from 'uuid'
import { BehaviorSubject, switchMap } from 'rxjs'
import { ID_PROP, LINK_POINT, sampleId, STYLE } from '~/lib/utils/schemaUtils'
import { userManager } from '~/lib/managers/userManager'

function projectIdToPanId(oldDoc) {
  if ('project_id' in oldDoc) {
    oldDoc.plan_id = oldDoc.project_id;
    delete oldDoc.project_id;
  }
  return oldDoc;
}

function projectIdToProject_id(oldDoc) {
  if (!('project_id' in oldDoc)) {
    oldDoc.projectId = v4();
    delete oldDoc.project_id;
  }
  return oldDoc;
}

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
                  .where('user_id').eq(userId).$
              })
            )
          } catch (err) {
            console.log('cup error:', err);
          }
        }
      },
      schema: {
        version: 1,
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
          user_id: {
            type: 'string'
          },
          created: {
            type: 'integer'
          }
        },
        required: ['id', 'name', 'user_id']
      },
      migrationStrategies: {
        1: (oldDoc) => {
          console.log('cloning pl 1', oldDoc);
          if ('userId' in oldDoc) {
            oldDoc.user_id = oldDoc.userId;
            delete oldDoc.userId;
          }
          return oldDoc;
        },
      }
    },
    frames: {
      schema: {
        version: 6,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: ID_PROP,
          name: {
            type: 'string'
          },
          plan_id: {
            type: 'string'
          },
          created: {
            type: 'integer'
          },
          type: {
            type: 'string',
            defaultValue: 'markdown'
          },
          value: {
            type: 'string'
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
        required: ['id', 'plan_id', 'linkMode', 'top', 'left', 'width', 'order', 'height']
      },
      migrationStrategies: {
        1: (oldDoc) => {
          console.log('cloning f 1', oldDoc);
          if (!(oldDoc.created && (typeof oldDoc.created === 'number'))) {
            oldDoc.created = Date.now();
          }
          return oldDoc;
        },
        2: projectIdToProject_id,
        3: (oldDoc) => {
          return oldDoc;
        },
        4: projectIdToPanId,
        5: (oldDoc) => {
          if (!oldDoc.content) {
            oldDoc.content = { type: 'markdown' }
          }
          if (!oldDoc.content.type) {
            oldDoc.content.type = 'markdown'
          }
          return oldDoc;
        },
        6: (oldDoc) => {
          if (oldDoc.content?.type) {
            oldDoc.type = oldDoc.content.type;
          }
          if (oldDoc.content?.markdown) {
            oldDoc.value = oldDoc.content.markdown;
          }
          if (!oldDoc.type) {
            oldDoc.type = 'markdown';
          }
          delete oldDoc.content;
          return oldDoc;
        }
      },
      statics: {
        async fetch(id: string) {
          //@ts-ignore
          const map = await this.findByIds([id]).exec();
          return map.get(id);
        }
      }
    },
    links: {
      schema: {
        version: 2,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: ID_PROP,
          name: {
            type: 'string',
          },
          plan_id: ID_PROP,
          start_frame: ID_PROP,
          end_frame: ID_PROP,
          start_point: LINK_POINT,
          end_point: LINK_POINT,
          style: STYLE,
        },
        required: ['id', 'plan_id', 'start_frame', 'end_frame'],

      },
      migrationStrategies: {
        1: projectIdToProject_id,
        2: projectIdToPanId
      }
    },
    /**
     * represents a single style designation for a tag
     * scoped to either an individual frame or all frames.
     */
    style: {
      schema: {
        version: 0,
        primaryKey: {
          // where should the composed string be stored
          key: 'id',
          // fields that will be used to create the composed key
          fields: [
            'scope',
            'tag'
          ],
          // separator which is used to concat the fields values.
          separator: '|'
        },
        properties: {
          id: {
            type: 'string',
            maxLength: 100
          },
          scope: {
            type: 'string',
            maxLength: 50
          },
          tag: {
            type: 'string',
            maxLength: 50
          },
          style: {
            type: 'string'
          }
        },
        required: ['id', 'scope', 'tag', 'style']
      }
    }
  });
}
