import {AIDevs} from '@/utils/ai-devs'

const aidevs = await AIDevs.init('optimaldb')

const db = await Bun.file('./exercises/optimaldb/optimized-db.json').json()

aidevs.sendAnswer(JSON.stringify(db))
