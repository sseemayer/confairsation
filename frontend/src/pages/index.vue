<template lang="pug">
v-container

  h2 People
  v-container.px-0: v-row(dense)
    v-col(
      v-for="person, i in personsStore.personsSorted"
      :key="i"
      sm="2"
    ): v-sheet.person-panel(
      v-ripple
      :color="`#${person.avatar.backgroundColor || 'cccccc'}66`"
      width="100%"
      @click="onEditPerson(person)"
    )
      Avatar(
        :id="person._id"
        :size="48"
      )
      .name {{ person.name }}

    v-col(sm="2")
      v-sheet.person-panel(
        v-ripple
        color="surface"
        height="100%"
        @click="onAddPerson"
      )
        v-icon(
          icon="mdi-plus-circle"
          title="Add Person"
          size="x-large"
        )


  h2.mt-5 Conversations

  v-list(v-if="conversationsStore.conversationsSorted.length")

    v-list-item(
      v-for="convo, i in conversationsStore.conversationsSorted"
      :key="i"
      :title="convo.title"
      :subtitle="new Date(convo.date).toLocaleString()"
      :to="{name: '/conversation/[id]', params: {id: convo._id}}"
    )
      template(#append)
        v-btn(
          icon="mdi-delete"
          @click.prevent.stop="onDeleteConversation(convo)"
        )

  v-form.mt-2(@submit.prevent="onSubmit")
    v-text-field(
      v-model="data.title"
      label="Start a new conversation"

      append-inner-icon="mdi-send"
      @click:append-inner="onSubmit"
    )
    v-btn(
type="Submit"
color="primary") Create
</template>

<script lang="ts" setup>
import {reactive} from "vue"

import {useConversationsStore, type Conversation} from "@/stores/conversations"
import {usePersonsStore, type Person} from "@/stores/persons"

const conversationsStore = useConversationsStore()
const personsStore = usePersonsStore()

const router = useRouter()

const data = reactive({
  title: "",
})

async function onSubmit() {
  if (!data.title) {return }
  const convo = await conversationsStore.create(data.title)
  router.push({name: '/conversation/[id]', params: {id: convo._id}})
}

async function onDeleteConversation(convo: Conversation) {
  await conversationsStore.remove(convo)
}

async function onEditPerson(person: Person) {
  router.push({name: '/people/[id]', params: {id: person._id}})
}

async function onAddPerson() {
  const person = await personsStore.create("")
  router.push({name: '/people/[id]', params: {id: person._id}})
}
</script>

<style lang="stylus" scoped>
.person-panel
  display flex

  flex-direction column

  justify-content center
  align-items center

  cursor pointer

  padding 8px
</style>
