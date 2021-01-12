import _ from 'lodash'
import axios from 'axios'
import config from './lib/config'
import constants from './lib/constants'
import file from './lib/file'
import log from './lib/log'
import { mergeCollection, mergeEnvironment } from './lib/merge-tool'
import { readRemoteCollection, readFileCollection }  from './lib/read-collection'

export default async function pull () {
  const { POSTMAN_API_KEY, POSTMAN_ENVIRONMENTS } = config.get()
  const incoming = await readRemoteCollection()
  const local = await readFileCollection()
  const environments = file.environment.read()

  // no local copy: just write the remote collection
  if (!local) {
    file.collection.write(incoming.toJSON());
    // log.success(`Saved remote collection ${incoming.name} as local copy.`)
  } else {
    await mergeCollection(local, incoming);
    file.collection.write(local.toJSON());
    // log.success(`Updated local copy of collection ${local.name}`)
  }

  // fetch environments, too
  if (POSTMAN_ENVIRONMENTS) {
    for (let id of Object.values(POSTMAN_ENVIRONMENTS)) {
      await writeEnvironment(id, _.find(environments, (env) => env.id === id), POSTMAN_API_KEY)
    }
  }

  log.success(`Pull complete`)
}

async function writeEnvironment (id, local, POSTMAN_API_KEY) {
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
  const environment = await axios.get(`${constants.POSTMAN_API_BASE}/environments/${id}/${apiKeyParam}`)

  if (local) {
    await mergeEnvironment(local, environment.data.environment)
  } else {
    local = environment.data.environment;
  }
  file.environment.write(local)
}
