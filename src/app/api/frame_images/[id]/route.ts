import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createServerActionClient} from '@supabase/auth-helpers-nextjs'
import {getUser, saveOrReturnMostRecentRecord} from "~/lib/utils/routeUtils";
import {supabaseClient} from "~/app/supabaseClient";

export function forDB(d) {
  Object.keys(d).forEach((key) => {
    if (/^_/.test(key)) {
      delete d[key];
    }
  })

  return d;
}

export const revalidate = 0

export async function GET(
    req, {params}
) {
  const supabase = createServerActionClient({cookies});
  const {data: sessionData, error: authError} = await supabase.auth.getSession()
  if (authError) {
    return NextResponse.json({frame_image: null, error: authError.message})
  }
  const user = sessionData?.session?.user;
  if (!user) {
    return NextResponse.json({error: 'no user', plans: []})
  }
  const {id} = params;

  const {error, data: frame_images} = await supabaseClient.from('frame_images')!
      .select('*, plans(*)')
      .eq('id', id)
      .eq('plans.user_id', user.id);

  //@TODO: cache
  return NextResponse.json({
    frame_image: Array.isArray(frame_images) ? frame_images[0] : null,
    error: error ? (error?.message || 'unknown error') : null
  })
}

export async function PUT(
    req, {params}
) {
  try {
    const {id} = params;
    const {record} = await req.json();
    const user = await getUser(cookies);
    if (!user?.id) throw new Error('authentication error');

    // @TODO: user MergeRecords
    const frame_image = await saveOrReturnMostRecentRecord( 'frame_images', record, user.id, id);

    //@TODO: cache
    return NextResponse.json({
      frame_image,
      error: null
    })
  } catch (err) {
    return NextResponse.json({
      frame_image: null,
      error: err.message
    })
  }

}
