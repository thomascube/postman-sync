import fs from 'fs'
import path from 'path'
import config from './config'
import log from './log'

function getFilename(name, type) {
  const { POSTMAN_DIR } = config.get()
  return `${POSTMAN_DIR}/${name}.${type}.json`.replace(' ', '-')
}

export default {
  collection: {
    read: (uuid) => {
      try {
        const { POSTMAN_COLLECTIONS } = config.get()
        const collectionFilename = getFilename(POSTMAN_COLLECTIONS[uuid], 'postman_collection')
        const collection = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), collectionFilename)));

        return collection
      } catch (e) {}
    },
    write: (collection) => {
      const { POSTMAN_COLLECTIONS } = config.get()

      try {
        const uuid = collection.info._postman_id
        const filename = getFilename(POSTMAN_COLLECTIONS[uuid] || collection.info.name, 'postman_collection')

        // TODO: rename file if collection name changed

        fs.writeFileSync(filename, JSON.stringify(collection, null, 2))
        log.success(`Postman collection written to ${filename}!`)
      } catch (e) {
        log.error('Failed to write Postman collection.')
      }
    }
  },
  environment: {
    read: () => {
      try {
        const { POSTMAN_ENVIRONMENTS } = config.get()

        return Object.values(POSTMAN_ENVIRONMENTS).map((name) => {
          const filename = getFilename(name, 'postman_environment')
          return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), filename)));
        })
      } catch (e) {}
    },
    write: (environment) => {
      try {
        const filename = getFilename(environment.name, 'postman_environment')

        fs.writeFileSync(filename, JSON.stringify(environment, null, 2))
        log.success(`Postman environment written to ${filename}!`)
      } catch (e) {
        log.error('Failed to write Postman environment.')
      }
    }
  }
}
