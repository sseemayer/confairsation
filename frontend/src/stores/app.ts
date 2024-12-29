import {defineStore} from 'pinia'
import {DateTime} from 'luxon'

export const useAppStore = defineStore('app', () => {

  const now = ref(DateTime.local())

  setInterval(() => {
    now.value = DateTime.local()
  }, 500)

  return {now}
})
