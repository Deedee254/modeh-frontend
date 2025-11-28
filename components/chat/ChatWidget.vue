<template>
  <div class="flex flex-1 min-h-0 bg-[#f0f2f5] px-4 py-6 md:px-6">
    <!-- Sidebar -->
    <div class="hidden md:flex w-80 flex-shrink-0">
      <!-- Sidebar keeps the hero gradient treatment just within the header, leaving the list area clean and white -->
  <div class="flex h-full w-full flex-col rounded-3xl border border-border/50 bg-white text-foreground shadow-xl min-h-0">
    <!-- Header -->
  <div class="p-4 border-b border-border bg-white text-foreground rounded-t-3xl flex-shrink-0">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-xl font-semibold">Chats</h1>
            <button @click="openNewChat" class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted h-9 w-9 rounded-full hover:text-foreground text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus h-5 w-5">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
            </button>
          </div>
          <!-- Search -->
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/70">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
            <input 
              class="flex h-10 w-full rounded-md border border-border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-9 bg-muted/20 text-foreground placeholder:text-muted-foreground" 
              placeholder="Search conversations..."
              v-model="searchQuery"
            >
          </div>
        </div>
        <!-- Tabs -->
  <div class="px-4 py-3 border-b border-border bg-transparent flex-shrink-0">
          <div dir="ltr" data-orientation="horizontal">
            <div role="tablist" aria-orientation="horizontal" class="h-10 items-center justify-center rounded-md p-1 text-muted-foreground grid w-full grid-cols-3 bg-muted/50">
              <button 
                v-for="tab in tabs" 
                :key="tab.value"
                type="button" 
                role="tab" 
                :aria-selected="activeTab === tab.value"
                class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 font-medium ring-offset-background transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-sm"
                :data-state="activeTab === tab.value ? 'active' : 'inactive'"
                @click="activeTab = tab.value"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Chat List -->
        <div class="flex-1 overflow-y-auto min-h-0" style="-webkit-overflow-scrolling: touch;">
          <transition-group name="list" tag="div">
          <button 
            v-for="chat in filteredConversations" 
            :key="chat.id" 
            class="w-full p-4 flex items-start gap-3 hover:bg-muted/20 transition-colors border-b border-border/60"
            :class="String(chat.id) === String(activeConversation?.id) ? 'bg-muted/10' : ''"
            @click="selectConversation(chat)"
          >
            <div class="relative flex-shrink-0">
              <span class="relative flex shrink-0 overflow-hidden rounded-full h-12 w-12">
                <!-- show real avatar when available, otherwise fallback to initial -->
                <img v-if="chat.avatar" :src="chat.avatar" :alt="chat.name" class="h-full w-full object-cover rounded-full" loading="lazy" decoding="async" />
                <span v-else class="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {{ chat.name[0] }}
                </span>
              </span>
              <div v-if="chat.status === 'online'" class="absolute bottom-0 right-0 h-3 w-3 bg-primary rounded-full border-2 border-white"></div>
            </div>
            <div class="flex-1 min-w-0 text-left">
              <div class="flex items-baseline justify-between mb-1">
                <h3 class="font-semibold text-foreground truncate">{{ chat.name }}</h3>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-muted-foreground flex-shrink-0">{{ formatTimeLocal(chat.last_at) }}</span>
                  <span v-if="((chat.unread_count ?? chat.unread) || 0) > 0" class="inline-flex items-center justify-center bg-primary text-white text-xs rounded-full px-2 py-0.5">{{ chat.unread_count ?? chat.unread }}</span>
                </div>
              </div>
              <!-- allow long words to break and wrap instead of growing the row -->
              <p class="text-sm text-muted-foreground whitespace-normal break-words overflow-hidden">{{ chat.last_preview || '' }}</p>
            </div>
          </button>
          </transition-group>
        </div>
      </div>
    </div>

    <!-- Mobile: show list when not viewing a chat -->
    <div v-if="isMobile && !showChatWindowOnMobile" class="md:hidden flex flex-1 flex-col min-w-0 overflow-hidden rounded-3xl h-full min-h-0">
      <div class="flex flex-col h-full min-h-0 bg-white text-foreground">
        <!-- Header (mobile list) -->
  <div class="p-4 border-b border-border bg-white text-foreground flex-shrink-0 w-full">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-xl font-semibold">Chats</h1>
            <button @click="openNewChat" class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-foreground h-9 w-9 rounded-full hover:bg-muted text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus h-5 w-5">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
            </button>
          </div>
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
            <input 
              class="flex h-10 w-full rounded-md border border-border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-9 bg-gray-100 text-foreground placeholder:text-muted-foreground" 
              placeholder="Search conversations..."
              v-model="searchQuery"
            >
          </div>
        </div>

        <div class="flex-1 overflow-y-auto min-h-0" style="-webkit-overflow-scrolling: touch;">
          <transition-group name="list" tag="div">
            <button
              v-for="chat in filteredConversations"
              :key="chat.id"
              class="w-full p-4 flex items-start gap-3 hover:bg-muted/20 transition-colors border-b border-border/60"
              :class="String(chat.id) === String(activeConversation?.id) ? 'bg-muted/10' : ''"
              @click="selectConversation(chat)"
            >
            <div class="relative flex-shrink-0">
              <span class="relative flex shrink-0 overflow-hidden rounded-full h-12 w-12">
                <img v-if="chat.avatar" :src="chat.avatar" :alt="chat.name" class="h-full w-full object-cover rounded-full" loading="lazy" decoding="async" />
                <span v-else class="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {{ chat.name[0] }}
                </span>
              </span>
              <div v-if="chat.status === 'online'" class="absolute bottom-0 right-0 h-3 w-3 bg-primary rounded-full border-2 border-white"></div>
            </div>
            <div class="flex-1 min-w-0 text-left">
              <div class="flex items-baseline justify-between mb-1">
                <h3 class="font-semibold text-foreground truncate">{{ chat.name }}</h3>
                <span class="text-xs text-muted-foreground ml-2 flex-shrink-0">{{ formatTimeLocal(chat.last_at) }}</span>
                <span v-if="((chat.unread_count ?? chat.unread) || 0) > 0" class="inline-flex items-center justify-center bg-primary text-white text-xs rounded-full px-2 py-0.5">{{ chat.unread_count ?? chat.unread }}</span>
              </div>
              <p class="text-sm text-muted-foreground whitespace-normal break-words overflow-hidden">{{ chat.last_preview || '' }}</p>
            </div>
            </button>
          </transition-group>
        </div>
      </div>
    </div>

    <!-- Main Chat Area -->
  <div v-if="!isMobile || showChatWindowOnMobile" class="flex flex-1 flex-col min-w-0 overflow-hidden rounded-3xl md:rounded-none md:pl-6 bg-[#efeae2] min-h-0">
    <!-- Chat Header -->
    <div class="flex items-center gap-3 p-4 bg-white border-b border-border flex-shrink-0">
      <button 
        v-if="isMobile && showChatWindowOnMobile" 
        class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground md:hidden h-9 w-9"
        @click="showChatWindowOnMobile = false"
        aria-label="Back to chats"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left h-5 w-5">
          <path d="m12 19-7-7 7-7"></path>
          <path d="M19 12H5"></path>
        </svg>
      </button>
      <div class="relative" v-if="activeConversation">
        <span class="relative flex shrink-0 overflow-hidden rounded-full h-10 w-10">
          <span class="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground">
            {{ activeConversation?.name ? activeConversation.name[0] : '' }}
          </span>
        </span>
      </div>
      <div class="flex-1 min-w-0">
        <h2 class="font-semibold text-foreground truncate">{{ activeConversation?.name || 'Select a conversation' }}</h2>
        <p class="text-xs text-muted-foreground">{{ activeConversation?.status || (activeConversation?.type === 'group' ? '' : '') }}</p>
      </div>
      <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 w-9">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-vertical h-5 w-5">
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="12" cy="5" r="1"></circle>
          <circle cx="12" cy="19" r="1"></circle>
        </svg>
      </button>
    </div>

    <!-- Messages Container -->
    <div ref="messagesPaneRef" class="flex-1 overflow-y-auto p-4 space-y-4 min-h-0" style="padding-bottom: 90px;">
          <div v-for="message in chatMessages" :key="message.id" class="flex w-full" :class="String(message.sender_id) === String(userId) ? 'justify-end' : 'justify-start'">
            <div :class="String(message.sender_id) === String(userId) ? 'chat-bubble sent' : 'chat-bubble received'" class="rounded-lg px-4 py-2">
              <!-- attachments (if any) -->
              <template v-if="message.attachments && message.attachments.length">
                <div class="mb-2 space-y-2">
                  <div v-for="(a, i) in message.attachments" :key="i" class="rounded overflow-hidden border bg-background">
                    <a :href="a.url || a.path" target="_blank" class="block p-2 text-sm underline text-primary-foreground">{{ a.name || a.filename || a.url }}</a>
                  </div>
                </div>
              </template>

              <p class="text-sm whitespace-pre-wrap">{{ message.content || message.text || message.body }}</p>

              <div class="flex items-center justify-end gap-2 mt-1">
                <p class="text-xs" :class="String(message.sender_id) === String(userId) ? 'text-muted-foreground/80' : 'text-muted-foreground'">{{ formatTimeLocal(message.created_at) }}</p>
                <!-- outgoing message ticks -->
                <template v-if="String(message.sender_id) === String(userId)">
                  <span class="ml-1">
                    <template v-if="message.sending">
                      <!-- clock icon -->
                      <svg class="tick" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
                    </template>
                    <template v-else-if="message.failed">
                      <svg class="tick text-rose-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v6"></path><path d="M12 15v.01"></path></svg>
                    </template>
                    <template v-else>
                      <!-- determine tick state: single/double/read -->
                      <svg v-if="getTickState(message) === 'single'" class="tick" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
                      <svg v-else-if="getTickState(message) === 'double'" class="tick" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path><path d="M22 6 11 17l-5-5"></path></svg>
                      <svg v-else-if="getTickState(message) === 'read'" class="tick tick-read" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path><path d="M22 6 11 17l-5-5"></path></svg>
                    </template>
                  </span>
                </template>
                <div v-if="message.failed && String(message.sender_id) === String(userId)" class="flex items-center gap-2">
                  <button @click="resendMessage(message)" class="text-xs text-rose-500 underline">Retry</button>
                </div>
              </div>
            </div>
          </div>
          <!-- sentinel for scrolling -->
          <div ref="messagesEndRef" />
        </div>

        <!-- Input Area -->
        <div class="p-3 bg-white/5 border-t border-border flex-shrink-0">
          <div class="flex items-end gap-2" style="margin-bottom:8px">
            <input type="file" multiple accept="image/*,application/pdf,.doc,.docx,.txt" class="hidden" ref="fileInput" @change="onFileChange">
            <button 
              class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent h-10 w-10 flex-shrink-0 text-muted-foreground hover:text-foreground"
              @click="triggerFileInput()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-paperclip h-5 w-5">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>
              <div class="flex-1 relative bg-background border border-input rounded-lg flex items-center pr-2">
              <input 
                ref="messageInputRef"
                v-model="body"
                class="flex h-10 w-full rounded-md px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent" 
                placeholder="Type a message..."
                @keyup.enter="sendLocalMessage"
              />
                <button @click="toggleEmojiPicker" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground" style="margin-bottom:6px">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smile h-5 w-5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line x1="9" x2="9.01" y1="9" y2="9"></line>
                  <line x1="15" x2="15.01" y1="9" y2="9"></line>
                </svg>
              </button>
              <div v-if="showEmojiPicker" class="absolute bottom-12 left-2 z-30 bg-white border rounded shadow p-2 grid grid-cols-6 gap-2 w-56">
                <button v-for="emoji in emojis" :key="emoji" @click.prevent="insertEmoji(emoji)" class="text-lg">{{ emoji }}</button>
              </div>
              <button 
                class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground h-8 w-8 flex-shrink-0 bg-primary hover:bg-primary/90 ml-1"
                @click="sendLocalMessage"
                :disabled="!body || !body.trim()"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send h-4 w-4">
                  <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
                  <path d="m21.854 2.147-10.94 10.939"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
  </div>
  <NewChatModal
    :show="showCreate"
    :searchResults="searchResults"
    @close="closeNewChat"
    @start-dm="handleStartDM"
    @start-support="handleStartSupport"
    @add-user="addUserToInvite"
    @search="onUserSearch"
  />
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { format } from 'date-fns'
import { type Ref } from 'vue';
import useChat from '~/composables/useChat'
import NewChatModal from '~/components/chat/NewChatModal.vue'

