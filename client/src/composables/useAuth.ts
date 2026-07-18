import { ref } from 'vue'
import { getMe, login as apiLogin, logout as apiLogout } from '../services/api'

const isLoggedIn = ref<boolean | null>(null) // null = not yet checked

export function useAuth() {
  async function checkAuth(): Promise<boolean> {
    try {
      const res = await getMe()
      isLoggedIn.value = res.authenticated
      return res.authenticated
    } catch {
      isLoggedIn.value = false
      return false
    }
  }

  async function login(user: string, pass: string): Promise<void> {
    const res = await apiLogin(user, pass)
    isLoggedIn.value = res.authenticated
  }

  async function doLogout(): Promise<void> {
    try { await apiLogout() } catch { /* ignore */ }
    isLoggedIn.value = false
  }

  return { isLoggedIn, login, logout: doLogout, checkAuth }
}
