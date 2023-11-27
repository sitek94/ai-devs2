const URL = 'https://serpapi.com/search'
const API_KEY = Bun.env.SERP_API_PRIVATE_KEY!
const ENGINE = 'google'
const GOOGLE_DOMAIN = 'google.com'

export const serpApi = {
  search,
}

async function search({query}: {query: string}) {
  const response = await fetch(
    `${URL}?api_key=${API_KEY}&engine=${ENGINE}&q=${query}&google_domain=${GOOGLE_DOMAIN}`,
  )
  const data = (await response.json()) as {
    organic_results: {
      title: string
      link: string
      snippet: string
    }[]
  }

  return data.organic_results
}
