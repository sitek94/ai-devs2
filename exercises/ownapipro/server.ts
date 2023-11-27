import {ChatOpenAI} from 'langchain/chat_models/openai'
import {HumanMessage, SystemMessage, AIMessage} from 'langchain/schema'

import {Model} from '@/utils/openai'

const chat = new ChatOpenAI({
  modelName: Model.GPT_3_5_TURBO_LATEST,
})

const conversations = {} as Record<
  string,
  {
    messages: {role: 'user' | 'ai'; text: string}[]
  }
>

// Start local server
Bun.serve({
  port: 3000,
  async fetch(request) {
    const conversationId = request.headers.get('x-forwarded-for')
    if (!conversationId) {
      throw new Error('No IP address')
    }

    const {question} = (await request.json()) as {question: string}

    // 🚨
    // This is a very primitive implementation of a conversation just for the sake of the exercise.
    // In real app, it'd be better to:
    // - persist conversations in a database
    // - generate conversation ID on the server, right now it's just IP address
    // - generate summary of the conversation and attach it as the context, instead of sending all
    //   messages to the AI
    // - context could be stored in Vector Store, so that we could use similarity search to get answers
    //   to user questions
    const conversation = conversations[conversationId] || {
      messages: [],
    }

    const {content: reply} = await chat.invoke([
      new SystemMessage(`Be ultra-concise`),
      ...conversation.messages.map(({role, text}) => {
        const Message = role === 'user' ? HumanMessage : AIMessage
        return new Message(text)
      }),
      new HumanMessage(question),
    ])

    conversation.messages.push({role: 'user', text: question})
    conversation.messages.push({role: 'ai', text: String(reply)})
    conversations[conversationId] = conversation

    return new Response(JSON.stringify({reply}), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },
})

// Start ngrok
Bun.spawn(['bun', 'ngrok'])
