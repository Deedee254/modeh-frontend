<template>
  <div class="flex-1 flex flex-col">
    <template v-if="!activeConversation">
      <div class="flex items-center justify-center h-full">
        <div class="text-center">
          <p class="text-lg font-medium mb-2">Select a conversation to start chatting</p>
          <p class="text-sm text-muted-foreground">or start a new chat using the + button</p>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="flex flex-col h-full">
        <div class="sticky top-0 z-30 flex items-center justify-between p-4 border-b bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/10">
          <div class="flex items-center">
            <button @click="$emit('back')" class="inline-flex items-center duration-300 justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground size-10 rounded-full h-9 w-9 md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left h-5 w-5">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
            <div class="relative">
              <img :alt="activeConversationName" loading="lazy" width="40" height="40" decoding="async" class="rounded-full object-cover" :src="resolveUserAvatar(activeConversation, activeConversationName)">
              <span v-if="activeConversation?.status" class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background" :class="statusColor(activeConversation.status)"></span>
            </div>
            <div class="ml-3">
              <h3 class="font-medium">{{ activeConversationName }}</h3>
              <p class="text-xs text-muted-foreground">{{ activeConversation?.status || 'Offline' }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-1">
            <slot name="header-actions"></slot>
          </div>
        </div>

        <div dir="ltr" class="relative overflow-hidden flex-1 p-4 bg-gradient-to-b from-muted/30 to-background" ref="messagesPane" style="--radix-scroll-area-corner-width: 0px; --radix-scroll-area-corner-height: 0px;">
          <div class="h-full w-full rounded-[inherit]" style="overflow: auto; -webkit-overflow-scrolling: touch;">
            <div style="min-width: 100%; display: table; padding-bottom: 140px;">
              <div class="space-y-6">
                <slot name="messages"></slot>
                <div ref="messagesEnd" aria-hidden="true"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-3 border-t bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/5 sticky bottom-0 z-40">
          <div style="margin-bottom:6px"><slot name="input"></slot></div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { resolveUserAvatar } from '~/composables/useAssets'
const props = defineProps({
  activeConversation: { type: Object, default: null },
  activeConversationName: { type: String, default: '' },
  showChatWindowOnMobile: { type: Boolean, default: false }
})
const emit = defineEmits(['back'])
const route = useRoute()
let _prevHideBottomNav = undefined

watch(() => props.showChatWindowOnMobile, (v) => {
  if (v) {
    _prevHideBottomNav = route.meta?.hideBottomNav
    route.meta.hideBottomNav = true
  } else {
    if (_prevHideBottomNav === undefined) route.meta.hideBottomNav = false
    else route.meta.hideBottomNav = _prevHideBottomNav
    _prevHideBottomNav = undefined
  }
})

onMounted(() => {
  if (props.showChatWindowOnMobile) {
    _prevHideBottomNav = route.meta?.hideBottomNav
    route.meta.hideBottomNav = true
  }
})

onBeforeUnmount(() => {
  if (props.showChatWindowOnMobile) {
    if (_prevHideBottomNav === undefined) route.meta.hideBottomNav = false
    else route.meta.hideBottomNav = _prevHideBottomNav
    _prevHideBottomNav = undefined
  }
})

const messagesPane = ref(null)
const messagesEnd = ref(null)
defineExpose({ messagesPane, messagesEnd })

function statusColor(status) {
  switch (status) {
    case 'online': return 'bg-brand-500';
    case 'away': return 'bg-yellow-500';
    default: return 'bg-gray-400';
  }
}
</script>
