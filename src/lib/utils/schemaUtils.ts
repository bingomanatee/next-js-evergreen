import { v4 } from 'uuid'
import { RxDocument } from 'rxdb'

export const sampleId = v4();
export const ID_PROP = {
  type: 'string',
  maxLength: sampleId.length,
};
export const INT = {
  type: 'integer',
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
