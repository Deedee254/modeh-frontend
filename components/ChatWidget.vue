<template>
  <div class="flex h-full bg-gray-50">
    <!-- Conversations list -->
  <aside :class="['w-full lg:w-80 xl:w-96 bg-white border-r border-gray-200 flex-col transition-all', sidebarOpen ? 'flex' : 'hidden lg:flex']">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <button class="lg:hidden p-2 rounded-full text-gray-500 hover:bg-gray-100" @click="sidebarOpen = !sidebarOpen" aria-label="Toggle sidebar">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <h2 class="text-lg font-semibold text-gray-900">Messages</h2>
          </div>
          <button @click="showCreate = true" class="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Unified Create Chat Modal -->
  <div v-if="showCreate" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" @keydown.esc="closeCreate">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
          <button @click="showCreate = false" class="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <h3 class="font-medium text-lg text-gray-900 mb-4">Start New Chat</h3>
          <div class="mb-4 flex gap-2">
            <button @click="createType = 'dm'" :class="['flex-1 py-2 rounded-lg font-medium', createType === 'dm' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700']">Direct Message</button>
            <button @click="createType = 'group'" :class="['flex-1 py-2 rounded-lg font-medium', createType === 'group' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700']">Group Chat</button>
          </div>
          <form v-if="createType === 'dm'" @submit.prevent="startDMByEmail" class="space-y-3">
            <input ref="dmInput" v-model="dmEmail" placeholder="Enter user email or 'support'" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" />
            <div class="flex gap-2">
              <button type="submit" :disabled="creating" class="flex-1 inline-flex items-center justify-center gap-2 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 font-medium">
                <svg v-if="creating" class="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"></path></svg>
                Start DM
              </button>
              <button type="button" class="px-3 py-2 rounded-lg bg-gray-100 text-gray-700" @click="dmEmail = ''">Clear</button>
            </div>
          </form>
          <form v-else @submit.prevent="createGroup" class="space-y-3">
            <input v-model="newGroupName" placeholder="Group name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" />
            <div class="relative">
              <input v-model="userSearch" @input="onUserSearch" placeholder="Search users to add..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" />
              <ul v-if="searchResults.length" class="absolute left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-auto z-20 shadow-lg">
                <li v-for="u in searchResults" :key="u.id" @click="addUserToInvite(u)" class="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0">
                  <div class="font-medium">{{ u.name }}</div>
                  <div class="text-xs text-gray-500">{{ u.email }}</div>
                </li>
              </ul>
            </div>
            <div v-if="selectedUsers.length > 0" class="flex flex-wrap gap-2">
              <div v-for="s in selectedUsers" :key="s.id" class="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                <span>{{ s.name || s.email }}</span>
                <button type="button" @click="removeSelectedUser(s)" class="ml-1 text-indigo-600 hover:text-indigo-800">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="text-xs text-gray-500">Up to 10 members (including you)</div>
            <button type="submit" class="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 font-medium">Create Group</button>
          </form>
        </div>
      </div>

      <div class="flex-1 overflow-auto px-4">
        <!-- Groups Section -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-medium text-gray-900">Groups</h4>
            <div class="flex bg-gray-100 rounded-lg p-1">
              <button
                :class="['px-3 py-1 text-xs font-medium rounded-md transition-colors', activeTab === 'unread' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900']"
                @click="activeTab = 'unread'"
              >
                Unread
              </button>
              <button
                :class="['px-3 py-1 text-xs font-medium rounded-md transition-colors', activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900']"
                @click="activeTab = 'all'"
              >
                All
              </button>
            </div>
          </div>

          <div v-if="groups.length === 0" class="text-center py-8 text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <p class="text-sm">No group chats yet</p>
            <button @click="showCreate = true" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-1">Create your first group</button>
          </div>

          <ul v-else class="space-y-1">
            <li v-for="g in filteredGroups" :key="g.id" @click="selectGroup(g)" class="p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-3" :class="g.id === selectedGroupId ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'">
              <img v-if="g.avatar" :src="g.avatar" class="w-10 h-10 rounded-full object-cover" alt="group avatar" />
              <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">{{ (g.name||'G').slice(0,1).toUpperCase() }}</div>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-900 truncate">{{ g.name }}</div>
                <div class="text-xs text-gray-500">{{ g.members?.length || 0 }} members</div>
              </div>
              <div v-if="g.unread_count > 0" class="ml-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{{ g.unread_count }}</div>
            </li>
          </ul>
        </div>

        <!-- Direct Messages Section -->
        <div>
          <h4 class="text-sm font-medium text-gray-900 mb-3">Direct Messages</h4>

          <div v-if="filteredThreads.length === 0" class="text-center py-8 text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <p class="text-sm">No conversations yet</p>
            <p class="text-xs text-gray-400 mt-1">Start chatting with someone!</p>
          </div>

          <ul v-else class="space-y-1">
            <li v-for="t in filteredThreads" :key="t.id || t.otherId" @click="selectThread(t)" class="p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-3" :class="t.otherId === selectedThreadId ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'">
              <img v-if="t.avatar" :src="t.avatar" class="w-10 h-10 rounded-full object-cover" alt="avatar" />
              <div :class="['w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm', t.unread > 0 ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-600']" v-else>
                {{ (t.otherName||'U').slice(0,1).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <div class="font-medium text-gray-900 truncate">{{ t.otherName || ('User ' + t.otherId) }}</div>
                  <div class="text-xs text-gray-500 flex-shrink-0 ml-2">{{ t.last_at ? formatTime(t.last_at) : '' }}</div>
                </div>
                <div class="text-xs text-gray-500 truncate">{{ t.last_preview || 'No messages yet' }}</div>
              </div>
              <div v-if="t.unread > 0" class="ml-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{{ t.unread }}</div>
            </li>
          </ul>
        </div>
      </div>
    </aside>

    <!-- Messages pane -->
    <section class="flex-1 bg-white flex-col" :class="activeConversation ? 'flex' : 'hidden lg:flex'">
      <header class="px-6 py-4 border-b border-gray-200 bg-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button @click="activeConversation = null" class="lg:hidden p-2 rounded-full text-gray-500 hover:bg-gray-100">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div class="relative">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {{ activeTitleInitial }}
              </div>
              <div v-if="isOnline" class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <div class="font-semibold text-gray-900">{{ activeConversationName }}</div>
              <div class="text-sm text-gray-500">{{ activeConversationSubtitle }}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="text-sm text-gray-500">{{ messages.length }} messages</div>
            <button class="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-auto px-6 py-4 space-y-4" ref="messagesPane">
        <div v-if="!activeConversation" class="flex flex-col items-center justify-center h-full text-center">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
          <p class="text-gray-500 max-w-sm">Choose a chat from the sidebar or start a new conversation to begin messaging.</p>
        </div>

        <template v-else>
            <div v-for="(chunk, idx) in groupedMessages" :key="idx" class="space-y-4">
            <div class="flex justify-center">
              <div class="px-3 py-1 bg-gray-100 rounded-full">
                <span class="text-xs text-gray-500 font-medium">{{ chunk.timeLabel }}</span>
              </div>
            </div>
            <div v-for="m in chunk.messages" :key="m.id" class="flex" :class="m.sender_id === userId.value ? 'justify-end' : 'justify-start'">
              <div class="max-w-xs lg:max-w-md xl:max-w-lg">
                <div :class="[
                  'px-4 py-3 rounded-xl shadow-sm break-words',
                  m.sender_id === userId.value
                    ? 'bg-emerald-500 text-white rounded-br-none'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                ]" style="border-radius: 16px;">
                  <div class="text-sm leading-relaxed">{{ m.content }}</div>
                  <div v-if="m.sending" class="text-xs text-white opacity-80 mt-2">Sending…</div>
                  <div v-if="m.failed" class="text-xs text-red-600 mt-2 flex items-center gap-2">
                    <span>Failed to send</span>
                    <button @click="resendMessage(m)" class="text-xs px-2 py-1 bg-gray-100 rounded">Retry</button>
                  </div>
                </div>
                <div :class="[
                  'text-xs mt-1',
                  m.sender_id === userId.value ? 'text-right text-gray-500' : 'text-left text-gray-500'
                ]">
                  {{ formatTime(m.created_at) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Typing indicator placeholder -->
          <div v-if="isTyping" class="flex justify-start">
            <div class="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
              <div class="flex items-center space-x-1">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
                <span class="text-xs text-gray-500 ml-2">Someone is typing...</span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <footer class="px-6 py-4 border-t border-gray-200 bg-white">
        <form @submit.prevent="sendMessage" class="flex items-end gap-3">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              @click="toggleEmoji"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </button>

            <input ref="fileInput" type="file" class="hidden" @change="onFileChange" />
            <button
              type="button"
              class="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              @click="$refs.fileInput.click()"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
              </svg>
            </button>
          </div>

          <div class="flex-1 relative">
            <textarea
              v-model="body"
              @keydown.enter.exact.prevent="sendMessage"
              @keydown.enter.shift="onShiftEnter"
              placeholder="Type a message..."
              class="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none min-h-[2.5rem] max-h-32 text-sm placeholder-gray-500"
              rows="1"
              style="height: 2.5rem;"
              ref="messageInput"
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="!body.trim()"
            :class="[
              'p-3 rounded-full transition-all duration-200 flex items-center justify-center',
              body.trim()
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            ]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </form>
      </footer>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useAppAlert } from '~/composables/useAppAlert'

