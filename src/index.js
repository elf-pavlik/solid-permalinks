import fetch from 'isomorphic-fetch'
/**
 * TODO: don't rely on window.fetch
 * create empty document in storage
 * create permalink
 * create content
 * update document with content
 */

function createPermalink (documentUrl, service) {
  return fetch(service.endpoint, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'},
    // FIXME: use token as bearer token
    body: 'location=' + encodeURIComponent(documentUrl) + '&secret=' + service.token
  }).then((response) => {
    if (response.ok && response.headers.has('location')) {
      return Promise.resolve({
        entity: response.headers.get('location'),
        doc: documentUrl
      })
    } else {
      return Promise.reject('Creating permalink failed')
    }
  })
}

function includePermalinks (profile) {
  const solidns = profile.rdf.Namespace('http://www.w3.org/ns/solid/terms#')
  let permalinkStatement = profile.parsedGraph.anyStatementMatching(profile.rdf.sym(profile.webId), solidns('permalinkService'), null)
  if (permalinkStatement) {
    let credentialNode = profile.parsedGraph.statementsMatching(null, solidns('service'), permalinkStatement.object)[0].subject
    let token = profile.parsedGraph.statementsMatching(credentialNode, solidns('token'))[0].object.value
    profile.permalinkService = {
      endpoint: permalinkStatement.object.value,
      token
    }
  }
  return profile
}

export { createPermalink, includePermalinks }
