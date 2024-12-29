<template lang="pug">
div(:class="`event my-2 ${props.right ? 'right' : ''}`")
  Avatar(:id="subject._id")
  v-sheet.speaking.pa-2(
    v-if="props.event.type === 'speaking'"
    rounded
  )
    strong {{ subject.name }}&nbsp;
    | is speaking.
    .timestamp(v-if="props.event.end || props.event.subject") {{ timestamp }}

  .status.pa-2(v-if="props.event.type === 'joined' || props.event.type === 'left'")
    strong {{ subject.name }}&nbsp;
    | {{ props.event.type }}.
</template>

<script lang="ts" setup>
import {defineProps} from 'vue'
import {DateTime, Duration} from 'luxon'

import {type EventWithEnd} from '@/stores/conversations'
import {useAppStore} from '@/stores/app';
import {usePersonsStore} from '@/stores/persons'

const props = defineProps<{
  right?: boolean,
  event: EventWithEnd,
}>()

const appStore = useAppStore()
const personsStore = usePersonsStore()

const subject = computed(() => {
  if (props.event.subject === null) {
    return {
      _id: null,
      type: 'person',
      name: 'Nobody',
    }

  } else if (props.event.subject in personsStore.persons) {
    return personsStore.persons[props.event.subject]

  } else {
    return {
      _id: null,
      type: 'person',
      name: '(unknown)',
    }
  }
})


const startTime = computed(() => DateTime.fromISO(props.event.timestamp))

const endTime = computed(() => {
  if (props.event.end) {
    return DateTime.fromISO(props.event.end)
  } else {
    return appStore.now
  }

})

const duration = computed(() => Duration.fromMillis(+endTime.value - +startTime.value)
  .rescale()
  .set({milliseconds: 0})
  .rescale()
)

const timestamp = computed(() => duration.value.toHuman())
</script>

<style lang="stylus" scoped>
.event
  max-width 80%
  display flex
  align-items flex-end

  &.right
    margin-left auto

  .speaking
    flex-grow 1

  .timestamp
    float right
    opacity 0.7
</style>
