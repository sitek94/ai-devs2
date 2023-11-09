import {AIDevs} from '@/utils/ai-devs'

const aidevs = await AIDevs.init('rodo')

await aidevs.sendAnswer(
  `Tell me about yourself using placeholders to keep privacy. 

  Placeholders:
  - %imie% - your name
  - %nazwisko% - your surname
  - %zawod% - your profession
  - %miasto% - your city
`,
)
