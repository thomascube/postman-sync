import fs from 'fs'
import path from 'path'
import config from './lib/config'
import file from './lib/file'
import log from './lib/log'
import CollectionModel from './lib/collection-model'

export default async function addFile (filePath) {
  const dataDir = path.resolve(process.cwd(), config.get().POSTMAN_DIR)
  const absPath = path.resolve(process.cwd(), filePath)
  if (absPath.indexOf(dataDir) < 0) {
    log.error('The file needs to be located in the configured data dir. Aborting.')
    return
  }

  try {
    let model, filetype;
    const { POSTMAN_COLLECTIONS, POSTMAN_ENVIRONMENTS, POSTMAN_USERID } = config.get()
    const jsondata = JSON.parse(fs.readFileSync(absPath))
    const idPrefix = POSTMAN_USERID + '-'

    if (!POSTMAN_USERID) {
      log.error('No POSTMAN_USERID set in config. Please run `postman-sync setup` before adding a file.')
      return
    }

    if (jsondata.info && jsondata.info._postman_id && jsondata.info.schema && jsondata.info.schema.indexOf('collection.json') > 0) {
      model = new CollectionModel(jsondata)
      filetype = 'postman_collection';
      POSTMAN_COLLECTIONS[idPrefix + model.id] = model.name
    } else if (jsondata.id && jsondata.values) {
      model = jsondata
      filetype = 'postman_environment'
      POSTMAN_ENVIRONMENTS[idPrefix + model.id] = model.name
      // TODO: remove this
      log.error('Only collections are currently allowed to be added. Sorry!')
      return
    }

    if (!filetype) {
      throw new Error('Unknown JSON schema. Could not determine Postman file type.');
    }

    const filename = file.getFilename(model.name, filetype)
    const targetFile = path.resolve(process.cwd(), filename)
    if (targetFile !== absPath) {
      fs.symlinkSync(absPath, targetFile)
      log.info(`Registered symlink ${targetFile} -> ${absPath}`)
    }

    config.set({ POSTMAN_COLLECTIONS, POSTMAN_ENVIRONMENTS }, { merge: true, log: true })
  } catch (err) {
    log.error('Failed to parse the import file: ' + err.message)
  }
}
