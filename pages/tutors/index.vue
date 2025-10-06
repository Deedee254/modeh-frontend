<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto p-6 max-w-7xl">
      <PageHero
        title="Our Tutors"
        description="Meet our team of dedicated and experienced tutors."
        align="center"
        padding="py-12"
      />

      <div v-if="pending" class="text-center text-gray-500">
        Loading tutors...
      </div>
      <div v-else-if="error" class="text-center text-red-500">
        Failed to load tutors. Please try again later.
      </div>
      <div v-else-if="tutors.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <UCard v-for="tutor in tutors" :key="tutor.id" class="hover:shadow-lg transition">
          <div class="flex flex-col items-center text-center">
            <div class="w-24 h-24 rounded-full overflow-hidden mb-4">
              <img v-if="tutor.avatar" :src="tutor.avatar" :alt="tutor.name" class="w-full h-full object-cover">
              <div v-else class="w-full h-full bg-indigo-100 text-indigo-700 grid place-items-center font-bold text-3xl">
                {{ (tutor.name || '').charAt(0).toUpperCase() }}
              </div>
            </div>
            <h3 class="font-semibold text-lg text-gray-800">{{ tutor.name }}</h3>
            <p class="text-sm text-gray-500">{{ tutor.headline || 'Experienced Tutor' }}</p>
            <div class="mt-4">
              <NuxtLink :to="`/tutors/${tutor.id}`" class="text-indigo-600 font-medium text-sm hover:underline">
                View Profile
              </NuxtLink>
            </div>
          </div>
        </UCard>
      </div>
      <div v-else class="text-center text-gray-500">
        No tutors found.
      </div>
    </div>
  </div>
</template>

<script setup>
import PageHero from '~/components/ui/PageHero.vue'

const config = useRuntimeConfig()

const { data: tutorsData, pending, error } = await useAsyncData(
  'tutors',
  () => $fetch(config.public.apiBase + '/api/tutors')
)

const tutors = computed(() => {
  if (!tutorsData.value) return []
  // Handle paginated or direct array response
  return Array.isArray(tutorsData.value) ? tutorsData.value : (tutorsData.value.data || [])
})

useHead({
  title: 'Our Tutors',
  meta: [
    { name: 'description', content: 'Browse our list of expert tutors.' }
  ]
})
</script>