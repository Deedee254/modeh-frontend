<template>
  <div class="h-screen w-full flex overflow-hidden">
    <!-- Left Side: Features Panel (Hidden on mobile) -->
    <div class="hidden lg:block lg:w-1/2 h-full">
      <AuthFeaturesPanel />
    </div>

    <!-- Right Side: Registration Wizard -->
    <div class="w-full lg:w-1/2 h-full overflow-y-auto bg-gray-50 flex flex-col">
      <div class="min-h-full py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div class="w-full max-w-xl">
           <!-- Mobile Header -->
          <div class="lg:hidden text-center mb-6">
            <NuxtLink to="/">
              <img class="mx-auto h-10 w-auto" src="/logo/modeh-logo.png" alt="Modeh" />
            </NuxtLink>
           </div>
          
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold tracking-tight text-gray-900">Create an account</h2>
            <p class="mt-2 text-sm text-gray-600">
              Already have an account? <NuxtLink to="/login" class="font-medium text-brand-600 hover:text-brand-500">Log in</NuxtLink>
            </p>
          </div>

          <!-- Wizard Progress -->
          <div class="mb-8" v-if="!showSignedInModal">
             <div class="flex items-center justify-between relative">
                <div class="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                <!-- Step 1 -->
                <div class="flex flex-col items-center bg-gray-50 px-2 cursor-pointer" @click="canGoToStep(1) && (step = 1)">
                   <div :class="`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${step >= 1 ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`">1</div>
                   <span class="text-xs font-medium mt-1" :class="step >= 1 ? 'text-brand-600' : 'text-gray-400'">Role</span>
                </div>
                <!-- Step 2 -->
                <div class="flex flex-col items-center bg-gray-50 px-2 cursor-pointer" @click="canGoToStep(2) && (step = 2)">
                   <div :class="`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${step >= 2 ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`">2</div>
                   <span class="text-xs font-medium mt-1" :class="step >= 2 ? 'text-brand-600' : 'text-gray-400'">Account</span>
                </div>
                <!-- Step 3 -->
                <div class="flex flex-col items-center bg-gray-50 px-2 cursor-pointer" @click="canGoToStep(3) && (step = 3)">
                   <div :class="`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${step >= 3 ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`">3</div>
                   <span class="text-xs font-medium mt-1" :class="step >= 3 ? 'text-brand-600' : 'text-gray-400'">Details</span>
                </div>
             </div>
          </div>

          <div class="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-gray-100 relative min-h-[400px]">
            <!-- Referral banner -->
            <div v-if="referralCode" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
              <Icon name="heroicons:information-circle" class="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p class="text-sm text-blue-900">
                <span class="font-semibold">You're joining via a referral link!</span>
              </p>
            </div>

            <form @submit.prevent="submit">
                <!-- STEP 1: Role Selection -->
                <div v-if="step === 1" class="animate-fade-in-right">
                  <h3 class="text-xl font-bold text-gray-900 mb-6">Who are you?</h3>
                  <div class="grid grid-cols-1 gap-4">
                    <button type="button" 
                      @click="selectRole('quizee')" 
                      :class="['p-4 rounded-xl border-2 text-left transition-all hover:shadow-md group flex items-start gap-4', role === 'quizee' ? 'border-brand-600 bg-brand-50/50' : 'border-gray-200 hover:border-brand-300']"
                    >
                       <div class="p-3 bg-white rounded-lg shadow-sm group-hover:bg-brand-50 transition-colors">
                          <Icon name="heroicons:academic-cap" class="w-8 h-8 text-brand-600" />
                       </div>
                       <div>
                          <span class="block font-bold text-gray-900">Learner / Student</span>
                          <span class="text-sm text-gray-500">I want to take quizzes, join battles, and track my progress.</span>
                       </div>
                    </button>
                    
                    <button type="button" 
                      @click="selectRole('quiz-master')" 
                      :class="['p-4 rounded-xl border-2 text-left transition-all hover:shadow-md group flex items-start gap-4', role === 'quiz-master' ? 'border-brand-600 bg-brand-50/50' : 'border-gray-200 hover:border-brand-300']"
                    >
                       <div class="p-3 bg-white rounded-lg shadow-sm group-hover:bg-brand-50 transition-colors">
                          <Icon name="heroicons:pencil-square" class="w-8 h-8 text-brand-600" />
                       </div>
                       <div>
                          <span class="block font-bold text-gray-900">Educator / Quiz Master</span>
                          <span class="text-sm text-gray-500">I want to create quizzes, host tournaments, and manage students.</span>
                       </div>
                    </button>
                    
                    <button type="button" 
                      @click="selectRole('institution-manager')" 
                      :class="['p-4 rounded-xl border-2 text-left transition-all hover:shadow-md group flex items-start gap-4', role === 'institution-manager' ? 'border-brand-600 bg-brand-50/50' : 'border-gray-200 hover:border-brand-300']"
                    >
                       <div class="p-3 bg-white rounded-lg shadow-sm group-hover:bg-brand-50 transition-colors">
                          <Icon name="heroicons:building-library" class="w-8 h-8 text-brand-600" />
                       </div>
                       <div>
                          <span class="block font-bold text-gray-900">Institution Manager</span>
                          <span class="text-sm text-gray-500">I represent a school or organization and want to manage members.</span>
                       </div>
                    </button>
                  </div>
                  <p v-if="validationError" class="mt-4 text-sm text-red-600 text-center">{{ validationError }}</p>
                </div>

                <!-- STEP 2: Account Details -->
                <div v-else-if="step === 2" class="animate-fade-in-right space-y-4">
                   <h3 class="text-xl font-bold text-gray-900 mb-6">Create your login</h3>
                   
                   <!-- Google Sign-up Option -->
                   <div class="space-y-3">
                     <button
                       type="button"
                       @click="signUpWithGoogle"
                       :disabled="isGoogleLoading"
                       class="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-75 flex items-center justify-center gap-2 transition-colors"
                     >
                       <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#1F2937" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                       <span>{{ isGoogleLoading ? 'Signing up...' : 'Continue with Google' }}</span>
                     </button>
                   </div>

                   <!-- Divider -->
                   <div class="relative">
                     <div class="absolute inset-0 flex items-center">
                       <div class="w-full border-t border-gray-300"></div>
                     </div>
                     <div class="relative flex justify-center text-sm">
                       <span class="px-2 bg-white text-gray-500">Or continue with email</span>
                     </div>
                   </div>
                   
                   <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Full Name <span class="text-red-500">*</span></label>
                    <input v-model="form.name" type="text" class="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:ring-brand-500 focus:border-brand-500" placeholder="John Doe" />
                    <p v-if="fieldErrors.name" class="mt-1 text-sm text-red-600">{{ fieldErrors.name }}</p>
                   </div>

                   <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
                    <input v-model="form.email" type="email" class="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:ring-brand-500 focus:border-brand-500" placeholder="john@example.com" />
                    <p v-if="fieldErrors.email" class="mt-1 text-sm text-red-600">{{ fieldErrors.email }}</p>
                   </div>

                   <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input v-model="form.phone" type="tel" class="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:ring-brand-500 focus:border-brand-500" placeholder="+1234567890" />
                   </div>

                   <!-- Password fields -->
                   <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Password <span class="text-red-500">*</span></label>
                        <div class="relative">
                           <input v-model="form.password" :type="showPassword ? 'text' : 'password'" class="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 pr-10 focus:ring-brand-500 focus:border-brand-500" />
                           <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600">
                             <Icon :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" class="w-5 h-5" />
                           </button>
                        </div>
                        <p v-if="fieldErrors.password" class="mt-1 text-sm text-red-600">{{ fieldErrors.password }}</p>
                     </div>
                     <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Confirm <span class="text-red-500">*</span></label>
                        <div class="relative">
                           <input v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" class="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 pr-10 focus:ring-brand-500 focus:border-brand-500" />
                           <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600">
                             <Icon :name="showConfirmPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" class="w-5 h-5" />
                           </button>
                        </div>
                        <p v-if="fieldErrors.confirmPassword" class="mt-1 text-sm text-red-600">{{ fieldErrors.confirmPassword }}</p>
                     </div>
                   </div>
                   <p v-if="validationError" class="mt-2 text-sm text-red-600">{{ validationError }}</p>
                </div>

                <!-- STEP 3: Check & Finish -->
                <div v-else-if="step === 3" class="animate-fade-in-right space-y-5">
                   <h3 class="text-xl font-bold text-gray-900 mb-6">Complete your profile</h3>
                   
                   <!-- Quizee Specific -->
                   <template v-if="role === 'quizee'">
                      <div class="bg-brand-50/50 p-5 rounded-xl border border-brand-100">
                        <label class="block text-sm font-bold text-gray-900 mb-3">Education Journey <span class="text-red-600">*</span></label>
                        <TaxonomyFlowPicker
                          v-model="taxonomySelection"
                          :includeTopics="false"
                          :multiSelectSubjects="true"
                          @submit="onTaxonomyComplete"
                        />
                         <p v-if="fieldErrors.level_id || fieldErrors.grade_id || fieldErrors.subjects" class="mt-1 text-sm text-red-600">Please complete the selection above.</p>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">School / Institution</label>
                        <input v-model="form.institution" type="text" class="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:ring-brand-500 focus:border-brand-500" placeholder="Optional" />
                      </div>

                      <!-- Parent email removed to shorten registration flow -->
                   </template>

                   <!-- Quiz Master Specific -->
                   <template v-else-if="role === 'quiz-master'">
                      <div class="bg-brand-50/50 p-5 rounded-xl border border-brand-100">
                        <label class="block text-sm font-bold text-gray-900 mb-3">Areas of Expertise <span class="text-red-600">*</span></label>
                        <TaxonomyFlowPicker
                          v-model="taxonomySelection"
                          :includeTopics="false"
                          :multiSelectSubjects="true"
                          @submit="onTaxonomyComplete"
                        />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                        <input v-model="form.institution" type="text" class="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:ring-brand-500 focus:border-brand-500" />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea v-model="form.bio" rows="3" class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500"></textarea>
                      </div>
                   </template>

                   <!-- Institution Manager Specific -->
                   <template v-else-if="role === 'institution-manager'">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Select Institution</label>
                        <select v-model="form.institution_id" class="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:ring-brand-500 focus:border-brand-500">
                          <option value="">Create new later...</option>
                          <option v-for="inst in institutions" :key="inst.id" :value="inst.id">{{ inst.name }}</option>
                        </select>
                      </div>
                   </template>
                   
                   <p v-if="error" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{{ error }}</p>
                </div>

                <!-- Footer Navigation Buttons -->
                <div class="mt-8 flex justify-between items-center gap-4 pt-4 border-t border-gray-100">
                   <button 
                     v-if="step > 1"
                     type="button" 
                     @click="step--"
                     class="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
                   >
                     Back
                   </button>
                   <div v-else></div> <!-- Spacer -->

                   <button 
                     v-if="step < 3"
                     type="button" 
                     @click="nextStep"
                     class="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 shadow-lg shadow-brand-600/20 transition-all hover:-translate-y-0.5"
                   >
                     Next Step
                   </button>
                   <button 
                     v-else
                     type="submit"
                     :disabled="isLoading"
                     class="px-8 py-2.5 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 shadow-lg shadow-brand-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                   >
                     <Icon v-if="isLoading" name="heroicons:arrow-path" class="animate-spin w-5 h-5" />
                     {{ isLoading ? 'Creating Account...' : 'Complete Registration' }}
                   </button>
                </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['guest']
})

