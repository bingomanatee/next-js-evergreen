import { v4 } from 'uuid'

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
