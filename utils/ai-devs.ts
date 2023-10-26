const {BASE_URL, AI_DEVS_API_KEY} = Bun.env
if (!BASE_URL || !AI_DEVS_API_KEY) {
  throw new Error('BASE_URL or AI_DEVS_API_KEY is not defined')
}

enum StatusCode {
  Ok = 0,
  WrongApiKey = -3,
  IncorrectAnswer = -777,
}

type BaseResponse = {
  code: StatusCode
  msg: string
}

export class AIDevs {
  private logger = {
    info: (msg: string) => console.log(`[${this.taskName}] ${msg}`),
    error: (msg: string) => console.error(`[${this.taskName}] ${msg}`),
  }

  constructor(private taskName: string) {}

  static async initialize<TData>(taskName: string) {
    const aidevs = new AIDevs(taskName)
    const token = await aidevs.getToken()
    const task = await aidevs.getTask<TData>(token)

    return {
      task,
      sendAnswer: (answer: string | string[] | number[]) =>
        aidevs.sendAnswer(token, answer),
    }
  }

  private async fetch<TData>({
    endpoint,
    ...options
  }: {endpoint: string} & RequestInit) {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    const data = (await response.json()) as BaseResponse

    if (data.code !== StatusCode.Ok) {
      throw new Error(data.msg)
    }

    return data as TData & BaseResponse
  }

  private async getToken() {
    try {
      const {token} = await this.fetch<{token: string}>({
        method: 'POST',
        endpoint: `token/${this.taskName}`,
        body: JSON.stringify({apikey: AI_DEVS_API_KEY}),
      })
      this.logger.info(`🔑 TOKEN: "${token}"`)

      return token
    } catch (e: any) {
      this.handleError(e, 'get token')
    }
  }

  private async getTask<TData>(token: string) {
    try {
      const response = await this.fetch<TData>({
        method: 'GET',
        endpoint: `task/${token}`,
      })
      this.logger.info(`📝 TASK: "${response.msg}"`)
      this.logger.info(`📝 DATA: \n${JSON.stringify(response, null, 2)}`)

      return response
    } catch (e: any) {
      this.handleError(e, 'get task')
    }
  }

  private async sendAnswer(
    token: string,
    answer: string | string[] | number[],
  ) {
    try {
      const response = await this.fetch({
        method: 'POST',
        endpoint: `answer/${token}`,
        body: JSON.stringify({answer}),
      })
      this.logger.info(`✅ ANSWER ACCEPTED!`)
      this.logger.info(`✅ MESSAGE: \n${JSON.stringify(response, null, 2)}`)

      return response
    } catch (e: any) {
      this.handleError(e, 'send answer')
    }
  }

  private handleError(e: any, description: string): never {
    this.logger.error(`Failed to ${description}`)
    this.logger.error(e.message)
    process.exit(1)
  }
}
