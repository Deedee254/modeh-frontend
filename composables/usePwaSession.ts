/**
 * Lightweight composable that dynamically loads the heavy PWA session manager
 * when any storage action is performed. This keeps the IndexedDB logic
 * code-split in `pwaSessionManager.ts` and only loads it when needed.
 */
import { useAuthStore } from '~/stores/auth'
import type { StoredSession } from './pwaSessionManager'

async function loadManager() {
  const mod = await import('./pwaSessionManager')
  return mod.getSessionManager()
}

export function usePwaSession() {
  const authStore = useAuthStore()

  const initializeSession = async () => {
    const manager = await loadManager()
    await manager.init()
    const stored = await manager.loadSession()
    if (stored?.user && stored?.apiToken) {
      authStore.setUser(stored.user)
      console.log('[PwaSession] Session restored from storage')
      return true
    }
    return false
  }

  const persistSession = async () => {
    const user = authStore.user
    if (!user) return

    try {
      const session: StoredSession = {
        user,
        token: '',
        apiToken: (user as any).apiToken || '',
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        createdAt: Date.now(),
      }

      const manager = await loadManager()
      await manager.saveSession(session)
    } catch (e) {
      console.warn('[PwaSession] Failed to persist session:', e)
    }
  }

  const clearStoredSession = async () => {
    try {
      const manager = await loadManager()
      await manager.clearSession()
    } catch (e) {
      console.warn('[PwaSession] Failed to clear session:', e)
    }
  }

  return {
    initializeSession,
    persistSession,
    clearStoredSession,
    // expose a getter that returns a promise-resolved manager if callers
    // need direct access — keeps the API flexible while preserving code-split behavior
    getSessionManager: async () => await loadManager(),
  }
}

export default usePwaSession