const threads = ref([])
const groups = ref([])
const messages = ref([])
const selectedThreadId = ref(null)
const selectedGroupId = ref(null)
const body = ref('')
const newGroupName = ref('')
const newGroupEmails = ref('')
const userSearch = ref('')
const searchResults = ref([])
const selectedUsers = ref([]) // array of user objects
const showCreate = ref(false)
const sidebarOpen = ref(true)
const creating = ref(false)
const createType = ref('dm')
const dmEmail = ref('')
const activeTab = ref('unread')
const alert = useAppAlert()
const auth = useAuthStore()
const userId = computed(() => auth.user?.id)
const apiBase = useRuntimeConfig().public.apiBase
const messageInput = ref(null)
const dmInput = ref(null)

const activeConversation = computed(() => {
  if (selectedGroupId.value) return { type: 'group', id: selectedGroupId.value }
  if (selectedThreadId.value) return { type: 'direct', id: selectedThreadId.value }
  return null
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

const activeConversationSubtitle = computed(() => {
  if (selectedGroupId.value) return 'Group chat'
  if (selectedThreadId.value) return 'Direct message'
  return ''
})

const activeTitleInitial = computed(() => (activeConversationName.value || 'M').slice(0,1))

// threads.value will now store the server-provided `conversations` array
// shape: { other_user_id, other_name, last_message, last_at, unread_count }
const filteredThreads = computed(() => {
  const convs = threads.value.map(c => ({
    otherId: c.other_user_id || c.otherId || c.id,
    otherName: c.other_name || c.otherName || c.name,
    last_preview: c.last_message || c.last_preview,
    last_at: c.last_at || c.updated_at,
    unread: c.unread_count || 0
  }))
  if (activeTab.value === 'unread') return convs.filter(x => (x.unread || 0) > 0)
  return convs.sort((a,b) => new Date(b.last_at || 0) - new Date(a.last_at || 0))
})

const filteredGroups = computed(() => {
  if (activeTab.value === 'unread') return groups.value.filter(g => (g.unread_count || 0) > 0)
  return groups.value.sort((a,b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
})

const isOnline = computed(() => {
  // Placeholder - would need real-time status from backend
  return Math.random() > 0.5
})

const isTyping = computed(() => {
  // Placeholder - would need real-time typing indicators from backend
  return false
})

function upsertThreadFromMessage(msg) {
  // Expect server message to use new fields: sender_id, recipient_id, content
  if (msg.group_id) return
  const otherId = msg.sender_id === userId.value ? msg.recipient_id : msg.sender_id
  if (!otherId) return
  let idx = threads.value.findIndex(c => String(c.other_user_id || c.otherId || c.id) === String(otherId))
  if (idx === -1) {
  threads.value.unshift({ other_user_id: otherId, other_name: msg.sender_name || null, last_message: msg.content, last_at: msg.created_at, unread_count: msg.sender_id === userId.value ? 0 : 1 })
  } else {
    const existing = threads.value[idx]
    existing.last_message = msg.content
    existing.last_at = msg.created_at
    if (msg.sender_id !== userId.value) existing.unread_count = (existing.unread_count || 0) + 1
    threads.value.splice(idx,1)
    threads.value.unshift(existing)
  }
}

function markThreadRead(otherId) {
  // server-side persist read state
  try {
    fetch(apiBase + '/api/chat/threads/mark-read', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ other_user_id: otherId }) })
  } catch (e) {}
  const idx = threads.value.findIndex(c => String(c.other_user_id || c.otherId || c.id) === String(otherId))
  if (idx !== -1) threads.value[idx].unread_count = 0
}

function groupedByTime(list) {
  // naive grouping by date (day)
  const out = []
  list.forEach(m => {
    const day = new Date(m.created_at).toLocaleDateString()
    let grp = out.find(g => g.timeLabel === day)
    if (!grp) { grp = { timeLabel: day, messages: [] }; out.push(grp) }
    grp.messages.push(m)
  })
  return out
}

const groupedMessages = computed(() => groupedByTime(messages.value))

function formatTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return date.toLocaleDateString()
}

