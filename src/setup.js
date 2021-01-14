import axios from 'axios'
import { prompt } from 'enquirer'
import config from './lib/config'
import createChoices from './lib/create-choices'
import log from './lib/log'
import { POSTMAN_API_BASE } from './lib/constants'

export default async function setup () {
  const apiKey = await prompt({
    type: 'password',
    name: 'value',
    message: 'Enter your Postman API key'
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
    const collectionList = collections.data.workspace.collections

    if (collectionList) {
      continueSetup(collectionList, apiKey, selectedWorkspace.id)
    } else {
      log.error('Workspace has no collections. Select another workspace.')
      beginSetup(apiKey)
    }
  } catch (e) {
    log.error('Invalid Postman API key!')
    setup()
  }
}

async function continueSetup (collectionList, apiKey, selectedWorkspaceId) {
  const settings = {}
  const apiKeyParam = `?apikey=${apiKey.value}`
  const collectionChoices = createChoices(collectionList)

  const selectedCollection = await prompt({
    name: 'id',
    type: 'autocomplete',
    message: 'Select the Collection you wish to work with',
    limit: 10,
    choices: collectionChoices
  })

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

      const selectedEnvironments = await prompt({
        name: 'list',
        type: 'autocomplete',
        multiple: true,
        message: 'Use SPACE to Select the Environment(s) you wish to work with',
        limit: 10,
        choices: environmentChoices,
        result (names) {
          return names.reduce((acc, cur) => {
            const match = environmentChoices.find(choice => choice.name === cur).value
            acc[cur] = match
            return acc
          }, {})
        }
      })

      settings.POSTMAN_ENVIRONMENTS = selectedEnvironments.list
    }
  }

  Object.assign(settings, {
    POSTMAN_API_KEY: apiKey.value,
    POSTMAN_COLLECTION_ID: selectedCollection.id,
    POSTMAN_WORKSPACE_ID: selectedWorkspaceId,
  })

  config.set(settings, { log: true })
}
