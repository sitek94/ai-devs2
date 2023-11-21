import {ChatOpenAI} from 'langchain/chat_models/openai'
import {HumanMessage} from 'langchain/schema'

import {Model} from '@/utils/openai'

const db = await Bun.file('./exercises/optimaldb/db.json').json<
  Record<string, string[]>
>()

const optimizedDb = {} as Record<string, string[]>

for (const [personName, facts] of Object.entries(db)) {
  const summarizedFacts = await summarize(facts)

  optimizedDb[personName] = summarizedFacts
}

Bun.write(
  './exercises/optimaldb/optimized-db.json',
  JSON.stringify(optimizedDb),
)

async function summarize(facts: string[]) {
  const chat = new ChatOpenAI({
    modelName: Model.GPT_3_5_TURBO_LATEST,
  }).bind({
    tool_choice: {
      type: 'function',
      function: {
        name: 'summarize',
      },
    },
    tools: [
      {
        type: 'function',
        function: {
          name: 'summarize',
          description: `Summarize facts as much as possible without loosing information and without including person name

Example:
User: "W wolnych chwilach Ania prowadzi kanal; na YouTube, gdzie dzieli sie; poradami z zakresu beauty."
AI: "Prowadzi kanal YouTube o tematyce beauty"
User: "Każdego lata Ania odbywa staż w renomowanej kancelarii prawnej, zdobywając cenne doświadczenie."
AI: "Każdego lata ma staż w kancelarii prawnej"`,
          parameters: {
            type: 'object',
            properties: {
              facts: {
                type: 'array',
                items: {
                  type: 'string',
                  description: 'Summarized facts',
                },
              },
            },
            required: ['facts'],
          },
        },
      },
    ],
  })

  const result = await chat.invoke([new HumanMessage(facts.join('\n'))])

  const toolCall = result.additional_kwargs.tool_calls?.[0]

  if (!toolCall) {
    throw new Error('No tool call')
  }

  const args = JSON.parse(toolCall.function.arguments) as {
    facts: string[]
  }

  return args.facts
}
