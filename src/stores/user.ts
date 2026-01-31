import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  let initialUser: any = {}
  try {
    initialUser = JSON.parse(localStorage.getItem('user') || '{}')
  } catch (e) {
    console.error('Failed to parse user info from localStorage', e)
  }
  const userInfo = ref<any>(initialUser)

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUser = (user: any) => {
    userInfo.value = user
    localStorage.setItem('user', JSON.stringify(user))
  }

  const clearUser = () => {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const updateAvatar = (avatar: string) => {
    userInfo.value.avatar = avatar
    localStorage.setItem('user', JSON.stringify(userInfo.value))
  }

  return {
    token,
    userInfo,
    setToken,
    setUser,
    clearUser,
    updateAvatar
  }
})