const {
  threads,
  groups,
  messages: chatMessages,
  allConversations,
  activeConversation,
  showChatWindowOnMobile,
  showEmojiPicker,
  searchQuery,
  activeTab,
  messageInput,
  body,
  loadThreads,
  selectConversation,
  sendMessage,
  onFileChange,
  loadThreads: refreshThreads,
  // create/new chat helpers
  showCreate,
  dmEmail,
  startDMByEmail,
  userSearch,
  onUserSearch,
  addUserToInvite,
  searchResults,
  // additional helpers/refs
  userId,
  messagesPane,
  chatWindowRef,
  resendMessage,
  maybeLoadOlder,
  scrollToBottom,
} = useChat()

const isMobile = ref(window.innerWidth < 768)

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  lastMessageTime: Date;
  online: boolean;
}

const selectedChat = ref<Chat | null>(null);
const newMessage = ref('')
const fileInput = ref<HTMLInputElement | null>(null);

// local DOM refs for the messages pane and sentinel; we'll assign them into the composable
const messagesPaneRef = ref<HTMLElement | null>(null)
const messagesEndRef = ref<HTMLElement | null>(null)
// keep a stable handler reference so we can remove it on unmount
let _onMessagesPaneScroll: ((e: Event) => void) | null = null

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Online', value: 'online' },
  { label: 'Unread', value: 'unread' }
]

