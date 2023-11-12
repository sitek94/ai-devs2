import {QdrantClient} from '@qdrant/js-client-rest'

import {createDocumentEmbedding} from './openai'

export class VectorCollection<TMetadata> {
  private client = new QdrantClient({url: Bun.env.QDRANT_URL})

  constructor(private collectionName: string) {}

  async isIndexed() {
    const {collections} = await this.client.getCollections()
    const exists = !!collections?.find(c => c.name === this.collectionName)

    if (!exists) {
      await this.client.createCollection(this.collectionName, {
        vectors: {size: 1536, distance: 'Cosine', on_disk: true},
      })
    }

    const collection = await this.client.getCollection(this.collectionName)

    return collection?.points_count > 0
  }

  async indexData<TDatum extends {id: string}>({
    data,
    getEmbeddingInput,
    getEmbeddingPayload,
  }: {
    data: TDatum[]
    getEmbeddingInput: (datum: TDatum) => string
    getEmbeddingPayload: (datum: TDatum) => TMetadata
  }) {
    const points = []

    for (const item of data) {
      try {
        const embeddingInput = getEmbeddingInput(item)
        const embeddingPayload = getEmbeddingPayload(item)
        const embedding = await createDocumentEmbedding(embeddingInput)

        points.push({
          id: item.id,
          payload: {
            ...embeddingPayload,
            source: this.collectionName,
          },
          vector: embedding,
        })
      } catch (error) {
        console.log(error)
      }
    }

    try {
      await this.client.upsert(this.collectionName, {
        wait: true,
        batch: {
          ids: points.map(point => point.id),
          vectors: points.map(point => point.vector),
          payloads: points.map(point => point.payload),
        },
      })
      console.log('✅ Data indexed!\n')
    } catch (error) {
      console.debug(error)
    }
  }

  async search(embedding: number[]) {
    const results = await this.client.search(this.collectionName, {
      vector: embedding,
      limit: 1,
      filter: {
        must: [
          {
            key: 'source',
            match: {
              value: this.collectionName,
            },
          },
        ],
      },
    })
    const result = results[0]

    return result as typeof result & {id: string; payload: TMetadata}
  }
}
