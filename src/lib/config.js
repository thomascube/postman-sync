import fs from 'fs'
import path from 'path'
import log from './log'
import { CONFIG_FILENAME } from './constants'

export default {
  get: function () {
    try {
      const data = fs.readFileSync(path.resolve(process.cwd(), CONFIG_FILENAME))
      return JSON.parse(data);
    } catch (e) {
      console.error(e)
      log.error(`No/invalid ${CONFIG_FILENAME} file found! Run postman setup.`)
      process.exit(1)
    }
  },
  set: function (config, options) {
    const shouldLog = options && options.log
    const shouldMerge = options && options.merge
    const settings = shouldMerge ? Object.assign(this.get(), config) : config

    try {
      fs.writeFileSync(CONFIG_FILENAME, JSON.stringify(settings, null, 2))

      if (shouldLog) {
        log.success('Postman Sync config saved!')
      }
    } catch (e) {
      log.error(`Failed to write ${CONFIG_FILENAME} config file!`)
    }
  }
}