// chat list is provided by useChat() as allConversations
// selecting a conversation is handled by useChat.selectConversation (wired in template)

const messageInputRef = ref<HTMLInputElement | null>(null)

const emojis = ['😀','😂','😍','👍','🙏','🎉','😅','🙌','😉','🔥','😢','🤔']

const filteredConversations = computed(() => {
  const q = (searchQuery.value || '').toString().toLowerCase().trim()
  const list = (allConversations.value || []).slice()
  // filter by active tab
  let filtered = list.filter((c: any) => {
    if (activeTab.value === 'online') return c.status === 'online'
    if (activeTab.value === 'unread') return (c.unread_count || c.unread || 0) > 0
    return true
  })
  // filter by search query
  if (q) {
    filtered = filtered.filter((c: any) => {
      const name = (c.name || '').toString().toLowerCase()
      const preview = (c.last_preview || '').toString().toLowerCase()
      return name.includes(q) || preview.includes(q)
    })
  }
  // sort by last_at descending
  filtered.sort((a: any, b: any) => {
    const A = new Date(a.last_at || a.updated_at || 0).getTime()
    const B = new Date(b.last_at || b.updated_at || 0).getTime()
    return B - A
  })
  return filtered
})

function toggleEmojiPicker() {
  showEmojiPicker.value = !showEmojiPicker.value
}

