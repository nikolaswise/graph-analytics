import { sparql_endpoint } from '$env/static/private'
import { queryArr, queryJSON } from "$lib/query.js"

const find = (bindings) => (term, id) => {
  return bindings.find(node => {
    return node[term].value === id
  })
}

const collectPages = (acc, val) => {
  let page = val.p.split('?')[0]
  acc[page] ? acc[page] = [...acc[page], val.id] : acc[page] = [val.id]
  return acc
}

const collectReferrers = (acc, val) => {
  acc[val.r] ? acc[val.r] = [...acc[val.r], val.id] : acc[val.r] = [val.id]
  return acc
}

export async function load() {
  let query = await queryArr(`
    select ?type (
      count(?s) AS ?count
    ) {
      VALUES ?type {
        <https://vocab.nikolas.ws/analytics#View>
        <https://vocab.nikolas.ws/analytics#Session>
      }
      ?s rdf:type ?type
    }
    group by ?type
  `)

  let f = find(query.results.bindings)

  let views = await queryJSON(`
    construct {
      ?s ?p ?o .
      ?s nka:inSession ?a
    } where {
      ?s rdf:type nka:View .
      ?a nka:viewed ?s .
      ?s ?p ?o
    }
  `)
  let sessions = await queryJSON(`
    construct {
      ?s ?p ?o
    } where {
      ?s rdf:type nka:Session .
      ?s ?p ?o
    }
  `)

  let referrers = sessions.reduce(collectReferrers, {})
  let referrersArr = Object.entries(referrers)
    .map(ref => {
      ref[1] = {
        sessions: ref[1],
        count: ref[1].length
      }
      return ref
    })
    .sort((a, b) => {
      return parseInt(b[1].count) - parseInt(a[1].count)
    })

  let pages = views.reduce(collectPages, {})
  let pageArr = Object.entries(pages)
    .map(page => {
      page[1] = {
        sessions: page[1],
        count: page[1].length
      }
      console.log(page[1].sessions)
      return page
    })
    .sort((a, b) => {
      return parseInt(b[1].count) - parseInt(a[1].count)
    })
  console.log(pageArr)

  return {
    pages: pageArr,
    referrers: referrersArr,
    sessions: sessions,
    views: views,
    summary: {
      sessions: parseInt(f('type', 'https://vocab.nikolas.ws/analytics#Session').count.value),
      views: parseInt(f('type', 'https://vocab.nikolas.ws/analytics#View').count.value),
    }
  }
}