import {QdrantClient} from '@qdrant/js-client-rest'
import {OpenAIEmbeddings} from 'langchain/embeddings/openai'

import {db} from './db'

const COLLECTION_NAME = `ai-devs_search`
const NUMBER_OF_LINKS_TO_INDEX = 300

const embeddings = new OpenAIEmbeddings({maxConcurrency: 5})
const qdrant = new QdrantClient({url: Bun.env.QDRANT_URL})

export const vectorDb = {
  aidevs: {
    getCollection: getAiDevsCollection,
    indexData: indexAiDevsData,
    search: searchAiDevsCollection,
  },
}

async function getAiDevsCollection() {
  const collection = await qdrant.getCollection(COLLECTION_NAME)
  if (!collection) {
    console.log(`Collection doesn't exist. Creating new collection...`)

    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: {size: 1536, distance: 'Cosine', on_disk: true},
    })
  }

  return {
    ...collection,
    isIndexed: collection.points_count > 0,
  }
}

async function indexAiDevsData() {
  console.log('Indexing data...')

  const links = db.links.findAll({
    limit: NUMBER_OF_LINKS_TO_INDEX,
  })

  const points = []

  for (const link of links) {
    try {
      const [embedding] = await embeddings.embedDocuments([link.info])
      points.push({
        id: link.id,
        payload: {title: link.title, source: COLLECTION_NAME},
        vector: embedding,
      })
    } catch (error) {
      console.log(error)
    }
  }

  try {
    await qdrant.upsert(COLLECTION_NAME, {
      wait: true,
      batch: {
        ids: points.map(point => point.id),
        vectors: points.map(point => point.vector),
        payloads: points.map(point => point.payload),
      },
    })
  } catch (error) {
    console.debug(error)
  }
}

async function searchAiDevsCollection(embedding: number[]) {
  const results = await qdrant.search(COLLECTION_NAME, {
    vector: embedding,
    limit: 1,
    filter: {
      must: [
        {
          key: 'source',
          match: {
            value: COLLECTION_NAME,
          },
        },
      ],
    },
  })
  const result = results[0]

  return result as typeof result & {id: string}
}
