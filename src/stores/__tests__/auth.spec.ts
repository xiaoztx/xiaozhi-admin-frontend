import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../user'

describe('User Store Auth Logic', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('setToken should update both state and localStorage', () => {
    const store = useUserStore()
    const testToken = 'test-token-123'

    store.setToken(testToken)

    // Verify State
    expect(store.token).toBe(testToken)
    // Verify LocalStorage
    expect(localStorage.getItem('token')).toBe(testToken)
  })

  it('clearUser should remove token from state and localStorage', () => {
    const store = useUserStore()
    store.setToken('old-token')
    
    store.clearUser()

    expect(store.token).toBe('')
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('setUser should persist user info', () => {
    const store = useUserStore()
    const testUser = { id: 1, username: 'admin' }

    store.setUser(testUser)

    expect(store.userInfo).toEqual(testUser)
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(testUser)
  })
})