function insertEmoji(emoji: string) {
  if (!emoji) return
  body.value = (body.value || '') + emoji
  // close picker and focus input
  showEmojiPicker.value = false
  setTimeout(() => { messageInputRef.value?.focus() }, 20)
}

async function sendLocalMessage(): Promise<void> {
  if (!body.value || !body.value.trim()) return
  await sendMessage()
}

function formatTimeLocal(date: any): string {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  if (!isNaN(d.getTime()) && d.toDateString() === now.toDateString()) return format(d, 'HH:mm')
  if (!isNaN(d.getTime())) return format(d, 'MMM d')
  return String(date)
}

/**
 * Determine tick state for outgoing messages.
 * - 'read' when message.read or read_at present
 * - 'double' when delivered flag present
 * - 'single' otherwise
 * We accept multiple possible field names because backends vary.
 */
function getTickState(message: any): 'single' | 'double' | 'read' | 'none' {
  if (!message) return 'none'
  // Only rely on backend's `is_read` boolean for read state.
  // Consider a message that has been saved to the DB (has a numeric id, not an optimistic temp id)
  // as delivered (double ticks). Messages created optimistically on the client have ids like
  // 'msg-<timestamp>' and should show sending/single until persisted.
  if (message.is_read === true) return 'read'

  // If message has a persisted numeric id (or any truthy non-optimistic id), count as delivered
  // (double tick). This treats successful DB save as delivery for the UI's purposes.
  const id = message.id
  const isOptimistic = typeof id === 'string' && id.startsWith('msg-')
  if (id && !isOptimistic) return 'double'

  // default to single (sent)
  return 'single'
}

