import {nanoid} from 'nanoid'
import {defineStore} from 'pinia'
import colors from 'vuetify/util/colors'

import {useDBStore, type Document} from '@/stores/db'

import {type Options as AvatarOptions} from '@dicebear/avataaars'

import {avatarChoices, skinColors} from '@/avatar'

type PersonCreate = {
  _id: string,
  type: 'person',
  name: string,
  avatar: AvatarOptions,
}

export type Person = PersonCreate & Document


function randomSelect<T>(choices: T[]): T {
  return choices[Math.floor(Math.random() * choices.length)]
}

function randomSelectDeep<T>(choices: {value: T}[]): T[] {
  const value = randomSelect(choices).value
  if (value === 'none') {
    return []
  } else {
    return [value]
  }
}


export const usePersonsStore = defineStore('persons', () => {
  const dbStore = useDBStore()

  async function create(name: string): Promise<Person> {
    return await dbStore.upsert<PersonCreate>({
      _id: nanoid(),
      type: 'person',
      name,
      avatar: {
        accessories: randomSelectDeep(avatarChoices.accessories),
        accessoriesColor: [colors.grey.darken4.replace('#', '')],
        accessoriesProbability: 100,
        backgroundColor: [colors.shades.white.replace('#', '')],
        clothing: randomSelectDeep(avatarChoices.clothing),
        clothesColor: [colors.indigo.base.replace('#', '')],
        eyebrows: randomSelectDeep(avatarChoices.eyebrows),
        eyes: randomSelectDeep(avatarChoices.eyes),
        facialHair: randomSelectDeep(avatarChoices.facialHair),
        facialHairColor: [colors.brown.darken4.replace('#', '')],
        facialHairProbability: 100,
        hairColor: [colors.brown.darken4.replace('#', '')],
        hatColor: [colors.brown.darken4.replace('#', '')],
        mouth: randomSelectDeep(avatarChoices.mouth),
        skinColor: [randomSelect(skinColors)],
        top: randomSelectDeep(avatarChoices.top),
        topProbability: 100,
      } as AvatarOptions,
    })
  }

  async function update(person: Person): Promise<Person> {
    return dbStore.upsert(person)
  }

  async function remove(person: Person) {
    dbStore.remove(person)
  }

  const persons = computed(() => (dbStore.documents['person'] || {}) as Record<string, Person>)

  const personsSorted = computed(() => {
    const out = Object.values(persons.value)
    out.sort((a, b) => a.name.localeCompare(b.name))
    return out
  })

  return {persons, personsSorted, create, update, remove}
})
