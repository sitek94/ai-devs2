import {LLMChain} from 'langchain/chains'
import {ChatOpenAI} from 'langchain/chat_models/openai'
import {PromptTemplate} from 'langchain/prompts'

import {AIDevs} from '@/utils/ai-devs'

const aidevs = await AIDevs.init<unknown>('liar')

const chat = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo',
})

const question = 'What is capital of Poland?'
const liarAnswer = await aidevs.getLiarAnswer(question)

const template = `
question###{question}###

answer###{answer}###

Return ONLY TRUE or FALSE if answer is correct
`

const prompt = PromptTemplate.fromTemplate(template)
const chain = new LLMChain({llm: chat, prompt})

const {text: guardAnswer} = await chain.call({question, answer: liarAnswer})

const taskAnswer = guardAnswer === 'TRUE' ? 'YES' : 'NO'

await aidevs.sendAnswer(taskAnswer)
