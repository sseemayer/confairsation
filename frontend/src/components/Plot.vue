<template lang="pug">
.plot
  .bar(
    v-for="stat, i in stats.times"
    :key="i"
    :style="`width: ${stat.fraction}; background: ${stat.background}AA`"
  )
    Avatar.my-2(
      :id="stat.id"
      :size="48"
    )
</template>

<script setup lang="ts">
import {DateTime} from 'luxon'

import {EventType, type EventWithEnd} from '@/stores/conversations'
import {usePersonsStore} from '@/stores/persons';
import {useAppStore} from '@/stores/app';

const props = defineProps<{
  events: EventWithEnd[],
}>()

const personsStore = usePersonsStore()
const appStore = useAppStore()

const stats = computed(() => {
  const times: Record<string, number> = {}

  for (const {subject, timestamp, end, type} of props.events) {
    if (!subject || [EventType.Speaking, EventType.Interrupted].indexOf(type) === -1) {
      continue
    }

    const endOrNow = end ? DateTime.fromISO(end) : appStore.now

    const duration = +endOrNow - +DateTime.fromISO(timestamp);

    if (!(subject in times)) {
      times[subject] = 0
    }

    times[subject] += duration
  }

  const total = Object.values(times).reduce((a, b) => a + b, 0)

  const timesSorted = Object.entries(times)
    .map(([id, duration]) => {
      const fraction = `${(duration * 100 / total).toFixed(1)}%`
      const background = '#' + (personsStore.persons[id].avatar.backgroundColor || 'cccccc')

      return {id, duration, fraction, background}
    })

  timesSorted.sort((a, b) => b.duration - a.duration)

  return {times: timesSorted}
})

</script>

<style lang="stylus" scoped>
.plot
  text-wrap nowrap
  overflow hidden

.bar
  display inline-block
  overflow hidden
  text-align center

  transition width 0.5s

</style>
