"use client"

import { Loader } from '@googlemaps/js-api-loader';

let result: Promise<any>;
const GOOGLE_API_TOKEN = process.env.NEXT_PUBLIC_GOOGLE_API_TOKEN;

export default async () => {
  if (!result) {
    console.log('loading google with ', GOOGLE_API_TOKEN);
    const loader = new Loader({
      apiKey: GOOGLE_API_TOKEN || '',
      version: "preview",
      libraries: ["places"]
    });
    result = await loader.load();
  }

  return result;
}

