import { sparql_endpoint } from '$env/static/private'

export async function load() {
  let triples = await fetch(`${sparql_endpoint}/query`, {
    method: 'POST',
    headers:{
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      'query': `CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o}`
    })
  }).then(r => r.text())
  return {
    triples: triples
  }
}