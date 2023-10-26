const {BASE_URL, AI_DEVS_API_KEY} = Bun.env
if (!BASE_URL || !AI_DEVS_API_KEY) {
  throw new Error('BASE_URL or API_KEY is not defined')
}

enum StatusCode {
  Ok = 0,
  WrongApiKey = -3,
  IncorrectAnswer = -777,
}

type GetTokenResponse =
  | {
      code: StatusCode.Ok
      msg: string
      token: string
    }
  | {
      code: StatusCode.WrongApiKey
      msg: string
    }

type GetTaskResponse = {
  code: StatusCode
  msg: string
}

type SendAnswerResponse =
  | {
      code: StatusCode.Ok
      msg: string
      note: string
    }
  | {code: StatusCode.IncorrectAnswer; msg: string}

export async function createUtils(taskName: string) {
  const log = createLog(taskName)

  let token = await getToken(taskName)
  if (!token) {
    throw new Error('Failed to get token')
  }
  log.info(`🔑 TOKEN: "${token}"`)

  return {
    getTask: async <TTaskData>() => {
      try {
        const task = await getTask<TTaskData>(token)
        log.info(`📝 TASK: "${task.msg}"`)
        log.info(`📝 DATA: \n${JSON.stringify(task, null, 2)}`)
        return task
      } catch (e: any) {
        log.error(`Failed to get task`)
        log.error(e.message)
        process.exit(1)
      }
    },
    sendAnswer: async (answer: string | number[]) => {
      if (!token) {
        throw new Error('You must call getToken() before sendAnswer()')
      }
      try {
        const response = await sendAnswer(token, answer)
        log.info(`✅ ANSWER ACCEPTED!`)
        log.info(`✅ MESSAGE: \n${JSON.stringify(response, null, 2)}`)
      } catch (e: any) {
        log.error(`Failed to send answer`)
        log.error(e.message)
        process.exit(1)
      }
    },
  }
}

async function getToken(taskName: string) {
  const response = await fetch(`${BASE_URL}/token/${taskName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({apikey: AI_DEVS_API_KEY}),
  })

  const data = (await response.json()) as GetTokenResponse

  if (data.code !== StatusCode.Ok) {
    throw new Error(data.msg)
  }

  return data.token
}

async function getTask<TTaskData>(token: string) {
  const response = await fetch(`${BASE_URL}/task/${token}`, {
    method: 'GET',
  })

  const data = (await response.json()) as GetTaskResponse

  if (data.code !== StatusCode.Ok) {
    throw new Error(data.msg)
  }

  return data as TTaskData & GetTaskResponse
}

async function sendAnswer(token: string, answer: string | number[]) {
  const response = await fetch(`${BASE_URL}/answer/${token}`, {
    method: 'POST',
    body: JSON.stringify({answer}),
  })

  const data = (await response.json()) as SendAnswerResponse

  if (data.code !== StatusCode.Ok) {
    throw new Error(data.msg)
  }

  return data
}

function createLog(taskName: string) {
  return {
    info: (msg: string) => console.log(`[${taskName}] ${msg}`),
    error: (msg: string) => console.error(`[${taskName}] ${msg}`),
  }
}