function toggleEmoji() {
  // Placeholder - would implement emoji picker
  console.log('Toggle emoji picker')
}

function autoResizeTextarea() {
  const textarea = messageInput.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px'
  }
}

async function loadThreads() {
  try {
    const res = await fetch(apiBase + '/api/chat/threads', { credentials: 'include' })
    if (res.ok) {
      const json = await res.json()
      // server returns { conversations: [...], groups: [...] }
      threads.value = json.conversations || json.messages || []
      groups.value = json.groups || []
    }
  } catch (e) {
    // ignore
  }
}

function selectThread(t) {
  selectedGroupId.value = null
  selectedThreadId.value = t.otherId || t.other_user_id || t.id
  // load messages for this direct conversation
  fetch(apiBase + `/api/chat/messages?user_id=${selectedThreadId.value}`, { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(json => {
    if (json && json.messages) messages.value = json.messages
    else messages.value = []
    // persist read state
    markThreadRead(selectedThreadId.value)
  }).catch(() => {
    messages.value = []
    markThreadRead(selectedThreadId.value)
  })
  nextTick(() => scrollToBottom())
}

function selectGroup(g) {
  selectedThreadId.value = null
  selectedGroupId.value = g.id
  // load messages for the group from server
  fetch(apiBase + `/api/chat/messages?group_id=${g.id}`, { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(json => {
    messages.value = json && json.messages ? json.messages : []
  }).catch(() => { messages.value = [] })
  .finally(() => {
    // mark group read on server once opened
    try { fetch(apiBase + '/api/chat/groups/mark-read', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ group_id: g.id }) }) } catch (e) {}
    nextTick(() => scrollToBottom())
  })
}

async function startDMByEmail() {
  const email = dmEmail.value.trim()
  if (!email) { 
    alert.push({ message: 'Enter an email', type: 'error', icon: 'heroicons:exclamation-circle' }); 
    return 
  }

  // Special case for support chat
  if (email.toLowerCase() === 'support' || email.toLowerCase() === 'help') {
    try {
      // Find first available admin for support chat
      const res = await fetch(apiBase + '/api/messages/support-chat', { credentials: 'include' })
      if (!res.ok) {
        alert.push({ message: 'Support chat unavailable', type: 'error', icon: 'heroicons:exclamation-circle' })
        return
      }
      const json = await res.json()
      const admin = json.contact

      // Create or get support thread
      await fetch(apiBase + '/api/chat/threads', { 
        method: 'POST', 
        credentials: 'include', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          recipient_id: admin.id,
          type: 'support'
        }) 
      })

      dmEmail.value = ''
      await loadThreads()
      selectedThreadId.value = admin.id

      // Load support messages
      const msgs = await fetch(apiBase + `/api/chat/messages?user_id=${admin.id}&type=support`, { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
      if (msgs && msgs.messages) messages.value = msgs.messages
      markThreadRead(admin.id)
      nextTick(() => scrollToBottom())

    } catch (e) {
      alert.push({ message: 'Could not start support chat', type: 'error', icon: 'heroicons:x-circle' })
    }
    return
  }

  // Regular DM flow
  try {
    const r = await fetch(apiBase + '/api/users/find-by-email?email=' + encodeURIComponent(email), { credentials: 'include' })
    if (r.status === 404) { 
      alert.push({ message: 'User not found', type: 'error', icon: 'heroicons:exclamation-circle' }); 
      return 
    }
    if (!r.ok) { 
      alert.push({ message: 'Lookup failed', type: 'error', icon: 'heroicons:exclamation-circle' }); 
      return 
    }
    const j = await r.json()
    const user = j.user
    
    // ensure thread on server
    const res = await fetch(apiBase + '/api/chat/threads', { 
      method: 'POST', 
      credentials: 'include', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        recipient_id: user.id,
        type: 'direct'
      }) 
    })
    
    if (!res.ok) { 
      alert.push({ message: 'Could not create thread', type: 'error', icon: 'heroicons:exclamation-circle' }); 
      return 
    }
    
    dmEmail.value = ''
    await loadThreads()
    selectedThreadId.value = user.id
    
    const msgs = await fetch(apiBase + `/api/chat/messages?user_id=${user.id}&type=direct`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
    if (msgs && msgs.messages) messages.value = msgs.messages
    markThreadRead(user.id)
    nextTick(() => scrollToBottom())
    
  } catch (e) {
    alert.push({ message: 'Network error', type: 'error', icon: 'heroicons:x-circle' })
  }
}

