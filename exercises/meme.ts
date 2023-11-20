import {AIDevs} from '@/utils/ai-devs'
import {renderMeme} from '@/utils/render-form'

const aidevs = await AIDevs.init<{image: string; text: string}>('meme')

const response = await renderMeme({
  template: 'meme',
  text: aidevs.task.text,
  imageUrl: aidevs.task.image,
})

await aidevs.sendAnswer(response.href)
