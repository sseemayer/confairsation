import axios from 'axios'
import {defineStore} from 'pinia'

export type Credentials = {
  email: string,
  password: string,
  database: string,
}

type GetAccountResponse = {
  database: string,
}

type GetTokenResponse = {
  ok: boolean,
}

type RegisterResponse = {
  ok: boolean,
  database: string,
}

export const useIdentityStore = defineStore('identity', () => {

  const credentials = ref<Credentials | undefined>(undefined)

  async function login(email: string, password: string, save: boolean) {

    const res = await axios.get<GetAccountResponse>('/api/accounts/', {
      auth: {
        username: email,
        password,
      }
    })

    if (res.status === 401) {
      throw Error("Bad credentials")
    } else if (res.status !== 200) {
      throw Error(`Other error: ${res.statusText}`)
    }

    if (!res.data.database) {
      throw new Error(`expected database, got ${res.data}`)
    }

    credentials.value = {
      email,
      password,
      database: res.data.database,
    }

    if (save) {
      localStorage.setItem('confairsationEmail', email)
      localStorage.setItem('confairsationPassword', password)
    }
  }

  function logout() {
    credentials.value = undefined
    localStorage.removeItem('confairsationEmail')
    localStorage.removeItem('confairsationPassword')
  }

  async function tryAutologin() {
    const email = localStorage.getItem('confairsationEmail')
    const password = localStorage.getItem('confairsationPassword')
    if (email && password) {
      try {
        await login(email, password, true)
      } catch {

      }
    }
  }

  async function getToken(email: string) {
    await axios.post<GetTokenResponse>('/api/accounts/token', {email})
  }

  async function register(email: string, password: string, token: string) {
    await axios.post<RegisterResponse>('/api/accounts/register', {email, password, token, })
  }

  tryAutologin()

  return {credentials, login, logout, register, getToken}

})
