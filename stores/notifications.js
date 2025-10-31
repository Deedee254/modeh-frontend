import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRuntimeConfig } from '#app';
import { useAuthStore } from './auth';
import { useAppAlert } from '~/composables/useAppAlert';
import { useBadgeToast } from '~/composables/useBadgeToast';
import useApi from '~/composables/useApi';
import Pusher from 'pusher-js';

export const useNotificationsStore = defineStore('notifications', () => {
  const drawerOpen = ref(false)
  const items = ref([])
  const config = useRuntimeConfig()
  const auth = useAuthStore()
  const api = useApi()

  // computed unread count for badges
  const unreadCount = computed(() => items.value.filter(i => !i.read).length)

  function openDrawer() { drawerOpen.value = true }
  function closeDrawer() { drawerOpen.value = false }
  function toggleDrawer() { drawerOpen.value = !drawerOpen.value }

  function markReadLocal(id) {
    const n = items.value.find(x => x.id === id)
    if (n) n.read = true
  }

  function prependNotification(n) {
    // normalize shape if a Notification model or raw event arrives
    const normalized = {
      id: n.id ?? `tmp-${Date.now()}`,
      type: n.type ?? (n.data ? n.data.type : null),
      data: n.data ?? (n.body ? { body: n.body } : {}),
      title: n.title ?? n.data?.title ?? n.data?.subject ?? null,
      body: n.body ?? n.data?.body ?? n.data?.message ?? null,
      read: !!n.read,
      created_at: n.created_at ?? (n.createdAt || new Date().toISOString())
    }
    items.value = [normalized, ...items.value].slice(0, 200)
  }

  function readXsrfTokenFromCookie() {
    if (import.meta.client) {
      const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
      return match ? decodeURIComponent(match[1]) : null
    }
    return null
  }

  async function fetchNotifications() {
    try {
      const res = await fetch(config.public.apiBase + '/api/notifications', { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        items.value = json.notifications || []
        return items.value
      }
      // if unauthorized, clear the list
      if (res.status === 401) {
        items.value = []
      }
    } catch (e) {
      // ignore network errors for now; caller can handle
    }
    return items.value
  }

  async function markRead(id) {
    // optimistic update
    markReadLocal(id)
    try {
      const res = await api.postJson(`/api/notifications/${id}/mark-read`, {})
      if (api.handleAuthStatus(res)) return
      if (!res.ok) {
        // revert on server error by refetching (simple strategy)
        await fetchNotifications()
      }
    } catch (e) {
      // network error: refetch to reconcile
      await fetchNotifications()
    }
  }

  // Echo listener wiring
  let _echoChannel = null

  let echoInstance = null;

  function getEcho() {
    if (import.meta.server) {
      return null;
    }
    if (echoInstance) {
      return echoInstance;
    }
    if (window.Echo) { // From laravel-echo plugin
      echoInstance = window.Echo;
    } else { // Manual instantiation
      echoInstance = new Echo({
        broadcaster: 'pusher',
        key: config.public.pusherAppKey,
        cluster: config.public.pusherAppCluster,
        forceTLS: true
      });
    }
    return echoInstance;
  }

  function attachEchoListeners() {
    const Echo = getEcho();
    const userId = auth.user?.id
    if (!Echo || !userId) return

    // detach previous
    detachEchoListeners()

    try {
      // align with backend channel naming (users.{id})
      _echoChannel = Echo.private(`users.${userId}`)

      // Laravel will broadcast notifications on the `Illuminate\Notifications\Events\BroadcastNotificationCreated` wrapper
      _echoChannel.listen('.Illuminate\Notifications.Events.BroadcastNotificationCreated', (payload) => {
        // payload.notification contains the notification stored data
        const notification = payload?.notification ?? payload
        prependNotification({
          id: notification.id,
          type: notification.type,
          data: notification.data,
          title: notification.data?.title,
          body: notification.data?.body,
          read: false,
          created_at: new Date().toISOString()
        })
    // show an alert via composable
  try { const alert = useAppAlert(); alert.push({ message: notification.data?.title || 'New notification', type: 'info', icon: 'heroicons:bell' }) } catch (e) {}
      })

      // listen for custom MessageSent events as a fallback
      _echoChannel.listen('MessageSent', (payload) => {
        // normalize a chat message into a notification-like object
        const msg = payload.message ?? payload
        prependNotification({
          id: `msg-${msg.id ?? Date.now()}`,
          type: 'message',
          data: { message: msg.content, from: msg.sender_id },
          title: msg.title ?? 'New message',
          body: msg.content,
          read: false,
          created_at: new Date().toISOString()
        })
  try { const alert = useAppAlert(); alert.push({ message: 'New message received', type: 'info', icon: 'heroicons:chat-bubble-left-right' }) } catch (e) {}
      })

      // Listen for gamification events we added on the backend
      _echoChannel.listen('.BadgeAwarded', (payload) => {
        // payload.badge || payload.notification
        const b = payload?.badge ?? payload
        prependNotification({
          id: `badge-${b.id ?? Date.now()}`,
          type: 'badge',
          data: { badge: b },
          title: `Badge earned: ${b.name ?? 'Badge'}`,
          body: b.description ?? null,
          read: false,
          created_at: new Date().toISOString()
        })
        try { const alert = useAppAlert(); alert.push({ message: `Badge earned: ${b.name ?? 'Badge'}`, type: 'success', emoji: '🏆' }) } catch (e) {}
        // open the badge UI
        try { const badgeToast = useBadgeToast(); badgeToast.open(b, { title: `Badge earned: ${b.name ?? 'Badge'}` }) } catch (e) {}
      })

      _echoChannel.listen('.DailyChallengeCompleted', (payload) => {
        const c = payload?.challenge ?? payload
        prependNotification({
          id: `challenge-${c.id ?? Date.now()}`,
          type: 'daily_challenge',
          data: { challenge: c },
          title: `Daily challenge complete: ${c.title ?? 'Daily Challenge'}`,
          body: c.description ?? null,
          read: false,
          created_at: new Date().toISOString()
        })
        try { const alert = useAppAlert(); alert.push({ message: `Daily challenge complete: ${c.title ?? 'Daily Challenge'}`, type: 'success', emoji: '⭐' }) } catch (e) {}
      })

      _echoChannel.listen('.BattleResult', (payload) => {
        const b = payload?.battle ?? payload
        const title = b.winner_id === auth.user?.id ? 'You won a battle!' : 'Battle result'
        prependNotification({
          id: `battle-${b.id ?? Date.now()}`,
          type: 'battle',
          data: { battle: b },
          title,
          body: `Result: ${b.status ?? 'completed'}`,
          read: false,
          created_at: new Date().toISOString()
        })
        try { const alert = useAppAlert(); alert.push({ message: title, type: 'info', icon: 'heroicons:trophy' }) } catch (e) {}
      })
    } catch (err) {
      // ignore Echo errors (e.g., not connected)
    }
  }

  function detachEchoListeners() {
    if (!import.meta.client) return
    const Echo = getEcho();
    const userId = auth.user?.id
    if (!Echo || !userId) return
    try {
      if (_echoChannel) {
        // Attempt to stop listening; channel.leave may exist
        if (typeof _echoChannel.stopListening === 'function') {
          _echoChannel.stopListening('.Illuminate\\Notifications.Events.BroadcastNotificationCreated')
          _echoChannel.stopListening('MessageSent')
        }
        if (typeof _echoChannel.leave === 'function') {
          _echoChannel.leave()
        }
      }
    } catch (e) {
      // ignore
    }
    _echoChannel = null
  }

  // automatically attach when the auth user is set (consumer can also call manually)
  // Note: pinia stores don't have lifecycle hooks for auth changes — callers should call attachEchoListeners() after login/fetchUser

  // Note: stores don't run inside a component lifecycle. Consumers (components)
  // should call `attachEchoListeners()` and `detachEchoListeners()` from
  // their own lifecycle hooks (e.g., onMounted/onBeforeUnmount).

  return { drawerOpen, items, unreadCount, openDrawer, closeDrawer, toggleDrawer, markRead, fetchNotifications, prependNotification, attachEchoListeners, detachEchoListeners }
})
