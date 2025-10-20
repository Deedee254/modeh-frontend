<template>
  <div :class="['chat-shell__window flex-1 flex-col min-w-0 absolute md:static inset-0 transition-transform duration-300 ease-in-out bg-chat-bg', showChatWindowOnMobile ? 'translate-x-0' : 'translate-x-full md:translate-x-0']">
    <template v-if="!activeConversation">
      <div class="flex flex-col items-center justify-center flex-1 bg-chat-bg">
        <div class="text-center text-muted-foreground">
          <p class="text-lg mb-2">Select a conversation to start chatting</p>
          <p class="text-sm">or start a new chat using the + button</p>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="flex flex-col h-full">
        <header class="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-5 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5 sm:gap-3.5">
              <button @click="$emit('back')" class="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/60">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div class="relative">
                <img :alt="activeConversationName" class="rounded-full object-cover w-9 h-9 sm:w-11 sm:h-11" :src="activeConversation?.avatar || `https://i.pravatar.cc/44?u=${activeConversation?.id}`">
                <span v-if="activeConversation?.status" class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background" :class="statusColor(activeConversation.status)"></span>
              </div>
              <div>
                <h3 class="font-medium text-sm sm:text-base">{{ activeConversationName }}</h3>
                <p class="text-[11px] text-muted-foreground sm:text-xs">{{ activeConversation?.status || 'Offline' }}</p>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-1.5 sm:gap-2">
            <slot name="header-actions"></slot>
          </div>
        </header>

        <div class="relative overflow-y-auto flex-1 p-4" :style="{ paddingBottom: `calc(3.5rem + env(safe-area-inset-bottom, 0px) + var(--bottom-nav-height))` }" ref="messagesPane">
          <!-- center messages column like WhatsApp: constrain width and center on large viewports -->
          <div class="mx-auto w-full max-w-[48rem] flex flex-col space-y-4">
            <slot name="messages"></slot>
            <!-- sentinel element used for scrollIntoView if desired by a consumer/composable -->
            <div ref="messagesEnd" aria-hidden="true"></div>
          </div>
        </div>

        <footer class="p-3 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:relative md:bottom-auto md:left-auto md:right-auto md:p-4 z-40 pb-[env(safe-area-inset-bottom)]">
          <slot name="input"></slot>
        </footer>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineProps({
  activeConversation: { type: Object, default: null },
  activeConversationName: { type: String, default: '' },
  showChatWindowOnMobile: { type: Boolean, default: false }
})
const emit = defineEmits(['back'])

const messagesPane = ref(null)
const messagesEnd = ref(null)
defineExpose({ messagesPane, messagesEnd })

function statusColor(status) {
  switch (status) {
    case 'online': return 'bg-green-500';
    case 'away': return 'bg-yellow-500';
    default: return 'bg-gray-400';
  }
}
</script>
