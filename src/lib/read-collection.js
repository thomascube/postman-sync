import axios from 'axios'
import JSum from 'jsum'
import config from './config'
import file from './file'
import storage from './storage'
import CollectionModel from './collection-model'
import { POSTMAN_API_BASE } from './constants'

export async function readRemoteCollection (uuid) {
  const { POSTMAN_API_KEY } = config.get()
  const apiKeyParam = `?apikey=${POSTMAN_API_KEY}`
  const apiAddress = `${POSTMAN_API_BASE}/collections/${uuid}/${apiKeyParam}`
  const res = await axios.get(apiAddress)
  const data = res.data.collection
  const metadata = {
    lastPull: new Date(),
    etag: res.headers.etag || JSum.digest(data, 'MD5', 'hex')
  }

  storage.setItem(uuid, metadata)

  return new CollectionModel(data);
}

export async function readFileCollection (uuid) {
  const data = file.collection.read(uuid)
  if (data) return new CollectionModel(data);
  return false
}

