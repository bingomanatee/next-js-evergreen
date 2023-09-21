import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {createServerActionClient} from '@supabase/auth-helpers-nextjs'

/*export const config = {
  api: {
    bodyParser: false
  }
}*/

export async function GET(
  req, { params }
) {
  const supabase = createServerActionClient({cookies});
  const { data: sessionData, error: authError } = await supabase.auth.getSession()

  if (authError) {
    return NextResponse.json({ authError })
  }

  const user = sessionData?.session?.user;
  const { id } = params;

  const { data, error } = await supabase.storage
    .from('images')
    .list('files/', {
      limit: 1,
      offset: 0,
      search: id
    })

  const fileData = (Array.isArray(data) ? data[0] : null);
  if (fileData) {
    const {data: urlData, error: urlError} = await supabase
      .storage
      .from('images')
      .createSignedUrl(`files/${id}`, 60 * 60 * 4) // expires in 4 hours;
    //@TODO: cache
    return NextResponse.json({ fileData, url: urlData?.signedUrl, urlError })
  }

  return NextResponse.json({ error })

}

export async function POST(req, { params }) {
  const supabase = createServerActionClient({cookies});
  const { data: sessionData, error: authError } = await supabase.auth.getSession()

  if (authError) {
    return NextResponse.json({ authError })
  }

  const user = sessionData?.session?.user;

  //@TODO: validate that user owns frame / project

  const { id } = params;

  const file = await req.blob();

  const { data, error } = await supabase.storage
    .from('images')
    .upload(`files/${id}`, file, {
      upsert: true,
      contentType: req.headers['file-type'],
    })
  const {data: urlData, error: urlError} = await supabase
    .storage
    .from('images')
    .createSignedUrl(`files/${id}`, 60 * 60 * 4) // expires in 4 hours;

  return NextResponse.json(
    {
      uploaded: true,
      data,
      urlData,
      error
    }
  );

}
