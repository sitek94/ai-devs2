import Database from 'bun:sqlite'
import {randomUUID} from 'node:crypto'
import path from 'node:path'

const dbPath = path.resolve(__dirname, 'archive.db')
const sqlite = new Database(dbPath)

type Link = {id: string; title: string; url: string; info: string}

export const db = {
  links: {
    findOne: (id: string) => {
      const query = sqlite.query(
        'SELECT id, title, info, url FROM links WHERE id = ?',
      )
      return query.get(id) as Link
    },
    findAll: ({offset = 0, limit}: {offset?: number; limit: number}) => {
      const query = sqlite.query(
        'SELECT id, title, info, url FROM links LIMIT ? OFFSET ?',
      )
      return query.all(limit, offset) as Link[]
    },
  },
}

export async function initDatabaseWithLinks() {
  sqlite.run(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      title TEXT,
      info TEXT,
      url TEXT
    )
  `)

  const linksPath = path.resolve(__dirname, 'links.json')
  const links = await Bun.file(linksPath).json<Link[]>()

  const query = 'INSERT INTO links (id, title, info, url) VALUES '
  const placeholders = links.map(() => '(?, ?, ?, ?)').join(', ')

  const parameters = links.flatMap(({title, info, url}) => [
    randomUUID(),
    title,
    info,
    url,
  ])

  sqlite.run(query + placeholders, parameters)
}
