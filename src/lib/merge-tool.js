import { prompt } from 'enquirer'
import JSum from 'jsum'

async function processItem(item, base, type) {
  const id = item._postman_id || item.key;
  const getter = 'get' + type + 'ById'
  const adder = 'add' + type
  const existing = base[getter](id);
  let result = 0;

  if (existing) {
    // delete 'id' key since this seems to to change with each pull
    delete item.id
    delete existing.id

    // compare new item && existing
    const incomingHash = JSum.digest(item, 'MD5', 'hex')
    const existingHash = JSum.digest(existing, 'MD5', 'hex')

    // they differ, confirm import by user
    if (incomingHash !== existingHash) {
      const confirm = await prompt({
        type: 'confirm',
        name: 'replaceitem',
        message: `Do you want to update the ${type} '${item.name || item.key}' of collection '${base.name}'?`
      })
      if (confirm.replaceitem) {
        Object.assign(existing, item)
        result = 1
      }
    }
  } else {
    const confirm = await prompt({
      type: 'confirm',
      name: 'importitem',
      message: `Do you want to import new ${type} '${item.name || item.key}' info collection '${base.name}'?`
    })
    if (confirm.importitem) {
      base[adder](item);
      result = 1
    }
  }

  return result
}

export async function mergeCollection (base, incoming) {
  let importCount = 0

  // for each incoming.items: check if exists in base and update if changed (prompt)
  const items = incoming.items;
  if (Array.isArray(items)) {
    for (const item of items) {
      importCount += await processItem(item, base, 'Item')
    }
  }

  // for each incoming.variables: check if exists in base and update if changed (prompt)
  const variables = incoming.variables;
  if (Array.isArray(variables)) {
    for (const variable of variables) {
      delete variable.id
      importCount += await processItem(variable, base, 'Variable')
    }
  }

  // TODO: copy incoming.auth
  // TODO: copy metadata like name and description

  return base;
}

export async function mergeEnvironment (base, incoming) {
  // TODO: implement this
  return base;
}
