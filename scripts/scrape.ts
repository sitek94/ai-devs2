import {NodeHtmlMarkdown} from 'node-html-markdown'
import puppeteer from 'puppeteer'

const browser = await puppeteer.launch({
  headless: 'new',
})
const page = await browser.newPage()

const paths = [
  'assistants/overview',
  'assistants/how-it-works',
  'assistants/tools',
  'guides/function-calling',
]
const codeSnippetLanguage = 'node.js'

for (const path of paths) {
  await fetchDocs(path)
}

await browser.close()

async function fetchDocs(path: string) {
  const url = `https://platform.openai.com/docs/${path}?lang=${codeSnippetLanguage}`
  await page.goto(url, {
    waitUntil: 'networkidle0',
  })

  const body = (await page.waitForSelector('.docs-body'))!
  const innerHTML = await body.evaluate(node => node.innerHTML)
  const rawMarkdown = NodeHtmlMarkdown.translate(innerHTML)

  const markdown = rawMarkdown
    // Fix code snippets that start with empty lines each beginning with a number
    .replace(/(```\w+\n)(\d+\n)+/g, '$1')

  await Bun.write(`./docs//${path.replace('/', '-')}.md`, markdown)
}
