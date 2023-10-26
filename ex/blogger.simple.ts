import {AIDevs} from '@/utils/ai-devs'
import {OpenAI} from 'langchain/llms/openai'
import {PromptTemplate} from 'langchain/prompts'

const aidevs = await AIDevs.initialize<{blog: string[]}>('blogger')

const systemTemplate = `
Generate paragraph for each of the blog post section titles below:
{outline}

Return ONLY paragraphs, no section titles.

Return JSON array of paragraphs, like so:
["paragraph about section 1", "paragraph about section 2", ...]
`

const prompt = PromptTemplate.fromTemplate(systemTemplate)

const formattedPrompt = await prompt.format({
  outline: aidevs.task.blog.map(line => '-' + line + '\n').join(''),
})

const llm = new OpenAI({
  modelName: 'gpt-3.5-turbo',
})

const json = await llm.call(formattedPrompt)

try {
  const answer = JSON.parse(json)

  await aidevs.sendAnswer(answer)
} catch (e: any) {
  console.error(e.message)
  console.log(json)
}
