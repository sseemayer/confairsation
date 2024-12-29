<template lang="pug">
v-app-bar(color="primary")
  v-app-bar-title.mr-2: router-link(to="/")
    img.mr-1(src="@/assets/logo.svg")
    | Confairsation
  slot

  v-spacer

  v-sheet.offline-warning.mr-5.pa-2(
    v-if="dbStore.syncStatus === 'disconnected'"
    color="warning"
    rounded
  )
    strong Working offline&nbsp;
    | &mdash; data could get lost


  v-menu(location="bottom")
    template(#activator="{props}")

      v-badge(
        location="bottom start"
        :color="badge.color"
      )
        template(#badge)
          v-icon(:icon="badge.icon")
        v-avatar.avatar.mr-3(
          icon="mdi-account-outline"
          :image="avatar"
          color="secondary"
          v-bind="props"
        )

    v-list(v-if="identityStore.credentials")
      v-list-item(
        :title="identityStore.credentials.email"
        :subtitle="badge.message"
      )
      v-divider
      v-list-item(
        title="Log out"
        @click.stop.prevent="identityStore.logout"
      )

    v-list(v-else)
      v-list-item(
        title="Not logged in"
        :subtitle="badge.message"
      )
      v-divider
      v-list-item(
        title="Log in / Register"
        :to="{name: '/login'}"
      )
</template>

<script setup lang="ts">
import {Md5} from 'ts-md5'

import {useIdentityStore} from '@/stores/identity'
import {SyncStatus, useDBStore} from '@/stores/db'

const dbStore = useDBStore()
const identityStore = useIdentityStore()

const avatar = computed(() => {
  if (!identityStore.credentials) {return undefined}
  const hash = Md5.hashStr(identityStore.credentials.email)
  return `https://gravatar.com/avatar/${hash}`
})

const badge = computed(() => {
  if (dbStore.syncStatus === SyncStatus.Active) {
    return {
      color: 'info',
      message: 'Sync active',
      icon: 'mdi-cloud-refresh-variant',
    }
  } else if (dbStore.syncStatus === SyncStatus.Disconnected) {
    return {
      color: 'warning',
      message: 'Working offline',
      icon: 'mdi-cloud-alert-outline',
    }
  } else if (dbStore.syncStatus === SyncStatus.Error) {
    return {
      color: 'error',
      message: 'Sync error',
      icon: 'mdi-cloud-alert',
    }
  } else if (dbStore.syncStatus === SyncStatus.Idle) {
    return {
      color: 'success',
      message: 'Sync complete',
      icon: 'mdi-cloud-check-variant',
    }
  } else {
    throw Error('unknown sync status')
  }
})

</script>

<style lang="stylus" scoped>
.v-app-bar-title
  flex 0 0 auto

  a
    color inherit
    text-decoration none

    display flex

.avatar
  cursor pointer

  img
    display block !important
</style>
