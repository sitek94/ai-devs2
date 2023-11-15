import OpenAI from 'openai'

import {AIDevs} from '@/utils/ai-devs'
import {doYouWantToContinue} from '@/utils/cli'

const aidevs = await AIDevs.init<{url: string}>('gnome')

const openai = new OpenAI()

const imageResponse = await fetch(aidevs.task.url)
const buffer = await imageResponse.arrayBuffer()
const base64 = Buffer.from(buffer).toString('base64')
const url = `data:image/jpeg;base64,${base64}`

await doYouWantToContinue()

const visionResponse = await openai.chat.completions.create({
  model: 'gpt-4-vision-preview',
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'IF there is a hat return only its color in Polish ELSE return ERROR',
        },
        {
          type: 'image_url',
          image_url: {
            url,
          },
        },
      ],
    },
  ],
})

const visionAnswer = visionResponse.choices[0].message.content

await aidevs.sendAnswer(visionAnswer!)
