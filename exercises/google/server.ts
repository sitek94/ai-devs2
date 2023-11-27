import {ChatOpenAI} from 'langchain/chat_models/openai'
import {HumanMessage, SystemMessage} from 'langchain/schema'

import {log} from '@/utils/log'
import {Model} from '@/utils/openai'
import {serpApi} from '@/utils/serp-api'

const chat = new ChatOpenAI({
  modelName: Model.GPT_3_5_TURBO_LATEST,
})

// Start local server
Bun.serve({
  port: 3000,
  async fetch(request) {
    const {question} = (await request.json()) as {question: string}

    log({question})

    // Generate good query for SarpAPI from user question
    const {content: googleSearchQuery} = await chat.invoke([
      new SystemMessage(`Return ONLY Google search query for the question`),
      new HumanMessage(`Question: ${question}`),
    ])

    log({googleSearchQuery})

    // Search Google using SerpAPI
    const searchResults = await serpApi.search({
      query: googleSearchQuery as string,
    })

    const firstResult = searchResults[0]

    log({firstResult})

    return new Response(JSON.stringify({reply: firstResult.link}), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },
})

// Start ngrok
Bun.spawn(['bun', 'ngrok'])
