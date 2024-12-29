<template lang="pug">

v-menu(:close-on-content-click="false")
  template(#activator="{props: activator}")
    v-btn(
      :color="innerValue"
      icon="mdi-palette"
      v-bind="activator"
    )

  v-color-picker(
    v-model="innerValue"
    hide-canvas
    hide-inputs
    hide-sliders
    show-swatches
    :swatches="swatches"
  )
</template>

<script setup lang="ts">

const model = defineModel<string[]>()

const props = defineProps<{
  swatches?: string[],
}>()

const innerValue = computed({
  get() {return `#${(model.value || ['000000'])[0]}`},
  set(v) {
    model.value = [v.replace('#', '')]
  }
})

const swatches = computed(() => {
  if (!props.swatches) {return undefined}

  return props.swatches.map(s => [`#${s}`])
})

</script>
