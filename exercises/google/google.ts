import {AIDevs} from '@/utils/ai-devs'
import {doYouWantToContinue} from '@/utils/cli'

const aidevs = await AIDevs.init('google')

await doYouWantToContinue()

await aidevs.sendAnswer(`https://${Bun.env.NGROK_DOMAIN}`!)
