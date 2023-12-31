const {AI_DEVS_BASE_URL, AI_DEVS_API_KEY} = Bun.env
if (!AI_DEVS_BASE_URL || !AI_DEVS_API_KEY) {
  throw new Error('BASE_URL or AI_DEVS_API_KEY is not defined')
}

enum StatusCode {
  Ok = 0,
  WrongApiKey = -3,
  TooManyRequests = 429,
  NotAcceptable = 406,
  IncorrectAnswer = -777,
}

type AIDevsApiResponse = {
  code: StatusCode
  msg: string
  [key: string]: any
}

export class AIDevs<TTaskData> {
  public task!: TTaskData & AIDevsApiResponse
  private token!: string
  public logger = this.createLogger()

  constructor(private taskName: string) {}

  public static async init<TTaskSpecificData>(taskName: string) {
    const aidevs = new AIDevs<TTaskSpecificData & AIDevsApiResponse>(taskName)
    await aidevs.prepareTask()

    return aidevs
  }

  private async prepareTask() {
    this.token = await this.getToken()
    this.task = await this.getTask()
  }

  private async fetch<TData>({
    endpoint,
    ...options
  }: {endpoint: string} & RequestInit): Promise<TData & AIDevsApiResponse> {
    const response = await fetch(`${AI_DEVS_BASE_URL}/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (response.status === StatusCode.TooManyRequests) {
      const secondsToWait = 10

      this.logger.info(
        `🕐 Too many requests. Waiting ${secondsToWait} seconds...`,
      )

      await new Promise(resolve => setTimeout(resolve, secondsToWait * 1000))

      return this.fetch<TData>({endpoint, ...options})
    }

    if (!response.ok) {
      const description = await response.text()

      this.logger.error(
        `${response.status} ${response.statusText}: ${description}`,
      )

      process.exit(1)
    }

    return (await response.json()) as TData & AIDevsApiResponse
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

  /**
   * Used in `ex/whoami.ts` task
   */
  public async getHint() {
    const task = await this.getTask({useLogger: false})
    return (task as any).hint
  }

  private async getTask({useLogger} = {useLogger: true}) {
    try {
      const response = await this.fetch<TTaskData>({
        method: 'GET',
        endpoint: `task/${this.token}`,
      })

      if (useLogger) {
        this.logger.data(`📝 TASK PAYLOAD:`, response)
        this.logger.info(`📝 DESCRIPTION: ${response.msg}`)

        if ('question' in response) {
          this.logger.info(`📝 QUESTION: ${response.question}`)
        }
      }

      return response
    } catch (e: any) {
      this.handleError(e, 'get task')
    }
  }

  public async sendAnswer(
    answer: number | number[] | string | string[] | object,
  ) {
    return this.sendRawAnswer(JSON.stringify({answer}))
  }

  public async sendRawAnswer(answer: string) {
    this.logger.data(`📤 SENDING ANSWER:`, answer)

    try {
      const response = await this.fetch({
        method: 'POST',
        endpoint: `answer/${this.token}`,
        body: answer,
      })
      this.logger.data(`✅ ANSWER ACCEPTED!`, response)

      return response
    } catch (e: any) {
      this.handleError(e, 'send answer')
    }
  }

  /**
   * Used in `ex/liar.ts` task
   */
  public async getLiarAnswer(question: string) {
    try {
      const body = new URLSearchParams({
        question,
      })
      const response = await this.fetch<{answer: string}>({
        method: 'POST',
        endpoint: `task/${this.token}`,
        body,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      this.logger.info(`📝 QUESTION: "${question}"`)
      this.logger.data(`📝 LIAR RESPONSE:`, response)

      return response.answer
    } catch (e: any) {
      this.handleError(e, 'get liar answer')
    }
  }

  private handleError(e: any, description: string): never {
    this.logger.error(`Failed to ${description}`)
    this.logger.error(e.message)

    throw e
  }

  private createLogger() {
    const info = (msg: string) => console.log(`${msg}\n`)
    const error = (msg: string) => console.error(`${msg}\n`)
    const data = (msg: string, data: any) => {
      console.log(`${msg}`)
      console.log(JSON.stringify(data, null, 2))
      console.log()
    }

    return {
      info,
      error,
      data,
    }
  }
}
