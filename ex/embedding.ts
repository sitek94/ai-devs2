import {OpenAIEmbeddings} from 'langchain/embeddings/openai'

import {AIDevs} from '@/utils/ai-devs'

const aidevs = await AIDevs.init<unknown>('embedding')

const sentence = 'I like Hawaiian pizza'

const openai = new OpenAIEmbeddings({
  modelName: 'text-embedding-ada-002',
})

const embedding = await openai.embedQuery(sentence)

console.log(embedding)

await aidevs.sendAnswer(embedding)
