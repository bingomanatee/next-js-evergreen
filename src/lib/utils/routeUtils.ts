import {Dateable, DateableSQL, isDateable} from "~/types";
import {createServerActionClient} from "@supabase/auth-helpers-nextjs";
import {supabaseClient} from "~/app/supabaseClient";
import {toTime} from "~/lib/utils/toTime";
import {MergeConstraint} from "~/lib/utils/RecordMerger";
import {ErrorPlus} from "~/lib/ErrorPlus";

type User = { id: string }

export async function getUser(cookies, throwIfNoUser?: boolean): Promise<User | undefined> {
  const supabase = createServerActionClient({cookies});
  const {data: sessionData, error: authError} = await supabase.auth.getSession()

  if (authError) {
    throw authError;
  }

  let user = sessionData?.session?.user;
  if ((!user) && throwIfNoUser) {
    throw new Error('no user');
  }
  return user;
}

export async function saveOrReturnMostRecentRecord(sourceTable: string, record: Dateable, user_id: string, id?: string) {
  const {error, data: records} = await supabaseClient.from(sourceTable)!
      .select('*, plans(*)')
      .eq('id', id || record.id)
      .eq('plans.user_id', user_id); // ensure the image relates to a plan owned by the user

  if (error) {
    throw error;
  }
  const [existing] = records;

  if (existing) {
    if (!record.updated_from) { // disallow writing if the record has no from basis
      return existing
    }
    const existingTime = toTime(existing.updated);
    const basisTime = toTime(record.updated_from);
    if (basisTime < existingTime) { // record has been updated since the requested changes occurred
      return existing;
    }
  }

  delete record.updated_from;
  const {data, error: err2} = await supabaseClient.from(sourceTable).upsert(record).select();
  if (err2) {
    throw err2;
  }
  return Array.isArray(data) ? data[0] : data;
}

export async function dataFrom(action, throwIfEmpty?: boolean | string) {
  const {data, error} = await action;

  if (error) {
    throw error;
  }
  if (throwIfEmpty && !data) {
    if (typeof throwIfEmpty === 'boolean') {
      throw new Error('no data');
    }
    throw new Error(throwIfEmpty);
  }
  return data;
}

export function validateRecord(record: any, {plan_id, user_id}: MergeConstraint) {
  if (record.user_id !== user_id) {
    throw new Error('unauthorized');
  }

  if (!isDateable(record) || record.plan_id !== plan_id) {
    throw new ErrorPlus('bad input', {
      record,
      isDateable: isDateable(record),
      planId_record: record.plan_id,
      plan_id_input: plan_id
    });
  }
}

export function withoutUpdatedFrom(record: Dateable): DateableSQL {
  const data = {...record};
  delete data.updated_from;
  return data;
}
