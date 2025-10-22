<template>
  <div :class="['absolute inset-y-0 left-0 z-20 w-full md:static md:w-96 border-r border-border transition-transform duration-300 ease-in-out', showChatWindowOnMobile ? '-translate-x-full' : 'translate-x-0 md:translate-x-0']">
    <div class="flex flex-col w-full h-full bg-sidebar-bg">
      <div class="p-4 border-b border-border bg-primary">
        <div class="flex items-center justify-between mb-3">
          <h1 class="text-lg font-semibold tracking-tight text-primary-foreground md:text-xl">Chats</h1>
          <button @click="$emit('open-create')" class="inline-flex items-center justify-center gap-2 h-8 w-8 rounded-full hover:bg-primary-foreground/20 text-primary-foreground md:h-9 md:w-9 [&_svg]:h-4 [&_svg]:w-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
          </button>
        </div>
        <div class="relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
          <input v-model="searchQueryLocal" @input="$emit('update:searchQuery', searchQueryLocal)" class="flex h-9 w-full rounded-full border px-3 py-2 text-sm md:text-xs pl-10 bg-primary-foreground/15 border-primary-foreground/25 text-primary-foreground placeholder:text-primary-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/50" placeholder="Search conversations...">
        </div>
      </div>

      <div class="px-4 py-3 border-b border-border">
        <div dir="ltr" data-orientation="horizontal">
          <div role="tablist" aria-orientation="horizontal" class="h-9 items-center justify-center rounded-full p-1 text-muted-foreground grid w-full grid-cols-3 bg-muted/60">
            <button @click="$emit('change-tab','all')" :data-state="activeTab === 'all' ? 'active' : 'inactive'" :class="['inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium md:text-xs transition', activeTab === 'all' ? 'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow' : 'hover:bg-muted/30']">All</button>
            <button @click="$emit('change-tab','online')" :data-state="activeTab === 'online' ? 'active' : 'inactive'" :class="['inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium md:text-xs transition', activeTab === 'online' ? 'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow' : 'hover:bg-muted/30']">Online</button>
            <button @click="$emit('change-tab','unread')" :data-state="activeTab === 'unread' ? 'active' : 'inactive'" :class="['inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium md:text-xs transition', activeTab === 'unread' ? 'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow' : 'hover:bg-muted/30']">Unread</button>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
  <button v-for="t in allConversations" :key="t.id" @click="$emit('select-conversation', t)" :class="['w-full px-4 py-3 flex items-start gap-3 hover:bg-sidebar-hover transition-colors duration-150 border-b border-border text-left', (t.id === activeConversationId) ? 'bg-sidebar-active' : '']">
          <div class="relative flex-shrink-0">
            <span class="relative flex shrink-0 overflow-hidden rounded-full h-12 w-12 sm:h-14 sm:w-14">
              <img v-if="t.avatar" class="aspect-square h-full w-full" :src="t.avatar" :alt="t.name">
              <span v-else class="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground">{{ t.name.charAt(0) }}</span>
            </span>
            <div v-if="t.status === 'online'" class="absolute bottom-0 right-0 h-3 w-3 bg-primary rounded-full border-2 border-sidebar-bg"></div>
          </div>
          <div class="flex-1 min-w-0 text-left">
            <div class="flex items-baseline justify-between mb-1">
              <h3 class="font-semibold text-sm text-foreground truncate md:text-base">{{ t.name }}</h3>
              <span class="text-[11px] text-muted-foreground ml-2 flex-shrink-0 md:text-xs">{{ t.last_at ? formatTime(t.last_at) : '' }}</span>
            </div>
            <p class="text-[13px] text-muted-foreground truncate md:text-sm">{{ t.last_preview || 'No messages yet' }}</p>
          </div>
          <div v-if="((t.unread_count ?? t.unread) || 0) > 0" class="flex-shrink-0 bg-primary text-primary-foreground text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">{{ t.unread_count ?? t.unread }}</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  allConversations: { type: Array, default: () => [] },
  activeConversationId: { type: [String, Number, null], default: null },
  activeTab: { type: String, default: 'all' },
  searchQuery: { type: String, default: '' },
  showChatWindowOnMobile: { type: Boolean, default: false }
})
const emit = defineEmits(['select-conversation','open-create','update:searchQuery','change-tab'])
const searchQueryLocal = ref(props.searchQuery)
watch(() => props.searchQuery, (v) => { searchQueryLocal.value = v })

function formatTime(dateString) {
  const date = new Date(dateString)
  if (isNaN(date)) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}
</script>
