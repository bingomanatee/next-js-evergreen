import { NextResponse } from 'next/server'
import { DDGS } from "duckduckit";
import { Loader } from '@googlemaps/js-api-loader'
import { result } from 'lodash'

const ddgs = new DDGS();
for (const key of Object.keys(ddgs)) {
  console.log('ddgs has ', key);
}

const loader = new Loader({
  apiKey: process.env.GOOGLE_API_TOKEN || '',
  version: "preview",
  libraries: ["places"]
});


export async function POST(
  req,
) {
  const mapLoader = await loader.load();
  console.log('mapLoader: ', mapLoader);
  const service = mapLoader.maps.places.AutocompleteService();
  const result = await service.getQueryPredictions({ input: req.body.location });
  try {
    return NextResponse.json({ result })
  } catch (err) {
    return NextResponse.json({error: err.message})
  }

}
