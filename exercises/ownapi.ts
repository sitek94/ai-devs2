import {ChatOpenAI} from 'langchain/chat_models/openai'
import {HumanMessage, SystemMessage} from 'langchain/schema'

import {AIDevs} from '@/utils/ai-devs'
import {doYouWantToContinue} from '@/utils/cli'
import {Model} from '@/utils/openai'

// ❗️❗️❗️
// Before running the exercise, ensure that you've got the following
// environment variables set:
// `NGROK_DOMAIN` - https://dashboard.ngrok.com/cloud-edge/domains/new
// `NGROK_AUTH_TOKEN` - https://dashboard.ngrok.com/get-started/your-authtoken

const chat = new ChatOpenAI({
  modelName: Model.GPT_3_5_TURBO_LATEST,
})

// Start local server
Bun.serve({
  port: 3000,
  async fetch(request) {
    const {question} = (await request.json()) as {question: string}

    const {content: reply} = await chat.invoke([
      new SystemMessage(`Be ultra-concise`),
      new HumanMessage(question),
    ])

    return new Response(JSON.stringify({reply}), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },
})

// Start ngrok
Bun.spawn(['bun', 'ngrok'])

const aidevs = await AIDevs.init('ownapi')

await doYouWantToContinue()

await aidevs.sendAnswer(`https://${Bun.env.NGROK_DOMAIN}`!)

process.exit(0)
