import { sparql_endpoint, subgraph } from '$env/static/private'
import { json } from '@sveltejs/kit'
import context from '$lib/context'
import jsonld from "jsonld"
import useragent from "useragent"

let context = {
  Session: "https://pushbroom.co/vocabulary#Session",
  View: "https://pushbroom.co/vocabulary#View",
  sesh: "@id",
  w: "https://pushbroom.co/vocabulary#width",
  r: "https://pushbroom.co/vocabulary#referrer",
  dt: {
    "@id": "https://pushbroom.co/vocabulary#datetime",
    "@type": "xsd:integer"
  },
  p: {
    "@id": "https://pushbroom.co/vocabulary#page",
    "@type": "@id"
  },
  pr: {
    "@id": "https://pushbroom.co/vocabulary#previous",
    "@type": "@id"
  },
  browser: "https://pushbroom.co/vocabulary#browser",
  browserVersion: "https://pushbroom.co/vocabulary#browserVersion",
  os: "https://pushbroom.co/vocabulary#operatingSystem",
  viewed: "https://pushbroom.co/vocabulary#viewed",
  link: "https://pushbroom.co/vocabulary#linked-to",
  from: {
    "@id": "https://pushbroom.co/vocabulary#from",
    "@type": "@id"
  }
}

export async function GET({ request, url, params }) {
  if (params.action != 'hello') {
    return json({})
  }

  console.log('okay?')
  const date = new Date()
  const agent = useragent.lookup(request.headers.get('user-agent'))
  const q = url.searchParams
  const ld = {
    '@context': context,
  }
  ld.sesh = `uuid:${q.get('sesh')}`
  ld.dt = q.get('sesh')
  ld['@type'] = 'Session'
  ld.browser = agent.family
  ld.browserVersion = agent.toVersion()
  ld.os = agent.os.toString()
  ld.viewed = {
    '@id': `uuid:${crypto.randomUUID()}`,
    '@type': "View",
    p: q.get('p'),
    w: q.get('w'),
    dt: date.toISOString()
  }
  if (q.get('pr') !== 'undefined') {
    ld.viewed.from = q.get('pr')
  }
  if (q.get('r') !== 'undefined') {
    ld.r = q.get('r')
  }
  const nquads = await jsonld.toRDF(ld, {format: 'application/n-quads'});
  await fetch(`${sparql_endpoint}/update`, {
    method: 'POST',
    headers:{
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      'update': `insert data {
        graph <${subgraph}> {
${nquads}
        }
      }`
    })
  }).catch((error) => {
    console.error('Error:', error);
  });
  return json({})
}