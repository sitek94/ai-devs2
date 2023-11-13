import {ChatOpenAI} from 'langchain/chat_models/openai'
import {HumanMessage, SystemMessage} from 'langchain/schema'

import {AIDevs} from '@/utils/ai-devs'
import {doYouWantToContinue} from '@/utils/cli'
import {getCurrentExchangeRate} from '@/utils/nbp'
import {getSingleToolCall} from '@/utils/openai'
import {getCountryPopulation} from '@/utils/rest-countries'

const chat = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo',
}).bind({
  tool_choice: 'auto',
  tools: [
    {
      type: 'function',
      function: {
        name: 'get_exchange_rate',
        description: 'Get the exchange rate for a currency',
        parameters: {
          type: 'object',
          properties: {
            currency_code: {
              type: 'string',
              description: 'The currency code to get the exchange rate for',
            },
          },
          required: ['currency_code'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_population',
        description: 'Get the population for a country',
        parameters: {
          type: 'object',
          properties: {
            country_name: {
              type: 'string',
              description: 'English country name to get the population for',
            },
          },
          required: ['country_name'],
        },
      },
    },
  ],
})

const aidevs = await AIDevs.init<{question: string}>('knowledge')

await doYouWantToContinue()

const result = await chat.invoke([
  new SystemMessage(`Answer super briefly:`),
  new HumanMessage(aidevs.task.question),
])

const tool = getSingleToolCall<'get_exchange_rate' | 'get_population'>(result)

switch (tool.name) {
  case 'get_exchange_rate': {
    const currencyCode = tool.arguments.currency_code
    const exchangeRate = await getCurrentExchangeRate(currencyCode)

    aidevs.sendAnswer(
      `Current exchange rate for ${currencyCode} is ${exchangeRate}`,
    )
    break
  }

  case 'get_population': {
    const countryName = tool.arguments.country_name
    const population = await getCountryPopulation(countryName.toLowerCase())

    aidevs.sendAnswer(`Population of ${countryName} is ${population}`)
    break
  }

  default: {
    aidevs.sendAnswer(result.content)
  }
}
