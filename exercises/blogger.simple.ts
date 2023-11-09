import {OpenAI} from 'langchain/llms/openai'
import {PromptTemplate} from 'langchain/prompts'

import {AIDevs} from '@/utils/ai-devs'

const aidevs = await AIDevs.init<{blog: string[]}>('blogger')

const systemTemplate = `
Generate Polish blog post from the outline below:
{outline}

Return JSON({jsonSchema})
`

const prompt = PromptTemplate.fromTemplate(systemTemplate)

const formattedPrompt = await prompt.format({
  outline: aidevs.task.blog.map(line => '-' + line + '\n').join(''),
  jsonSchema: '[{header:string;content:string}]',
})

const llm = new OpenAI({
  modelName: 'gpt-3.5-turbo',
  maxTokens: 1000,
})

const json = await llm.call(formattedPrompt)

try {
  const response = JSON.parse(json) as {header: string; content: string}[]
  const answer = response.map(({content}) => content)

  await aidevs.sendAnswer(answer)
} catch (e: any) {
  console.error(e.message)
  console.log(json)
}