function triggerFileInput() { fileInput.value?.click() }

function openNewChat() { showCreate.value = true }
function closeNewChat() { showCreate.value = false }

async function handleStartSupport() {
  try {
    // Set email to 'support' to trigger support chat in startDMByEmail
    dmEmail.value = 'support'
    await startDMByEmail()
    closeNewChat()
  } catch (e) {
    console.error('Support chat error:', e)
    closeNewChat()
  }
}

async function handleStartDM(email: string) {
  if (!email) return
  try {
    dmEmail.value = email
    await startDMByEmail()
    closeNewChat()
  } catch (e) {
    closeNewChat()
  }
}

function handleResize() {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) {
    showChatWindowOnMobile.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  // wire the messages pane/sentinel into the composable so it can perform scroll/older-load logic
  try {
    // expose the pane and sentinel to the composable via chatWindowRef
    if (chatWindowRef) {
      chatWindowRef.value = { messagesPane: { value: messagesPaneRef.value }, messagesEnd: { value: messagesEndRef.value } }
    }
    // attach the older-messages loader to the DOM pane
    if (messagesPaneRef.value && maybeLoadOlder) {
      // wrap the composable-provided function in a stable local handler so removal is reliable
      _onMessagesPaneScroll = (_ev: Event) => {
        try { maybeLoadOlder() } catch (e) {}
      }
      messagesPaneRef.value.addEventListener('scroll', _onMessagesPaneScroll)
    }
    // ensure we scroll to bottom when the component mounts
    scrollToBottom()
  } catch (e) {}
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  // remove the messages pane scroll handler if we attached one
  try {
    if (messagesPaneRef.value && _onMessagesPaneScroll) {
      messagesPaneRef.value.removeEventListener('scroll', _onMessagesPaneScroll)
    }
  } catch (e) {}
})
</script>

<style scoped>
/* Hide scrollbars but keep functionality */
::-webkit-scrollbar {
  display: none;
}

* {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Chat bubble styling */
.chat-bubble {
  display: inline-block;
  /* keep the window shape stable: limit width by ch (characters) and percentage */
  max-width: min(65%, 36ch);
  min-width: 6ch;
  word-wrap: break-word;
  overflow-wrap: anywhere;
  -webkit-font-smoothing: antialiased;
}

.chat-bubble.sent {
  background: #891f21;
  color: #ffffff;
  border-radius: 18px 18px 4px 18px;
}

.chat-bubble.received {
  background: #f5f5f5;
  color: #111827;
  border-radius: 18px 18px 18px 4px;
  box-shadow: 0 1px 0 rgba(0,0,0,0.05);
}

/* make sure message row doesn't overflow */
.flex.w-full > .chat-bubble { max-width: 70%; }

/* tick icon styles */
.tick { display: inline-block; vertical-align: middle; stroke: #8696a0; color: #8696a0; }
.tick-read { stroke: #f7b932; color: #f7b932; }
.chat-bubble.received .tick { stroke: rgba(0,0,0,0.45); color: rgba(0,0,0,0.45); }
.chat-bubble.sent .tick { stroke: #8696a0; color: #8696a0; }
.tick { width: 14px; height: 14px; margin-left: 6px }

/* time and small meta */
.chat-bubble .meta { font-size: 11px; opacity: 0.8 }

</style>

