import {ChatOpenAI} from 'langchain/chat_models/openai'
import {HumanMessage, SystemMessage} from 'langchain/schema'

import {AIDevs} from '@/utils/ai-devs'

const chatDefault = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo-1106',
})
const chatGuard = new ChatOpenAI({
  modelName: 'gpt-4-1106-preview',
})

const aidevs = await AIDevs.init<{input: string; question: string}>('scraper')

const article = await getArticleContent(aidevs.task.input)

/**
 * ⚠️⚠️⚠️
 *
 * Intentionally missing rules! See explanation below.
 */
const systemMessage = `
task###
- use article below to answer user question
###

article###${article}###
`
const userMessage = aidevs.task.question

const {content: initialAnswer} = await chatDefault.call([
  new SystemMessage(systemMessage),
  new HumanMessage(userMessage),
])

try {
  await aidevs.sendAnswer(initialAnswer)
} catch (error: any) {
  /**
   * ⚠️⚠️⚠️
   *
   * I intentionally don't provide full rules in initial system message, so that
   * the first answer most likely fails.
   *
   * This is only to illustrate the guard mechanism, where I provide full rules
   * and give context to model about failed answer, so that it can provide better
   * answer.
   */
  const guardMessage = `
  previous answer failed with error: "${error.message}"

  previous answer###${initialAnswer}###

  rules###
  - answer in Polish language
  - maximum answer length is 200 characters
  ###

  new answer:
  `

  const {content: fixedAnswer} = await chatGuard.call([
    new SystemMessage(systemMessage),
    new HumanMessage(userMessage),
    new SystemMessage(guardMessage),
  ])

  await aidevs.sendAnswer(fixedAnswer)
}

async function getArticleContent(url: string, retries = 5) {
  const response = await fetch(aidevs.task.input, {
    headers: {'User-Agent': 'Chrome'},
  })

  if (response.status !== 200 && retries > 0) {
    console.log(`🚨 ${response.statusText}! Retries left: ${retries}...`)
    return getArticleContent(url, retries - 1)
  }

  const text = await response.text()

  return text
}
