import _ from 'lodash'
import axios from 'axios'
import config from './lib/config'
import { POSTMAN_API_BASE } from './lib/constants'
import file from './lib/file'
import log from './lib/log'
import storage from './lib/storage'
import { mergeCollection, mergeEnvironment } from './lib/merge-tool'
import { readRemoteCollection, readFileCollection }  from './lib/read-collection'

async function pullCollection (id) {
  const incoming = await readRemoteCollection(id)
  const local = await readFileCollection(id)

  // no local copy: just write the remote collection
  if (!local) {
    file.collection.write(incoming.toJSON());
    // log.success(`Saved remote collection ${incoming.name} as local copy.`)
  } else {
    await mergeCollection(local, incoming);
    file.collection.write(local.toJSON());
    // log.success(`Updated local copy of collection ${local.name}`)
  }
}

async function writeEnvironment (id, local, POSTMAN_API_KEY) {
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
  const environment = await axios.get(`${POSTMAN_API_BASE}/environments/${id}/${apiKeyParam}`)

  if (local) {
    await mergeEnvironment(local, environment.data.environment)
  } else {
    local = environment.data.environment;
  }
  file.environment.write(local)
}

export default async function pull () {
  const { POSTMAN_API_KEY, POSTMAN_ENVIRONMENTS, POSTMAN_COLLECTIONS } = config.get()
  const environments = file.environment.read()

  for (let id in POSTMAN_COLLECTIONS) {
    await pullCollection(id)
  }

  // fetch environments, too
  if (POSTMAN_ENVIRONMENTS) {
    for (let id in POSTMAN_ENVIRONMENTS) {
      await writeEnvironment(id, _.find(environments, (env) => env.id === id), POSTMAN_API_KEY)
    }
  }

  storage.write()
  log.success(`Pull complete`)
}
