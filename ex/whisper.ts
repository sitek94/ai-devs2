import OpenAI, {toFile} from 'openai'

import {AIDevs} from '@/utils/ai-devs'

const openai = new OpenAI()
const aidevs = await AIDevs.init('whisper')

const audioUrl = aidevs.task.msg.split('file: ')[1]

const fetchedAudioResponse = await fetch(audioUrl)
const file = await toFile(fetchedAudioResponse)

const {text: transcript} = await openai.audio.transcriptions.create({
  file,
  model: 'whisper-1',
})

await aidevs.sendAnswer(transcript)
