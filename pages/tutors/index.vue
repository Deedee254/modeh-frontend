<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto p-6 max-w-7xl">
      <PageHero
        title="Our quiz-masters"
        description="Meet our team of dedicated and experienced quiz-masters."
        align="center"
        padding="py-12"
      />

      <div v-if="pending" class="text-center text-gray-500">
        Loading quiz-masters...
      </div>
      <div v-else-if="error" class="text-center text-red-500">
        Failed to load quiz-masters. Please try again later.
      </div>
      <div v-else-if="quiz-masters.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <UCard v-for="quiz-master in quiz-masters" :key="quiz-master.id" class="hover:shadow-lg transition">
          <div class="flex flex-col items-center text-center">
            <div class="w-24 h-24 rounded-full overflow-hidden mb-4">
              <img v-if="quiz-master.avatar" :src="quiz-master.avatar" :alt="quiz-master.name" class="w-full h-full object-cover">
              <div v-else class="w-full h-full bg-indigo-100 text-indigo-700 grid place-items-center font-bold text-3xl">
                {{ (quiz-master.name || '').charAt(0).toUpperCase() }}
              </div>
            </div>
            <h3 class="font-semibold text-lg text-gray-800">{{ quiz-master.name }}</h3>
            <p class="text-sm text-gray-500">{{ quiz-master.headline || 'Experienced quiz-master' }}</p>
            <div class="mt-4">
              <NuxtLink :to="`/quiz-masters/${quiz-master.id}`" class="text-indigo-600 font-medium text-sm hover:underline">
                View Profile
              </NuxtLink>
            </div>
          </div>
        </UCard>
      </div>
      <div v-else class="text-center text-gray-500">
        No quiz-masters found.
      </div>
    </div>
  </div>
</template>

<script setup>
import PageHero from '~/components/ui/PageHero.vue'

const config = useRuntimeConfig()

const { data: quiz-mastersData, pending, error } = await useAsyncData(
  'quiz-masters',
  () => $fetch(config.public.apiBase + '/api/quiz-masters')
)

const quiz-masters = computed(() => {
  if (!quiz-mastersData.value) return []
  // Handle paginated or direct array response
  return Array.isArray(quiz-mastersData.value) ? quiz-mastersData.value : (quiz-mastersData.value.data || [])
})

useHead({
  title: 'Our quiz-masters',
  meta: [
    { name: 'description', content: 'Browse our list of expert quiz-masters.' }
  ]
})
</script>