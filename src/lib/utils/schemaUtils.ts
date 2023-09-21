import {v4} from 'uuid'
import {RxDocument} from 'rxdb'
import {userManager} from "~/lib/managers/userManager";
import {type} from "@wonderlandlabs/walrus";
import {TypeEnum} from "@wonderlandlabs/walrus/dist/enums";
import {Dateable} from "~/types";
import {record} from "zod";

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

export function assertCreatedUpdated(oldDoc) {
  if (!oldDoc.created) {
    oldDoc.created = Date.now();
  }
  if (!oldDoc.updated) {
    oldDoc.updated = Date.now();
  }
  return oldDoc;
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
