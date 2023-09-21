import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createServerActionClient} from '@supabase/auth-helpers-nextjs'
import {datesToSql, toTime} from "~/lib/utils/routeUtils";
import {supabaseClient} from "~/app/supabaseClient";
import plans from "~/components/pages/Plans/Plans";

export function forDB(d) {
  datesToSql(d);
  Object.keys(d).forEach((key) => {
    if (/^_/.test(key)) {
      delete d[key];
    }
  })

  return d;
}

async function mergePlans(plans, oldPlans = []) {

  const oldPlansMap = new Map();
  oldPlans?.forEach((oldPlan) => {
    oldPlansMap.set(oldPlan.id, oldPlan);
  });

  const planMap = new Map();

  plans.map((plan) => {
    planMap.set(plan.id, plan);
  });

  const plansToWrite = new Map();

  planMap.forEach((plan, id) => {
    const savedPlan = oldPlansMap.get(id);
    if (!savedPlan) {
      plansToWrite.set(id, plan);
      return;
    }
    // if there is a saved plan make sure we do not overwrite more recent data
    const updatedTime = toTime(plan.updated);

    const updatedTimeOnServer = toTime(savedPlan.updated);

    // the stored updated date is a de facto "version stamp" -- if another session writes a more current version to the database,
    // it will be more current and therefore will not be overwritten

    if (updatedTimeOnServer <= updatedTime) {
      plansToWrite.set(id, plan);
    }
  });

  const plansList = Array.from(plansToWrite.values()).map((data) => forDB(data));
  const {data, error} = await supabaseClient.from('plans').upsert(plansList).select();
  return data;
}

export const revalidate = 0

export async function GET(
    req, {params}
) {
  const supabase = createServerActionClient({cookies});
  const {data: sessionData, error: authError} = await supabase.auth.getSession()

  if (authError) {
    return NextResponse.json({authError})
  }

  const user = sessionData?.session?.user;

  if (!user) {
    return NextResponse.json({error: 'no user', plans: []})
  }
  const {query, plan_id} = params;

  const {error, data: plans} = await supabaseClient.from('plans')!
      .select('*, frames(*),links(*),map_points(*)')
      .eq('id', plan_id)
      .eq('user_id', user.id);

  //@TODO: cache
  return NextResponse.json({
    plan: Array.isArray(plans) ? plans[0] : null,
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

  if (!user) {
    return NextResponse.json({error: 'no user'})
  }

  const {plans} = await req.json();

  const {plan_id} = params;

  const {error, data: oldPlans} = await supabaseClient.from('plans')!
      .select()
      .eq('id', plan_id)
      .eq('deleted', false)
      .eq('user_id', user.id);

  if (error){
    return NextResponse.json({
      plans: [],
      error: error?.message || 'unknown error'
    })
  }

  if (plans) {
    const [savedData, error] = await mergePlans(plans, oldPlans ?? undefined);
    return NextResponse.json({
      plans: Array.isArray(savedData) ? savedData : [],
      error: error?.message || 'unknown error'
    });
  } else {
    console.log('not merging plans - none submitted')
  }
  //@TODO: cache
  return NextResponse.json({
    plans: [],
    error: 'did not save data or encounter error?'
  })
}
