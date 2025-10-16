<template>
  <div>
    <PageHero
      title="My Quizees"
      description="A list of users who follow you, have liked, or have taken your quizzes."
      :breadcrumbs="[{ text: 'Dashboard', href: '/quiz-master/dashboard' }, { text: 'Quizees', current: true }]"
    >
      <template #eyebrow>Quiz-master tools</template>
    </PageHero>

    <div class="container mx-auto p-6 max-w-7xl">
      <div v-if="pending" class="text-center text-gray-500">
        Loading quizees...
      </div>
      <div v-else-if="error" class="text-center text-red-500">
        Failed to load quizees. Please try again later.
      </div>
      <div v-else-if="quizees.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <UCard v-for="quizee in quizees" :key="quizee.id" class="hover:shadow-lg transition">
          <div class="flex flex-col items-center text-center">
            <div class="w-24 h-24 rounded-full overflow-hidden mb-4">
              <img v-if="quizee.avatar" :src="quizee.avatar" :alt="quizee.name" class="w-full h-full object-cover">
              <div v-else class="w-full h-full bg-slate-100 text-slate-700 grid place-items-center font-bold text-3xl">
                {{ (quizee.name || '').charAt(0).toUpperCase() }}
              </div>
            </div>
            <h3 class="font-semibold text-lg text-gray-800">{{ quizee.name }}</h3>
            <p class="text-sm text-gray-500">{{ quizee.email }}</p>
            <div class="mt-4">
              <NuxtLink :to="`/users/${quizee.id}`" class="text-indigo-600 font-medium text-sm hover:underline">
                View Profile
              </NuxtLink>
            </div>
          </div>
        </UCard>
      </div>
      <div v-else class="text-center text-gray-500 py-12">
        <Icon name="heroicons:users" class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-semibold text-gray-900">No engaged users yet</h3>
        <p class="mt-1 text-sm text-gray-500">Users who follow you or interact with your quizzes will appear here.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PageHero from '~/components/ui/PageHero.vue'

definePageMeta({
  layout: 'quiz-master',
  title: 'My Quizees'
})

useHead({
  title: 'My Quizees'
})

const { data, pending, error } = await useAsyncData(
  'quiz-master-followers',
  () => $fetch('/api/quiz-master/followers')
)

const quizees = computed(() => (data.value?.followers || data.value || []).filter(Boolean))
</script>
