<template>
  <div class="chat-shell relative flex h-full bg-background overflow-hidden">
    <ConversationList
      :allConversations="allConversations"
      :activeConversationId="activeConversation?.id"
      :activeTab="activeTab"
      :searchQuery="searchQuery"
      :showChatWindowOnMobile="showChatWindowOnMobile"
      @select-conversation="selectConversation"
  @open-create="() => (showCreate = true)"
  @update:searchQuery="onUpdateSearchQuery"
  @change-tab="onChangeTab"
  class="flex-shrink-0 md:w-96 border-r border-border"
    />

    <ChatWindow
      ref="chatWindowRef"
  :activeConversation="activeConversation || undefined"
      :activeConversationName="activeConversationName"
      :showChatWindowOnMobile="showChatWindowOnMobile"
      @back="showChatWindowOnMobile = false"
      class="flex-1"
    >
      <template #header-actions>
        <div class="flex items-center gap-2">
          <button aria-label="Start voice call" class="icon-btn"><span role="img" aria-hidden="true">📞</span></button>
          <button aria-label="Start video call" class="icon-btn"><span role="img" aria-hidden="true">🎥</span></button>
          <button aria-label="Search messages" class="icon-btn"><span role="img" aria-hidden="true">🔎</span></button>
        </div>
      </template>

      <template #messages>
        <div class="space-y-6">
          <div v-for="(chunk, idx) in groupedMessages" :key="idx" class="space-y-4">
            <div class="flex justify-center">
              <span class="text-xs bg-muted/80 px-3 py-1 rounded-full text-muted-foreground font-medium shadow-sm">{{ chunk.timeLabel }}</span>
            </div>
            <div v-for="m in chunk.messages" :key="m.id" class="group">
              <div :class="['flex items-end space-x-2', m.sender_id === userId ? 'justify-end' : 'justify-start']">
                <img v-if="m.sender_id !== userId" :alt="m.sender?.name || 'User'" class="rounded-full object-cover mb-1 border border-border w-7 h-7" :src="m.sender?.avatar || `https://i.pravatar.cc/28?u=${m.sender_id}`" />

                <div :class="['max-w-[70%] rounded-lg px-4 py-2 shadow-sm', m.sender_id === userId ? 'bg-primary text-primary-foreground rounded-br-lg' : 'bg-muted text-muted-foreground rounded-bl-lg']">
                  <p class="text-sm break-words">{{ m.content }}</p>

                  <div class="flex items-center gap-1 mt-1 justify-end text-xs">
                    <MessageStatus :time="formatTime(m.created_at)" :isOwn="m.sender_id === userId" :status="m.sending ? 'sending' : (m.failed ? 'failed' : (m.read ? 'read' : (m.delivered ? 'delivered' : 'sent')) )" >
                      <template #retry>
                        <button @click="resendMessage(m)" class="text-xs px-2 py-1 bg-gray-100 rounded">Retry</button>
                      </template>
                    </MessageStatus>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isTyping" class="flex justify-start mt-4">
          <div class="bg-muted px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
            <div class="flex items-center space-x-1">
                <div class="flex space-x-1" aria-label="Typing indicator">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
              <span class="text-xs text-gray-500 ml-2">Someone is typing...</span>
            </div>
          </div>
        </div>
      </template>

      <template #input>
        <div class="p-4 bg-sidebar-bg border-t border-border">
          <form @submit.prevent="sendMessage" class="w-full">
            <div class="flex items-end gap-2">
              <!-- Paperclip / Attach button (fixed size, outside input container) -->
              <div class="flex-shrink-0">
             <button type="button" class="h-11 w-11 flex items-center justify-center rounded-lg bg-muted/10" title="Attach file" aria-label="Attach file" @click.prevent="() => fileInput && fileInput.click()"><span role="img" aria-hidden="true">📎</span></button>
                <input ref="fileInput" type="file" class="hidden" @change="onFileChange" />
              </div>

              <!-- Input container: grows to fill available space -->
              <div class="flex-1 relative bg-background border border-input rounded-lg flex items-center pr-2">
                <textarea
                  v-model="body"
                  @keydown.enter.exact.prevent="sendMessage"
                  @keydown.enter.shift="onShiftEnter"
                  @focus="onComposerFocus"
                  @blur="onComposerBlur"
                  placeholder="Type a message..."
                  class="flex-1 border-0 focus-visible:ring-0 bg-transparent text-sm placeholder:text-muted-foreground resize-none px-3 py-2"
                  rows="1"
                  ref="messageInput"
                ></textarea>

                <!-- Emoji picker trigger inside input container -->
                  <button type="button" @click="toggleEmojiPicker" class="h-11 w-11 flex-shrink-0 rounded-md ml-1" title="Emoji" aria-label="Open emoji picker"><span role="img" aria-hidden="true">😊</span></button>

                <!-- Emoji picker panel (absolute, above input) -->
                <div v-if="showEmojiPicker" class="absolute bottom-full right-2 z-20 mb-2">
                  <div ref="emojiPickerEl" class="bg-white border rounded shadow p-2 w-40">
                    <div class="grid grid-cols-6 gap-1">
                      <button type="button" v-for="e in emojiList" :key="e" @click="selectEmoji(e)" class="p-1 text-lg">{{ e }}</button>
                    </div>
                  </div>
                </div>

                <!-- Send button inside input container (fixed size) -->
                  <button type="submit" :disabled="!body.trim()" class="h-11 w-11 flex-shrink-0 ml-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md flex items-center justify-center" aria-label="Send message"><span aria-hidden="true">➤</span></button>
              </div>

              <!-- Optional additional actions (voice etc.) -->
              <div class="hidden sm:flex space-x-1">
             <button type="button" class="h-11 w-11 flex items-center justify-center rounded-lg bg-muted/10" title="Voice message" aria-label="Record voice message"><span role="img" aria-hidden="true">🎙️</span></button>
              </div>
            </div>
          </form>
        </div>
      </template>
    </ChatWindow>

  <NewChatModal :show="showCreate" :searchResults="searchResults" @close="closeCreate" @start-dm="startDMByEmail" @add-user="addUserToInvite" @search="onNewChatSearch" />
  </div>
