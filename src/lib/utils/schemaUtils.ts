import {v4} from 'uuid'
import {RxDocument} from 'rxdb'
import {userManager} from "~/lib/managers/userManager";
import {type} from "@wonderlandlabs/walrus";
import {TypeEnum} from "@wonderlandlabs/walrus/dist/enums";
import {Dateable, DateableSQL, StringId} from "~/types";
import dayjs from "dayjs";

export const sampleId = v4();
export const ID_PROP = {
  type: 'string',
  maxLength: sampleId.length,
};
export const INT = {
  type: 'integer',
}
export const NUMBER = {
  type: 'number',
}
export const BOOLEAN = {
  type: 'boolean',
  defaultValue: false
}
export const STRING = {
  type: 'string'
}
export const LINK_POINT = {
  type: 'object',
  properties: {
    x: INT,
    y: INT,
    basis: STRING
  },
  required: ['basis']
};

export const STYLE = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      value: {
        type: ['number', 'string']
      }
    }
  }
}

export function asJson(items: RxDocument[]) {
  if (!Array.isArray(items)) {
    return [];
  }
  return items.map((doc) => {
    try {
      return doc.toJSON();
    } catch (err) {
      return null;
    }
  }).filter((a) => !!a);
}

export function projectIdToPanId(oldDoc) {
  if ('project_id' in oldDoc) {
    oldDoc.plan_id = oldDoc.project_id;
    delete oldDoc.project_id;
  }
  return oldDoc;
}

export function projectIdToProject_id(oldDoc) {
  if (!('project_id' in oldDoc)) {
    oldDoc.projectId = v4();
    delete oldDoc.project_id;
  }
  return oldDoc;
}

export function migrationNoOp(oldDoc) {
  return oldDoc
}

export function assertCreatedUpdated(oldDoc) { // dates used to be stored as numbers
  if (!oldDoc.created || typeof oldDoc.created === 'number') {
    oldDoc.created = Date.now();
  }
  if (!oldDoc.updated || typeof oldDoc.updated === 'number') {
    oldDoc.updated = oldDoc.created
  }
  if (!oldDoc.updated_from || typeof oldDoc.updated_from === 'number') {
    oldDoc.updated_from = oldDoc.created
  }
  return oldDoc;
}

function toDateString(value) { // now they are stored as ISO strings.
  switch (typeof value) {
    case 'string':
      const d = dayjs(value);
      if (d.isValid){
        return d.toISOString();
      }
      return new Date().toISOString();
      break;

    case 'number':
      return new Date(value).toISOString();
      break;

    default:
      return new Date().toISOString();
  }
}

export function assertStringDates(oldDoc) {
  oldDoc.created = toDateString(oldDoc.created);
  oldDoc.updated = toDateString(oldDoc.updated);
  oldDoc.updated_from = toDateString(oldDoc.updated_from);
}

export function assertUpdatedFrom(oldDoc) {
  if (!oldDoc.updated_from) {
    oldDoc.updated_from = oldDoc.updated
  }
  return oldDoc;
}

export function assertDeleted(oldDoc) {
  if (type.describe(oldDoc.is_deleted, true) !== TypeEnum.boolean) {
    oldDoc.is_deleted = false;
  }
  return oldDoc;
}

export function assertUserId(oldDoc) {
  if (!oldDoc.user_id) {
    oldDoc.user_id = userManager.$.currentUserId() || '';
  }
  return oldDoc;
}

export function dateless(record: Partial<Dateable>) {
  const withoutDates = {...record};
  delete withoutDates.updated;
  delete withoutDates.updated_from;
  return withoutDates;
}

export function mapRecords(records: StringId []) {
  return records.reduce((map: Map<string, StringId>, record: StringId) => {
    map.set(record.id, record);
    return map;
  }, new Map());
}
