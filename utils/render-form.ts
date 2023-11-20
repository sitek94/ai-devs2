const TEMPLATES = {
  meme: Bun.env.RENDER_FORM_MEME_TEMPLATE_ID!,
}

/**
 * Uses Render Form API to render a meme
 *
 * https://renderform.io/
 */
export async function renderMeme({
  template,
  text,
  imageUrl,
}: {
  template: 'meme'
  text: string
  imageUrl: string
}) {
  const url = 'https://get.renderform.io/api/v2/render'

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-API-KEY': Bun.env.RENDER_FORM_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      template: TEMPLATES[template],
      data: {
        'title.text': text,
        'image.src': imageUrl,
      },
    }),
  })

  const json = await response.json()

  return json as {requestId: string; href: string}
}
