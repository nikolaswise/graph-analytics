import { sparql_endpoint } from '$env/static/private'
import { json } from '@sveltejs/kit'
import jsonld from "jsonld"
import useragent from "useragent"

let context = {
  Session: "https://vocab.nikolas.ws/analytics#Session",
  View: "https://vocab.nikolas.ws/analytics#View",
  sesh: "@id",
  w: "https://vocab.nikolas.ws/analytics#width",
  r: "https://vocab.nikolas.ws/analytics#referrer",
  dt: {
    "@id": "https://vocab.nikolas.ws/analytics#datetime",
    "@type": "xsd:integer"
  },
  p: {
    "@id": "https://vocab.nikolas.ws/analytics#page",
    "@type": "@id"
  },
  pr: {
    "@id": "https://vocab.nikolas.ws/analytics#previous",
    "@type": "@id"
  },
  browser: "https://vocab.nikolas.ws/analytics#browser",
  browserVersion: "https://vocab.nikolas.ws/analytics#browserVersion",
  os: "https://vocab.nikolas.ws/analytics#operatingSystem",
  viewed: "https://vocab.nikolas.ws/analytics#viewed",
  link: "https://vocab.nikolas.ws/analytics#linked-to",
  from: {
    "@id": "https://vocab.nikolas.ws/analytics#from",
    "@type": "@id"
  }
}

export async function GET({ request, url, params }) {
  if (params.action != 'hello') {
    return json({})
  }

  const agent = useragent.lookup(request.headers.get('user-agent'))
  const q = url.searchParams
  const ld = {
    '@context': context,
  }
  ld.sesh = `uuid:${crypto.randomUUID()}`
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
    dt: Date.now()
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
      'update': `INSERT DATA {
${nquads}
      }`
    })
  }).catch((error) => {
    console.error('Error:', error);
  });
  return json({})
}