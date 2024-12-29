<template lang="pug">

v-container

  v-card(v-if="!identityStore.credentials")
    v-tabs(v-model="tab")
      v-tab Login
      v-tab Register

    v-card-text
      v-tabs-window(v-model="tab")

        v-tabs-window-item: v-form(@submit.prevent.stop="onLogin")
          v-text-field(
            v-model="credentials.email"
            label="E-Mail"
            type="email"
            autofocus
          )

          v-text-field(
            v-model="credentials.password"
            label="Password"
            type="password"
          )

          v-checkbox(
            v-model="credentials.save"
            label="Save login data"
          )

          v-btn-group
            v-btn(
              color="primary"
              type="submit"
            ) Log in
            v-btn() Reset

        v-tabs-window-item: v-form(@submit.prevent.stop="onRegister")
          v-text-field(
            v-model="credentials.email"
            label="E-Mail"
            type="email"
            autofocus
          )
            template(#append)
              v-btn(
                color="primary"
                :disabled="!credentials.email"
                @click="onGetToken"
              ) Send Token

          v-text-field(
            v-model="credentials.token"
            label="Token"
          )

          v-text-field(
            v-if="credentials.token"
            v-model="credentials.password"
            label="Password"
            type="password"
          )

          v-text-field(
            v-if="credentials.token"
            v-model="credentials.passwordRepeat"
            label="Password (repeat)"
            type="password"
          )

          v-btn-group
            v-btn(
              color="primary"
              type="submit"
            ) Register
            v-btn() Reset
</template>

<script setup lang="ts">
import {useIdentityStore} from '@/stores/identity'

const identityStore = useIdentityStore()
const router = useRouter()

const tab = ref(0)

const credentials = reactive({
  email: '',
  token: '',
  password: '',
  passwordRepeat: '',
  save: false,
})

async function onLogin() {
  await identityStore.login(credentials.email, credentials.password, credentials.save)
  router.push({name: '/'})
}

async function onGetToken() {
  await identityStore.getToken(credentials.email)
}

async function onRegister() {
  await identityStore.register(credentials.email, credentials.password, credentials.token)
  credentials.password = ''
  credentials.passwordRepeat = ''
  credentials.token = ''

  tab.value = 0
}


</script>
