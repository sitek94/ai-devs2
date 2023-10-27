const {BASE_URL, AI_DEVS_API_KEY} = Bun.env
if (!BASE_URL || !AI_DEVS_API_KEY) {
  throw new Error('BASE_URL or AI_DEVS_API_KEY is not defined')
}

enum StatusCode {
  IncorrectAnswer = -777,
  Ok = 0,
  WrongApiKey = -3,
}

type BaseResponse = {
  code: StatusCode
  msg: string
}

export class AIDevs<TTask> {
  public task!: TTask
  private token!: string
  private logger = {
    info: (msg: string) => console.log(`[${this.taskName}] ${msg}`),
    error: (msg: string) => console.error(`[${this.taskName}] ${msg}`),
  }

  constructor(private taskName: string) {}

  public static async init<TTask>(taskName: string) {
    const aidevs = new AIDevs<TTask>(taskName)
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

  private async getTask() {
    try {
      const response = await this.fetch<TTask>({
        method: 'GET',
        endpoint: `task/${this.token}`,
      })
      this.logger.info(`📝 TASK: "${response.msg}"`)
      this.logger.info(`📝 DATA: \n${JSON.stringify(response, null, 2)}`)

      return response
    } catch (e: any) {
      this.handleError(e, 'get task')
    }
  }

  public async sendAnswer(answer: number[] | string | string[]) {
    this.logger.info(`📤 SENDING ANSWER...`)
    this.logger.info(`📤 ANSWER: \n${JSON.stringify(answer, null, 2)}`)

    try {
      const response = await this.fetch({
        method: 'POST',
        endpoint: `answer/${this.token}`,
        body: JSON.stringify({answer}),
      })
      this.logger.info(`✅ ANSWER ACCEPTED!`)
      this.logger.info(`✅ MESSAGE: \n${JSON.stringify(response, null, 2)}`)

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
      const response = await this.fetch<{answer: string}>({
        method: 'POST',
        endpoint: `liar/${this.taskName}`,
        body: JSON.stringify({question}),
      })
      this.logger.info(`📝 QUESTION: "${question}"`)
      this.logger.info(`📝 LIAR RESPONSE: "${response.answer}"`)
      console.log(response)

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
}
