import { prompt } from 'enquirer'
import JSum from 'jsum'

async function processItem(item, base) {
  const id = item._postman_id;
  const existing = base.getItemById(id);
  let result = 0;

  if (existing) {
    // compare new item && existing
    const incomingHash = JSum.digest(item, 'MD5', 'hex')
    const existingHash = JSum.digest(existing, 'MD5', 'hex')

    // they differ, confirm import by user
    if (incomingHash !== existingHash) {
      const doReplace = await prompt({
        type: 'confirm',
        name: 'replaceitem',
        message: `Do you want to update the item ${item.name}?`
      })
      if (doReplace) {
        Object.assign(existing, item)
        result = 1
      }
    }
  } else {
    const doImport = await prompt({
      type: 'confirm',
      name: 'importitem',
      message: `Do you want to import new item ${item.name}?`
    })
    if (doImport) {
      base.addItem(item);
      result = 1
    }
  }

  return result
}

export async function mergeCollection (base, incoming) {
  let importCount = 0
  // for each incoming.items: check if exists in base and update if changed (promt)
  const items = incoming.items;
  if (Array.isArray(items)) {
    for (const item of items) {
      importCount += await processItem(item, base)
    }
  }

  // TODO: copy metadata like name and description

  return base;
}

export async function mergeEnvironment (base, incoming) {
  // TODO: implement this
  return base;
}
