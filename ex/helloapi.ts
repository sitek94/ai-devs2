import {AIDevs} from '@/utils/ai-devs'

const aidevs = await AIDevs.initialize<{cookie: string}>('helloapi')

await aidevs.sendAnswer(aidevs.task.cookie)
