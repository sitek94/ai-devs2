import {AIDevs} from '@/utils/ai-devs'
import {LLMChain} from 'langchain/chains'
import {OpenAI} from 'langchain/llms/openai'
import {
  OutputFixingParser,
  StructuredOutputParser,
} from 'langchain/output_parsers'
import {PromptTemplate} from 'langchain/prompts'
import {z} from 'zod'

const aidevs = await AIDevs.initialize<{blog: string[]}>('blogger')

const chatModel = new OpenAI({
  modelName: 'gpt-3.5-turbo',
})

/**
 * Output parsers usage with LLMs as described:
 * https://js.langchain.com/docs/modules/model_io/output_parsers/how_to/use_with_llm_chain
 */
const outputParser = StructuredOutputParser.fromZodSchema(z.array(z.string()))
const outputFixingParser = OutputFixingParser.fromLLM(chatModel, outputParser)

const systemTemplate = `
Generate paragraph for each of the blog post section titles below:
{outline}

Return ONLY paragraphs, no section titles.

{format_instructions}
`

const prompt = new PromptTemplate({
  template: systemTemplate,
  inputVariables: ['outline'],
  partialVariables: {
    format_instructions: outputFixingParser.getFormatInstructions(),
  },
})

const answerFormattingChain = new LLMChain({
  llm: chatModel,
  prompt,
  outputKey: 'blog',
  outputParser: outputFixingParser,
})

const {blog} = await answerFormattingChain.call({
  outline: aidevs.task.blog.map(line => '-' + line + '\n').join(''),
})

await aidevs.sendAnswer(blog)
