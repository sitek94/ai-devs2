import {format} from 'date-fns'
import {ChatOpenAI} from 'langchain/chat_models/openai'
import {HumanMessage, SystemMessage} from 'langchain/schema'
import {ChatCompletionTool} from 'openai/resources/index.mjs'

import {AIDevs} from '@/utils/ai-devs'
import {doYouWantToContinue} from '@/utils/cli'
import {getSingleToolCall} from '@/utils/openai'

const tools = [
  {
    type: 'function',
    function: {
      name: 'add_task' as const,
      description: 'Add normal task',
      parameters: {
        type: 'object',
        properties: {
          desc: {
            type: 'string',
            description: 'Task description',
          },
        },
        required: ['desc'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_task_to_calendar' as const,
      description: 'Add date constrained task',
      parameters: {
        type: 'object',
        properties: {
          desc: {
            type: 'string',
            description: 'Task description',
          },
          date: {
            type: 'string',
            description: 'Date of the event',
            format: 'YYYY-MM-DD',
          },
        },
        required: ['desc', 'date'],
      },
    },
  },
] satisfies ChatCompletionTool[]

type ToolName = (typeof tools)[number]['function']['name']

const chat = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo',
}).bind({
  tool_choice: 'auto',
  tools,
})

const aidevs = await AIDevs.init<{question: string}>('tools')

await doYouWantToContinue()

const result = await chat.invoke([
  new SystemMessage(`Today is ${format(new Date(), 'yyyy-MM-dd')}`),
  new HumanMessage(aidevs.task.question),
])

const tool = getSingleToolCall<ToolName>(result)

switch (tool.name) {
  case 'add_task': {
    const desc = tool.arguments.desc

    await aidevs.sendAnswer({tool: 'ToDo', desc})
    break
  }

  case 'add_task_to_calendar': {
    const desc = tool.arguments.desc
    const date = tool.arguments.date

    await aidevs.sendAnswer({tool: 'Calendar', desc, date})
    break
  }

  default: {
    throw new Error(`Unhandled tool: ${tool}`)
  }
}
