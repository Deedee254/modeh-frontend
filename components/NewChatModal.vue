<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40" @click="$emit('close')"></div>
    <div class="relative bg-white rounded-lg shadow-lg w-full max-w-md p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-medium">New Chat</h3>
        <button @click="$emit('close')" class="text-muted-foreground" aria-label="Close">✕</button>
      </div>
      <div class="space-y-3">
        <input v-model="localEmail" ref="dmInput" placeholder="Email or 'support'" class="w-full border px-3 py-2 rounded" />
        <div>
          <label class="block text-sm font-medium mb-1">Invite users</label>
          <input v-model="userSearchLocal" @input="onSearch" placeholder="Search users..." class="w-full border px-3 py-2 rounded" />
          <div v-if="searchResultsLocal.length" class="mt-2 max-h-40 overflow-auto border rounded p-2">
            <button v-for="u in searchResultsLocal" :key="u.id" @click="$emit('add-user', u)" class="block w-full text-left px-2 py-1 hover:bg-muted">{{ u.name }} — {{ u.email }}</button>
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button @click="$emit('close')" class="px-3 py-2 rounded border">Cancel</button>
          <button @click="$emit('start-dm', localEmail)" class="px-3 py-2 rounded bg-brand-600 text-white">Start</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ show: { type: Boolean, default: false }, searchResults: { type: Array, default: () => [] } })
const emit = defineEmits(['close','start-dm','add-user','search'])
const localEmail = ref('')
const userSearchLocal = ref('')
const searchResultsLocal = ref(props.searchResults || [])
watch(() => props.searchResults, (v) => { searchResultsLocal.value = v || [] })
function onSearch() { emit('search', userSearchLocal.value) }
</script>

