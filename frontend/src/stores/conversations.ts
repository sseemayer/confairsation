import {nanoid} from 'nanoid'
import {defineStore} from 'pinia'

import {useDBStore, type Document} from '@/stores/db'

export enum EventType {
  Joined = "joined",
  Left = "left",
  Speaking = "speaking",
  Interrupted = "interrupted",
}

export type Event = {
  timestamp: string,
  subject: string | null,
  type: EventType,
}

type ConversationCreate = {
  _id: string,
  type: "conversation",
  title: string,
  date: string,
  participants: string[],
  events: Event[],
}

export type Conversation = ConversationCreate & Document

export type EventWithEnd = Event & {
  end: string,
}

export function eventsWithDuration(events: Event[]): EventWithEnd[] {

  const out = []
  let prevSpeakEvent = null
  for (const event of events) {
    const eventCopy = JSON.parse(JSON.stringify(event)) as EventWithEnd

    if (event.type === EventType.Speaking || event.type === EventType.Interrupted) {

      if (prevSpeakEvent) {
        prevSpeakEvent.end = event.timestamp
      }

      prevSpeakEvent = eventCopy

    }

    out.push(eventCopy)
  }

  return out
}


export const useConversationsStore = defineStore('conversations', () => {
  const dbStore = useDBStore()

  async function create(title: string): Promise<Conversation> {
    return await dbStore.upsert<ConversationCreate>({
      _id: nanoid(),
      type: 'conversation',
      date: new Date().toISOString(),
      title,
      participants: [],
      events: [],
    })
  }

  async function update(convo: Conversation): Promise<Conversation> {
    return dbStore.upsert(convo)
  }

  async function remove(convo: Conversation) {
    await dbStore.remove(convo)
  }

  const conversations = computed(() => (dbStore.documents['conversation'] || {}) as Record<string, Conversation>)

  const conversationsSorted = computed(() => {
    const out = Object.values(conversations.value)
    out.sort((a, b) => (+new Date(a.date)) - (+new Date(b.date)))
    return out
  })

  return {conversations, conversationsSorted, create, update, remove}
})
