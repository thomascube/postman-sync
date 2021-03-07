import axios from 'axios'
import fs from 'fs'
import { prompt } from 'enquirer'
import config from './lib/config'
import createChoices from './lib/create-choices'
import log from './lib/log'
import { POSTMAN_API_BASE } from './lib/constants'

export default async function setup () {
  const oldKey = config.get(true).POSTMAN_API_KEY
  const apiKey = await prompt({
    type: 'password',
    name: 'value',
    message: 'Enter your Postman API key' + (oldKey ? ' (leave empty to keep stored key)' : ''),
    initial: oldKey,
  })

  beginSetup(apiKey)
}

async function beginSetup (apiKey) {
  try {
    const apiKeyParam = `?apikey=${apiKey.value}`
    const workspaces = await axios.get(`${POSTMAN_API_BASE}/workspaces/${apiKeyParam}`)
    const workspaceChoices = createChoices(workspaces.data.workspaces)

    const selectedWorkspace = await prompt({
      name: 'id',
      type: 'autocomplete',
      message: 'Select the Workspace your Collection resides within',
      limit: 10,
      choices: workspaceChoices
    })

    const collections = await axios.get(`${POSTMAN_API_BASE}/workspaces/${selectedWorkspace.id}/${apiKeyParam}`)
    continueSetup(collections.data.workspace.collections, apiKey, selectedWorkspace.id)
  } catch (e) {
    log.error('Invalid Postman API key!')
    setup()
  }
}

async function continueSetup (collectionList, apiKey, selectedWorkspaceId) {
  const settings = {}
  const apiKeyParam = `?apikey=${apiKey.value}`

  if (collectionList) {
    const collectionChoices = createChoices(collectionList)
    const previouslySelectedCollections = config.get(true).POSTMAN_COLLECTIONS || {}

    const selectedCollections = await prompt({
      type: 'select',
      name: 'list',
      multiple: true,
      message: 'Use SPACE to select the Collection(s) you wish to synchronize',
      choices: collectionChoices,
      initial: Object.values(previouslySelectedCollections),
      result (names) {
        return names.reduce((acc, cur) => {
          const match = collectionChoices.find(choice => choice.name === cur).value
          acc[match] = cur
          return acc
        }, {})
      }
    })

    settings.POSTMAN_COLLECTIONS = selectedCollections.list
  } else {
    settings.POSTMAN_COLLECTIONS = {}
  }

  const environmentList = await axios.get(`${POSTMAN_API_BASE}/workspaces/${selectedWorkspaceId}/${apiKeyParam}`)
  const envs = environmentList.data.workspace.environments

  if (envs) {
    const fetchEnvironment = await prompt({
      name: 'value',
      type: 'confirm',
      message: 'Would you like to include Environment(s)?'
    })

    if (fetchEnvironment.value) {
      const environmentChoices = createChoices(envs)
      const previouslySelectedEnvironments = config.get(true).POSTMAN_ENVIRONMENTS || {}

      const selectedEnvironments = await prompt({
        name: 'list',
        type: 'select',
        multiple: true,
        message: 'Use SPACE to select the Environment(s) you wish to synchronize',
        choices: environmentChoices,
        initial: Object.values(previouslySelectedEnvironments),
        result (names) {
          return names.reduce((acc, cur) => {
            const match = environmentChoices.find(choice => choice.name === cur).value
            acc[match] = cur
            return acc
          }, {})
        }
      })

      settings.POSTMAN_ENVIRONMENTS = selectedEnvironments.list
    }
  }

  const directory = await prompt({
    type: 'input',
    name: 'name',
    initial: config.get(true).POSTMAN_DIR || '.',
    message: 'Enter directory for Postman files'
  })

  try {
    await fs.promises.access(directory.name, fs.constants.O_DIRECTORY)
  } catch (e) {
    try {
      await fs.promises.mkdir(directory.name, { recursive: true })
      log.info(`Postman directory '${directory.name}' created`)
    } catch (e) {
      log.error(`Postman directory '${directory.name}' does not exist and could not be created`)
    }
  }

  const me = await axios.get(`${POSTMAN_API_BASE}/me/${apiKeyParam}`)

  Object.assign(settings, {
    POSTMAN_API_KEY: apiKey.value,
    POSTMAN_WORKSPACE_ID: selectedWorkspaceId,
    POSTMAN_DIR: directory.name,
    POSTMAN_USERID: me.data.user.id + ''
  })

  config.set(settings, { log: true })
}
