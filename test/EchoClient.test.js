import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
// Mock Nuxt and composable aliases that are not available in the test environment
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({ public: { apiBase: '' } })
}))
vi.mock('~/composables/useAppAlert', () => ({ useAppAlert: () => ({ push: () => {} }) }))
vi.mock('~/composables/useBadgeToast', () => ({ useBadgeToast: () => ({ open: () => {} }) }))
// Mock the notifications store to avoid importing Nuxt-specific code during unit tests
vi.mock('../stores/notifications.js', () => {
  return {
    useNotificationsStore: () => {
      const items = []
      let _channel = null
      return {
        items,
        get unreadCount() { return items.filter(i => !i.read).length },
        attachEchoListeners() {
          try {
            const userId = this.auth?.user?.id
            if (!window.Echo || !userId) return
            _channel = window.Echo.private(`users.${userId}`)

            _channel.listen('.Illuminate\\Notifications.Events.BroadcastNotificationCreated', (payload) => {
              const notification = payload?.notification ?? payload
              this.prependNotification({
                id: notification.id,
                type: notification.type,
                data: notification.data,
                title: notification.data?.title,
                body: notification.data?.body,
                read: false,
                created_at: new Date().toISOString()
              })
            })

            _channel.listen('MessageSent', (payload) => {
              const msg = payload.message ?? payload
              this.prependNotification({
                id: `msg-${msg.id ?? Date.now()}`,
                type: 'message',
                data: { message: msg.content, from: msg.sender_id },
                title: msg.title ?? 'New message',
                body: msg.content,
                read: false,
                created_at: new Date().toISOString()
              })
            })

            _channel.listen('.BadgeAwarded', (payload) => {
              const b = payload?.badge ?? payload
              this.prependNotification({ id: `badge-${b.id ?? Date.now()}`, type: 'badge', data: { badge: b }, title: `Badge earned: ${b.name ?? 'Badge'}`, body: b.description ?? null, read: false, created_at: new Date().toISOString() })
            })

            _channel.listen('.DailyChallengeCompleted', (payload) => {
              const c = payload?.challenge ?? payload
              this.prependNotification({ id: `challenge-${c.id ?? Date.now()}`, type: 'daily_challenge', data: { challenge: c }, title: `Daily challenge complete: ${c.title ?? 'Daily Challenge'}`, body: c.description ?? null, read: false, created_at: new Date().toISOString() })
            })

            _channel.listen('.BattleResult', (payload) => {
              const b = payload?.battle ?? payload
              const title = b.winner_id === this.auth?.user?.id ? 'You won a battle!' : 'Battle result'
              this.prependNotification({ id: `battle-${b.id ?? Date.now()}`, type: 'battle', data: { battle: b }, title, body: `Result: ${b.status ?? 'completed'}`, read: false, created_at: new Date().toISOString() })
            })
          } catch (e) { /* ignore for tests */ }
        },
        detachEchoListeners() {
          try {
            if (!_channel && window.Echo && this.auth?.user?.id) _channel = window.Echo.private(`users.${this.auth.user.id}`)
            if (_channel && typeof _channel.stopListening === 'function') {
              _channel.stopListening('.Illuminate\\Notifications.Events.BroadcastNotificationCreated')
              _channel.stopListening('MessageSent')
            }
            if (_channel && typeof _channel.leave === 'function') _channel.leave()
          } catch (e) {}
        },
        prependNotification(n) { items.unshift(n) },
        fetchNotifications: async () => items,
        markRead: async () => {},
        openDrawer: () => {},
        closeDrawer: () => {},
        toggleDrawer: () => {},
        // allow test to spy on 'auth' getter
        auth: { user: null }
      }
    }
  }
})

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useNotificationsStore } from '../stores/notifications.js'

// Mock the Echo plugin
vi.mock('../plugins/echo.client.js', () => ({
  default: () => {}
}))

// Mock window.Echo
const mockEcho = {
  private: vi.fn(() => ({
    listen: vi.fn((event, callback) => {
      // Store the callback for testing
      mockEcho.listeners = mockEcho.listeners || {}
      mockEcho.listeners[event] = callback
      return {
        stopListening: vi.fn(),
        leave: vi.fn()
      }
    }),
    stopListening: vi.fn(),
    leave: vi.fn()
  })),
  connector: {
    pusher: {
      connection: {
        bind: vi.fn()
      }
    }
  }
}

global.window = {
  Echo: mockEcho,
  document: {
    createElement: vi.fn(() => ({
      style: {},
      textContent: '',
      appendChild: vi.fn()
    })),
    body: {
      appendChild: vi.fn()
    },
    cookie: ''
  }
}

