import {add, nextDay, Day} from 'date-fns'
import {ChatOpenAI} from 'langchain/chat_models/openai'
import {HumanMessage} from 'langchain/schema'
import {ChatCompletionTool} from 'openai/resources/index.mjs'

/**
 * 🚨
 * This example does not cover all cases, for more in depth guide on
 * how to deal with relative dates, check the following:
 * https://github.com/dair-ai/Prompt-Engineering-Guide/blob/main/guides/prompts-applications.md
 */

const DAYS_OF_WEEK = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

const chat = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo',
}).bind({
  tool_choice: {
    type: 'function',
    function: {
      name: 'get_future_date',
    },
  },
  tools: [getFutureDateFunctionSchema()],
})

const result = await chat.invoke([
  new HumanMessage(`I've got a doctor appointment on first sunday next month`),
])

const toolCalls = result.additional_kwargs.tool_calls
if (!toolCalls) {
  throw new Error(
    'No tool calls, improve the prompt, or be more specific in your message',
  )
}

const toolCall = toolCalls[0]
const args = parseArguments(toolCall.function.arguments)

const futureDate = getFutureDate(args)

console.log(`Your appointment is on ${futureDate}`)

// ============================================================================
// UTILS
// ============================================================================

function getFutureDate({
  timeUnit,
  timeValue,
  dayOfWeek,
}: ReturnType<typeof parseArguments>) {
  console.log('Received arguments:', {timeUnit, timeValue, dayOfWeek})

  const today = new Date()
  const dateAhead = add(today, {
    [timeUnit]: timeValue,
  })

  console.log('Date ahead:', dateAhead)

  const target = nextDay(dateAhead, DAYS_OF_WEEK[dayOfWeek] as Day)

  console.log('Target:', target)

  return target
}

function parseArguments(json: string) {
  const args = JSON.parse(json)

  return {
    dayOfWeek: args.week_day as keyof typeof DAYS_OF_WEEK,
    timeUnit: args.time_unit as 'day' | 'week' | 'month' | 'year',
    timeValue: args.time_value as number,
  }
}

function getFutureDateFunctionSchema() {
  return {
    type: 'function',
    function: {
      name: 'get_future_date',
      description:
        'Calculate future date based on relative date in user message',
      parameters: {
        type: 'object',
        properties: {
          week_day: {
            type: 'string',
            enum: Object.keys(DAYS_OF_WEEK),
            description: 'Specific day of the week to get the date for',
          },
          time_unit: {
            type: 'string',
            enum: ['days', 'weeks', 'months', 'years'],
            description: 'The time unit to use',
          },
          time_value: {
            type: 'integer',
            description: 'The number of time units to use',
          },
        },
        required: [
          'day_of_week',
          'days_ahead',
          'weeks_ahead',
          'months_ahead',
          'years_ahead',
        ],
      },
    },
  } satisfies ChatCompletionTool
}
