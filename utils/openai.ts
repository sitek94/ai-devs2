import {OpenAIEmbeddings} from 'langchain/embeddings/openai'
import {BaseMessageChunk} from 'langchain/schema'

const embeddings = new OpenAIEmbeddings({maxConcurrency: 5})

export enum Model {
  GPT_4_TURBO_LATEST = 'gpt-4-1106-preview',
  GPT_3_5_TURBO_LATEST = 'gpt-3.5-turbo-1106',
  GPT_3_5_TURBO_1106_MARKDOWN_TO_HTML = 'ft:gpt-3.5-turbo-1106:personal::8PfIBCCY',
}

export async function createDocumentEmbedding(input: string) {
  return (await embeddings.embedDocuments([input]))[0]
}

export async function createQueryEmbedding(query: string) {
  return embeddings.embedQuery(query)
}

export function getSingleToolCall<T>(message: BaseMessageChunk) {
  const toolCalls = message.additional_kwargs.tool_calls
  if (!toolCalls) {
    return {
      name: '' as const,
    }
  }

  if (toolCalls.length > 1) {
    throw new Error('Multiple tool calls are not supported')
  }

  const toolCall = toolCalls[0]
  const args = JSON.parse(toolCall.function.arguments)

  return {
    name: toolCall.function.name as T,
    arguments: args,
  }
}
