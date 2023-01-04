import { sparql_endpoint } from '$env/static/private'
import { error, redirect, json } from '@sveltejs/kit';
import jsonld from 'jsonld'
import context from '$lib/context'
import prefixes from '$lib/prefixes'

const getTriples = (accept) => async (query) => await fetch(`${sparql_endpoint}/query`, {
  method: 'POST',
  headers:{
    'Accept': accept
  },
  body: new URLSearchParams({
    'query': `${prefixes}
    ${query}`
  })
})

export const queryJSON = async query => {
  let triples = await getTriples('application/n-triples')(query)
    .then(result => result.text())
  const doc = await jsonld.fromRDF(triples, {format: 'application/n-quads'});
  const compact = await jsonld.compact(doc, context)
  delete compact['@context']
  if (compact['@graph']) {
    return compact['@graph']
  }
  return [compact]
}

export const queryArr = async query => {
  let triples = await getTriples('application/sparql-results+json')(query)
      .then(result => result.json())
  return triples
}