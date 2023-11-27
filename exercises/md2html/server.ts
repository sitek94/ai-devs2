import {ChatOpenAI} from 'langchain/chat_models/openai'
import {HumanMessage, SystemMessage} from 'langchain/schema'

import {log} from '@/utils/log'
import {Model} from '@/utils/openai'

const chat = new ChatOpenAI({
  // Use fine-tuned gpt-3.5-turbo-1106 model that was pre-trained using `./md2html-dataset.json` dataset.
  modelName: Model.GPT_3_5_TURBO_1106_MARKDOWN_TO_HTML,
})

// Start local server
Bun.serve({
  port: 3000,
  async fetch(request) {
    const {question} = (await request.json()) as {question: string}

    log({question})

    const {content: reply} = await chat.invoke([
      new SystemMessage(`convert markdown to html`),
      new HumanMessage(question),
    ])

    log({reply})

    return new Response(JSON.stringify({reply}), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },
})

// Start ngrok
Bun.spawn(['bun', 'ngrok'])
