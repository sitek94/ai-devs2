import {AIDevs} from '@/utils/ai-devs'

const aidevs = await AIDevs.init('functions')

export const schema = {
  name: 'addUser',
  description: 'Add a new user',
  parameters: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      surname: {
        type: 'string',
      },
      year: {
        type: 'number',
      },
    },
    required: ['name', 'surname', 'year'],
  },
}

await aidevs.sendAnswer(schema)
