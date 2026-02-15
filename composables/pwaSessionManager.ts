/**
 * Heavy PWA session manager (IndexedDB + localStorage).
 * Kept in its own module so it can be code-split and dynamically imported.
 */
import { useAuthStore } from '~/stores/auth'

const DB_NAME = 'modeh-pwa-session'
const DB_VERSION = 1
const STORE_NAME = 'auth-session'
const SESSION_KEY = 'current-session'

export interface StoredSession {
  user: any
  token: string
  apiToken: string
  expiresAt: number
  createdAt: number
}

class PwaSessionManager {
  private db: IDBDatabase | null = null
  private isInitialized = false

  async init(): Promise<void> {
    if (this.isInitialized) return
    if (typeof window === 'undefined') return

    try {
      await this.openDatabase()
      this.isInitialized = true
    } catch (e) {
      console.warn('[PwaSession] Failed to initialize IndexedDB:', e)
    }
  }

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

  async saveSession(session: StoredSession): Promise<void> {
    try {
      if (this.db) {
        await this.saveToIndexedDB(session)
      }
      this.saveToLocalStorage(session)
    } catch (e) {
      console.warn('[PwaSession] Failed to save session:', e)
      this.saveToLocalStorage(session)
    }
  }

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

  private saveToLocalStorage(session: StoredSession): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`modeh-pwa:${SESSION_KEY}`, JSON.stringify(session))
      }
    } catch (e) {
      console.warn('[PwaSession] Failed to save to localStorage:', e)
    }
  }

  async loadSession(): Promise<StoredSession | null> {
    try {
      if (this.db) {
        const session = await this.loadFromIndexedDB()
        if (session) return session
      }
      return this.loadFromLocalStorage()
    } catch (e) {
      console.warn('[PwaSession] Failed to load session:', e)
      return null
    }
  }

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
        if (session && session.expiresAt > Date.now()) {
          resolve(session)
        } else {
          resolve(null)
        }
      }
    })
  }

  private loadFromLocalStorage(): StoredSession | null {
    try {
      if (typeof localStorage === 'undefined') return null

      const stored = localStorage.getItem(`modeh-pwa:${SESSION_KEY}`)
      if (!stored) return null

      const session = JSON.parse(stored) as StoredSession
      if (session.expiresAt > Date.now()) {
        return session
      }

      this.clearSession()
      return null
    } catch (e) {
      console.warn('[PwaSession] Failed to parse localStorage session:', e)
      return null
    }
  }

  async clearSession(): Promise<void> {
    try {
      if (this.db) {
        const tx = this.db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        store.delete(SESSION_KEY)
      }

      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(`modeh-pwa:${SESSION_KEY}`)
      }
    } catch (e) {
      console.warn('[PwaSession] Failed to clear session:', e)
    }
  }
}

let sessionManager: PwaSessionManager | null = null

export function getSessionManager(): PwaSessionManager {
  if (!sessionManager) {
    sessionManager = new PwaSessionManager()
  }
  return sessionManager
}

export default PwaSessionManager
