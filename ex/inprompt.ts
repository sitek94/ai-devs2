import {ChatOpenAI} from 'langchain/chat_models/openai'
import {Document} from 'langchain/document'
import {HumanMessage, SystemMessage} from 'langchain/schema'

import {AIDevs} from '@/utils/ai-devs'

const aidevs = await AIDevs.init<{input: string[]; question: string}>(
  'inprompt',
)

const documents = aidevs.task.input.map(
  sentence =>
    new Document({
      pageContent: sentence,
      metadata: {
        // Assume the input is a sentence and the name is the first word
        name: sentence.split(' ')[0],
      },
    }),
)

const name = aidevs.task.question.split(' ').reverse()[0].replace('?', '')
const context = documents.find(doc => doc.metadata.name === name)!.pageContent

const model = new ChatOpenAI()

const response = await model.call([
  new SystemMessage(`Answer question using the context below and nothing more:
    context###${context}###
  `),
  new HumanMessage(aidevs.task.question),
])

aidevs.sendAnswer(response.content)
