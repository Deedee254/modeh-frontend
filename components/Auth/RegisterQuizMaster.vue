<template>
  <div class="min-h-screen w-full flex overflow-hidden">
    <!-- Left Side: Features Panel (Hidden on mobile) -->
    <div class="hidden lg:block lg:w-1/2 h-full">
      <AuthFeaturesPanel />
    </div>

    <!-- Right Side: Registration Form -->
    <div class="w-full lg:w-1/2 min-h-screen overflow-y-auto bg-gray-50 flex flex-col pt-16 sm:pt-12">
      <div class="flex-1 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div class="w-full max-w-xl">
          <!-- Mobile Header -->
          <div class="lg:hidden text-center mb-6">
            <NuxtLink to="/">
              <img class="mx-auto h-10 w-auto" src="/logo/modeh-logo.png" alt="Modeh" />
            </NuxtLink>
          </div>

          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold tracking-tight text-gray-900">Join as a Quiz Master</h2>
            <p class="mt-2 text-sm text-gray-600">
              Already have an account? <NuxtLink to="/login" class="font-medium text-brand-600 hover:text-brand-500">Log in</NuxtLink>
            </p>
          </div>

          <!-- Referral banner -->
          <div v-if="referralCode" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
            <Icon name="heroicons:information-circle" class="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p class="text-sm text-blue-900">
              <span class="font-semibold">You're joining via a referral link!</span>
            </p>
          </div>

          <div class="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-gray-100">
            <form @submit.prevent="submit" class="space-y-5">
              <!-- Google Sign-in Button -->
              <div class="mb-6">
                <button
                  type="button"
                  @click="signInWithGoogle"
                  :disabled="isGoogleLoading"
                  class="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-75 flex items-center justify-center gap-2 transition-colors font-medium"
                >
                  <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#1F2937" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  <span>{{ isGoogleLoading ? 'Signing up...' : 'Continue with Google' }}</span>
                </button>
              </div>

              <!-- Divider -->
              <div class="relative mb-6">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>

              <!-- Full Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name <span class="text-red-500">*</span></label>
                <input v-model="form.name" type="text" required class="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:ring-brand-500 focus:border-brand-500" placeholder="Jane Educator" />
                <p v-if="fieldErrors.name" class="mt-1 text-sm text-red-600">{{ fieldErrors.name }}</p>
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
                <input v-model="form.email" type="email" required class="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:ring-brand-500 focus:border-brand-500" placeholder="jane@example.com" />
                <p v-if="fieldErrors.email" class="mt-1 text-sm text-red-600">{{ fieldErrors.email }}</p>
              </div>

              <!-- Phone Number -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input v-model="form.phone" type="tel" class="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:ring-brand-500 focus:border-brand-500" placeholder="+1234567890" />
              </div>

              <!-- Password Fields (Required for email/password) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Password <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required class="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 pr-10 focus:ring-brand-500 focus:border-brand-500" />
                    <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600">
                      <Icon :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" class="w-5 h-5" />
                    </button>
                  </div>
                  <p v-if="fieldErrors.password" class="mt-1 text-sm text-red-600">{{ fieldErrors.password }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Confirm <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <input v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" required class="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 pr-10 focus:ring-brand-500 focus:border-brand-500" />
                    <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600">
                      <Icon :name="showConfirmPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" class="w-5 h-5" />
                    </button>
                  </div>
                  <p v-if="fieldErrors.confirmPassword" class="mt-1 text-sm text-red-600">{{ fieldErrors.confirmPassword }}</p>
                </div>
              </div>

              <!-- Error messages -->
              <p v-if="validationError" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{{ validationError }}</p>
              <p v-if="error" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{{ error }}</p>

              <!-- Submit Button -->
              <button
                type="submit"
                :disabled="isLoading"
                class="w-full px-8 py-2.5 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 shadow-lg shadow-brand-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Icon v-if="isLoading" name="heroicons:arrow-path" class="animate-spin w-5 h-5" />
                {{ isLoading ? 'Creating Account...' : 'Create Account' }}
              </button>

              <p class="text-xs text-gray-600 text-center">
                After creating your account, you'll complete your profile information.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import AuthFeaturesPanel from '~/components/Auth/AuthFeaturesPanel.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const { signIn } = useAuth()

// State
const isLoading = ref(false)
const isGoogleLoading = ref(false)
const error = ref(null)
const validationError = ref('')
const referralCode = ref(null)

// Form Data
const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

// Validation State
const fieldErrors = reactive({})

// UI State
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Validation functions
function validateForm() {
  fieldErrors.name = !form.name ? 'Name is required' : ''
  fieldErrors.email = !form.email || !/^\S+@\S+\.\S+$/.test(form.email) ? 'Valid email is required' : ''
  fieldErrors.password = !form.password || form.password.length < 6 ? 'Password must be at least 6 chars' : ''
  fieldErrors.confirmPassword = form.password !== form.confirmPassword ? 'Passwords do not match' : ''

  if (fieldErrors.name || fieldErrors.email || fieldErrors.password || fieldErrors.confirmPassword) {
    validationError.value = "Please fix errors before continuing."
    return false
  }
  validationError.value = ''
  return true
}

// Google Sign-in (Direct - no modal)
async function signInWithGoogle() {
  isGoogleLoading.value = true
  error.value = null

  try {
    const result = await signIn('google', { redirect: false })
    
    // Wait for session to establish
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Fetch user data
    await auth.fetchUser?.()
    const user = auth.user

    if (user) {
      // After Google sign-in, redirect to onboarding to select role
      setTimeout(() => router.push('/onboarding/new-user'), 800)
    } else {
      error.value = 'Failed to establish session. Please try again.'
    }
  } catch (err) {
    console.error('Google sign-in error:', err)
    error.value = err?.message || 'Google sign-in failed. Please try again.'
  } finally {
    isGoogleLoading.value = false
  }
}

// Email/Password Registration
async function submit() {
  if (!validateForm()) return

  isLoading.value = true
  error.value = null

  try {
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      password_confirmation: form.confirmPassword,
      referral_code: referralCode.value,
      role: 'quiz-master',
    }

    const res = await auth.register(payload)
    if (res.error) throw new Error(res.error)

    // After registration with role set, redirect to complete profile (skip role selection)
    setTimeout(() => router.push('/onboarding'), 800)
  } catch (e) {
    try {
      for (const k in fieldErrors) delete fieldErrors[k]
      if (e && e.fields) {
        const fields = e.fields
        for (const [key, val] of Object.entries(fields)) {
          fieldErrors[key] = Array.isArray(val) ? val.join(' ') : val
        }
        validationError.value = e.message || 'Please fix the highlighted errors.'
      } else {
        error.value = e.message || 'Registration failed.'
      }
    } catch (err) {
      error.value = e.message || 'Registration failed.'
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (route.query.ref) referralCode.value = route.query.ref
})
</script>

<style scoped>
.animate-fade-in-right {
  animation: fadeInRight 0.3s ease-out forwards;
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