const messagesPane = ref(null)
function scrollToBottom() {
  try {
    const el = messagesPane.value
    if (el && el.scrollHeight) el.scrollTop = el.scrollHeight
  } catch (e) {}
}

async function sendMessage() {
  if (!body.value.trim()) return
  // optimistic UI: push a temp message immediately
  const tempId = 'temp-' + Date.now()
  const optimistic = {
    id: tempId,
    sender_id: userId.value,
    recipient_id: selectedThreadId.value || null,
    group_id: selectedGroupId.value || null,
    content: body.value,
    created_at: new Date().toISOString(),
    sending: true,
  }
  messages.value.push(optimistic)
  const payload = { body: body.value }
  if (selectedGroupId.value) payload.group_id = selectedGroupId.value
  else if (selectedThreadId.value) payload.recipient_id = selectedThreadId.value

  body.value = ''
  nextTick(() => scrollToBottom())

  try {
  const res = await fetch(apiBase + '/api/chat/send', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) {
      const json = await res.json()
      // replace optimistic message with server message
      const idx = messages.value.findIndex(m => m.id === tempId)
  if (idx !== -1) messages.value.splice(idx, 1, json.message)
      nextTick(() => scrollToBottom())
    } else {
      // mark optimistic as failed
      const idx = messages.value.findIndex(m => m.id === tempId)
  if (idx !== -1) messages.value[idx].sending = false, messages.value[idx].failed = true
  alert.push({ message: 'Failed to send message', type: 'error', icon: 'heroicons:x-circle' })
    }
  } catch (e) {
    const idx = messages.value.findIndex(m => m.id === tempId)
    if (idx !== -1) messages.value[idx].sending = false, messages.value[idx].failed = true
  alert.push({ message: 'Network error', type: 'error', icon: 'heroicons:x-circle' })
  }
}

