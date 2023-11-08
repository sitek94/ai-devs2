import {ChatOpenAI} from 'langchain/chat_models/openai'
import {SystemMessage} from 'langchain/schema'

import {AIDevs} from '@/utils/ai-devs'

const aidevs = await AIDevs.init<{hint: string}>('whoami')

const chat = new ChatOpenAI()

run([aidevs.task.hint])

async function run(hints: string[]) {
  const facts = hints.map(hint => `- ${hint}`).join('\n')

  const {content: answer} = await chat.call([
    new SystemMessage(`Guess who is described person using the following facts:
      ${facts}

      If you're 100% sure return ONLY the name of the person
      Else return FALSE
    `),
  ])

  try {
    if (answer === 'FALSE') {
      aidevs.logger.info(`🤔 Still not sure... Here's what I know:\n${facts}`)
      throw new Error()
    }

    await aidevs.sendAnswer(answer)
  } catch {
    let newHint = await aidevs.getHint()

    while (hints.includes(newHint)) {
      newHint = await aidevs.getHint()
    }

    run([...hints, newHint])
  }
}
