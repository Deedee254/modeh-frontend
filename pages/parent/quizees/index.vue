<template>
  <div class="w-full">
    <div class="mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">My Quizees</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Manage and monitor your quizees' progress</p>
        </div>
        <button
          @click="showInviteModal = true"
          class="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors w-full sm:w-auto"
        >
          + Invite New Quizee
        </button>
      </div>
    </div>

    <LoadingSpinner v-if="loading" />
    <ErrorAlert v-if="error" :message="error" @dismiss="error = null" />

    <template v-else>
      <div v-if="quizees.length > 0" class="grid grid-cols-1 gap-4">
        <div v-for="quizee in quizees" :key="quizee.id" class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="flex items-center gap-4 flex-1">
              <img :src="quizee.avatar || '/logo/avatar-placeholder.png'" class="w-16 h-16 rounded-lg object-cover" />
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white truncate">{{ quizee.name }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ quizee.email }}</p>
                <p v-if="quizee.grade || quizee.level" class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  <span v-if="quizee.grade">Grade: {{ quizee.grade.name }}</span>
                  <span v-if="quizee.level" class="ml-3">Level: {{ quizee.level.name }}</span>
                </p>
              </div>
            </div>

            <div class="grid grid-cols-2 sm:flex sm:gap-6 gap-4">
              <div class="text-center">
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ quizee.points || 0 }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Points</p>
              </div>
              <div class="flex flex-col gap-2 col-span-2 sm:col-span-1">
                <NuxtLink
                  :to="`/parent/quizee/${quizee.id}/progress`"
                  class="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-center font-medium"
                >
                  View Progress
                </NuxtLink>
                <button
                  @click="removeQuizee(quizee.id)"
                  class="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center">
        <Icon name="heroicons:user-group" class="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No quizees yet</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">Start by inviting your first quizee to monitor their progress</p>
        <button
          @click="showInviteModal = true"
          class="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors"
        >
          Invite Your First Quizee
        </button>
      </div>
    </template>

    <InviteQuizeeModal v-if="showInviteModal" @close="showInviteModal = false" @invited="onQuizeeInvited" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import ErrorAlert from '~/components/ui/ErrorAlert.vue'
import InviteQuizeeModal from '~/components/parent/InviteQuizeeModal.vue'

definePageMeta({ layout: 'parent' })

const auth = useAuthStore()
const api = useApi()

const loading = ref(false)
const error = ref(null)
const showInviteModal = ref(false)
const quizees = ref([])

async function loadQuizees() {
  loading.value = true
  error.value = null
  try {
    const res = await api.get('/api/parent/quizees')
    if (api.handleAuthStatus(res)) return
    const data = await api.parseResponse(res)
    if (data && data.quizees) {
      quizees.value = data.quizees
    }
  } catch (e) {
    console.error('Failed to load quizees:', e)
    error.value = e?.message || 'Failed to load quizees'
  } finally {
    loading.value = false
  }
}

async function removeQuizee(quizeeId) {
  if (!confirm('Are you sure you want to remove this quizee?')) return

  try {
    const res = await api.del(`/api/parent/quizee/${quizeeId}`)
    if (api.handleAuthStatus(res)) return
    if (res.ok) {
      quizees.value = quizees.value.filter(s => s.id !== quizeeId)
    } else {
      error.value = 'Failed to remove quizee'
    }
  } catch (e) {
    error.value = e?.message || 'Failed to remove quizee'
  }
}

function onQuizeeInvited() {
  showInviteModal.value = false
  loadQuizees()
}

onMounted(() => {
  loadQuizees()
})
</script>
