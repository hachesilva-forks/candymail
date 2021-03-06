import { AutomationConfig, AutomationEmailConfig, AutomationFile, Config } from './types/types'

import { isEmpty } from 'lodash'
import * as path from 'path'
import { setConfig } from './config'
import { generateDateKey } from './helper'
import { addScheduledMessage } from './messages' // TODO: Clean these propagating imports

let loadedAutomations: AutomationConfig[]

// TODO: on init, validate JSON

const init = (automationPath: string, config: Config) => {
  const automationFile =
    require(automationPath) || path.resolve(process.cwd(), './candymail.automation.json')

  loadedAutomations = loadAutomations(automationFile)
  // TODO: Look for candymail.automation.json in the root path

  setConfig(config)
}

const loadAutomations = (file: AutomationFile): AutomationConfig[] => {
  return file.automations
}

const build = (emails: AutomationEmailConfig[], sendTo: string) => {
  emails.forEach(({ sendDelay, subject, body, from }) => {
    const template = 'default'
    const today = new Date(Date.now())
    today.setHours(today.getHours() + sendDelay) // TDDO: problem here. what happens with 10:59 + 1 will be 11
    const time = generateDateKey(today)
    const sendFrom = from

    addScheduledMessage(time, { template, sendFrom, sendTo, subject, body })
  })
}

const runAutomation = (automation: string, sendTo: string) => {
  if (!loadedAutomations || isEmpty(loadedAutomations)) {
    throw new Error('No automation configuration found. Run the init first: init()')
  }
  const messagesInAutomation = loadedAutomations.find((message) => message.name === automation)
  if (messagesInAutomation) {
    build(messagesInAutomation.emails, sendTo)
  }
}

export { init, runAutomation }