</template>

<script setup lang="ts">
import useChat from '~/composables/useChat'
import ConversationList from '~/components/ConversationList.vue'
import ChatWindow from '~/components/ChatWindow.vue'
import NewChatModal from '~/components/NewChatModal.vue'
import MessageStatus from '~/components/MessageStatus.vue'

const chat = useChat()

// expose individual refs/methods used in template for clarity
const {
  chatWindowRef,
  messagesPane,
  messages,
  body,
  messageInput,
  showEmojiPicker,
  emojiPickerEl,
  emojiList,
  showCreate,
  searchResults,
  searchQuery,
  activeTab,
  showChatWindowOnMobile,
  allConversations,
  activeConversation,
  activeConversationName,
  groupedMessages,
  userId,
  isTyping,
  // methods
  selectConversation,
  selectEmoji,
  toggleEmojiPicker,
  onComposerFocus,
  onComposerBlur,
  onShiftEnter,
  onFileChange,
  sendMessage,
  closeCreate,
  startDMByEmail,
  addUserToInvite,
  onUserSearch,
  userSearch,
  resendMessage,
  formatTime,
} = chat

// small wrappers used by template to avoid inline lambda implicit any
function onUpdateSearchQuery(val: string) { searchQuery.value = val }
function onChangeTab(tab: string) { activeTab.value = tab }
function onNewChatSearch(val: string) { userSearch.value = val; onUserSearch() }

// return true for very short messages (<= 5 words) so we can avoid breaking them
// shortMsg removed — using break-words everywhere now

import { ref as vueRef } from 'vue'
const fileInput = vueRef<HTMLInputElement | null>(null)
</script>

<style scoped>
.chat-shell > div:first-child { transition: transform 220ms ease }
.icon-btn { display:inline-flex; align-items:center; justify-content:center; height:36px; width:36px; border-radius:9999px }

/* layout sizing helpers to avoid top/bottom nav overlap */
:root { --bottom-nav-height: 0px; --top-bar-height: 0px }
.chat-shell { min-height: calc(100vh - var(--top-bar-height)); }
.chat-shell .chat-shell__window { padding-bottom: calc(env(safe-area-inset-bottom, 0px) + var(--bottom-nav-height)); }

/* ensure input footer is above bottom nav on mobile */
.chat-shell footer { padding-bottom: calc(env(safe-area-inset-bottom, 0px) + var(--bottom-nav-height)); }
</style>

<style>
/* global mobile keyboard helpers */
body.chat-keyboard-open .chat-shell__window { padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 300px) }
body.chat-keyboard-open .chat-shell__floating-button { bottom: calc(5.25rem + 260px) }
body.chat-keyboard-open footer[style] { position: relative }

/* When reading chats on small screens, hide site bottom navigation so it doesn't cover inputs.
   We add/remove the `chat-hide-bottom-nav` class on the <html> element from the chat composable. */
html.chat-hide-bottom-nav .bottom-nav,
html.chat-hide-bottom-nav .site-bottom-nav,
html.chat-hide-bottom-nav nav.bottom,
html.chat-hide-bottom-nav .app-bottom-nav {
  display: none !important;
}
</style>
