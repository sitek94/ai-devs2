import {createUtils} from '@/utils/ai-devs'
import {OpenAI} from 'langchain/llms/openai'
import {PromptTemplate} from 'langchain/prompts'

const utils = await createUtils('blogger')
const task = await utils.getTask<{blog: string[]}>()

const systemTemplate = `
Create JSON array with paragraph for each of the sections below:
{outline}

Don't include the sections themselves in the answer.

example###
"["paragraph about section 1", "paragraph about section 2", ...]"
###
`

const prompt = PromptTemplate.fromTemplate(systemTemplate)

const formattedPrompt = await prompt.format({
  outline: task.blog.map(line => '-' + line + '\n').join(''),
})

const llm = new OpenAI({
  modelName: 'gpt-3.5-turbo',
})

const json = await llm.call(formattedPrompt)

const answer = JSON.parse(json)

await utils.sendAnswer(answer)