async function createGroup() {
  const emails = selectedUsers.value.map(u => u.email).concat(newGroupEmails.value.split(',').map(s => s.trim()).filter(Boolean))
  try {
    const res = await fetch(apiBase + '/api/chat/groups', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newGroupName.value, emails }) })
    if (res.ok) {
      const json = await res.json()
  groups.value.unshift(json.group)
      newGroupName.value = ''
      newGroupEmails.value = ''
      selectedUsers.value = []
  showCreate.value = false
  alert.push({ message: 'Group created', type: 'success', icon: 'heroicons:check-circle' })
    } else {
      const err = await res.json().catch(() => null)
  alert.push({ message: err?.errors ? 'Invalid group data' : 'Failed to create group', type: 'error', icon: 'heroicons:exclamation-circle' })
    }
  } catch (e) {
  alert.push({ message: 'Network error', type: 'error', icon: 'heroicons:x-circle' })
  }
}

let _userSearchTimer = null
async function onUserSearch() {
  const q = userSearch.value.trim()
  if (_userSearchTimer) clearTimeout(_userSearchTimer)
  if (!q) { searchResults.value = []; return }
  _userSearchTimer = setTimeout(async () => {
    try {
      const res = await fetch(apiBase + '/api/users/search?q=' + encodeURIComponent(q), { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        searchResults.value = (json.users || []).filter(u => !selectedUsers.value.some(s => s.id === u.id))
      }
    } catch (e) {}
  }, 250)
}

function addUserToInvite(u) {
  if (selectedUsers.value.length >= 9) {
    alert.push({ message: 'Maximum 10 members allowed', type: 'error', icon: 'heroicons:exclamation-triangle' })
    return
  }
  selectedUsers.value.push(u)
  userSearch.value = ''
  searchResults.value = []
}

function removeSelectedUser(u) { selectedUsers.value = selectedUsers.value.filter(s => s.id !== u.id) }

function onShiftEnter() { body.value += '\n' }

function onFileChange(e) { /* TODO: implement file upload */ }

function formatDate(s) { try { return new Date(s).toLocaleString() } catch (e) { return s } }

// Real-time listening via Echo
let _channel = null
function attachEcho() {
  if (!process.client || !window?.Echo || !userId.value) return
  try {
    // subscribe to the server channel name: App.Models.User.{id}
    window.Echo.private(`App.Models.User.${userId.value}`).listen('.MessageSent', (payload) => {
      const msg = payload.message ?? payload
      upsertThreadFromMessage(msg)
      const otherId = msg.sender_id === userId.value ? msg.recipient_id : msg.sender_id
      if (selectedThreadId.value && String(selectedThreadId.value) === String(otherId)) {
        messages.value.push(msg)
        // mark as read since it's visible
        markThreadRead(otherId)
      }
      nextTick(() => scrollToBottom())
    })
  } catch (e) { console.error('attachEcho error', e) }
}

function attachGroupChannel(groupId) {
  if (!process.client || !window?.Echo || !groupId) return
  try {
    if (_channel && _channel.leave) _channel.leave()
    _channel = window.Echo.private(`App.Models.Group.${groupId}`)
    _channel.listen('.MessageSent', (payload) => {
      const msg = payload.message ?? payload
      if (msg.group_id == groupId) {
        const gi = groups.value.find(g => g.id == groupId)
        if (gi) { gi.last_message = msg.content; gi.last_at = msg.created_at; gi.unread_count = (gi.unread_count||0) + (msg.sender_id === userId.value ? 0 : 1) }
        if (selectedGroupId.value && String(selectedGroupId.value) === String(groupId)) {
          messages.value.push(msg)
          // TODO: call mark-group-read API if desired
        }
      }
      nextTick(() => scrollToBottom())
    })
  } catch (e) { console.error('attachGroupChannel error', e) }
}

// Scroll-up pagination: when user scrolls near top, fetch older messages
let _loadingOlder = false
async function maybeLoadOlder() {
  try {
    const el = messagesPane.value
    if (!el || _loadingOlder) return
    if (el.scrollTop > 50) return // only load when very near top
    // find earliest message id we have
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
        // prepend older messages while keeping scroll position
        const oldHeight = el.scrollHeight
        messages.value = json.messages.concat(messages.value)
        await nextTick()
        // try to maintain scroll position
        el.scrollTop = el.scrollHeight - oldHeight
      }
    }
  } catch (e) {
    console.error('load older messages failed', e)
  } finally { _loadingOlder = false }
}


