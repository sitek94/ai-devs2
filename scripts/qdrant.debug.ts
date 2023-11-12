import {QdrantClient} from '@qdrant/js-client-rest'

const qdrant = new QdrantClient({url: Bun.env.QDRANT_URL})

const collections = await qdrant.getCollections()

console.log(collections)
