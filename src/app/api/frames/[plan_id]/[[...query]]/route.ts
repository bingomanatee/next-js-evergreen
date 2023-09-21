import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createServerActionClient} from '@supabase/auth-helpers-nextjs'
import {datesToSql, toTime} from "~/lib/utils/routeUtils";
import {supabaseClient} from "~/app/supabaseClient";
import {isEqual} from "lodash";
import dayjs from "dayjs";

export const revalidate = 0

export function forDB(d) {
  datesToSql(d);
  Object.keys(d).forEach((key) => {
    if (/^_/.test(key)) {
      delete d[key];
    }
  })
  if (typeof d.name !== 'string') {
    d.name = '';
  }
  if (typeof d.value !== 'string') {
    d.value = '';
  }
  if (typeof d.type !== 'string') {
    d.type = '';
  }

  return d;
}

async function mergeFrames(frames, oldFrames = []) {

  const oldFramesMap = new Map();
  oldFrames?.forEach((oldFrame) => {
    oldFramesMap.set(oldFrame.id, oldFrame);
  });

  const frameMap = new Map();

  frames.forEach((frame) => {
    frameMap.set(frame.id, forDB(frame));
  });

  const framesToWrite = new Map();

  const framesToReturn = [];

  frameMap.forEach((frame, id) => {
    const savedFrame = oldFramesMap.get(id);
    if (!savedFrame) {
      framesToWrite.set(id, frame);
      return;
    }
    if (isEqual(savedFrame, frame)) {
      return;
    }
    // if there is a saved frame make sure we do not overwrite more recent data
    const updatedTime = toTime(frame.updated);

    const updatedTimeOnServer = toTime(savedFrame.updated);

    // the stored updated date is a de facto "version stamp"
    // -- if another session writes a more current version to the database,
    // it will be more current and therefore will not be overwritten

    if (updatedTimeOnServer <= updatedTime) {
      framesToWrite.set(id, frame);
    } else {
      framesToReturn.push([savedFrame]);
    }
  });

  const framesList = Array.from(framesToWrite.values());

  let updated =  dayjs().toISOString();
  let {data, error} = await supabaseClient.from('frames').upsert(framesList.map((frame) => {
    return ({...frame, updated})
  })).select();
  if (!error) {
    if (!Array.isArray(data)) {
      return [framesToReturn, error];
    }
    return [[...data, ...framesToReturn], error];
  }
  return [data, error]
}

export async function GET(
    req, {params}
) {
  const supabase = createServerActionClient({cookies});
  const {data: sessionData, error: authError} = await supabase.auth.getSession()

  if (authError) {
    return NextResponse.json({authError})
  }

  const user = sessionData?.session?.user;

  const {plan_id} = params;

  const {error, data: frames} = await supabaseClient.from('frames')!
      .select('*')
      .eq('plan_id', plan_id)
      .eq('deleted', false)
      .eq('user_id', user.id);


  //@TODO: cache
  return NextResponse.json({
    frames: frames || [],
    error: error ? (error?.message || 'unknown error') : null
  })
}

export async function POST(
    req, {params}
) {
  const supabase = createServerActionClient({cookies});
  const {data: sessionData, error: authError} = await supabase.auth.getSession()

  if (authError) {
    return NextResponse.json({authError})
  }

  const user = sessionData?.session?.user;

  const {frames} = await req.json();

  const {plan_id} = params;

  const {error, data: oldFrames} = await supabaseClient.from('frames')!
      .select()
      .eq('plan_id', plan_id)
      .eq('deleted', false)
      .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({
      frames: [],
      error: error?.message || 'unknown error'
    })
  }
  if (frames) {
    const [data, error] = await mergeFrames(frames, oldFrames ?? undefined);

    if (error) {
      return NextResponse.json({
        frames: [],
        error: error?.message || 'unknown error'
      })
    }

    return NextResponse.json({
      frames: Array.isArray(data) ? data : [],
      error: null
    })
  } else {
    console.log('not merging frames - none submitted')
  }
  return NextResponse.json({
    frames: [],
    error: 'unknown error'
  })
}