import AuthFeaturesPanel from '~/components/Auth/AuthFeaturesPanel.vue'
import TaxonomyFlowPicker from '~/components/taxonomy/TaxonomyFlowPicker.vue'
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'

const router = useRouter()
const auth = useAuthStore()
const api = useApi()
// Auth helper (signIn) provided by nuxt-auth / sidebase auto-import
const { signIn } = useAuth()

// Logic State
const step = ref(1)
const role = ref(null)
const isLoading = ref(false)
const isGoogleLoading = ref(false)
const error = ref(null)
const referralCode = ref(null)

// Form Data
const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  institution: '',
  bio: '',
  // parentEmail removed to shorten registration
  institution_id: '',
})

// Validation State
const fieldErrors = reactive({})
const validationError = ref('')
const taxonomySelection = ref({})

// --- Step 1: Role ---
function selectRole(r) {
  role.value = r
  validationError.value = ''
  // Auto advance if clicking a role
  setTimeout(() => nextStep(), 200)
}

// --- Step 2: Account ---
// --- Step 3: Details ---

function validateStep1() {
  if (!role.value) {
    validationError.value = "Please select a role to continue."
    return false
  }
  return true
}

function validateStep2() {
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

function validateStep3() {
   // Validate taxonomy for quizee/master
   if (role.value === 'quizee' || role.value === 'quiz-master') {
    // Expect the TaxonomyFlowPicker selection object with nested objects
    // (level, grade, subject). Use those nested ids directly.
    const sel = taxonomySelection.value || {}
    const levelId = sel.level?.id ?? null
    const gradeId = sel.grade?.id ?? null
    if (!levelId) {
      error.value = "Please select your education level."
      return false
    }
    if (role.value === 'quizee' && !gradeId) {
      error.value = "Please select your grade."
      return false
    }
   }
   return true
}

function nextStep() {
  if (step.value === 1 && validateStep1()) step.value = 2
  else if (step.value === 2 && validateStep2()) step.value = 3
}

async function signUpWithGoogle() {
  if (isGoogleLoading.value) return
  isGoogleLoading.value = true
  error.value = null

  try {
    // Store selected role before OAuth flow
    if (!role.value) {
      error.value = 'Please select a role first'
      isGoogleLoading.value = false
      return
    }

    // Use NextAuth.js signIn with Google
    await signIn('google', { redirect: false })

    // Wait for session to be established
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Fetch user data from auth store
    const authStore = useAuthStore()
    await authStore.fetchUser?.()
    const user = authStore.user

    if (user) {
      // User authenticated successfully via Google
      // If they don't have a role yet (first-time Google signup), redirect to role selection
      if (!user.role) {
        // Store the selected role for them
        const res = await api.post('/api/auth/set-role', { role: role.value })
        if (res.ok) {
          // Re-fetch user to get updated role
          await authStore.fetchUser?.()
        }
      }
      
      // Redirect based on role
      goToDashboard()
    } else {
      error.value = 'Failed to establish session after Google sign-up'
    }
  } catch (err) {
    console.error('Google sign-up error:', err)
    error.value = err?.message || 'Google sign-up failed. Please try again.'
  } finally {
    isGoogleLoading.value = false
  }
}

// Allow clicking wizard steps if valid
function canGoToStep(s) {
  if (s === 1) return true
  if (s === 2) return validateStep1()
  if (s === 3) return validateStep1() && validateStep2()
  return false
}

// --- Submission ---
async function submit() {
  if (!validateStep3()) return
  
  isLoading.value = true
  error.value = null
  
  try {
     const payload = { ...form, role: role.value, referral_code: referralCode.value }
     // Laravel expects password_confirmation for validation; convert confirmPassword -> password_confirmation
     if (payload.confirmPassword !== undefined) {
       payload.password_confirmation = payload.confirmPassword
       // keep confirmPassword for local usage but remove to avoid unexpected backend fields
       delete payload.confirmPassword
     }
     
     // Merge taxonomy
     if (taxonomySelection.value) {
        const sel = taxonomySelection.value
        if (sel.level && sel.level.id) payload.level_id = sel.level.id
        if (sel.grade && sel.grade.id) payload.grade_id = sel.grade.id
        // sub-grade naming varies; check common keys on the grade object
        if (sel.grade && (sel.grade.sub_grade_id || sel.grade.subGradeId || sel.grade.sub_grade)) {
          payload.sub_grade_id = sel.grade.sub_grade_id ?? sel.grade.subGradeId ?? sel.grade.sub_grade
        }
        if (sel.subject) {
          if (Array.isArray(sel.subject)) payload.subjects = sel.subject.map(s => s.id)
          else if (sel.subject.id) payload.subjects = [sel.subject.id]
        }
     }

     const res = await auth.register(payload)
     if (res.error) throw new Error(res.error)
     
     // Success - redirect handled by auth store or we force it:
     if (auth.user) goToDashboard()
     else router.push('/login?registered=true')
  } catch (e) {
     // If the auth store attached structured validation errors, map them into
     // the reactive `fieldErrors` object so the form shows per-field messages.
      try {
        // Clear previous field errors
        for (const k in fieldErrors) delete fieldErrors[k]
        if (e && e.fields) {
          const fields = e.fields
          for (const [key, val] of Object.entries(fields)) {
            // Join array messages into a single string
            fieldErrors[key] = Array.isArray(val) ? val.join(' ') : val
          }
          // Also expose a general validation message
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

// --- Utils ---
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const institutions = ref([])

function onTaxonomyComplete(data) {
  taxonomySelection.value = data
}

function goToDashboard() {
  const r = auth.user?.role
  if (r === 'quiz-master') router.push('/quiz-master/dashboard')
  else if (r === 'quizee') router.push('/quizee/dashboard')
  else if (r === 'institution-manager') router.push('/institution-manager/dashboard')
  else router.push('/')
}

onMounted(async () => {
   // Check referral
   const route = useRoute()
   if (route.query.ref) referralCode.value = route.query.ref
   if (route.query.role) role.value = route.query.role
   
   // Load institutions
   try {
     const res = await api.get('/api/institutions')
     if (res.ok) {
       const data = await res.json()
       institutions.value = data.institutions || data
     }
   } catch (e) {}
})
</script>

<style scoped>
.animate-fade-in-right {
  animation: fadeInRight 0.3s ease-out forwards;
}
@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
