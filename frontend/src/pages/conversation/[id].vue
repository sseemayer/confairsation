<template lang="pug">
v-navigation-drawer(
location="right"
permanent)
  v-list
    v-list-item(title="Participants")
      template(#append)

        v-menu
          template(#activator="{props}")
            v-btn(
              v-if="addableParticipants.length"
              icon="mdi-plus"
              v-bind="props"
            )

          v-list
            v-list-item(
              v-for="person, i in addableParticipants"
              :key="i"
              :title="person.name"
              @click="onAddParticipant(person)"
            )
              template(#prepend)
                Avatar(:id="person._id")

    v-divider
    Participant(
      :participant="null"
      @click="onParticipantClick(null)"
    )

    Participant(
      v-for="participant, i in conversation?.participants"
      :key="i"
      :participant="participant"
      :is-active="participant === lastSpeaker"
      @click="onParticipantClick(participant)"
      @click:leave="onLeaveParticipant(i)"
    )

Plot(:events="events")

v-container

  Event(
    v-for="event, i in events"
    :key="i"
    :event="event"
    :right="i % 2 == 0"
  )
</template>

<script setup lang="ts">
import {eventsWithDuration, EventType, useConversationsStore, type Conversation} from '@/stores/conversations'
import {usePersonsStore, type Person} from '@/stores/persons'

const conversationsStore = useConversationsStore()
const personsStore = usePersonsStore()
const route = useRoute('/conversation/[id]')

const conversation = computed(() => conversationsStore.conversations[route.params.id])

const events = computed(() => conversation.value ? eventsWithDuration(conversation.value.events) : [])

const addableParticipants = computed(() => {
  return Object.values(personsStore.persons).filter(p => conversation.value.participants.indexOf(p._id) === -1)
})

const lastSpeaker = computed(() => {
  if (!conversation.value) {return null}

  let out = null

  for (const event of conversation.value.events) {
    if (event.type === EventType.Speaking || event.type === EventType.Interrupted) {
      out = event.subject
    }
  }

  return out
})

function copyConvo(): Conversation {
  return JSON.parse(JSON.stringify(conversation.value))
}

async function onAddParticipant(person: Person) {
  const convo = copyConvo()
  convo.participants.push(person._id)

  convo.events.push({
    timestamp: new Date().toISOString(),
    subject: person._id,
    type: EventType.Joined,
  })

  await conversationsStore.update(convo)
}

async function onLeaveParticipant(index: number) {
  // make the leaving participant stop talking if they are the current speaker
  if (conversation.value.participants[index] === lastSpeaker.value) {
    await onParticipantClick(null)
  }

  const convo = copyConvo()


  const person = convo.participants.splice(index, 1)[0]

  convo.events.push({
    timestamp: new Date().toISOString(),
    subject: person,
    type: EventType.Left,
  })


  await conversationsStore.update(convo)
}

async function onParticipantClick(id: string | null) {
  if (id === lastSpeaker.value) {return }

  const convo = copyConvo()
  convo.events.push({
    timestamp: new Date().toISOString(),
    subject: id,
    type: EventType.Speaking
  })

  await conversationsStore.update(convo)
}

</script>
