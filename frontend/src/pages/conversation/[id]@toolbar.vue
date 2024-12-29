<template lang="pug">
p {{ conversation?.title || "" }}
v-spacer
</template>

<script setup lang="ts">
import {useConversationsStore} from '@/stores/conversations'

const conversationsStore = useConversationsStore()
const route = useRoute('/conversation/[id]')

const conversation = computed(() => {
  return conversationsStore.conversations[route.params.id]
})
</script>
