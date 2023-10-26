import {createUtils} from '@/utils/ai-devs'

const utils = await createUtils('helloapi')

const task = await utils.getTask<{cookie: string}>()
await utils.sendAnswer(task.cookie)
