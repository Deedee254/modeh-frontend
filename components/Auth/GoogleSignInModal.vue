<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 bg-black/20 z-40" @click="closeModal" />
    </Transition>

    <Transition name="slide-down">
      <div
        v-if="isOpen"
        class="fixed top-4 right-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span class="text-sm font-semibold text-gray-700">Sign in to Modeh with Google</span>
          </div>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- Content -->
        <div class="p-4">
          <p class="text-xs text-gray-600 mb-4">
            Choose an account to continue signing up as a {{ roleName }}
          </p>

          <!-- Account List -->
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <button
              v-for="account in googleAccounts"
              :key="account.email"
              @click="signInWithAccount(account)"
              class="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-left"
            >
              <img
                v-if="account.avatar"
                :src="account.avatar"
                :alt="account.name"
                class="w-10 h-10 rounded-full"
              />
              <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {{ getInitials(account.name) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900 truncate">{{ account.name }}</div>
                <div class="text-xs text-gray-500 truncate">{{ account.email }}</div>
              </div>
            </button>

            <!-- Use another account -->
            <button
              @click="useAnotherAccount"
              class="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-left"
            >
              <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Icon name="heroicons:plus" class="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div class="text-sm font-medium text-gray-700">Use another account</div>
              </div>
            </button>
          </div>

          <!-- Email/Password Option -->
          <div class="mt-4 pt-4 border-t border-gray-200">
            <button
              @click="toggleEmailForm"
              class="w-full text-sm text-brand-600 hover:text-brand-700 font-medium py-2"
            >
              {{ showEmailForm ? 'Back to Google Sign-In' : 'Sign up with email instead' }}
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isGoogleLoading" class="absolute inset-0 bg-white/80 flex items-center justify-center">
          <Icon name="heroicons:arrow-path" class="animate-spin w-6 h-6 text-brand-600" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    default: 'quizee'
  }
})

const emit = defineEmits(['close', 'sign-in', 'toggle-email-form', 'use-another-account'])

const isGoogleLoading = ref(false)
const showEmailForm = ref(false)
const googleAccounts = ref([])

const roleName = computed(() => {
  const roles = {
    'quizee': 'Learner',
    'quiz-master': 'Educator',
    'institution-manager': 'Institution Manager'
  }
  return roles[props.role] || 'User'
})

function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

function closeModal() {
  emit('close')
}

function toggleEmailForm() {
  showEmailForm.value = !showEmailForm.value
  emit('toggle-email-form')
}

function useAnotherAccount() {
  isGoogleLoading.value = true
  emit('use-another-account')
  // The parent component will handle the actual sign-in
  setTimeout(() => {
    isGoogleLoading.value = false
  }, 1000)
}

async function signInWithAccount(account) {
  isGoogleLoading.value = true
  try {
    emit('sign-in', account)
    // Parent component handles the actual sign-in logic
  } finally {
    // Keep loading state until parent closes modal
  }
}

// Simulate fetching stored Google accounts
// In a real app, this would come from browser's Google Account Picker
onMounted(() => {
  // Mock accounts - in production, this would come from Google API
  googleAccounts.value = [
    {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      avatar: null
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@gmail.com',
      avatar: null
    }
  ]

  // Try to get real accounts from Google One Tap or Account Chooser API
  loadGoogleAccounts()
})

// Placeholder for integrating with Google Account Chooser API
async function loadGoogleAccounts() {
  // This would integrate with Google's account chooser
  // For now, we use mock data
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    // Reset state when modal opens
    showEmailForm.value = false
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
