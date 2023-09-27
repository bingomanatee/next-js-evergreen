import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {supabaseClient} from "~/app/supabaseClient";
import {Dateable, DateableSQL, isDateable} from "~/types";
import {dataFrom, getUser, validateRecord, withoutUpdatedFrom} from "~/lib/utils/routeUtils";
import {RecordMerger} from "~/lib/utils/RecordMerger";
import {ErrorPlus} from "~/lib/ErrorPlus";

export const revalidate = 0

/**
 * get all records for a plan
 */
export async function GET(
    req, {params}
) {
  const {plan_id}: { records: Dateable[], plan_id: 'string' } = await req.json();
  try {
    const user = await getUser(cookies, true);
    if (!user?.id) {
      throw new ErrorPlus('unauthorized', 'bad user from getUser');
    }

    if (!plan_id ) {
      throw new ErrorPlus("bad input", 'no plan_id')
    }

    const dbRecords: DateableSQL[] = await dataFrom(
        supabaseClient.from('links')
            .select()
            .eq('plan_id', plan_id)
            .eq('user_id', user.id)
    );

    return NextResponse.json({records: dbRecords});

  } catch (err) {
    console.log('>>>>>> --------- error getting links', records, err);
    return new Response(JSON.stringify({error: err.message}), {
      status: 500,
    });
  }
}

/**
 * Post a complete set of records for a given plan
 */
export async function POST(req) {
  const {records, plan_id}: { records: Dateable[], plan_id: 'string' } = await req.json();
  try {
    const user = await getUser(cookies, true);
    if (!user?.id) {
      throw new ErrorPlus('unauthorized', 'bad user from getUser');
    }

    if (!plan_id ) {
      throw new ErrorPlus("bad input", 'no plan_id')
    }

    const constraint = {plan_id, user_id: user.id};

    records.forEach((record) => validateRecord(record, constraint))

    const dbRecords: DateableSQL[] = await dataFrom(
        supabaseClient.from('links')
            .select()
            .eq('plan_id', plan_id)
            .eq('user_id', user.id)
    );

    const merger = new RecordMerger(records, dbRecords, constraint);

    const {local_records, db_records} = merger.merge();

    let saved_on_db = !local_records.length ? [] : await dataFrom(
        supabaseClient.from('links').upsert(
            local_records.map(withoutUpdatedFrom))
            .select()
    );

    return NextResponse.json({saved_on_db, newer_on_db: db_records, status: 'updated'});

  } catch (err) {
    console.log('>>>>>> --------- error posting links', records, err);

    return new Response(JSON.stringify({error: err.message}), {
      status: 500,
    });
  }
}

export async function PATCH(req) {
  const {records, plan_id}: { records: Dateable[], plan_id: 'string' } = await req.json();
  try {
    const user = await getUser(cookies, true);
    if (!user?.id) {
      throw new ErrorPlus('unauthorized', 'bad user from getUser');
    }

    if (!plan_id ) {
      throw new ErrorPlus("bad input", 'no plan_id')
    }

    const constraint = {plan_id, user_id: user.id};

    records.forEach((record) => validateRecord(record, constraint))

    const dbRecords: DateableSQL[] = await dataFrom(
        supabaseClient.from('links')
            .select()
            .eq('plan_id', plan_id)
            .eq('user_id', user.id)
            .in('id', records.map((r) => r.id))
    );

    const merger = new RecordMerger(records, dbRecords, constraint);

    const {local_records, db_records} = merger.merge();


    let saved_on_db = !local_records.length ? [] : await dataFrom(
        supabaseClient.from('links').upsert(
            local_records.map(withoutUpdatedFrom))
            .select()
    );
    console.log('---- patch: saved_on_db', saved_on_db, 'updates FROM db:', db_records);

    return NextResponse.json({saved_on_db, newer_on_db: db_records, status: 'updated'});

  } catch (err) {
    console.log('>>>>>> --------- error patching links', records, err);
    return new Response(JSON.stringify({error: err.message}), {
      status: 500,
    });
  }
}
