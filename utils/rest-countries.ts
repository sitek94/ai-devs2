const BASE_URL = 'https://restcountries.com/v3.1'

type Country = {
  name: {
    common: string
    official: string
  }
  region: string
  flag: string
  population: number
}

export async function getCountryByName(name: string) {
  const response = await fetch(`${BASE_URL}/name/${name}`)
  const json = await response.json()

  return json[0] as Country
}

export async function getCountryPopulation(name: string) {
  const country = await getCountryByName(name)

  return country.population
}
