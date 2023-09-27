import {v4} from 'uuid'
import {BehaviorSubject, switchMap} from 'rxjs'
import {
  asJson,
  assertCreatedUpdated,
  assertDeleted,
  assertStringDates,
  assertUpdatedFrom,
  assertUserId,
  BOOLEAN,
  ID_PROP,
  INT,
  mapRecords,
  migrationNoOp,
  NUMBER,
  projectIdToPanId,
  projectIdToProject_id,
  STRING,
  STYLE
} from '~/lib/utils/schemaUtils'
import {userManager} from '~/lib/managers/userManager'
import {Dateable, DateableSQL, dirToString, LFSummary, MapPoint} from '~/types'
import axios from 'axios';
import {HOUR} from '~/constants'
import {assertNoop} from "@babel/types";
import {newDateable} from "~/lib/utils/toTime";
import {RxCollection} from "rxdb";
import {RecordMerger} from "~/lib/utils/RecordMerger";

export const NO_IMAGE_ERROR = 'no image saved';

async function mergeServerRecords(collection: RxCollection, serverRecords: DateableSQL[], plan_id?: string) {
  let records = await collection.find().where('plan_id').eq(plan_id).exec();
  const merger = new RecordMerger(asJson(records) as Dateable[], serverRecords, plan_id ? {plan_id} : {});
  const mergeResult = merger.merge();
  const {new_db, db_records, local_records} = mergeResult;
/*  if (collection.name === 'links') {
    console.log('---- links records for ', plan_id, records,'merge result:',  mergeResult);
  }*/
  if (new_db.length) {
    await collection.bulkInsert(new_db);
    const newRecordMap = mapRecords(new_db);
    const updates = db_records.filter((dbRecord) => !newRecordMap.has(dbRecord.id))
    for (const data of updates) {
      collection.incrementalUpsert(data);
    }
  }
  if (local_records.length) {
    axios.patch('/api/' + collection.name, {records: local_records, plan_id});
  }
}

export default function plansSchema(dataManager) {
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
        async syncWithServer(records, planId) {

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
        async syncWithServer(serverRecords: DateableSQL[]) {
          return mergeServerRecords(this as RxCollection, serverRecords);
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
        version: 10,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: ID_PROP,
          name: STRING,
          user_id: ID_PROP,
          plan_id: STRING,
          created: STRING,
          updated: STRING,
          updated_from: STRING,
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
        1: assertCreatedUpdated,
        2: projectIdToProject_id,
        3: migrationNoOp,
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
        6: assertNoop,
        7: assertUserId,
        8: assertCreatedUpdated,
        9: assertDeleted,
        10: assertStringDates,
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
        async syncWithServer(serverRecords: Dateable[], planId: string) {
          return mergeServerRecords(this as RxCollection, serverRecords, planId);
        },
      },
      methods: {}
    },
    links: {
      schema: {
        version: 12,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: ID_PROP,
          name: STRING,
          plan_id: ID_PROP,
          user_id: ID_PROP,
          updated_from: STRING,
          is_deleted: BOOLEAN,
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
          created: STRING,
          updated: STRING,
          line_size: INT,
        },
        required: ['id', 'plan_id', 'user_id', 'start_frame', 'end_frame', 'created', 'updated', 'updated_from'],
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
        9: assertUpdatedFrom,
        10: assertUserId,
        11: assertCreatedUpdated,
        12: assertCreatedUpdated,
      },
      statics: {
        async addLink(params: LFSummary) {
          const planId = dataManager.planId();
          const userId = userManager.$.currentUserId();
          if (!(planId && userId)) {
            console.error('---- cannot save link - no plan id/userid', planId, userId);
          }
          const now = new Date().toISOString();

          const newLink = {
            id: v4(),
            plan_id: planId,
            user_id: userId,
            created: now,
            updated: now,
            updated_from: now,
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
        async syncWithServer(serverRecords: DateableSQL[], planId: string) {
          return mergeServerRecords(this as RxCollection, serverRecords, planId);
        },
      }
    },
    frame_images: {
      schema: {
        version: 6,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: ID_PROP,
          user_id: ID_PROP,
          frame_id: ID_PROP,
          plan_id: ID_PROP,
          created: STRING,
          updated: STRING,
          updated_from: STRING,
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
        5: assertUpdatedFrom,
        6: assertStringDates,
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
          const userId = userManager.$.currentUserId();
          if (url) {
            frameImage = await this.incrementalUpsert(newDateable({
              id: v4(),
              url,
              plan_id,
              user_id: userId,
              frame_id,
            }));
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
        async syncWithServer(serverRecords: DateableSQL[], planId: string) {
          return mergeServerRecords(this as RxCollection, serverRecords, planId);
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
        async syncWithServer(serverRecords: DateableSQL[], planId: string) {
          await mergeServerRecords(this as RxCollection, serverRecords, planId);
        },
      }
    },

    map_points: {
      schema: {
        version: 5,
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
          created: STRING,
          updated: STRING,
          updated_from: STRING,
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
        4: assertUpdatedFrom,
        5: assertCreatedUpdated,
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
        async syncWithServer(serverRecords: DateableSQL[], planId: string) {
          return mergeServerRecords(this as RxCollection, serverRecords, planId);
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

            //@TODO: change to server friendly -- also use is_deleted
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
