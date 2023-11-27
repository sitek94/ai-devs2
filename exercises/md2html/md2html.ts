import {AIDevs} from '@/utils/ai-devs'
import {doYouWantToContinue} from '@/utils/cli'

const aidevs = await AIDevs.init('md2html')

await doYouWantToContinue()

await aidevs.sendAnswer(`https://${Bun.env.NGROK_DOMAIN}`!)
