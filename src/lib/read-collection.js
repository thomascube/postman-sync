import axios from 'axios'
import config from './config'
import file from './file'
import CollectionModel from './collection-model'
import { POSTMAN_API_BASE } from './constants'

export async function readRemoteCollection () {
  const { POSTMAN_API_KEY, POSTMAN_COLLECTION_ID } = config.get()
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
  const apiAddress = `${POSTMAN_API_BASE}/collections/${POSTMAN_COLLECTION_ID}/${apiKeyParam}`
  const res = await axios.get(apiAddress)
  const data = res.data.collection

  return new CollectionModel(data);
}

export async function readFileCollection () {
  const data = file.collection.read()
  if (data) return new CollectionModel(data);
  return false
}

