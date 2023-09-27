import dayjs from "dayjs";
import {Dateable} from "~/types";

export function toTime(value: any) {
  if (typeof value === 'number') {
    return value;
  }
  const date = dayjs(value);
  if (!date.isValid()) {
    return null;
  }
  return date.toDate().getTime();
}

export function newDateable(record: Partial<Dateable>) {

  if (!record.created) {
    record.created = new Date().toISOString();
  }
  if (!record.updated) {
    record.updated = record.created;
  }
  if (!record.updated_from) {
    record.updated_from = record.updated;
  }
  return record;
}
