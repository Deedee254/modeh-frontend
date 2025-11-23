<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-2xl">
      <!-- Header/Branding -->
      <div class="text-center mb-8">
        <img class="mx-auto h-16 w-auto" src="/logo/modeh-logo.png" alt="Modeh" />
        <h2 class="mt-6 text-3xl font-bold tracking-tight text-gray-900">Create Your Account</h2>
        <p class="mt-2 text-lg text-gray-600">Join Modeh to practice, compete, and improve</p>
        <p class="mt-2 text-sm text-gray-500">Already have an account? <NuxtLink to="/login" class="text-blue-600">Login</NuxtLink></p>
      </div>

      <UModal v-model="showSignedInModal">
        <template #default>
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-900">You're already signed in</h3>
            <p class="mt-2 text-sm text-slate-600">You are signed in as <strong>{{ auth.user?.name || auth.user?.email || 'User' }}</strong> ({{ auth.user?.role || 'user' }}).</p>
            <div class="mt-4 flex flex-col sm:flex-row gap-3">
              <button @click="goToDashboard" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Go to dashboard</button>
              <button @click="handleLogout" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Log out</button>
            </div>
          </div>
        </template>
      </UModal>

      <!-- Role Selection -->
      <div class="mb-8">
        <div class="flex justify-center space-x-4">
          <button 
            @click="role = 'quizee'" 
            :class="[
              'px-6 py-3 text-sm font-medium rounded-lg flex items-center justify-center',
              role === 'quizee' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-200'
            ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
            I am a quizee
          </button>
          <button 
            @click="role = 'quiz-master'" 
            :class="[
              'px-6 py-3 text-sm font-medium rounded-lg flex items-center justify-center',
              role === 'quiz-master' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-200'
            ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
            </svg>
            I am a quiz-master
          </button>
          <button
            @click="role = 'institution-manager'"
            :class="[
              'px-6 py-3 text-sm font-medium rounded-lg flex items-center justify-center',
              role === 'institution-manager'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-200'
            ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
              <path d="M6 20v-1a4 4 0 014-4h4a4 4 0 014 4v1" />
            </svg>
            I manage an institution
          </button>
        </div>
      </div>

          <!-- Registration Form -->
      <div class="bg-white py-8 px-10 shadow rounded-lg">
        <form @submit.prevent="submit" class="space-y-6">
          <!-- quizee Form -->
          <template v-if="role === 'quizee'">
            <div class="grid grid-cols-1 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700">Full Name</label>
                <input v-model="form.name" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                <p v-if="fieldErrors.name" class="mt-1 text-sm text-red-600">{{ fieldErrors.name }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Institution / School</label>
                <input v-model="form.institution" type="text" placeholder="Optional - enter your school name" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <p v-if="fieldErrors.institution" class="mt-1 text-sm text-red-600">{{ fieldErrors.institution }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Education Level <span class="text-red-600">*</span></label>
                <TaxonomyPicker
                  resource="levels"
                  v-model="form.level_id"
                  title="Level"
                  subtitle="Select education level"
                  compact
                />
                <p v-if="fieldErrors.level_id" class="mt-1 text-sm text-red-600">{{ fieldErrors.level_id }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Class / Grade <span class="text-red-600">*</span></label>
                <TaxonomyPicker
                  resource="grades"
                  :level-id="form.level_id"
                  v-model="form.grade_id"
                  title="Grade / Course"
                  subtitle="Select class, course or grade"
                  compact
                />
                <p v-if="fieldErrors.grade_id" class="mt-1 text-sm text-red-600">{{ fieldErrors.grade_id }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Subjects <span class="text-red-600">*</span></label>
                <MultiTaxonomyPicker
                  resource="subjects"
                  :grade-id="form.grade_id"
                  compact
                  v-model="form.subjects"
                  title="Subjects"
                  subtitle="Pick subjects"
                />
                <p class="mt-1 text-xs text-gray-500">Select at least one subject relevant to your grade/course.</p>
                <p v-if="fieldErrors.subjects" class="mt-1 text-sm text-red-600">{{ fieldErrors.subjects }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input v-model="form.email" type="email" autocomplete="email" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                <p v-if="fieldErrors.email" class="mt-1 text-sm text-red-600">{{ fieldErrors.email }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Phone Number</label>
                <input v-model="form.phone" type="tel" placeholder="Optional" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <p v-if="fieldErrors.phone" class="mt-1 text-sm text-red-600">{{ fieldErrors.phone }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Short Bio</label>
                <textarea v-model="form.bio" rows="3" placeholder="Optional - a short bio" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                <p v-if="fieldErrors.bio" class="mt-1 text-sm text-red-600">{{ fieldErrors.bio }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Parent/Guardian Email</label>
                <input v-model="form.parentEmail" type="email" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Optional but recommended for minors" />
                <p v-if="fieldErrors.parentEmail" class="mt-1 text-sm text-red-600">{{ fieldErrors.parentEmail }}</p>
              </div>
            </div>
          </template>

          <!-- quiz-master Form -->
          <template v-else-if="role === 'quiz-master'">
            <div class="grid grid-cols-1 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700">Full Name</label>
                <input v-model="form.name" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Institution</label>
                <input v-model="form.institution" type="text" placeholder="Optional - enter your school name" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Education Level <span class="text-red-600">*</span></label>
                <TaxonomyPicker
                  resource="levels"
                  v-model="form.level_id"
                  title="Level"
                  subtitle="Select education level"
                  compact
                />
                <p v-if="fieldErrors.level_id" class="mt-1 text-sm text-red-600">{{ fieldErrors.level_id }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Class / Grade (Optional)</label>
                <TaxonomyPicker
                  resource="grades"
                  :level-id="form.level_id"
                  v-model="form.grade_id"
                  title="Grade / Course"
                  subtitle="Select class, course or grade"
                  compact
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Subject Specializations <span class="text-red-600">*</span></label>
                <MultiTaxonomyPicker
                  resource="subjects"
                  :grade-id="form.grade_id"
                  compact
                  v-model="form.subjects"
                  title="Subjects"
                  subtitle="Pick subjects"
                />
                <p class="mt-1 text-xs text-gray-500">Select at least one subject you teach or specialize in.</p>
                <p v-if="fieldErrors.subjects" class="mt-1 text-sm text-red-600">{{ fieldErrors.subjects }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input v-model="form.email" type="email" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                <p v-if="fieldErrors.email" class="mt-1 text-sm text-red-600">{{ fieldErrors.email }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Phone Number</label>
                <input v-model="form.phone" type="tel" placeholder="Optional" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <p v-if="fieldErrors.phone" class="mt-1 text-sm text-red-600">{{ fieldErrors.phone }}</p>
              </div>
            </div>
          </template>

          <!-- institution-manager Form -->
          <template v-else-if="role === 'institution-manager'">
            <div class="grid grid-cols-1 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700">Full Name</label>
                <input v-model="form.name" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Institution</label>
                <p class="text-xs text-gray-600 mb-2">Select an existing institution or skip to create one later</p>
                <select v-model="form.institution_id" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" :disabled="loadingInstitutions">
                  <option value="">{{ loadingInstitutions ? 'Loading institutions...' : 'Select an institution (optional)' }}</option>
                  <option v-for="inst in institutions" :key="inst.id" :value="inst.id">
                    {{ inst.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input v-model="form.email" type="email" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                <p v-if="fieldErrors.email" class="mt-1 text-sm text-red-600">{{ fieldErrors.email }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Phone Number</label>
                <input v-model="form.phone" type="tel" placeholder="Optional" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <p v-if="fieldErrors.phone" class="mt-1 text-sm text-red-600">{{ fieldErrors.phone }}</p>
              </div>
            </div>
          </template>

          <!-- Common Fields (Password) -->
          <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Password</label>
                <div class="relative">
                <input 
                  v-model="form.password" 
                  :type="showPassword ? 'text' : 'password'" 
                  autocomplete="new-password"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  required 
                />
                <button 
                  type="button"
                  @click="showPassword = !showPassword" 
                  class="absolute inset-y-0 right-0 mt-1 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                >
                  <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
                <p v-if="fieldErrors.password" class="mt-1 text-sm text-red-600">{{ fieldErrors.password }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div class="relative">
                <input 
                  v-model="form.confirmPassword" 
                  :type="showConfirmPassword ? 'text' : 'password'" 
                  autocomplete="new-password"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  required 
                />
                <button 
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword" 
                  class="absolute inset-y-0 right-0 mt-1 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                >
                  <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
                <p v-if="fieldErrors.confirmPassword" class="mt-1 text-sm text-red-600">{{ fieldErrors.confirmPassword }}</p>
            </div>
          </div>

          <div>
            <button 
              type="submit" 
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
              :disabled="isLoading"
            >
              <svg 
                v-if="isLoading" 
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Creating Account...' : 'Create Account' }}
            </button>
          </div>

          <div v-if="error" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
// SEO meta for Register page
definePageMeta({
  title: 'Register — Modeh',
  meta: [
    { name: 'description', content: 'Create a Modeh account to start practicing quizzes, track progress, and join tournaments. Choose to register as a quizee or quiz-master.' },
    { property: 'og:title', content: 'Register — Modeh' },
    { property: 'og:description', content: 'Create a Modeh account to start practicing quizzes, track progress, and join tournaments. Choose to register as a quizee or quiz-master.' }
  ]
})

import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRuntimeConfig } from '#app'
import { useAuthStore } from '../stores/auth'
import useApi from '~/composables/useApi'
import useTaxonomy from '~/composables/useTaxonomy'
import MultiTaxonomyPicker from '~/components/taxonomy/MultiTaxonomyPicker.vue'
import TaxonomyPicker from '~/components/taxonomy/TaxonomyPicker.vue'


const router = useRouter()
const auth = useAuthStore()

// modal for already-signed-in users
const showSignedInModal = ref(Boolean(auth.user))
watch(() => auth.user, (val) => { showSignedInModal.value = Boolean(val) })

function goToDashboard() {
  const r = auth.user?.role
  if (r === 'quiz-master') router.push('/quiz-master/dashboard')
  else if (r === 'quizee') router.push('/quizee/dashboard')
  else if (r === 'institution-manager') router.push('/institution-manager/dashboard')
  else if (r === 'admin') window.location.href = `${useRuntimeConfig().public.apiBase}/admin`
  else router.push('/')
}

async function handleLogout() {
  try { await auth.logout() } catch (e) {}
  showSignedInModal.value = false
  router.push('/')
}

// Form state
const role = ref('quizee')
const isLoading = ref(false)
const error = ref(null)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Institutions for manager dropdown
const institutions = ref([])
const loadingInstitutions = ref(false)

const form = reactive({
  name: '',
  institution: '',
  institution_id: '',
  grade_id: '',
  level_id: '',
  email: '',
  parentEmail: '',
  phone: '',
  bio: '',
  subjects: [],
  password: '',
  confirmPassword: ''
})

// field-level errors from server-side validation
const fieldErrors = reactive({
  name: '',
  institution: '',
  email: '',
  parentEmail: '',
  phone: '',
  bio: '',
  password: '',
  confirmPassword: ''
})

// Preselect role from query if provided
  if (process.client) {
  const qRole = new URLSearchParams(window.location.search).get('role')
  if (qRole === 'quiz-master' || qRole === 'quizee' || qRole === 'institution-manager') {
    role.value = qRole
  }
}

const validateForm = () => {
  // Required fields for all roles
  const requiredFields = ['name', 'email', 'password', 'confirmPassword']
  
  // Taxonomy is required for Quizee and Quiz Master
  if (role.value === 'quizee') {
    requiredFields.push('level_id', 'grade_id', 'subjects')
  } else if (role.value === 'quiz-master') {
    requiredFields.push('level_id', 'subjects')
  }

  for (const field of requiredFields) {
    if (Array.isArray(form[field])) {
      if (form[field].length === 0) {
        error.value = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`
        return false
      }
    } else if (!form[field]?.trim() && form[field] !== '') {
      error.value = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`
      return false
    }
  }

  // Password match validation
  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match'
    return false
  }

  // Password strength validation
  if (form.password.length < 6) {
    error.value = 'Password must be at least 6 characters long'
    return false
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    error.value = 'Please enter a valid email address'
    return false
  }

  if (form.parentEmail && !emailRegex.test(form.parentEmail)) {
    error.value = 'Please enter a valid parent/guardian email address'
    return false
  }

  // Phone number validation - optional but validate if provided
  if (form.phone) {
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/
    if (!phoneRegex.test(form.phone)) {
      error.value = 'Please enter a valid phone number'
      return false
    }
  }

  return true
}

// taxonomy: load levels for education level select
const { levels, fetchLevels, loadingLevels } = useTaxonomy()

// Fetch institutions for institution manager registration
const fetchInstitutions = async () => {
  try {
    loadingInstitutions.value = true
    const api = useApi()
    const response = await api.get('/api/institutions')
    if (api.handleAuthStatus(response)) return
    const data = await response.json().catch(() => null)
    if (response.ok && Array.isArray(data)) {
      institutions.value = data
    }
  } catch (e) {
    console.error('Failed to load institutions:', e)
  } finally {
    loadingInstitutions.value = false
  }
}

onMounted(async () => {
  try { await fetchLevels() } catch (e) {}
  try { await fetchInstitutions() } catch (e) {}
})

async function submit() {
  if (isLoading.value) return
  // reset errors
  error.value = null
  for (const k in fieldErrors) fieldErrors[k] = ''

  if (!validateForm()) return

  isLoading.value = true

  try {
  const api = useApi()
  // Backend exposes role-specific registration endpoints. Choose the correct one based on selected role.
  let endpoint = '/api/register/quiz-master'
  if (role.value === 'quizee') endpoint = '/api/register/quizee'
  if (role.value === 'institution-manager') endpoint = '/api/register/institution-manager'
    
    // Build payload - include common fields and role-specific fields
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
      }
    
    // Add optional institution field
    if (form.institution) payload.institution = form.institution
    
    // Add phone if provided
    if (form.phone) payload.phone = form.phone
  // Add bio if provided
  if (form.bio) payload.bio = form.bio
    
    // Add taxonomy fields for Quizee and Quiz Master
    if (role.value === 'quizee') {
      payload.level_id = form.level_id
      payload.grade_id = form.grade_id
      payload.subjects = form.subjects
      if (form.parentEmail) payload.parentEmail = form.parentEmail
    } else if (role.value === 'quiz-master') {
      payload.level_id = form.level_id
      if (form.grade_id) payload.grade_id = form.grade_id
      payload.subjects = form.subjects
    } else if (role.value === 'institution-manager') {
      // Send institution_id if selected
      if (form.institution_id) payload.institution_id = form.institution_id
    }

    const response = await api.postJson(endpoint, payload)
    if (api.handleAuthStatus(response)) return
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      // Map validation errors to fields if present
      if (data?.errors) {
        for (const key of Object.keys(data.errors)) {
          const v = data.errors[key]
          const msg = Array.isArray(v) ? v[0] : v
          if (key in fieldErrors) {
            fieldErrors[key] = msg
          } else if (key === 'institution' && 'institution' in fieldErrors) {
            fieldErrors['institution'] = msg
          } else {
            // fallback to top-level error
            error.value = msg
          }
        }
      } else {
        error.value = data?.message || 'Registration failed. Please try again.'
      }
      isLoading.value = false
      return
    }
    const body = data
    // Attempt to log the user in to establish a session cookie for subsequent authenticated requests.
    try {
      await auth.login(form.email, form.password)
    } catch (loginErr) {
      // If auto-login fails, fall back to setting the user object returned by registration
      // Merge any returned profile objects into the user payload so UI has the profile data
      const returnedUser = body.user || body || {}
      if (body.quizee) returnedUser.quizeeProfile = body.quizee
      if (body.quizMaster) returnedUser.quizMasterProfile = body.quizMaster
      // ensure institutions from response are attached when present
      if (body.user && body.user.institutions) returnedUser.institutions = body.user.institutions
      auth.setUser(returnedUser)
    }

    // Redirect based on role
    if (role.value === 'quizee') {
      router.push('/quizee/dashboard')
    } else if (role.value === 'quiz-master') {
      router.push('/quiz-master/dashboard')
    } else if (role.value === 'institution-manager') {
      // after institution-manager registration, go to institution-manager dashboard
      router.push('/institution-manager/dashboard')
    }
  } catch (e) {
    // Fallback error handling
    const data = e?.data || e?.response || null
    if (data?.errors) {
      for (const key of Object.keys(data.errors)) {
        const v = data.errors[key]
        const msg = Array.isArray(v) ? v[0] : v
        if (key in fieldErrors) fieldErrors[key] = msg
        else error.value = msg
      }
    } else {
      error.value = data?.message || 'Registration failed. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>