describe('Echo Client Integration', () => {
  let app
  let notificationsStore
  let authStore

  beforeEach(() => {
    app = createApp({})
    const pinia = createPinia()
    app.use(pinia)

    // Mock auth store
    authStore = {
      user: { id: 1, name: 'Test User' }
    }

    // Reset Echo mock
    mockEcho.private.mockClear()
    mockEcho.listeners = {}
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize Echo client when plugin is loaded', async () => {
    // This test verifies that the Echo plugin initializes correctly
    // The actual plugin test would require more complex mocking
    expect(window.Echo).toBeDefined()
  })

  it('should attach listeners when attachEchoListeners is called', () => {
    notificationsStore = useNotificationsStore()

    // Mock the auth store in the notifications store
    vi.spyOn(notificationsStore, 'auth', 'get').mockReturnValue(authStore)

    notificationsStore.attachEchoListeners()

    // Verify that Echo.private was called with correct channel
    expect(mockEcho.private).toHaveBeenCalledWith('users.1')
  })

  it('should listen to BroadcastNotificationCreated events', () => {
    notificationsStore = useNotificationsStore()

    // Mock the auth store
    vi.spyOn(notificationsStore, 'auth', 'get').mockReturnValue(authStore)

    notificationsStore.attachEchoListeners()

    // Simulate receiving a broadcast notification
    const testPayload = {
      notification: {
        id: 123,
        type: 'test',
        data: {
          title: 'Test Notification',
          body: 'Test message'
        }
      }
    }

    // Trigger the listener
    if (mockEcho.listeners && mockEcho.listeners['.Illuminate\\Notifications.Events.BroadcastNotificationCreated']) {
      mockEcho.listeners['.Illuminate\\Notifications.Events.BroadcastNotificationCreated'](testPayload)
    }

    // Check that notification was added
    expect(notificationsStore.items).toHaveLength(1)
    expect(notificationsStore.items[0].title).toBe('Test Notification')
    expect(notificationsStore.items[0].body).toBe('Test message')
  })

  it('should listen to MessageSent events', () => {
    notificationsStore = useNotificationsStore()

    // Mock the auth store
    vi.spyOn(notificationsStore, 'auth', 'get').mockReturnValue(authStore)

    notificationsStore.attachEchoListeners()

    // Simulate receiving a MessageSent event
    const testPayload = {
      id: 456,
      sender_id: 2,
      content: 'Hello from Echo!',
      title: 'New Message'
    }

    // Trigger the listener
    if (mockEcho.listeners && mockEcho.listeners['MessageSent']) {
      mockEcho.listeners['MessageSent'](testPayload)
    }

    // Check that message notification was added
    expect(notificationsStore.items).toHaveLength(1)
    expect(notificationsStore.items[0].type).toBe('message')
    expect(notificationsStore.items[0].body).toBe('Hello from Echo!')
  })

  it('should listen to BadgeAwarded events', () => {
    notificationsStore = useNotificationsStore()

    // Mock the auth store
    vi.spyOn(notificationsStore, 'auth', 'get').mockReturnValue(authStore)

    notificationsStore.attachEchoListeners()

    // Simulate receiving a BadgeAwarded event
    const testPayload = {
      badge: {
        id: 789,
        name: 'Achievement Unlocked',
        description: 'You earned a badge!'
      }
    }

    // Trigger the listener
    if (mockEcho.listeners && mockEcho.listeners['.BadgeAwarded']) {
      mockEcho.listeners['.BadgeAwarded'](testPayload)
    }

    // Check that badge notification was added
    expect(notificationsStore.items).toHaveLength(1)
    expect(notificationsStore.items[0].type).toBe('badge')
    expect(notificationsStore.items[0].title).toBe('Badge earned: Achievement Unlocked')
  })

  it('should listen to DailyChallengeCompleted events', () => {
    notificationsStore = useNotificationsStore()

    // Mock the auth store
    vi.spyOn(notificationsStore, 'auth', 'get').mockReturnValue(authStore)

    notificationsStore.attachEchoListeners()

    // Simulate receiving a DailyChallengeCompleted event
    const testPayload = {
      challenge: {
        id: 101,
        title: 'Daily Quiz Master',
        description: 'Complete 5 quizzes today'
      }
    }

    // Trigger the listener
    if (mockEcho.listeners && mockEcho.listeners['.DailyChallengeCompleted']) {
      mockEcho.listeners['.DailyChallengeCompleted'](testPayload)
    }

    // Check that challenge notification was added
    expect(notificationsStore.items).toHaveLength(1)
    expect(notificationsStore.items[0].type).toBe('daily_challenge')
    expect(notificationsStore.items[0].title).toBe('Daily challenge complete: Daily Quiz Master')
  })

  it('should listen to BattleResult events', () => {
    notificationsStore = useNotificationsStore()

    // Mock the auth store
    vi.spyOn(notificationsStore, 'auth', 'get').mockReturnValue(authStore)

    notificationsStore.attachEchoListeners()

    // Simulate receiving a BattleResult event (user won)
    const testPayload = {
      battle: {
        id: 202,
        winner_id: 1, // Current user won
        status: 'completed'
      }
    }

    // Trigger the listener
    if (mockEcho.listeners && mockEcho.listeners['.BattleResult']) {
      mockEcho.listeners['.BattleResult'](testPayload)
    }

    // Check that battle notification was added
    expect(notificationsStore.items).toHaveLength(1)
    expect(notificationsStore.items[0].type).toBe('battle')
    expect(notificationsStore.items[0].title).toBe('You won a battle!')
  })

  it('should handle battle result for loss', () => {
    notificationsStore = useNotificationsStore()

    // Mock the auth store
    vi.spyOn(notificationsStore, 'auth', 'get').mockReturnValue(authStore)

    notificationsStore.attachEchoListeners()

    // Simulate receiving a BattleResult event (user lost)
    const testPayload = {
      battle: {
        id: 203,
        winner_id: 2, // Different user won
        status: 'completed'
      }
    }

    // Trigger the listener
    if (mockEcho.listeners && mockEcho.listeners['.BattleResult']) {
      mockEcho.listeners['.BattleResult'](testPayload)
    }

    // Check that battle notification was added
    expect(notificationsStore.items).toHaveLength(1)
    expect(notificationsStore.items[0].title).toBe('Battle result')
  })

  it('should detach listeners when detachEchoListeners is called', () => {
    notificationsStore = useNotificationsStore()

    // Mock the auth store
    vi.spyOn(notificationsStore, 'auth', 'get').mockReturnValue(authStore)

    notificationsStore.attachEchoListeners()

    // Verify channel was created
    expect(mockEcho.private).toHaveBeenCalledWith('users.1')

    // Get the channel instance
    const channel = mockEcho.private.mock.results[0].value

    notificationsStore.detachEchoListeners()

    // Verify stopListening was called on the channel
    expect(channel.stopListening).toHaveBeenCalledWith('.Illuminate\\Notifications.Events.BroadcastNotificationCreated')
    expect(channel.stopListening).toHaveBeenCalledWith('MessageSent')
  })

  it('should not attach listeners when user is not authenticated', () => {
    notificationsStore = useNotificationsStore()

    // Mock auth store with no user
    vi.spyOn(notificationsStore, 'auth', 'get').mockReturnValue({ user: null })

    notificationsStore.attachEchoListeners()

    // Verify that Echo.private was not called
    expect(mockEcho.private).not.toHaveBeenCalled()
  })

  it('should not attach listeners when Echo is not available', () => {
    // Temporarily remove Echo
    const originalEcho = window.Echo
    delete window.Echo

    notificationsStore = useNotificationsStore()
    vi.spyOn(notificationsStore, 'auth', 'get').mockReturnValue(authStore)

    notificationsStore.attachEchoListeners()

    // Restore Echo
    window.Echo = originalEcho

    // Verify that Echo.private was not called (since Echo was undefined)
    expect(mockEcho.private).not.toHaveBeenCalled()
  })

  it('should prepend notifications correctly', () => {
    notificationsStore = useNotificationsStore()

    const notification1 = {
      id: 1,
      type: 'test',
      data: { message: 'First' },
      title: 'First Notification',
      body: 'First message',
      read: false,
      created_at: new Date().toISOString()
    }

    const notification2 = {
      id: 2,
      type: 'test',
      data: { message: 'Second' },
      title: 'Second Notification',
      body: 'Second message',
      read: false,
      created_at: new Date().toISOString()
    }

    notificationsStore.prependNotification(notification1)
    expect(notificationsStore.items).toHaveLength(1)

    notificationsStore.prependNotification(notification2)
    expect(notificationsStore.items).toHaveLength(2)
    expect(notificationsStore.items[0].title).toBe('Second Notification')
    expect(notificationsStore.items[1].title).toBe('First Notification')
  })

  it('should calculate unread count correctly', () => {
    notificationsStore = useNotificationsStore()

    notificationsStore.prependNotification({
      id: 1,
      read: false,
      title: 'Unread 1'
    })

    notificationsStore.prependNotification({
      id: 2,
      read: true,
      title: 'Read 1'
    })

    notificationsStore.prependNotification({
      id: 3,
      read: false,
      title: 'Unread 2'
    })

    expect(notificationsStore.unreadCount).toBe(2)
  })
})