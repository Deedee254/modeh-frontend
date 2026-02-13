/**
 * PWA Session Persistence Composable
 * 
 * Handles persistent login for PWAs by:
 * 1. Storing session data in IndexedDB (survives app close/reopen)
 * 2. Backing up to localStorage as fallback
 * 3. Restoring session on app load
 * 4. Keeping session fresh with periodic sync
 */

import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const DB_NAME = 'modeh-pwa-session'
const DB_VERSION = 1
const STORE_NAME = 'auth-session'
const SESSION_KEY = 'current-session'

interface StoredSession {
  user: any
  token: string
  apiToken: string
  expiresAt: number
  createdAt: number
}

class PwaSessionManager {
  private db: IDBDatabase | null = null
  private isInitialized = false

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<void> {
    if (this.isInitialized) return
    if (typeof window === 'undefined') return

    try {
      await this.openDatabase()
      this.isInitialized = true
    } catch (e) {
      console.warn('[PwaSession] Failed to initialize IndexedDB:', e)
      // Continue - localStorage fallback will be used
    }
  }

  /**
   * Open or create IndexedDB database
   */
  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(request.result)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      }
    })
  }

  /**
   * Save session to IndexedDB + localStorage
   */
  async saveSession(session: StoredSession): Promise<void> {
    try {
      // Save to IndexedDB (primary)
      if (this.db) {
        await this.saveToIndexedDB(session)
      }

      // Save to localStorage as backup
      this.saveToLocalStorage(session)
    } catch (e) {
      console.warn('[PwaSession] Failed to save session:', e)
      // Continue with localStorage only
      this.saveToLocalStorage(session)
    }
  }

  /**
   * Save session to IndexedDB
   */
  private saveToIndexedDB(session: StoredSession): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'))
        return
      }

      const tx = this.db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const request = store.put(session, SESSION_KEY)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  /**
   * Save session to localStorage as backup
   */
  private saveToLocalStorage(session: StoredSession): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`modeh-pwa:${SESSION_KEY}`, JSON.stringify(session))
      }
    } catch (e) {
      console.warn('[PwaSession] Failed to save to localStorage:', e)
    }
  }

  /**
   * Load session from IndexedDB or localStorage
   */
  async loadSession(): Promise<StoredSession | null> {
    try {
      // Try IndexedDB first
      if (this.db) {
        const session = await this.loadFromIndexedDB()
        if (session) return session
      }

      // Fallback to localStorage
      return this.loadFromLocalStorage()
    } catch (e) {
      console.warn('[PwaSession] Failed to load session:', e)
      return null
    }
  }

  /**
   * Load session from IndexedDB
   */
  private loadFromIndexedDB(): Promise<StoredSession | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'))
        return
      }

      const tx = this.db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(SESSION_KEY)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const session = request.result
        // Check if session is expired
        if (session && session.expiresAt > Date.now()) {
          resolve(session)
        } else {
          resolve(null)
        }
      }
    })
  }

  /**
   * Load session from localStorage
   */
  private loadFromLocalStorage(): StoredSession | null {
    try {
      if (typeof localStorage === 'undefined') return null

      const stored = localStorage.getItem(`modeh-pwa:${SESSION_KEY}`)
      if (!stored) return null

      const session = JSON.parse(stored) as StoredSession
      // Check if session is expired
      if (session.expiresAt > Date.now()) {
        return session
      }

      // Clean up expired session
      this.clearSession()
      return null
    } catch (e) {
      console.warn('[PwaSession] Failed to parse localStorage session:', e)
      return null
    }
  }

  /**
   * Clear session from all storage
   */
  async clearSession(): Promise<void> {
    try {
      // Clear IndexedDB
      if (this.db) {
        const tx = this.db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        store.delete(SESSION_KEY)
      }

      // Clear localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(`modeh-pwa:${SESSION_KEY}`)
      }
    } catch (e) {
      console.warn('[PwaSession] Failed to clear session:', e)
    }
  }
}

// Singleton instance
let sessionManager: PwaSessionManager | null = null

function getSessionManager(): PwaSessionManager {
  if (!sessionManager) {
    sessionManager = new PwaSessionManager()
  }
  return sessionManager
}

/**
 * Composable: use PWA session persistence
 */
export function usePwaSession() {
  const authStore = useAuthStore()
  const manager = getSessionManager()

  /**
   * Initialize session manager and restore session on app load
   */
  const initializeSession = async () => {
    await manager.init()

    // Try to restore session from storage
    const stored = await manager.loadSession()
    if (stored?.user && stored?.apiToken) {
      // Restore user to auth store
      authStore.setUser(stored.user)

      // Log user back in via session (session will be validated by nuxt-auth)
      // The API token is already in the stored session
      console.log('[PwaSession] Session restored from storage')
      return true
    }

    return false
  }

  /**
   * Persist current session to storage
   */
  const persistSession = async () => {
    const user = authStore.user
    if (!user) return

    try {
      const session: StoredSession = {
        user,
        token: '', // JWT token managed by next-auth
        apiToken: (user as any).apiToken || '',
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        createdAt: Date.now()
      }

      await manager.saveSession(session)
    } catch (e) {
      console.warn('[PwaSession] Failed to persist session:', e)
    }
  }

  /**
   * Clear session from storage
   */
  const clearStoredSession = async () => {
    await manager.clearSession()
  }

  return {
    initializeSession,
    persistSession,
    clearStoredSession,
    getSessionManager: () => manager
  }
}

export default usePwaSession
