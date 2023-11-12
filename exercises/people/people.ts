import {ChatOpenAI} from 'langchain/chat_models/openai'
import {HumanMessage, SystemMessage} from 'langchain/schema'

import {AIDevs} from '@/utils/ai-devs'
import {db} from '@/utils/db'
import {createQueryEmbedding} from '@/utils/openai'
import {VectorCollection} from '@/utils/vector-db'

const aidevs = await AIDevs.init<{question: string}>('people')

// Get all people from the database.
const people = await db.person.findMany()

// Initialize the vector collection.
const vectorCollection = new VectorCollection('ai-devs_people')
const isIndexed = await vectorCollection.isIndexed()

if (!isIndexed) {
  vectorCollection.indexData({
    data: people,
    // Embedding is created using the person's first and last name.
    getEmbeddingInput: person => `${person.firstName} ${person.lastName}`,

    // For metadata we only use the person's ID, to be able to link the
    // person's data from the vector database with the person's data from DB.
    getEmbeddingPayload: person => ({
      id: person.id,
    }),
  })
}

// Generate embedding from the question.
const questionEmbedding = await createQueryEmbedding(aidevs.task.question)
aidevs.logger.info('📐 Created question embedding')

// Search for the most similar person.
const searchResult = await vectorCollection.search(questionEmbedding)
aidevs.logger.data('🔎 Searched for the most similar person', searchResult)

// Get the person from the database using the ID from the vector database.
const person = await db.person.findFirst({
  where: {id: searchResult.id},
})
aidevs.logger.data('👤Found matching person', person)

if (!person) {
  throw new Error(`Person with ID ${searchResult.id} not found`)
}

const system = `Answer question using the context below and nothing more:
  context###
  name: ${person.firstName} ${person.lastName}
  age: ${person.age}
  bio: ${person.bio}
  favorite Kapitan Bomba character: ${person.favoriteCharacter}
  favorite show: ${person.favoriteShow}
  favorite movie: ${person.favoriteMovie}
  favorite color: ${person.favoriteColor}
  ###
`

// Get the answer from the chat model by providing the person info as context.
const chat = new ChatOpenAI()
const response = await chat.call([
  new SystemMessage(system),
  new HumanMessage(aidevs.task.question),
])

// Send the answer to the AI Devs platform.
await aidevs.sendAnswer(response.content)
