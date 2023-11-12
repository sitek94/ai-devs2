import path from 'node:path'

import {db} from '@/utils/db'

const peopleJsonPath = path.resolve(__dirname, 'people.json')
const people = await Bun.file(peopleJsonPath).json()

// ❗️ `db.person.createMany()` is not supported in sqlite
// https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#remarks
for (const person of people) {
  await db.person.create({
    data: {
      firstName: person.imie,
      lastName: person.nazwisko,
      age: person.wiek,
      bio: person.o_mnie,
      favoriteCharacter: person.ulubiona_postac_z_kapitana_bomby,
      favoriteShow: person.ulubiony_serial,
      favoriteMovie: person.ulubiony_film,
      favoriteColor: person.ulubiony_kolor,
    },
  })
}
