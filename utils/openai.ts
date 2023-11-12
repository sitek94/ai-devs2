import {OpenAIEmbeddings} from 'langchain/embeddings/openai'

const embeddings = new OpenAIEmbeddings({maxConcurrency: 5})

export async function createDocumentEmbedding(input: string) {
  return (await embeddings.embedDocuments([input]))[0]
}

export async function createQueryEmbedding(query: string) {
  return embeddings.embedQuery(query)
}
