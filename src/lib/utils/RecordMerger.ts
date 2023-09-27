import {Dateable, DateableSQL} from "~/types";
import {dateless} from "~/lib/utils/schemaUtils";
import {isEqual} from "lodash";
import {toTime} from "~/lib/utils/toTime";
import {string} from "zod";
import {ErrorPlus} from "~/lib/ErrorPlus";

const PairStatus = {
  SAME: 'same',
  DB_IS_NEWER: 'newer on db',
  LOCAL_IS_NEWER: 'newer local',
  NO_VALUE: 'no value'
}
type PairStatusKeys = keyof typeof PairStatus;
export type PairStatusType = typeof PairStatus[PairStatusKeys]

type MergeResult = {
  db_records: DateableSQL[],
  local_records: Dateable[];
  new_db: DateableSQL[],
  new_local: Dateable[]
}

class RecordPair {
  constructor(public id: string, private merger: RecordMerger) {
  }

  get newOnDb() {
    return this.dbRecord && !this.localRecord;
  }

  get newLocal() {
    return this.localRecord && !this.dbRecord;
  }


  public localRecord?: Dateable
  public dbRecord?: DateableSQL

  private summary(record?: Dateable | DateableSQL, note?: string) {
    if (!record) {
      return this.id + '--absent'
    }
    return `${record.id} updated ${record.updated} ${
        'updated_from' in record ? ` updated_from: ${record.updated_from}` : ''} ${
        'name' in record ? record.name : ''} ${note ?? ''}`
  }

  get status(): PairStatusType {
    if (this.merger.debug) {
      console.log(`======== RecordPair  comparing  ${this.id}
           ${this.summary(this.localRecord, '(local)')}
           ${this.summary(this.dbRecord, '(db)')}`);
    }

    if (!this.localRecord) {
      if (this.dbRecord) {
        if (this.merger.debug) {
          console.log('-------- only has db record: DB_IS_NEWER');
        }
        return PairStatus.DB_IS_NEWER
      }
      if (this.merger.debug) {
        console.log('-------- no records: NO_VALUE');
      }
      return PairStatus.NO_VALUE
    }

    if (!this.dbRecord) {
      if (this.merger.debug) {
        console.log('-------- only has local: LOCAL_IS_NEWER');
      }
      return PairStatus.LOCAL_IS_NEWER
    }

    // once a record has been deleted on the server do not accept any more updates

    if (this.dbRecord.is_deleted) {
      if (this.merger.debug) {
        console.log('-------- db is deleted: LOCAL_IS_NEWER');
      }
      return PairStatus.DB_IS_NEWER;
    }

    // the db has recorded an update from the record that the local "checked out" -
    // the db update is considered more valid

    if (this.localUpdatedFrom < this.dbUpdated) {
      if (this.merger.debug) {
        console.log(`-------- db has more recent updated date: (${this.localUpdatedFrom} < ${this.dbUpdated}): DB_IS_NEWER`);
      }
      return PairStatus.DB_IS_NEWER;
    }

    // at this point the local is based on the record on the database

    if (isEqual(dateless(this.localRecord), dateless(this.dbRecord))) {
      // there have not been any local changes to the data in the database
      if (this.merger.debug) {
        console.log(`-------- data in database identical to that in local value: SAME`);
      }
      return PairStatus.SAME
    }

    if (this.merger.debug) {
      console.log('------- LOCAL IS NEWER')
    }
    return PairStatus.LOCAL_IS_NEWER;
  }

  get localUpdatedFrom() {
    return this.localRecord?.updated_from ? toTime(this.localRecord.updated_from) : 0;
  }

  get dbUpdated() {
    return this.dbRecord?.updated ? toTime(this.dbRecord.updated) : 0;
  }
}

export type MergeConstraint = {
  plan_id?: string,
  user_id?: string,
}

export class RecordMerger {

  constructor(localRecords: Dateable[],
              dbRecords: DateableSQL[],
              private constraint?: MergeConstraint, public debug?: boolean) {
    if (!(localRecords && dbRecords)) {
      console.error('bad input to RecordsMerger');
      throw new ErrorPlus('bad input to LocalRecords', {localRecords, dbRecords})
    }


    localRecords.forEach(record => this.adLocalRecord(record));
    dbRecords.forEach(record => this.addDbRecord(record));
  }

  private pairMap: Map<string, RecordPair> = new Map();

  pair(id: string) {
    if (!this.pairMap.has(id)) {
      const pair = new RecordPair(id, this);
      this.pairMap.set(id, pair);
      return pair;
    }
    return this.pairMap.get(id)
  }

  private isValid(record: Dateable | DateableSQL) {
    if (this.constraint?.plan_id) {
      if (record.plan_id !== this.constraint.plan_id) {
        return false;
      }
    }
    if (this.constraint?.user_id) {
      if (record.user_id !== this.constraint.user_id) {
        return false;
      }
    }

    return true;
  }

  private addDbRecord(record: Dateable) {
    if (this.isValid(record)) {
      this.pair(record.id).dbRecord = record;
    }
  }

  private adLocalRecord(record: DateableSQL) {
    if (this.isValid(record)) {
      this.pair(record.id).localRecord = record;
    }
  }

  merge(): MergeResult {
    const db_records = []
    const local_records = [];
    const new_local = [];
    const new_db = [];

    this.pairMap.forEach((pair) => {
          switch (pair.status) {
            case PairStatus.LOCAL_IS_NEWER:
              local_records.push(pair.localRecord);
              break;

            case PairStatus.DB_IS_NEWER:
              db_records.push(pair.dbRecord);
              break;

            case PairStatus.SAME:
              break;

            case PairStatus.NO_VALUE:
              break;

            default:
          }

          if (pair.newOnDb) {
            new_db.push(pair.dbRecord);
          }
          if (pair.newLocal) {
            new_local.push(pair.localRecord);
          }
        }
    );

    return {db_records, local_records, new_db, new_local};
  }

}
