<template lang="pug">
v-avatar(
  :image="image"
  :size="props.size"
  :title="tooltip"
  )
</template>

<script setup lang="ts">
import {createAvatar} from '@dicebear/core'
import * as style from '@dicebear/avataaars'

import {usePersonsStore} from '@/stores/persons'

const personsStore = usePersonsStore()

const props = withDefaults(defineProps<{
  id: string | null,
  options?: style.Options,
  size?: number,
}>(), {
  id: null,
  options: undefined,
  size: 32,
})

const tooltip = computed(() => {
  if (props.id && props.id in personsStore.persons) {
    return personsStore.persons[props.id].name
  }

  return ''
})

const options = computed(() => {
  if (props.options) {return props.options}

  if (props.id && props.id in personsStore.persons) {
    return personsStore.persons[props.id].avatar
  }

  if (props.id === null) {
    return {
      skinColor: ['cccccc'],
      top: [],
      mouth: [],
      eyes: [],
      eyebrows: [],
      clothesColor: ['aaaaaa'],
      clothing: ['shirtCrewNeck' as const],
    }
  }

  return {}
})

const image = computed(() => {
  const effectiveOptions = {
    ...options.value,
    ...{
      size: props.size,
      style: ['circle' as const],
    }
  }

  const avatar = createAvatar(style, effectiveOptions)

  return avatar.toDataUri()
})

</script>
