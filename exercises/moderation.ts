import {OpenAIModerationChain} from 'langchain/chains'
import OpenAI from 'openai'

import {AIDevs} from '@/utils/ai-devs'

const aidevs = await AIDevs.init<{input: string[]}>('moderation')

const moderationChain = new OpenAIModerationChain()
const moderations = (await moderationChain.invoke({
  input: aidevs.task.input,
})) as OpenAI.ModerationCreateResponse

const answer = moderations.results.map(result => (result.flagged ? 1 : 0))

await aidevs.sendAnswer(answer)
