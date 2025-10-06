<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto p-6 max-w-4xl">
      <div class="my-8">
        <NuxtLink to="/student/tutors" class="text-indigo-600 hover:underline">
          &larr; Back to all tutors
        </NuxtLink>
      </div>

      <div v-if="pending" class="text-center text-gray-500">
        Loading tutor profile...
      </div>
      <div v-else-if="error" class="text-center text-red-500">
        Failed to load profile. The tutor may not exist or there was a server error.
      </div>
      <div v-else-if="tutor" class="bg-white rounded-2xl shadow-lg p-8">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <div class="flex-shrink-0">
            <div class="w-40 h-40 rounded-full overflow-hidden ring-4 ring-indigo-100">
              <img v-if="tutor.avatar" :src="tutor.avatar" :alt="tutor.name" class="w-full h-full object-cover">
              <div v-else class="w-full h-full bg-indigo-100 text-indigo-700 grid place-items-center font-bold text-6xl">
                {{ (tutor.name || '').charAt(0).toUpperCase() }}
              </div>
            </div>
          </div>
          <div class="flex-1 text-center sm:text-left">
            <h1 class="text-3xl font-bold text-gray-900">{{ tutor.name }}</h1>
            <p class="text-lg text-gray-600 mt-1">{{ tutor.headline || 'Experienced Tutor' }}</p>
            
            <div v-if="tutor.subjects && tutor.subjects.length" class="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
              <span v-for="subject in tutor.subjects" :key="subject.id" class="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full">
                {{ subject.name }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-8 border-t border-gray-200 pt-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">About Me</h2>
          <div v-if="tutor.bio" class="prose max-w-none text-gray-700" v-html="tutor.bio"></div>
          <p v-else class="text-gray-500">
            This tutor has not yet provided a bio.
          </p>
        </div>
        
        <div v-if="tutor.quizzes && tutor.quizzes.length" class="mt-8 border-t border-gray-200 pt-8">
           <h2 class="text-xl font-semibold text-gray-800 mb-4">Quizzes by {{ tutor.name }}</h2>
           <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <UCard v-for="quiz in tutor.quizzes" :key="quiz.id">
                <h3 class="font-semibold text-gray-800">{{ quiz.title }}</h3>
                <p class="text-sm text-gray-500 mt-1">{{ quiz.topic_name || 'General' }}</p>
                <div class="mt-3">
                  <NuxtLink :to="`/quizzes/${quiz.id}`" class="text-indigo-600 font-medium text-sm hover:underline">
                    View Quiz
                  </NuxtLink>
                </div>
             </UCard>
           </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'student' })

const route = useRoute()
const config = useRuntimeConfig()
const tutorId = route.params.id

const { data: tutorData, pending, error } = await useAsyncData(
  `tutor-${tutorId}`,
  () => $fetch(config.public.apiBase + `/api/tutors/${tutorId}`)
)

const tutor = computed(() => {
    if (!tutorData.value) return null
    // API might return tutor object nested under a 'data' key
    return tutorData.value.data || tutorData.value
})

// Set head tags for SEO
useHead({
  title: () => tutor.value ? tutor.value.name : 'Tutor Profile',
  meta: [
    { name: 'description', content: () => tutor.value ? `View the profile of ${tutor.value.name}. ${tutor.value.headline || ''}` : 'Tutor profile' }
  ]
})
</script>

<style>
/* Basic prose styles for the bio */
.prose p {
  margin-bottom: 1em;
}
.prose ul, .prose ol {
  margin-left: 1.5em;
  margin-bottom: 1em;
}
.prose li {
  margin-bottom: 0.5em;
}
</style>
