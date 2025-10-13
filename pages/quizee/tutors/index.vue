<template>
  <div>
    <h1 class="text-2xl font-semibold mb-4">Browse quiz-masters</h1>
    <div v-if="pending">
      <SkeletonGrid :count="3" />
    </div>
    <div v-else>
      <div v-if="(!quizMasters || quizMasters.length === 0)" class="p-6 bg-white rounded shadow text-gray-600">0 results returned</div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="t in quizMasters" :key="t.id" class="block p-4 bg-white rounded shadow hover:shadow-md transition">
          <div class="flex items-center gap-3 justify-between">
            <NuxtLink :to="`/quizee/quiz-masters/${t.id}`" class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                <img v-if="t.avatar" :src="t.avatar" :alt="t.name" class="w-full h-full object-cover rounded-full" />
                <span v-else>T</span>
              </div>
              <div>
                <div class="font-semibold">{{ t.name }}</div>
                <div class="text-xs text-gray-500">{{ t.experience ? t.experience + ' yrs' : '' }}</div>
              </div>
            </NuxtLink>
            <div>
              <button @click="() => toggleFollow(t)" :disabled="loadingFollow[t.id]" class="px-3 py-1 rounded-md border text-sm" :class="following[t.id] ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'">
                <span v-if="following[t.id]">Following</span>
                <span v-else>Follow</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SkeletonGrid from '~/components/SkeletonGrid.vue'
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

definePageMeta({ layout: 'quizee' })

const config = useRuntimeConfig()
const { data, pending } = await useFetch(config.public.apiBase + '/api/quiz-masters')

const quizMasters = computed(() => {
  if (data.value && data.value.data && Array.isArray(data.value.data)) {
    return data.value.data.filter(Boolean)
  }
  return []
})

const auth = useAuthStore()
const router = useRouter()
const following = ref({})
const loadingFollow = ref({})

async function toggleFollow(qm) {
  if (!auth.user) return router.push('/login')
  const id = qm.id
  const cur = !!following.value[id]
  following.value = { ...following.value, [id]: !cur }
  loadingFollow.value = { ...loadingFollow.value, [id]: true }
  try {
    if (!cur) await $fetch(config.public.apiBase + `/api/quiz-masters/${id}/follow`, { method: 'POST', credentials: 'include' })
    else await $fetch(config.public.apiBase + `/api/quiz-masters/${id}/unfollow`, { method: 'POST', credentials: 'include' })
  } catch (err) {
    following.value = { ...following.value, [id]: cur }
    console.error('Follow failed', err)
  } finally {
    loadingFollow.value = { ...loadingFollow.value, [id]: false }
  }
}

// populate initial following map when data is available
watchEffect(() => {
  const list = quizMasters.value || []
  const map = {}
  list.forEach(q => { map[q.id] = !!(q.is_following || q.isFollowing || q.is_following_by_current_user) })
  following.value = map
})
</script>
