import axios from 'axios'
import { prompt } from 'enquirer'
import config from './lib/config'
import file from './lib/file'
import log from './lib/log'
import storage from './lib/storage'
import { POSTMAN_API_BASE } from './lib/constants'

async function updateCollection (id) {
  const { POSTMAN_API_KEY, POSTMAN_WORKSPACE_ID } = config.get()
  const collection = file.collection.read(id)
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
  let collectionAddress = `${POSTMAN_API_BASE}/collections/${id}/${apiKeyParam}`

  // get etag from API and compare with local metadata
  let latestEtag;
  try {
    const head = await axios.head(collectionAddress)
    latestEtag = head.headers.etag || 'empty'
  } catch (err) {
    latestEtag = 'notfound'
  }

  let metaData = storage.getItem(id) || {}
  let confirmMesage = `Overwrite the collection '${collection.info.name}' in your workspace. Are you sure?`;
  let abortMessage = null

  if (metaData && metaData.etag !== latestEtag) {
    confirmMesage = `The collection '${collection.info.name}' has changed in your workspace. Do you really want to overwrite it?`
    abortMessage = 'You should run `postman-sync pull` to sync your local copy'
  }

  const confirm = await prompt({
    type: 'confirm',
    name: 'pushcollection',
    message: confirmMesage
  })

  if (confirm.pushcollection) {
    // post as new collection
    if (latestEtag === 'notfound') {
      const created = await axios.post(`${POSTMAN_API_BASE}/collections/${apiKeyParam}&workspace=${POSTMAN_WORKSPACE_ID}`, { collection })

      if (created.data.collection?.uid) {
        id = created.data.collection.uid
        collectionAddress = `${POSTMAN_API_BASE}/collections/${id}/${apiKeyParam}`
        metaData = { lastPull: new Date() }
      } else {
        log.error(`Unexpected response for POST request: ${created.data}`)
      }
    } else {
      // put updated collection
      await axios.put(collectionAddress, { collection })
    }

    log.success(`Pushed collection '${collection.info.name}' to Postman`)

    // update the stored etag after push
    const head = await axios.head(collectionAddress)
    if (head.headers.etag) {
      metaData.etag = head.headers.etag
      storage.setItem(id, metaData)
    }
  } else if (abortMessage) {
    log.info(abortMessage)
  }
}

export default async function update () {
  const { POSTMAN_API_KEY, POSTMAN_COLLECTIONS } = config.get()
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
  const environments = file.environment.read()

  for (let id in POSTMAN_COLLECTIONS) {
    await updateCollection(id)
  }

  if (environments && environments.length) {
    environments.forEach(async (environment) => {
      const environmentAddress = `${POSTMAN_API_BASE}/environments/${environment.id}/${apiKeyParam}`
      const confirm = await prompt({
        type: 'confirm',
        name: 'pushenvironment',
        message: `Overwrite the environment '${environment.name}' in your workspace. Are you sure?`
      })

      if (confirm.pushenvironment) {
        // TODO: post new environment
        await axios.put(environmentAddress, { environment })
        log.success(`Pushed environment '${environment.name}' to Postman`)
      }
    })
  }

  storage.write()
}
