<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40" @click="$emit('close')"></div>
    <div class="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold">New Chat</h3>
        <button @click="$emit('close')" class="text-muted-foreground hover:text-foreground" aria-label="Close">✕</button>
      </div>
      
      <div class="space-y-4">
        <!-- Support Chat Button -->
        <button 
          @click="startSupport" 
          class="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/5 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-headset h-5 w-5 text-brand-600">
            <path d="M3 9d0v-2a9 9 0 0 1 18 0v2"></path>
            <path d="M21 12.5A8.97 8.97 0 0 1 12 20.5 8.97 8.97 0 0 1 3 12.5"></path>
            <circle cx="8" cy="13" r="1"></circle>
            <circle cx="16" cy="13" r="1"></circle>
          </svg>
          <div class="text-left">
            <div class="font-medium text-foreground">Contact Support</div>
            <div class="text-xs text-muted-foreground">Chat with our support team</div>
          </div>
        </button>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-border"></div>
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="px-2 bg-white text-muted-foreground">OR</span>
          </div>
        </div>

        <!-- User Search -->
        <div>
          <label class="block text-sm font-medium mb-2 text-foreground">Message a user</label>
          <input 
            v-model="localEmail" 
            ref="dmInput" 
            placeholder="Enter email address" 
            class="w-full border border-input px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2" 
            @keydown.enter.prevent="start"
          />
          <div v-if="searchResultsLocal.length" class="mt-2 max-h-48 overflow-auto border border-input rounded-md bg-background">
            <button 
              v-for="u in searchResultsLocal" 
              :key="u.id" 
              @click="selectUser(u)" 
              class="w-full text-left px-3 py-2 hover:bg-accent/50 transition-colors border-b border-border last:border-b-0"
            >
              <div class="font-medium text-sm">{{ u.name }}</div>
              <div class="text-xs text-muted-foreground">{{ u.email }}</div>
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 pt-4">
          <button 
            @click="$emit('close')" 
            class="px-4 py-2 rounded-md border border-input text-foreground hover:bg-accent/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="start" 
            :disabled="!localEmail.trim()"
            class="px-4 py-2 rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Start Chat
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ 
  show: { type: Boolean, default: false }, 
  searchResults: { type: Array, default: () => [] } 
})

const emit = defineEmits(['close', 'start-dm', 'add-user', 'search', 'start-support'])

const localEmail = ref('')
const userSearchLocal = ref('')
const searchResultsLocal = ref(props.searchResults || [])
const dmInput = ref(null)

watch(() => props.searchResults, (v) => { 
  searchResultsLocal.value = v || [] 
})

watch(() => props.show, (v) => { 
  if (v) { 
    localEmail.value = ''
    setTimeout(() => { 
      try { 
        dmInput.value?.focus?.() 
      } catch (e) {} 
    }, 100) 
  } 
})

function onSearch() { 
  emit('search', userSearchLocal.value) 
}

function start() { 
  if (!localEmail.value.trim()) return
  emit('start-dm', localEmail.value.trim()) 
}

function startSupport() {
  emit('start-support')
  emit('close')
}

function selectUser(user) {
  localEmail.value = user.email
  searchResultsLocal.value = []
}
</script>

<style scoped>
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

