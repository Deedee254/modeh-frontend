<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold mb-4">Edit Topic</h1>

    <div v-if="loading">Loading...</div>
    <div v-else>
      <div class="mb-4">
        <label class="block text-sm font-medium">Name</label>
        <input v-model="topic.name" class="border p-2 w-full" />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Image</label>
        <div v-if="topic.image" class="mb-2">
          <img :src="topic.image" class="w-32 h-32 object-cover rounded" />
        </div>
        <input ref="fileRef" type="file" accept="image/*" @change="onFileChange" />
        <div class="mt-3">
          <button @click="upload" class="px-4 py-2 bg-indigo-600 text-white rounded">Upload Image</button>
        </div>
      </div>

      <div class="mt-6">
        <NuxtLink to="/quiz-master/topics" class="text-sm text-gray-600">Back to topics</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
// Use the quiz-master layout and provide a page title
definePageMeta({ layout: 'quiz-master', title: 'Edit Topic' })
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'
const alert = useAppAlert()
const api = useApi()
const route = useRoute()
const router = useRouter()
const id = route.params.id
const topic = ref({})
const loading = ref(false)
const fileRef = ref(null)
let selectedFile = null

onMounted(fetchTopic)

async function fetchTopic() {
  loading.value = true
  try {
    const res = await fetch(useRuntimeConfig().public.apiBase + `/api/topics?per_page=1&q=${encodeURIComponent(id)}`, { credentials: 'include' })
    if (res.ok) {
      const json = await res.json()
      // Try to find by id in returned list
      const data = (json.topics?.data || json.topics || json.data || [])
      const found = Array.isArray(data) ? data.find(t => String(t.id) === String(id)) : null
      topic.value = found || { id }
    }
  } catch (e) {
    alert.push({ type: 'error', message: 'Network error', icon: 'heroicons:x-circle' })
  }
  loading.value = false
}

function onFileChange(e) {
  selectedFile = e.target.files?.[0] || null
}

async function upload() {
  if (!selectedFile) { alert.push({ type: 'error', message: 'No file selected', icon: 'heroicons:exclamation-circle' }); return }
  const fd = new FormData()
  fd.append('image', selectedFile)
  const res = await api.postFormData(`/api/topics/${id}/upload-image`, fd)
  if (api.handleAuthStatus(res)) { alert.push({ type: 'warning', message: 'Session expired — please sign in again' }); return }
  if (res.ok) {
    const json = await res.json()
    topic.value = json.topic
    alert.push({ type: 'success', message: 'Image uploaded', icon: 'heroicons:check-circle' })
  } else {
    alert.push({ type: 'error', message: 'Upload failed', icon: 'heroicons:exclamation-circle' })
  }
}
</script>
