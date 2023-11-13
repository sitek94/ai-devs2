const BASE_URL = 'http://api.nbp.pl/api/exchangerates'
const TABLE = 'A'

type ExchangeRate = {
  currency: string
  code: string
  mid: number
}

export async function getExchangeRates() {
  const response = await fetch(`${BASE_URL}/tables/${TABLE}/`)
  const json = await response.json()
  const rates = json[0].rates

  return rates as ExchangeRate[]
}

export async function getCurrentExchangeRate(code: string) {
  const response = await fetch(`${BASE_URL}/rates/${TABLE}/${code}/`)
  const json = (await response.json()) as {
    rates: {no: string; effectiveDate: string; mid: number}[]
  }

  return json.rates[0].mid
}

console.log(await getCurrentExchangeRate('USD'))
