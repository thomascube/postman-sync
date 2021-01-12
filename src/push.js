import axios from 'axios'
import { prompt } from 'enquirer'
import config from './lib/config'
import file from './lib/file'
import log from './lib/log'
import { POSTMAN_API_BASE } from './lib/constants'

export default async function update () {
  const { POSTMAN_API_KEY, POSTMAN_COLLECTION_ID } = config.get()
  const collection = file.collection.read()
  const environments = file.environment.read()
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
  const collectionAddress = `${POSTMAN_API_BASE}/collections/${POSTMAN_COLLECTION_ID}/${apiKeyParam}`
  const doPush = await prompt({
    type: 'confirm',
    name: 'pushcollection',
    message: `This will overwrite the collection ${collection.info.name} in your workspace. Are you sure?`
  })

  if (doPush) {
    await axios.put(collectionAddress, { collection })
    log.success(`Pushed collection ${collection.info.name} to Postman`)
  }

  if (environments && environments.length) {
    environments.forEach(async (environment) => {
      const environmentAddress = `${POSTMAN_API_BASE}/environments/${environment.id}/${apiKeyParam}`
      const doPush = await prompt({
        type: 'confirm',
        name: 'pushenvironment',
        message: `Overwrite the environment ${environment.name} in your workspace. Are you sure?`
      })

      if (doPush) {
        await axios.put(environmentAddress, { environment })
        log.success(`Pushed environment ${environment.name} to Postman`)
      }
    })
  }
}
