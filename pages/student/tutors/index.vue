<template>
  <div>
    <h1 class="text-2xl font-semibold mb-4">Browse Tutors</h1>
    <div v-if="pending">
      <SkeletonGrid :count="3" />
    </div>
    <div v-else>
      <div v-if="(!tutors || tutors.length === 0)" class="p-6 bg-white rounded shadow text-gray-600">0 results returned</div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NuxtLink v-for="t in tutors" :key="t.id" :to="`/student/tutors/${t.id}`" class="block p-4 bg-white rounded shadow hover:shadow-md transition">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
              <img v-if="t.avatar" :src="t.avatar" :alt="t.name" class="w-full h-full object-cover rounded-full" />
              <span v-else>T</span>
            </div>
            <div>
              <div class="font-semibold">{{ t.name }}</div>
              <div class="text-xs text-gray-500">{{ t.experience ? t.experience + ' yrs' : '' }}</div>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SkeletonGrid from '~/components/SkeletonGrid.vue'

definePageMeta({ layout: 'student' })

const config = useRuntimeConfig()
const { data, pending } = await useFetch(config.public.apiBase + '/api/tutors')

const tutors = computed(() => {
  if (data.value && data.value.data && Array.isArray(data.value.data)) {
    return data.value.data.filter(Boolean)
  }
  return []
})
</script>
