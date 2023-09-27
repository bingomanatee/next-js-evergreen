import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {supabaseClient} from "~/app/supabaseClient";
import plans from "~/components/pages/Plans/Plans";
import {dataFrom, getUser} from "~/lib/utils/routeUtils";
import {ErrorPlus} from "~/lib/ErrorPlus";

export const revalidate = 0

export async function GET(
    req, {params}
) {

  try {
    const {plan_id} = params;
    const user = await getUser(cookies, true);
    if (!user?.id) {
      throw new ErrorPlus('unauthorized', 'planId::GET bad user from getUser');
    }

    if (!plan_id) {
      throw new ErrorPlus("bad input", 'no plan_id')
    }

    const [plan] = await dataFrom(await supabaseClient.from('plans')!
            .select('*, frames(*),links(*),map_points(*), frame_images(*)')
            .eq('id', plan_id)
            .eq('user_id', user.id)
        , true)

    if (!plan) {
      throw new ErrorPlus('no plan found', {plan_id})
    } else {
      console.log('---- got plan:', JSON.stringify(plan).substring(0, 100));
    }

    return NextResponse.json({
      plan,
      error: null
    });
  } catch (err) {
    console.log('plan_id route error:', err);
    return new Response(JSON.stringify({error: err.message}), {
      status: 500,
    })
  }
}
