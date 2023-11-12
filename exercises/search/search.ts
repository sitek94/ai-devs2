import {ChatOpenAI} from 'langchain/chat_models/openai'
import {OpenAIEmbeddings} from 'langchain/embeddings/openai'
import {HumanMessage, SystemMessage} from 'langchain/schema'

import {AIDevs} from '@/utils/ai-devs'

import {db} from './init-db'
import {vectorDb} from './vector-db'

const aiDevsCollection = await vectorDb.aidevs.getCollection()

if (!aiDevsCollection.isIndexed) {
  await vectorDb.aidevs.indexData()
}

const aidevs = await AIDevs.init<{question: string}>('search')

// Convert the question to an embedding, so that we can search for it in the
// vector database.
const embeddings = new OpenAIEmbeddings({maxConcurrency: 5})
const queryEmbedding = await embeddings.embedQuery(aidevs.task.question)

// Search for the most similar link in the vector database.
const searchResult = await vectorDb.aidevs.search(queryEmbedding)
aidevs.logger.data('🔎 Similarity search result:', searchResult)

// Get matching link from the database - records in the vector database
// and the database are linked by the same ID. This way we can get the
// full link data.
const link = db.links.findOne(searchResult.id)
aidevs.logger.data('💾 Link from DB:', link)

// ⚠️ It's not the part of the exercise, I'm just adding additional step for practice.
// Get the answer from the chat model by providing the link info as context.
const chat = new ChatOpenAI()
const response = await chat.call([
  new SystemMessage(`Answer question using the context below and nothing more:
    context###${link.info}###
  `),
  new HumanMessage(aidevs.task.question),
])
aidevs.logger.data('💬 Chat response:', response.content)

// Send the answer to the AI Devs platform.
aidevs.sendAnswer(link.url)
