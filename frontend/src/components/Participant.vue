<template lang="pug">
v-list-item(@click.prevent.stop="emit('click')")
  template(#prepend)
    Avatar(
      :id="props.participant"
      :size="48"
    )

  v-list-item-title(:class="cssClass") {{ person?.name }}

  template(#append)
    v-btn(
      v-if="participant"
      icon="mdi-exit-run"
      flat
      @click.prevent.stop="emit('click:leave')"
    )

</template>

<script setup lang="ts">
import {defineProps} from 'vue'
import {usePersonsStore} from '@/stores/persons'

const emit = defineEmits<{
  'click': [],
  'click:leave': [],
}>()

const props = defineProps<{
  participant: string | null,
  isActive?: boolean,
}>()

const personsStore = usePersonsStore()

const cssClass = computed(() => `${props.participant === null ? 'font-italic' : ''}${props.isActive ? 'active' : ''}`)

const person = computed(() => {
  if (props.participant === null) {
    return {
      _id: null,
      type: 'person',
      name: '(nobody)',
    }

  } else if (props.participant in personsStore.persons) {
    return personsStore.persons[props.participant]

  } else {
    return {
      _id: null,
      type: 'person',
      name: '(unknown)',
    }
  }
})

</script>

<style lang="stylus" scoped>
.active
  font-weight bold
</style>
