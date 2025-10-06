<template>
  <div>
    <!-- Chat Sidebar -->
    <div class="fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-gray-200 overflow-y-auto">
      <!-- Start New Chat -->
      <div class="p-4 border-b">
        <button @click="showNewChatModal = true" class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          New Chat
        </button>
      </div>

      <!-- Contact List -->
      <div class="divide-y">
        <div 
          v-for="contact in contacts" 
          :key="contact.id" 
          @click="selectContact(contact)"
          class="p-4 hover:bg-gray-50 cursor-pointer"
          :class="{'bg-indigo-50': selectedContact?.id === contact.id}"
        >
          <div class="flex items-center gap-3">
            <div class="relative">
              <img :src="contact.avatar || '/default-avatar.png'" class="w-10 h-10 rounded-full" alt="Avatar" />
              <div 
                v-if="contact.unreadCount" 
                class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
              >
                {{ contact.unreadCount }}
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center">
                <p class="font-medium truncate">{{ contact.name }}</p>
                <p v-if="contact.lastMessage" class="text-xs text-gray-500">
                  {{ formatTime(contact.lastMessage.created_at) }}
                </p>
              </div>
              <p v-if="contact.lastMessage" class="text-sm text-gray-500 truncate">
                {{ contact.lastMessage.content }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Area -->
    <div class="ml-72 flex flex-col h-screen">
      <!-- Chat Header -->
      <div v-if="selectedContact" class="h-16 border-b flex items-center px-6 bg-white">
        <div class="flex items-center gap-3">
          <img :src="selectedContact.avatar || '/default-avatar.png'" class="w-8 h-8 rounded-full" alt="Avatar" />
          <div>
            <h3 class="font-medium">{{ selectedContact.name }}</h3>
            <p class="text-xs text-gray-500">{{ selectedContact.role }}</p>
          </div>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto p-6 bg-gray-50" ref="messagesContainer">
        <div v-if="selectedContact" class="space-y-4">
          <div
            v-for="message in selectedContactMessages"
            :key="message.id"
            class="flex"
            :class="[message.sender_id === currentUser.id ? 'justify-end' : 'justify-start']"
          >
            <div 
              class="max-w-[70%] rounded-lg px-4 py-2"
              :class="[message.sender_id === currentUser.id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900']"
            >
              {{ message.content }}
              <div class="text-xs mt-1 opacity-75">
                {{ formatTime(message.created_at) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message Input -->
      <div v-if="selectedContact" class="h-24 border-t bg-white p-4">
        <div class="flex gap-4">
          <textarea 
            v-model="newMessage" 
            @keyup.enter.exact.prevent="sendMessage"
            placeholder="Type your message..." 
            class="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          ></textarea>
          <button 
            @click="sendMessage" 
            class="px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            :disabled="!newMessage.trim()"
          >
            Send
          </button>
        </div>
      </div>
    </div>

    <!-- New Chat Modal -->
    <div v-if="showNewChatModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Start New Chat</h3>
          
          <!-- Search/Email Input -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Search User or Enter Email</label>
            <input 
              v-model="searchQuery" 
              type="text" 
              class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Name or email address..."
              @input="searchUsers"
            />
          </div>

          <!-- Search Results -->
          <div v-if="searchResults.length > 0" class="mb-4 max-h-60 overflow-y-auto divide-y">
            <div 
              v-for="user in searchResults" 
              :key="user.id"
              @click="startChat(user)"
              class="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
            >
              <img :src="user.avatar || '/default-avatar.png'" class="w-8 h-8 rounded-full" alt="Avatar" />
              <div>
                <div class="font-medium">{{ user.name }}</div>
                <div class="text-sm text-gray-500">{{ user.email }}</div>
              </div>
            </div>
          </div>

          <!-- Support Chat Option -->
          <div class="mb-4 pt-4 border-t">
            <button 
              @click="startSupportChat"
              class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Contact Support
            </button>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3">
            <button 
              @click="showNewChatModal = false"
              class="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import debounce from 'lodash/debounce'

const currentUser = useAuth().user
const contacts = ref([])
const selectedContact = ref(null)
const messages = ref([])
const newMessage = ref('')
const showNewChatModal = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const messagesContainer = ref(null)

const selectedContactMessages = computed(() => 
  messages.value.filter(m => 
    (m.sender_id === selectedContact.value?.id && m.recipient_id === currentUser.value.id) ||
    (m.sender_id === currentUser.value.id && m.recipient_id === selectedContact.value?.id)
  )
)

// Echo subscription
onMounted(() => {
  subscribeToMessages()
  loadContacts()
})

function subscribeToMessages() {
  window.Echo.private(`messages.${currentUser.value.id}`)
    .listen('MessageSent', (e) => {
      const m = e.message ?? e
      // assume backend now emits the new fields exactly: sender_id, recipient_id, content, is_read
      messages.value.push(m)
      if (m.sender_id === selectedContact.value?.id) {
        markMessageAsRead(m.id)
      } else {
        updateUnreadCount(m.sender_id)
      }
      scrollToBottom()
    })
}

async function loadContacts() {
  try {
    const response = await fetch('/api/messages/contacts')
    const data = await response.json()
    contacts.value = data.contacts
  } catch (error) {
    console.error('Error loading contacts:', error)
  }
}

async function selectContact(contact) {
  selectedContact.value = contact
  newMessage.value = ''
  
  try {
    const response = await fetch(`/api/messages/${contact.id}`)
  const data = await response.json()
  // expect backend to return messages with the new field names
  messages.value = data.messages || []
    
    // Mark messages as read
    const unreadMessages = messages.value.filter(m => 
      !m.is_read && m.recipient_id === currentUser.value.id
    )
    if (unreadMessages.length > 0) {
      markMessagesAsRead(unreadMessages.map(m => m.id))
      contact.unreadCount = 0
    }
    
    scrollToBottom()
  } catch (error) {
    console.error('Error loading messages:', error)
  }
}

async function sendMessage() {
  if (!newMessage.value.trim()) return
  
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify({
        recipient_id: selectedContact.value.id,
        content: newMessage.value
      })
    })
    
  const data = await response.json()
  messages.value.push(normalizeMessage(data.message))
    newMessage.value = ''
    scrollToBottom()
  } catch (error) {
    console.error('Error sending message:', error)
  }
}

