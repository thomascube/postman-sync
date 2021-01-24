import fs from 'fs'
import path from 'path'
import log from './log'
import { STORAGE_FILENAME } from './constants'

let storageData = null;

export default {
  read: function () {
    if (storageData !== null) {
      return storageData;
    }

    try {
      const data = fs.readFileSync(path.resolve(process.cwd(), STORAGE_FILENAME))
      storageData = JSON.parse(data)
    } catch (e) {
      //console.error(e)
      //log.error(`No/invalid ${STORAGE_FILENAME} file found! Run postman setup.`)
      // process.exit(1)
      storageData = {} 
    }

    return storageData
  },
  write: function (options) {
    const shouldLog = options && options.log
    try {
      fs.writeFileSync(STORAGE_FILENAME, JSON.stringify(storageData || {}, null, 2))

      if (shouldLog) {
        log.success('Postman storage data saved!')
      }
    } catch (e) {
      log.error(`Failed to write ${STORAGE_FILENAME} config file!`)
    }

  },
  getItem: function (key) {
    this.read()
    return storageData[key];
  },
  setItem: function (key, value, options) {
    const shouldMerge = options && options.merge
    const shouldWrite = options && options.write
    this.read()
    storageData[key] = shouldMerge ? Object.assign(storageData[key] || {}, value) : value
    if (shouldWrite) this.write(options)
  }
}