onMounted(() => {
  if (!process.client) return
  loadThreads()
  attachEcho()
  // If the page was opened with ?user_id or ?group_id, open that conversation immediately
  try {
    const route = useRoute()
    const q = route && route.query ? route.query : {}
    if (q.user_id) {
      // route.query values may be strings or arrays
      const uid = Array.isArray(q.user_id) ? q.user_id[0] : q.user_id
      selectedThreadId.value = uid
      // load messages for this direct conversation
      fetch(apiBase + `/api/chat/messages?user_id=${uid}`, { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(json => {
        if (json && json.messages) messages.value = json.messages
        else messages.value = []
        markThreadRead(uid)
      }).catch(() => { messages.value = []; markThreadRead(uid) })
      nextTick(() => scrollToBottom())
    } else if (q.group_id) {
      const gid = Array.isArray(q.group_id) ? q.group_id[0] : q.group_id
      selectedGroupId.value = gid
      fetch(apiBase + `/api/chat/messages?group_id=${gid}`, { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(json => { messages.value = json && json.messages ? json.messages : [] }).catch(() => { messages.value = [] })
      nextTick(() => scrollToBottom())
    }
  } catch (e) {}
  // wire scroll-up pagination
  try {
    const el = messagesPane.value
    if (el) {
      el.addEventListener('scroll', () => {
        maybeLoadOlder()
      })
    }
  } catch (e) {}

  // Auto-resize textarea
  nextTick(() => {
    const textarea = messageInput.value
    if (textarea) {
      textarea.addEventListener('input', autoResizeTextarea)
      autoResizeTextarea()
    }
  })

  // Global key handling: ESC to close modal or sidebar on small screens
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (showCreate.value) closeCreate()
      else if (window.innerWidth < 1024 && sidebarOpen.value) sidebarOpen.value = false
    }
  })
})

watch(() => selectedGroupId.value, (id) => {
  if (id) attachGroupChannel(id)
  else if (_channel && _channel.leave) { try { _channel.leave() } catch (e) {} }
})

function closeCreate() {
  showCreate.value = false
}

async function resendMessage(m) {
  if (!m || !m.body) return
  // mark as resending
  m.failed = false
  m.sending = true
  try {
  const payload = { content: m.content ?? m.body }
  if (m.group_id) payload.group_id = m.group_id
  else if (m.recipient_id) payload.recipient_id = m.recipient_id
    const res = await fetch(apiBase + '/api/chat/send', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) {
      const json = await res.json()
      // replace message in messages array
      const idx = messages.value.findIndex(x => x.id === m.id)
      if (idx !== -1) messages.value.splice(idx, 1, json.message)
    } else {
      m.sending = false
      m.failed = true
    }
  } catch (e) {
    m.sending = false
    m.failed = true
  }
}

// autofocus dm input when modal opens
watch(() => showCreate.value, (v) => {
  if (v) {
    nextTick(() => {
      if (dmInput.value && dmInput.value.focus) dmInput.value.focus()
    })
  }
})
</script>
