import {v4} from 'uuid'
import {BehaviorSubject, switchMap} from 'rxjs'
import {
  assertCreatedUpdated,
  assertDeleted, assertUpdatedFrom,
  assertUserId,
  BOOLEAN,
  ID_PROP,
  INT,
  migrationNoOp,
  NUMBER,
  projectIdToPanId,
  projectIdToProject_id,
  STRING,
  STYLE
} from '~/lib/utils/schemaUtils'
import {userManager} from '~/lib/managers/userManager'
import {Dateable, dirToString, LFSummary, MapPoint} from '~/types'
import axios from 'axios';
import {HOUR} from '~/constants'
import dayjs from "dayjs";

export const NO_IMAGE_ERROR = 'no image saved';

function mapSqlData(records: Dateable[]) {

  return mapRecords(records.map((record: Dateable) => {
    const created = dayjs(record.created).toDate().getTime();
    const updated = dayjs(record.updated).toDate().getTime();
    return {
      ...record,
      created,
      updated,
      updated_from: updated
    }
  }))
}

function mapRecords(records: Dateable[]) {
  return records.reduce((map: Map<string, Dateable>, record: Dateable) =>  {
    map.set(record.id, record);
    return map;
  }, new Map());
}

export default function framesSchema(dataManager) {
  return {
    plans: {
      statics: {
        newPlan(name, userId) {
          // noinspection TypeScriptUnresolvedFunction
          return this.incrementalUpsert({
            id: v4(),
            name,
            created: Date.now(),
            user_id: userId || dataManager.anonUserId
          });
          //@TODO: open new record
        },
        async currentUserPlans$() {
          try {
            const ub = new BehaviorSubject(userManager.value);
            userManager.observable.subscribe(ub);
            const db = await dataManager.db();
            return ub.pipe(
                switchMap(({user}) => {
                  const userId = user.id ?? dataManager.anonUserId;
                  return db.plans.find()
                      .where('user_id').eq(userId).$
                })
            )
          } catch (err) {
            console.log('cup error:', err);
          }
        },
        async reconcileFromServer(records, planId) {

        },
      },
      schema: {
        version: 3,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: ID_PROP,
          name: STRING,
          user_id: STRING,
          created: INT,
          updated: INT,
          updated_from: INT,
        },
        required: ['id', 'name', 'user_id', 'created', 'updated', 'updated_from']
      },
      migrationStrategies: {
        1: assertUserId,
        2: assertCreatedUpdated,
        3: assertUpdatedFrom
      }
    },
    settings: {
      migrationStrategies: {
        1: migrationNoOp,
        2: migrationNoOp,
        3: assertUserId,
        4: assertCreatedUpdated,
        5: assertDeleted,
        6: assertUpdatedFrom
      },
      schema: {
        version: 6,
        primaryKey: 'id',
        type: 'object',
        required: ['id', 'name', 'plan_id', 'created', 'updated'],
        properties: {
          id: ID_PROP,
          plan_id: ID_PROP,
          name: STRING,
          user_id: STRING,
          string: STRING,
          number: NUMBER,
          is_number: BOOLEAN,
          created: INT,
          updated: INT,
          is_deleted: BOOLEAN,
          updated_from: INT,
        }
      },
      statics: {
        async reconcileFromServer(records, planId) {
          const localRecords = await this.find().where('plan_id').eq(planId).exec();
          const localMap =  Array.isArray(localRecords) ? mapRecords(localRecords) : new Map();
          const recordUpdates = [];
          mapSqlData(records).forEach((record: Dateable, id) => {
            if (localMap.has(id)) {
              const local = localMap.get(id);
              if (local.updated_from >= record.updated && local.updated > record.updated) {
                /**
                 * There is a local record which was based on the database data
                 * and is more recent than it. Do not overwrite.
                 */
                return;
              }
            }
            recordUpdates.push(record);
          });
          this.bulkInsert(recordUpdates);
        },
        async assertSetting(planId: string, name: string, value:
            string | number, isNumber: boolean = true
        ) {
          const existing = await this.findOne({
            selector: {
              name,
              plan_id: planId
            }
          }).exec();

          if (isNumber) {
            if (existing) {
              existing.incrementalPatch({
                is_number: true,
                string: '',
                number: value
              })
            } else {
              this.incrementalUpsert({
                id: v4(),
                plan_id: planId,
                name,
                is_number: true,
                number: value,
                string: ''
              })
            }
          } else {
            if (existing) {
              existing.incrementalPatch({
                is_number: false,
                number: 0,
                string: value
              })
            } else {
              this.incrementalUpsert({
                id: v4(),
                plan_id: planId,
                name,
                is_number: false,
                number: 0,
                string: value
              })
            }
          }
        }
      }
    },
    frames: {
      schema: {
        version: 11,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: ID_PROP,
          name: STRING,
          user_id: ID_PROP,
          plan_id: STRING,
          created: INT,
          updated: INT,
          updated_from: INT,
          is_deleted: BOOLEAN,
          type: {
            ...STRING,
            defaultValue: 'markdown'
          },
          value: STRING,
          linkMode: {
            ...STRING,
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
        required: ['id', 'plan_id', 'linkMode', 'top', 'left', 'width',
          'order', 'height', 'user_id', 'created', 'updated', 'updated_from']
      },
      migrationStrategies: {
        1: (oldDoc) => {
          console.log('cloning f 1', oldDoc);
          if (!(oldDoc.created && typeof oldDoc.created === 'number')) {
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
            oldDoc.content = {type: 'markdown'}
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
        },
        7: assertUserId,
        8: assertCreatedUpdated,
        9: assertDeleted,
        10: assertUpdatedFrom,
        11: assertUpdatedFrom
      },
      statics: {
        async fetch(id: string) {
          //@ts-ignore
          const map = await this.findByIds([id]).exec();
          return map.get(id);
        },
        async nextFrameOrder(planId): number {
          // returns a number 1 larger than all the current orders of the frames in the given plan.
          try {
            const frames = await this.find()
                .where('plan_id').eq(planId).exec();
            return frames.reduce((max, fr) => {
              return Math.max(max, fr.order);
            }, 0) + 1;
          } catch (err) {
            return 1;
          }
        },
        async reconcileFromServer(records, planId) {
          const localRecords = await this.find().where('plan_id').eq(planId).exec();
          console.log('local frames = ', localRecords, 'for plan_id', planId);

          const localMap =  Array.isArray(localRecords) ? mapRecords(localRecords) : new Map();
          const recordUpdates = [];
          mapSqlData(records).forEach((record: Dateable, id) => {
            if (localMap.has(id)) {
              const local = localMap.get(id);
              if (local.updated_from >= record.updated && local.updated > record.updated) {
                /**
                 * There is a local record which was based on the database data
                 * and is more recent than it. Do not overwrite.
                 */
                return;
              }
            }
            recordUpdates.push(record);
          });
          console.log('record updates are ', recordUpdates, 'from', records);
          const result = await this.bulkInsert(recordUpdates);
          console.log('result of update:', result);
        },
      },
      methods: {}
    },
    links: {
      schema: {
        version: 9,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: ID_PROP,
          name: STRING,
          plan_id: ID_PROP,
          start_frame: ID_PROP,
          end_frame: ID_PROP,
          start_at: STRING,
          end_at: STRING,
          start_label: STRING,
          end_label: STRING,
          label: STRING,
          link_style: STRING,
          line_type: STRING,
          line_color: STRING,
          created: INT,
          updated: INT,
          line_size: INT,
          is_deleted: BOOLEAN,
          updated_from: INT
        },
        required: ['id', 'plan_id', 'start_frame', 'end_frame', 'created', 'updated', 'updated_from'],
      },
      migrationStrategies: {
        1: projectIdToProject_id,
        2: projectIdToPanId,
        3: migrationNoOp,
        4: migrationNoOp,
        5: assertCreatedUpdated,
        6: assertCreatedUpdated,
        7: assertCreatedUpdated,
        8: assertDeleted,
        9: assertUpdatedFrom
      },
      statics: {
        async addLink(params: LFSummary) {
          const planId = dataManager.planId();
          if (!planId) {
            console.log('---- cannot save link - no plan id');
          }
          const newLink = {
            id: v4(),
            plan_id: planId,
            created: params.created || Date.now(),
            updated: Date.now(),
            start_frame: params.id,
            end_frame: params.targetId,
            start_at: dirToString(params.spriteDir),
            end_at: dirToString(params.targetSpriteDir, params.targetMapPoint),
          }

          if (newLink.start_at && newLink.end_at) {
            return this.incrementalUpsert(newLink);
          }
        },
        async unLink(frameOne: string, frameTwo: string) {
          const fromQuery = await this.find({
            selector: {
              start_frame: frameOne,
              end_frame: frameTwo
            }
          }).exec();

          const toQuery = await this.find({
            selector: {
              start_frame: frameTwo,
              end_frame: frameOne
            }
          }).exec();

          const ids = [fromQuery, toQuery].flat()
              .reduce((ids, item) => {
                if (item?.id) {
                  ids.push(item.id);
                }
                return ids;
              }, []);
          return this.bulkRemove(ids);
        },
        async reconcileFromServer(records, planId) {
          const localRecords = await this.find().where('plan_id').eq(planId).exec();
          const localMap =  Array.isArray(localRecords) ? mapRecords(localRecords) : new Map();
          const recordUpdates = [];
          mapSqlData(records).forEach((record: Dateable, id) => {
            if (localMap.has(id)) {
              const local = localMap.get(id);
              if (local.updated_from >= record.updated && local.updated > record.updated) {
                /**
                 * There is a local record which was based on the database data
                 * and is more recent than it. Do not overwrite.
                 */
                return;
              }
            }
            recordUpdates.push(record);
          });
          this.bulkInsert(recordUpdates);
        },
      }
    },
    frame_images: {
      schema: {
        version: 5,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: ID_PROP,
          user_id: ID_PROP,
          frame_id: ID_PROP,
          plan_id: ID_PROP,
          created: INT,
          updated: INT,
          updated_from: INT,
          url: STRING,
          width: INT,
          height: INT,
          error: STRING,
          is_valid: BOOLEAN,
          is_deleted: BOOLEAN
        },
        required: ['id', 'plan_id', 'frame_id', 'user_id', 'created', 'updated', 'updated_from'],

      },
      migrationStrategies: {
        1: migrationNoOp,
        2: assertUserId,
        3: assertCreatedUpdated,
        4: assertDeleted,
        5: assertUpdatedFrom
      },
      statics: {
        async updateImageData(frame_id, plan_id) {
          const {data} = await axios.get('/api/images/' + frame_id);
          let url = data?.url || '';

          let existing = await this.findOne({
            selector: {
              frame_id,
              plan_id
            }
          }).exec();

          if (existing) {
            existing = await existing.incrementalPatch({url});
            return existing?.validate();
          }

          return this.incrementalUpsert({
            id: v4(),
            url,
            plan_id,
            frame_id,
            created: Date.now(),
          })?.validate();
        },

        async fetchImageData(frame_id, plan_id) {
          let frameImage = await this.findOne({
            selector: {
              frame_id,
              plan_id
            }
          }).exec();

          if (frameImage) {
            if (frameImage.time < Date.now() - HOUR) {
              return frameImage;
            } else {
              return this.updateImageData(frame_id, plan_id);
            }
          }

          const {data} = await axios.get('/api/images/' + frame_id);
          let url = data?.url || '';

          if (url) {
            frameImage = await this.incrementalUpsert({
              id: v4(),
              url,
              plan_id,
              frame_id,
              created: Date.now(),
            });
            return await frameImage?.validate();
          } else {
            frameImage = this.incrementalUpsert({
              id: v4(),
              url: '',
              plan_id,
              frame_id,
              created: Date.now(),
              error: NO_IMAGE_ERROR,
              is_valid: false,
            })
          }
          return frameImage;
        },
        async reconcileFromServer(records, planId) {
          const localRecords = await this.find().where('plan_id').eq(planId).exec();
          const localMap =  Array.isArray(localRecords) ? mapRecords(localRecords) : new Map();
          const recordUpdates = [];
          mapSqlData(records).forEach((record: Dateable, id) => {
            if (localMap.has(id)) {
              const local = localMap.get(id);
              if (local.updated_from >= record.updated && local.updated > record.updated) {
                /**
                 * There is a local record which was based on the database data
                 * and is more recent than it. Do not overwrite.
                 */
                return;
              }
            }
            recordUpdates.push(record);
          });
          this.bulkInsert(recordUpdates);
        },
      },
      methods: {
        onImageError(err: string) {
          return this.incrementalModify((doc) => {
            doc.is_valid = false;
            doc.error = err;
            return doc;
          });
        },
        async validate() {

          if (this.error === NO_IMAGE_ERROR) {
            return this;
          }
          if (!this.url) {
            return this.onImageError('no url');
          }

          return new Promise((done, fail) => {
            let img = new Image();
            img.src = this.url;

            img.onload = async () => {
              const update = await this.incrementalModify((doc) => {
                doc.width = img.width;
                doc.height = img.height;
                doc.is_valid = true;
                return doc;
              });

              // @TODO: update frame dimensions
              done(update);
            }
            img.onerror = async (err) => {

              console.log('cannot load image ', this.url);
              const update = await this.onImageError(
                  `${(typeof err === 'string' ? err : err.type) || 'cannot load'}`
              );
              done(update);
            };
          });
        }
      },
    },
    /**
     * represents a single style designation for a tag
     * scoped to either an individual frame or all frames.
     */
    style: {
      schema: {
        version: 5,
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
            ...STRING,
            maxLength: 100
          },
          scope: {
            ...STRING,
            maxLength: 50
          },
          tag: {
            ...STRING,
            maxLength: 50
          },
          style: STRING,
          plan_id: ID_PROP,
          user_id: ID_PROP,
          created: INT,
          updated: INT,
          updated_from: INT,
          is_deleted: BOOLEAN
        },
        required: ['id', 'scope', 'tag', 'style', 'user_id', 'created', 'updated', 'updated_from']
      },
      migrationStrategies: {
        1: (data) => {
          if (!data.plan_id) {
            data.plan_id = '';
          }
          return data;
        },
        2: assertUserId,
        3: assertCreatedUpdated,
        4: assertDeleted,
        5: assertUpdatedFrom
      },
      statics: {
        async reconcileFromServer(records, planId) {
          const localRecords = await this.find().where('plan_id').eq(planId).exec();
          const localMap =  Array.isArray(localRecords) ? mapRecords(localRecords) : new Map();
          const recordUpdates = [];
          mapSqlData(records).forEach((record: Dateable, id) => {
            if (localMap.has(id)) {
              const local = localMap.get(id);
              if (local.updated_from >= record.updated && local.updated > record.updated) {
                /**
                 * There is a local record which was based on the database data
                 * and is more recent than it. Do not overwrite.
                 */
                return;
              }
            }
            recordUpdates.push(record);
          });
          this.bulkInsert(recordUpdates);
        },
      }
    },

    map_points: {
      schema: {
        version: 4,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: ID_PROP,
          plan_id: ID_PROP,
          user_id: ID_PROP,
          frame_id: ID_PROP,
          lat: NUMBER,
          lng: NUMBER,
          label: STRING,
          x: NUMBER,
          y: NUMBER,
          created: INT,
          updated: INT,
          updated_from: INT,
          is_deleted: BOOLEAN
        },
        required: ['id', 'frame_id', 'lat', 'lng', 'plan_id', 'user_id', 'created', 'updated', 'updated_from'],
      },
      migrationStrategies: {
        1: (data) => {
          if (!data.plan_id) {
            data.plan_id = '';
          }
          return data;
        },
        2: assertUserId,
        3: assertCreatedUpdated,
        4: assertUpdatedFrom
      },
      statics: {
        async fetch(id: string) {
          //@ts-ignore
          const map = await this.findByIds([id]).exec();
          return map.get(id);
        },
        async forFrame(frame_id: string) {
          return this.find()
              .where('frame_id').eq(frame_id)
        },
        async reconcileFromServer(records, planId) {
          const localRecords = await this.find().where('plan_id').eq(planId).exec();
          const localMap =  Array.isArray(localRecords) ? mapRecords(localRecords) : new Map();
          const recordUpdates = [];
          const remoteMap = mapSqlData(records);

          remoteMap.forEach((record: Dateable, id) => {
            console.log('sql frame is ', record);
            if (localMap.has(id)) {
              const local = localMap.get(id);
              if (local.updated_from >= record.updated && local.updated > record.updated) {
                /**
                 * There is a local record which was based on the database data
                 * and is more recent than it. Do not overwrite.
                 */
                return;
              }
            }
            recordUpdates.push(record);
          });
          console.log('bulk inserting ', recordUpdates, 'frames');
          this.bulkInsert(recordUpdates);
        },
        async updatePoints(frame_id: string, points: MapPoint[], exclusive = false) {

          if (exclusive) {
            const ids = new Set(
                points.map((p) => p.id)
            );


            const query = await this.forFrame(frame_id);
            let existing = await query.exec();

            const deleteIds = existing
                .map((point: MapPoint) => point.id
                )
                .filter((pointId) => {
                  if (!(ids.has(pointId))) {
                    return true;
                  } else {
                    return false;
                  }
                });

            await this.bulkRemove(deleteIds);
          }

          return this.bulkUpsert(points.map((pointData) => ({
            ...pointData, frame_id
          })));
        }
      }
    }
  };
}
