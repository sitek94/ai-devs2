import {LLMChain} from 'langchain/chains'
import {OpenAI} from 'langchain/llms/openai'
import {
  OutputFixingParser,
  StructuredOutputParser,
} from 'langchain/output_parsers'
import {PromptTemplate} from 'langchain/prompts'
import {z} from 'zod'

import {AIDevs} from '@/utils/ai-devs'

const aidevs = await AIDevs.init<{blog: string[]}>('blogger')

const chatModel = new OpenAI({
  modelName: 'gpt-3.5-turbo',
  maxTokens: 1000,
})

const blogSchema = z.array(
  z.object({
    header: z.string(),
    content: z.string(),
  }),
)

/**
 * Output parsers usage with LLMs as described:
 * https://js.langchain.com/docs/modules/model_io/output_parsers/how_to/use_with_llm_chain
 */
const outputParser = StructuredOutputParser.fromZodSchema(blogSchema)
const outputFixingParser = OutputFixingParser.fromLLM(chatModel, outputParser)

const systemTemplate = `
Generate Polish blog post from the outline below:
{outline}

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

const output = await answerFormattingChain.call({
  outline: aidevs.task.blog.map(line => '-' + line + '\n').join(''),
})
const blog = blogSchema.parse(output.blog)

await aidevs.sendAnswer(blog.map(({content}) => content))
