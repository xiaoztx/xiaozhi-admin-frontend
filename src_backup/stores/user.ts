import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(JSON.parse(localStorage.getItem('user') || '{}'))

  const setUser = (user: any) => {
    userInfo.value = user
    localStorage.setItem('user', JSON.stringify(user))
  }

  const clearUser = () => {
    userInfo.value = {}
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const updateAvatar = (avatar: string) => {
    userInfo.value.avatar = avatar
    localStorage.setItem('user', JSON.stringify(userInfo.value))
  }

  return {
    userInfo,
    setUser,
    clearUser,
    updateAvatar
  }
})
