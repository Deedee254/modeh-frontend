import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRuntimeConfig } from '#app'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'

export default function useChat() {
  const chatWindowRef = ref<any>(null)
  const threads = ref<any[]>([])
  const groups = ref<any[]>([])
  const messages = ref<any[]>([])
  const selectedThreadId = ref<any>(null)
  const selectedGroupId = ref<any>(null)
  const body = ref('')
  const newGroupName = ref('')
  const newGroupEmails = ref('')
  const userSearch = ref('')
  const searchResults = ref<any[]>([])
  const selectedUsers = ref<any[]>([])
  const showCreate = ref(false)
  const creating = ref(false)
  const createType = ref('dm')
  const dmEmail = ref('')
  const activeTab = ref('all')
  const searchQuery = ref('')
  const showEmojiPicker = ref(false)
  const alert = useAppAlert()
  const auth = useAuthStore()
  const userId = computed(() => (auth.user as any)?.id)
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const api = useApi()
  const messageInput = ref<any>(null)
  const dmInput = ref<any>(null)
  const isMobileKeyboardOpen = ref(false)
  const showChatWindowOnMobile = ref(false)
  const route = useRoute()

  // exposed child pane ref
  const messagesPane = ref<any>(null)
  const messagesEnd = ref<any>(null)

  // Cached canonical conversations list (threads + groups) kept sorted by last_at.
  // Rebuild only when threads or groups change to avoid sorting inside a computed
  const conversations = ref<any[]>([])

  function rebuildConversations() {
    try {
      const convs = (threads.value || []).map(c => ({ id: String(c.other_user_id || c.otherId || c.id), type: 'direct', name: c.other_name || c.otherName || c.name, last_preview: c.last_message || c.last_preview, last_at: c.last_at || c.updated_at, unread: c.unread_count || 0, unread_count: c.unread_count || 0, status: c.status || 'offline', avatar: c.avatar_url }))
      const grps = (groups.value || []).map(g => ({ id: String(g.id), type: 'group', name: g.name, last_preview: g.last_message, last_at: g.updated_at, unread: g.unread_count || 0, unread_count: g.unread_count || 0, status: null, avatar: g.avatar_url }))
      conversations.value = [...convs, ...grps].sort((a,b) => new Date(b.last_at || 0).getTime() - new Date(a.last_at || 0).getTime())
    } catch (e) {
      // fallback: linear merge
      try {
        conversations.value = []
      } catch (err) {}
    }
  }

  // nav helpers (defined here so they can be registered/removed cleanly)
  function updateNavVars() {
    try {
      const bottomEl = document.querySelector('.bottom-nav, .site-bottom-nav, nav.bottom, .app-bottom-nav') as HTMLElement | null
      const topEl = document.querySelector('.top-bar, header.site-header, nav.top, .app-top-bar') as HTMLElement | null
      const bottomH = bottomEl ? bottomEl.offsetHeight : 0
      const topH = topEl ? topEl.offsetHeight : 0
      document.documentElement.style.setProperty('--bottom-nav-height', `${bottomH}px`)
      document.documentElement.style.setProperty('--top-bar-height', `${topH}px`)
    } catch (e) {
      document.documentElement.style.setProperty('--bottom-nav-height', '0px')
      document.documentElement.style.setProperty('--top-bar-height', '0px')
    }
  }

  function _onResizeForNavHide() {
    try {
      const mobile = import.meta.client && window.matchMedia ? window.matchMedia('(max-width: 767px)').matches : false
      // Use class-only toggling to hide bottom navs. Styles are applied via global CSS
      if (!mobile) {
        document.documentElement.classList.remove('chat-hide-bottom-nav')
      } else {
        if (showChatWindowOnMobile.value) {
          document.documentElement.classList.add('chat-hide-bottom-nav')
        }
      }
    } catch (e) {}
  }

  // emoji picker
  const emojiPickerEl = ref<any>(null)
  const emojiList = ['😀','😄','😃','😊','😉','😍','😘','😅','🤣','😎','😭','😡','🤔','🤗','👍','👎','🙏','👏','🔥','💯']

  function selectEmoji(e: string) {
    body.value += e
    showEmojiPicker.value = false
    nextTick(() => { try { messageInput.value?.focus() } catch (e) {} })
  }

  function _onDocClickForEmoji(e: Event) {
    const el = emojiPickerEl.value
    if (!el) return
    if (!(el as HTMLElement).contains(e.target as Node)) showEmojiPicker.value = false
  }

  watch(() => showEmojiPicker.value, (v) => {
    if (v) document.addEventListener('click', _onDocClickForEmoji)
    else document.removeEventListener('click', _onDocClickForEmoji)
  })

  const activeConversationName = computed(() => {
    if (selectedGroupId.value) {
      const g = groups.value.find(x => x.id === selectedGroupId.value)
      return g ? g.name : 'Group'
    }
    if (selectedThreadId.value) {
      const t = threads.value.find(x => String(x.other_user_id || x.otherId || x.id) === String(selectedThreadId.value))
      return t ? (t.other_name || t.otherName || ('User ' + (t.otherId || t.other_user_id))) : 'Direct'
    }
    return 'No conversation'
  })

  const activeConversation = computed(() => {
    if (selectedGroupId.value) {
      const g = groups.value.find(x => String(x.id) === String(selectedGroupId.value))
      if (!g) return null
      return { id: String(g.id), name: g.name, avatar: g.avatar_url || g.avatar, status: null, type: 'group' }
    }
    if (selectedThreadId.value) {
      const t = threads.value.find(x => String(x.other_user_id || x.otherId || x.id) === String(selectedThreadId.value))
      if (!t) return null
      return { id: String(t.other_user_id || t.otherId || t.id), name: t.other_name || t.otherName || t.name, avatar: t.avatar_url || t.avatar, status: t.status || 'offline', type: 'direct' }
    }
    return null
  })

  const allConversations = computed(() => {
    // conversations is kept sorted and updated only when threads/groups change
    let all = (conversations.value || []).slice()
    if (activeTab.value === 'unread') all = all.filter(x => ((x.unread_count ?? x.unread) || 0) > 0)
    if (searchQuery.value) all = all.filter(c => c.name && c.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
    return all
  })

  const isTyping = computed(() => false)

  function upsertThreadFromMessage(msg: any) {
    if (msg.group_id) return
    const otherId = msg.sender_id === userId.value ? msg.recipient_id : msg.sender_id
    if (!otherId) return
    let idx = threads.value.findIndex(c => String(c.other_user_id || c.otherId || c.id) === String(otherId))
    if (idx === -1) threads.value.unshift({ other_user_id: otherId, other_name: msg.sender_name || null, last_message: msg.content, last_at: msg.created_at, unread_count: msg.sender_id === userId.value ? 0 : 1 })
    else {
      const existing = threads.value[idx]
      existing.last_message = msg.content
      existing.last_at = msg.created_at
      if (msg.sender_id !== userId.value) existing.unread_count = (existing.unread_count || 0) + 1
      threads.value.splice(idx,1)
      threads.value.unshift(existing)
    }
    // update canonical conversations list
    try { rebuildConversations() } catch (e) {}
  }

  function markThreadRead(otherId: any) {
    try { api.postJson('/api/chat/threads/mark-read', { other_user_id: otherId }).catch(()=>{}) } catch (e) {}
    const idx = threads.value.findIndex(c => String(c.other_user_id || c.otherId || c.id) === String(otherId))
    if (idx !== -1) threads.value[idx].unread_count = 0
    try { rebuildConversations() } catch (e) {}
  }

  function groupedByTime(list: any[]) {
    const out: { timeLabel: string, messages: any[] }[] = []
    list.forEach(m => {
      const date = new Date(m.created_at)
      const today = new Date()
      const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
      const day = date.toDateString() === today.toDateString() ? 'Today' : date.toDateString() === yesterday.toDateString() ? 'Yesterday' : date.toLocaleDateString()
      let grp = out.find(g => g.timeLabel === day)
      if (!grp) { grp = { timeLabel: day, messages: [] }; out.push(grp) }
      grp.messages.push(m)
    })
    return out
  }

  const groupedMessages = computed(() => groupedByTime(messages.value))

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  function selectConversation(conv: any) {
    if (conv.type === 'group') selectGroup(conv)
    else selectThread(conv)
    // Only toggle the single-column mobile chat view on small screens
    try {
      const mobile = import.meta.client && window.matchMedia ? window.matchMedia('(max-width: 767px)').matches : false
      showChatWindowOnMobile.value = !!mobile
    } catch (e) {
      showChatWindowOnMobile.value = false
    }
  }

  function toggleEmojiPicker() { showEmojiPicker.value = !showEmojiPicker.value }

  function onComposerFocus() { isMobileKeyboardOpen.value = true; try { document.body.classList.add('chat-keyboard-open') } catch (e) {}; setTimeout(() => { nextTick(() => scrollToBottom()) }, 120) }
  function onComposerBlur() { isMobileKeyboardOpen.value = false; try { document.body.classList.remove('chat-keyboard-open') } catch (e) {} }
  function autoResizeTextarea() { const textarea = messageInput.value; if (textarea) { textarea.style.height = 'auto'; textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px'; } }

  async function loadThreads() {
    try {
      const res = await fetch(apiBase + '/api/chat/threads', { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        threads.value = json.conversations || json.messages || []
        groups.value = json.groups || []
        try { rebuildConversations() } catch (e) {}
      }
    } catch (e) {}
  }

  function selectThread(t: any) {
    selectedGroupId.value = null
    selectedThreadId.value = t.id || t.otherId || t.other_user_id
    fetch(apiBase + `/api/chat/messages?user_id=${selectedThreadId.value}`, { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(json => { messages.value = json && json.messages ? json.messages : []; markThreadRead(selectedThreadId.value) }).catch(() => { messages.value = [] }).finally(() => { nextTick(() => scrollToBottom()) })
  }

  function selectGroup(g: any) {
    selectedThreadId.value = null
    selectedGroupId.value = g.id
    fetch(apiBase + `/api/chat/messages?group_id=${g.id}`, { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(json => { messages.value = json && json.messages ? json.messages : [] }).catch(() => { messages.value = [] }).finally(() => { try { api.postJson('/api/chat/groups/mark-read', { group_id: g.id }).catch(()=>{}) } catch (e) {}; nextTick(() => scrollToBottom()) })
  }

  async function startDMByEmail() {
    const email = dmEmail.value.trim()
    if (!email) { alert.push({ message: 'Enter an email', type: 'error', icon: 'heroicons:exclamation-circle' }); return }
    if (email.toLowerCase() === 'support' || email.toLowerCase() === 'help') {
      try {
        const res = await fetch(apiBase + '/api/messages/support-chat', { credentials: 'include' })
        if (!res.ok) { alert.push({ message: 'Support chat unavailable', type: 'error' }); return }
        const json = await res.json(); const admin = json.contact
        const threadRes = await api.postJson('/api/chat/threads', { recipient_id: admin.id, type: 'support' })
        if (api.handleAuthStatus(threadRes)) return
        dmEmail.value = ''
        await loadThreads(); selectConversation({ id: admin.id, type: 'direct' })
      } catch (e) { alert.push({ message: 'Could not start support chat', type: 'error' }) }
      return
    }
    try {
      const r = await fetch(apiBase + '/api/users/find-by-email?email=' + encodeURIComponent(email), { credentials: 'include' })
      if (r.status === 404) { alert.push({ message: 'User not found', type: 'error' }); return }
      if (!r.ok) { alert.push({ message: 'Lookup failed', type: 'error' }); return }
      const j = await r.json(); const user = j.user
      const threadRes = await api.postJson('/api/chat/threads', { recipient_id: user.id, type: 'direct' })
      if (api.handleAuthStatus(threadRes)) return
      if (!threadRes.ok) { alert.push({ message: 'Could not create thread', type: 'error' }); return }
      dmEmail.value = ''
      await loadThreads(); selectConversation({ id: user.id, type: 'direct' })
    } catch (e) { alert.push({ message: 'Network error', type: 'error' }) }
  }

  function scrollToBottom() {
    try {
      // prefer the sentinel element if available (supports smooth scroll)
      const sentinel = messagesEnd.value || (chatWindowRef.value && chatWindowRef.value.messagesEnd && chatWindowRef.value.messagesEnd.value)
      if (sentinel && sentinel.scrollIntoView) {
        sentinel.scrollIntoView({ behavior: 'smooth', block: 'end' })
        return
      }
      const el = messagesPane.value || (chatWindowRef.value && chatWindowRef.value.messagesPane && chatWindowRef.value.messagesPane.value)
      if (el && el.scrollHeight) el.scrollTop = el.scrollHeight
    } catch (e) {}
  }

  async function sendMessage() {
    if (!body.value.trim()) return
    const tempId = 'temp-' + Date.now()
    // create an optimistic message. We intentionally do NOT set `sending: true` so the UI
    // will show the message as delivered (double tick) immediately. We mark it as `_optimistic`
    // so it can be reconciled when the server response or Echo event arrives.
    const optimistic = { id: tempId, sender_id: userId.value, recipient_id: selectedThreadId.value || null, group_id: selectedGroupId.value || null, content: body.value, created_at: new Date().toISOString(), _optimistic: true }
    messages.value.push(optimistic)
    const payload: any = { content: optimistic.content }
    if (selectedGroupId.value) payload.group_id = selectedGroupId.value
    else if (selectedThreadId.value) payload.recipient_id = selectedThreadId.value
    body.value = ''
    nextTick(() => scrollToBottom())
    try {
      const res = await api.postJson('/api/chat/send', payload)
      if (api.handleAuthStatus(res)) return
      if (res.ok) {
        const json = await res.json()
        const idx = messages.value.findIndex(m => m.id === tempId)
        if (idx !== -1) {
          // replace optimistic with server message
          messages.value.splice(idx, 1, json.message)
        } else {
          // fallback: push it if not present
          messages.value.push(json.message)
        }
        nextTick(() => scrollToBottom())
      } else {
        const idx = messages.value.findIndex(m => m.id === tempId)
        if (idx !== -1) messages.value[idx].sending = false, messages.value[idx].failed = true
        alert.push({ message: 'Failed to send message', type: 'error' })
      }
    } catch (e) {
      const idx = messages.value.findIndex(m => m.id === tempId)
      if (idx !== -1) messages.value[idx].sending = false, messages.value[idx].failed = true
      alert.push({ message: 'Network error', type: 'error' })
    }
  }

  async function createGroup() {
    const emails = selectedUsers.value.map(u => u.email).concat(newGroupEmails.value.split(',').map(s => s.trim()).filter(Boolean))
    try {
      const res = await api.postJson('/api/chat/groups', { name: newGroupName.value, emails })
      if (api.handleAuthStatus(res)) return
  if (res.ok) { const json = await res.json(); groups.value.unshift(json.group); try { rebuildConversations() } catch (e) {} newGroupName.value = ''; newGroupEmails.value = ''; selectedUsers.value = []; showCreate.value = false; alert.push({ message: 'Group created', type: 'success' }) }
      else { const err = await res.json().catch(() => null); alert.push({ message: err?.errors ? 'Invalid group data' : 'Failed to create group', type: 'error' }) }
    } catch (e) { alert.push({ message: 'Network error', type: 'error' }) }
  }

  let _userSearchTimer: any = null
  let _onWindowKeydown: any = null
  async function _doUserSearch(q: string) {
    if (!q) { searchResults.value = []; return }
    try {
      const res = await fetch(apiBase + '/api/users/search?q=' + encodeURIComponent(q), { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        searchResults.value = (json.users || []).filter((u: any) => !selectedUsers.value.some(s => s.id === u.id))
      }
    } catch (e) {
      // ignore
    }
  }

  function onUserSearch() {
    const q = userSearch.value.trim()
    if (_userSearchTimer) clearTimeout(_userSearchTimer)
    // debounce network requests by 250ms
    _userSearchTimer = setTimeout(() => { void _doUserSearch(q) }, 250)
  }

  function addUserToInvite(u: any) { if (selectedUsers.value.length >= 9) { alert.push({ message: 'Maximum 10 members allowed', type: 'error' }); return } selectedUsers.value.push(u); userSearch.value = ''; searchResults.value = [] }
  function removeSelectedUser(u: any) { selectedUsers.value = selectedUsers.value.filter(s => s.id !== u.id) }
  function onShiftEnter() { body.value += '\n' }
  function onFileChange(e: Event) { alert.push({ message: 'File uploads not implemented yet.', type: 'info' }) }

  let _channel: any = null
  function attachEcho() {
    if (!import.meta.client || !window?.Echo || !userId.value) return
    try {
  if (_channel && _channel.leave) _channel.leave()
  _channel = window.Echo.private(`App.Models.User.${userId.value}`)
      _channel.listen('.MessageSent', (payload: any) => {
        const msg = payload.message ?? payload
        upsertThreadFromMessage(msg)
        const otherId = msg.sender_id === userId.value ? msg.recipient_id : msg.sender_id
        if (selectedThreadId.value && String(selectedThreadId.value) === String(otherId)) {
          // Avoid duplicates: if the exact server id already exists, replace it.
          const existingById = messages.value.findIndex(m => String(m.id) === String(msg.id))
          if (existingById !== -1) {
            messages.value.splice(existingById, 1, msg)
            markThreadRead(otherId)
            nextTick(() => scrollToBottom())
            return
          }

          // Try to find a matching optimistic message (by temp id + content + sender + timestamp proximity)
          const optIdx = messages.value.findIndex(m => m._optimistic && m.sender_id === msg.sender_id && (m.content === msg.content || m.body === msg.content) && Math.abs(new Date(m.created_at).getTime() - new Date(msg.created_at).getTime()) < 5000)
          if (optIdx !== -1) {
            messages.value.splice(optIdx, 1, msg)
            markThreadRead(otherId)
            nextTick(() => scrollToBottom())
            return
          }

          // No match: push as a new incoming message
          messages.value.push(msg)
          markThreadRead(otherId)
        }
        nextTick(() => scrollToBottom())
      })
    } catch (e) { console.error('attachEcho error', e) }
  }

  function attachGroupChannel(groupId: any) {
    if (!import.meta.client || !window?.Echo || !groupId) return
    try {
      if (_channel && _channel.leave) _channel.leave()
      _channel = window.Echo.private(`App.Models.Group.${groupId}`)
      _channel.listen('.MessageSent', (payload: any) => {
        const msg = payload.message ?? payload
        if (msg.group_id == groupId) {
          const gi = groups.value.find(g => g.id == groupId)
          if (gi) { gi.last_message = msg.content; gi.last_at = msg.created_at; gi.unread_count = (gi.unread_count||0) + (msg.sender_id === userId.value ? 0 : 1) }
          if (selectedGroupId.value && String(selectedGroupId.value) === String(groupId)) {
            const existingById = messages.value.findIndex(m => String(m.id) === String(msg.id))
            if (existingById !== -1) {
              messages.value.splice(existingById, 1, msg)
              nextTick(() => scrollToBottom())
              return
            }
            const optIdx = messages.value.findIndex(m => m._optimistic && m.sender_id === msg.sender_id && (m.content === msg.content || m.body === msg.content) && Math.abs(new Date(m.created_at).getTime() - new Date(msg.created_at).getTime()) < 5000)
            if (optIdx !== -1) {
              messages.value.splice(optIdx, 1, msg)
              nextTick(() => scrollToBottom())
              return
            }
            messages.value.push(msg)
          }
        }
        // update conversations to reflect new group last_at
        try { rebuildConversations() } catch (e) {}
        nextTick(() => scrollToBottom())
      })
    } catch (e) { console.error('attachGroupChannel error', e) }
  }

  let _loadingOlder = false
  async function maybeLoadOlder() {
    try {
      const el = messagesPane.value || (chatWindowRef.value && chatWindowRef.value.messagesPane && chatWindowRef.value.messagesPane.value)
      if (!el || _loadingOlder) return
      if (el.scrollTop > 50) return
      if (!messages.value.length) return
      _loadingOlder = true
      const earliest = messages.value[0]
      const params = new URLSearchParams()
      params.set('per_page', '50')
      params.set('before_id', String(earliest.id))
      if (selectedThreadId.value) params.set('user_id', String(selectedThreadId.value))
      if (selectedGroupId.value) params.set('group_id', String(selectedGroupId.value))
      const url = apiBase + '/api/chat/messages?' + params.toString()
      const res = await fetch(url, { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        if (json && json.messages && json.messages.length) {
          const oldHeight = el.scrollHeight
          messages.value = json.messages.concat(messages.value)
          await nextTick()
          el.scrollTop = el.scrollHeight - oldHeight
        }
      }
    } catch (e) { console.error('load older messages failed', e) } finally { _loadingOlder = false }
  }

  onMounted(() => {
  if (!import.meta.client) return
    loadThreads()
    attachEcho()
    nextTick(() => {
      try {
        if (chatWindowRef.value && chatWindowRef.value.messagesPane) messagesPane.value = chatWindowRef.value.messagesPane.value
        if (chatWindowRef.value && chatWindowRef.value.messagesEnd) messagesEnd.value = chatWindowRef.value.messagesEnd.value
        const el = messagesPane.value || (chatWindowRef.value && chatWindowRef.value.messagesPane && chatWindowRef.value.messagesPane.value)
        if (el) el.addEventListener('scroll', maybeLoadOlder)
      } catch (e) {}
    })

    nextTick(() => { const ta = messageInput.value; if (ta) { ta.addEventListener('input', autoResizeTextarea); autoResizeTextarea() } })

  // named handler so we can remove it on unmount
  _onWindowKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') { if (showCreate.value) closeCreate(); else if (showChatWindowOnMobile.value) showChatWindowOnMobile.value = false } }
  window.addEventListener('keydown', _onWindowKeydown)

    try {
      const q = route && route.query ? route.query : {}
      if ((q as any).user_id) { const uid = Array.isArray((q as any).user_id) ? (q as any).user_id[0] : (q as any).user_id; selectConversation({ id: uid, type: 'direct' }) }
      else if ((q as any).group_id) { const gid = Array.isArray((q as any).group_id) ? (q as any).group_id[0] : (q as any).group_id; selectConversation({ id: gid, type: 'group' }) }
    } catch (e) {}

    // adjust page CSS variables to avoid bottom/top nav overlap
      // see top-level helpers defined outside onMounted
      updateNavVars()
      window.addEventListener('resize', updateNavVars)
      window.addEventListener('resize', _onResizeForNavHide)
  })

  // Consolidated cleanup on unmount: remove all listeners, timers and leave channels
  onBeforeUnmount(() => {
    try { document.body.classList.remove('chat-keyboard-open') } catch (e) {}
    try { window.removeEventListener('resize', updateNavVars) } catch (e) {}
    try { window.removeEventListener('resize', _onResizeForNavHide as any) } catch (e) {}
    try { document.removeEventListener('click', _onDocClickForEmoji) } catch (e) {}
    try { if (_userSearchTimer) clearTimeout(_userSearchTimer) } catch (e) {}
    try { if (_channel && _channel.leave) _channel.leave() } catch (e) {}
    try {
      const el = messagesPane.value || (chatWindowRef.value && chatWindowRef.value.messagesPane && chatWindowRef.value.messagesPane.value)
      if (el && el.removeEventListener) el.removeEventListener('scroll', maybeLoadOlder)
    } catch (e) {}
    try { const ta = messageInput.value; if (ta && ta.removeEventListener) ta.removeEventListener('input', autoResizeTextarea) } catch (e) {}
    try { window.removeEventListener('keydown', _onWindowKeydown as any) } catch (e) {}
  })

  watch(() => selectedGroupId.value, (id) => { if (id) attachGroupChannel(id); else if (_channel && _channel.leave) { try { _channel.leave() } catch (e) {} } })

  // hide/show bottom navigation on mobile when the chat window is opened in mobile view
  watch(() => showChatWindowOnMobile.value, (hide) => {
    try {
      const mobile = import.meta.client && window.matchMedia ? window.matchMedia('(max-width: 767px)').matches : false
      // Only toggle a root-level class; a global CSS rule will hide the bottom nav elements.
      if (hide && mobile) {
        document.documentElement.classList.add('chat-hide-bottom-nav')
      } else {
        document.documentElement.classList.remove('chat-hide-bottom-nav')
      }
    } catch (e) {}
  })

  function closeCreate() { showCreate.value = false }

  async function resendMessage(m: any) {
    if (!m || (!m.content && !m.body)) return
    m.failed = false; m.sending = true
    try {
      const payload: any = { content: m.content || m.body }
      if (m.group_id) payload.group_id = m.group_id
      else if (m.recipient_id) payload.recipient_id = m.recipient_id
      const res = await api.postJson('/api/chat/send', payload)
      if (api.handleAuthStatus(res)) return
      if (res.ok) { const json = await res.json(); const idx = messages.value.findIndex(x => x.id === m.id); if (idx !== -1) messages.value.splice(idx, 1, json.message) }
      else { m.sending = false; m.failed = true }
    } catch (e) { m.sending = false; m.failed = true }
  }

  return {
    // refs
    chatWindowRef,
    threads,
    groups,
    messages,
    selectedThreadId,
    selectedGroupId,
    body,
    newGroupName,
    newGroupEmails,
    userSearch,
    searchResults,
    selectedUsers,
    showCreate,
    creating,
    createType,
    dmEmail,
    activeTab,
    searchQuery,
    showEmojiPicker,
    messageInput,
    dmInput,
    isMobileKeyboardOpen,
    showChatWindowOnMobile,
    messagesPane,
    emojiPickerEl,
    emojiList,
    // computed
    userId,
    activeConversation,
    activeConversationName,
    allConversations,
    groupedMessages,
    isTyping,
    // methods
    selectEmoji,
    selectConversation,
    toggleEmojiPicker,
    onComposerFocus,
    onComposerBlur,
    autoResizeTextarea,
    loadThreads,
    selectThread,
    selectGroup,
    startDMByEmail,
    scrollToBottom,
    sendMessage,
    createGroup,
    onUserSearch,
    addUserToInvite,
    removeSelectedUser,
    onShiftEnter,
    onFileChange,
    attachEcho,
    attachGroupChannel,
    maybeLoadOlder,
    closeCreate,
    resendMessage,
    upsertThreadFromMessage,
    markThreadRead,
    formatTime,
  }
}
