import {createUtils} from '@/utils/ai-devs'
import {OpenAIModerationChain} from 'langchain/chains'
import OpenAI from 'openai'

const utils = await createUtils('moderation')

const task = await utils.getTask<{input: string[]}>()

const moderationChain = new OpenAIModerationChain()

const moderations = (await moderationChain.invoke({
  input: task.input,
})) as OpenAI.ModerationCreateResponse

const answer = moderations.results.map(result => (result.flagged ? 1 : 0))

await utils.sendAnswer(answer)
