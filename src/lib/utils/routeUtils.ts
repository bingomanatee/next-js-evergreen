import dayjs from "dayjs";
import {Dateable} from "~/types";
import {createServerActionClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import {NextResponse} from "next/server";

function toSqlDate(date: number | string) {
  if (typeof date === 'number') {
    let d = new Date();
    d.setTime(date);
    return d.toISOString();
  }
  return dayjs(date).toISOString();
}

export function datesToSql(d: Dateable) {
  d.created = toSqlDate(d.created);
  d.updated = ('updated' in d) ? toSqlDate(d.updated) : d.created;
  return d;
}

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

export async function getUser(throwIfNoUser) {
  const supabase = createServerActionClient({cookies});
  const {data: sessionData, error: authError} = await supabase.auth.getSession()

  if (authError) {
    throw authError;
  }

  let user = sessionData?.session?.user;
  if (throwIfNoUser) throw new Error('no user');
  return user;
}