const searchUsers = debounce(async () => {
  if (!searchQuery.value) {
    searchResults.value = []
    return
  }
  
  try {
    const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery.value)}`)
    const data = await response.json()
    searchResults.value = data.users
  } catch (error) {
    console.error('Error searching users:', error)
  }
}, 300)

async function startChat(user) {
  showNewChatModal.value = false
  const existingContact = contacts.value.find(c => c.id === user.id)
  if (existingContact) {
    selectContact(existingContact)
  } else {
    contacts.value.unshift(user)
    selectContact(user)
  }
}

async function startSupportChat() {
  showNewChatModal.value = false
  // Find or create support chat
  const adminSupport = contacts.value.find(c => c.role === 'admin')
  if (adminSupport) {
    selectContact(adminSupport)
  } else {
    try {
      const response = await fetch('/api/messages/support-chat')
      const data = await response.json()
      contacts.value.unshift(data.contact)
      selectContact(data.contact)
    } catch (error) {
      console.error('Error starting support chat:', error)
    }
  }
}

async function markMessageAsRead(messageId) {
  try {
    await fetch(`/api/messages/${messageId}/read`, {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
      }
    })
  } catch (error) {
    console.error('Error marking message as read:', error)
  }
}

async function markMessagesAsRead(messageIds) {
  try {
    await fetch('/api/messages/mark-read', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify({ message_ids: messageIds })
    })
  } catch (error) {
    console.error('Error marking messages as read:', error)
  }
}

function updateUnreadCount(senderId) {
  const contact = contacts.value.find(c => c.id === senderId)
  if (contact) {
    contact.unreadCount = (contact.unreadCount || 0) + 1
  }
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString()
}

async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Auto-scroll when new messages arrive
watch(() => selectedContactMessages.value.length, scrollToBottom)
</script>