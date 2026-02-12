<template>
  <div class="space-y-6 max-w-6xl">
    <!-- Profile Header Card -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 sm:p-8">
      <!-- Avatar and Basic Info -->
      <div class="flex flex-col sm:flex-row gap-6 sm:items-start">
        <!-- Avatar Circle -->
        <div class="flex-shrink-0">
          <div class="relative">
            <!-- Avatar Circle -->
            <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-brand-200 dark:border-brand-800 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 shadow-lg">
              <img 
                v-if="avatarPreview" 
                :src="avatarPreview" 
                :alt="user?.name || 'Avatar'" 
                class="w-full h-full object-cover"
              />
              <svg v-else class="w-16 h-16 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <!-- Edit Button -->
            <button 
              type="button" 
              @click="triggerAvatarUpload" 
              :disabled="isUploadingAvatar"
              title="Change avatar" 
              class="absolute bottom-0 right-0 bg-brand-600 hover:bg-brand-700 text-white rounded-full p-2 shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="!isUploadingAvatar" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M17.414 2.586a2 2 0 010 2.828l-9.193 9.193a1 1 0 01-.464.263l-4 1a1 1 0 01-1.213-1.213l1-4a1 1 0 01.263-.464l9.193-9.193a2 2 0 012.828 0zM15.121 4.05l-1.172-1.172-8.486 8.486-0.588 2.353 2.353-0.588 8.486-8.486L15.12 4.05z" />
              </svg>
              <svg v-else class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            </button>
            <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="onAvatarFileSelected" aria-hidden="true" />
          </div>
        </div>

        <!-- User Info -->
        <div class="flex-1">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">{{ user?.name }}</h2>
          <p v-if="currentProfile?.headline" class="text-gray-600 dark:text-gray-400 mt-1">{{ currentProfile.headline }}</p>
          <div v-if="isQuizMaster || isQuizee" class="flex items-center gap-2 mt-3">
            <VerifiedBadge v-if="currentProfile?.is_verified" />
          </div>
        </div>
      </div>
    </div>

    <!-- Account Settings Card -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 sm:p-8">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Account Settings</h3>
      <div class="space-y-6">
        <!-- Profile Fields Grid -->
        <div class="space-y-6">
          <!-- Display Name - For all users -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Display Name</label>
            <input 
              v-model="form.display_name" 
              type="text" 
              placeholder="Your display name"
              class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">This is the name shown on your profile</p>
          </div>

          <!-- Name Fields - For Quizee and Quiz-Master -->
          <div v-if="isQuizee || isQuizMaster" class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">First Name</label>
              <input 
                v-model="form.first_name" 
                type="text" 
                placeholder="Your first name"
                class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Last Name</label>
              <input 
                v-model="form.last_name" 
                type="text" 
                placeholder="Your last name"
                class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Phone and Email -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Phone Number</label>
              <input 
                v-model="form.phone" 
                type="tel" 
                placeholder="+1000-000"
                class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Email Address</label>
              <input 
                type="email" 
                :value="user?.email"
                disabled
                class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 cursor-not-allowed opacity-75"
              />
            </div>
          </div>

          <!-- Headline - For QuizMaster only -->
          <div v-if="isQuizMaster">
            <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Headline</label>
            <input 
              v-model="form.headline" 
              type="text" 
              placeholder="Your professional headline"
              class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <!-- Bio -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Bio</label>
            <textarea 
              v-model="form.bio" 
              rows="4" 
              placeholder="Tell us about yourself..."
              class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
            ></textarea>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Maximum 500 characters</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Areas of Interest Card -->
    <div v-if="isQuizMaster || isQuizee" class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 sm:p-8">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Areas of Interest</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Select your areas of expertise</p>

      <!-- Display Current Selections from Profile -->
      <div class="mb-6">
        <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">Your Current Selection</p>
        <div v-if="taxonomySelection && (taxonomySelection.level || taxonomySelection.grade || taxonomySelection.subject)" class="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
          <div v-if="taxonomySelection.level" class="flex items-center gap-2">
            <span class="font-semibold text-slate-900 dark:text-slate-100">Level:</span>
            <span class="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300">
              📚 {{ taxonomySelection.level.name }}
            </span>
          </div>
          <div v-if="taxonomySelection.grade" class="flex items-center gap-2">
            <span class="font-semibold text-slate-900 dark:text-slate-100">Grade:</span>
            <span class="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-sm font-medium text-green-700 dark:text-green-300">
              📖 {{ taxonomySelection.grade.name }}
            </span>
          </div>
          <div v-if="taxonomySelection.subject && (Array.isArray(taxonomySelection.subject) ? taxonomySelection.subject.length > 0 : taxonomySelection.subject)" class="flex items-start gap-2">
            <span class="font-semibold text-slate-900 dark:text-slate-100 pt-1">Subjects:</span>
            <div class="flex flex-wrap gap-2">
              <template v-if="Array.isArray(taxonomySelection.subject)">
                <span v-for="subject in taxonomySelection.subject" :key="subject.id" class="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1 text-sm font-medium text-purple-700 dark:text-purple-300">
                  🎓 {{ subject.name }}
                </span>
              </template>
              <template v-else>
                <span class="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1 text-sm font-medium text-purple-700 dark:text-purple-300">
                  🎓 {{ taxonomySelection.subject.name }}
                </span>
              </template>
            </div>
          </div>
        </div>
        <div v-else class="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-gray-600 dark:text-gray-400">
          No areas of interest selected yet
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex gap-3">
        <button 
          type="button" 
          @click="openTaxonomyModal"
          class="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors"
        >
          Edit
        </button>
      </div>
    </div>

    <!-- Taxonomy Modal -->
    <div v-if="showTaxonomyModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Select Areas of Interest</h3>
          <button 
            type="button" 
            @click="showTaxonomyModal = false"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-6">
          <TaxonomyFlowPicker 
            v-model="tempTaxonomySelection" 
            :includeTopics="false" 
            :multiSelectSubjects="true" 
          />
        </div>
        <div class="border-t border-gray-200 dark:border-slate-700 p-6 flex gap-3 justify-end sticky bottom-0 bg-white dark:bg-slate-800">
          <button 
            type="button" 
            @click="showTaxonomyModal = false"
            class="px-6 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button" 
            @click="confirmTaxonomySelection"
            class="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
    <div v-if="isInstitutionManager">
      <form @submit.prevent="saveInstitution" class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Institution Profile</h3>

        <div class="space-y-6">
          <!-- Basics Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Institution Name</label>
              <input 
                v-model="institutionForm.name" 
                type="text" 
                placeholder="Institution name"
                class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Email</label>
              <input 
                v-model="institutionForm.email" 
                type="email" 
                placeholder="contact@institution.com"
                class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Phone</label>
              <input 
                v-model="institutionForm.phone" 
                type="tel" 
                placeholder="Phone number"
                class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Website</label>
              <input 
                v-model="institutionForm.website" 
                type="url" 
                placeholder="https://example.com"
                class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Address -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Address</label>
            <textarea 
              v-model="institutionForm.address" 
              rows="2" 
              placeholder="Street address, city, state, postal code..."
              class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
            ></textarea>
          </div>

          <!-- Logo -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Logo URL</label>
            <input 
              v-model="institutionForm.logo_url" 
              type="url" 
              placeholder="https://example.com/logo.png"
              class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            <div v-if="institutionForm.logo_url" class="mt-3">
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-2">Logo Preview:</p>
              <img :src="institutionForm.logo_url" alt="Institution logo" class="h-20 w-20 rounded-lg object-cover border border-gray-200 dark:border-slate-700" />
            </div>
          </div>

          <!-- Status Messages -->
          <div v-if="institutionError" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {{ institutionError }}
          </div>
          <div v-if="institutionSuccess" class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm">
            {{ institutionSuccess }}
          </div>

          <!-- Buttons -->
          <div class="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button 
              type="submit" 
              :disabled="institutionLoading" 
              class="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!institutionLoading">Save Institution</span>
              <span v-else>Saving…</span>
            </button>
            <button 
              type="button" 
              @click="resetInstitution"
              class="px-6 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- No manual save button needed - auto-saves as you type -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import type { Ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useUserRole } from '~/composables/useUserRole'
import { useApi } from '~/composables/useApi'
import { useAccountApi } from '~/composables/useAccountApi'
import { useAppAlert } from '~/composables/useAppAlert'
import { resolveAssetUrl, resolveAvatar } from '~/composables/useAssets'
import { useProfileForm } from '~/composables/useProfileForm'
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import TaxonomyFlowPicker from '~/components/taxonomy/TaxonomyFlowPicker.vue'
import VerifiedBadge from '~/components/badge/VerifiedBadge.vue'
import type { User, QuizMasterProfile, QuizeeProfile } from '~/types'

const auth = useAuthStore()
const { isQuizMaster, isInstitutionManager, preferredRole, isQuizee } = useUserRole()
const { createFormState, onFile, saveProfile, avatarPreview, avatarFile } = useProfileForm()
const api = useApi()
const { patchMe } = useAccountApi()
const appAlert = useAppAlert()

const avatarInput = ref<HTMLInputElement | null>(null)

const taxonomyStore = useTaxonomyStore()

// Taxonomy selection state
const taxonomySelection = ref<{ level: any; grade: any; subject: any; topic: any }>({ level: null, grade: null, subject: null, topic: null })
const tempTaxonomySelection = ref<{ level: any; grade: any; subject: any; topic: any }>({ level: null, grade: null, subject: null, topic: null })
const showTaxonomyModal = ref(false)
const isTaxonomyDirty = ref(false)
const isUploadingAvatar = ref(false)

// Make user reactive and form depend on it
const user = computed(() => auth.user as User | null)

// Get the current profile object based on role
const currentProfile = computed(() => {
  const u = user.value as User | null
  return u?.profile as QuizMasterProfile | QuizeeProfile | undefined
})

// Initialize form from user data - will react to user changes
const form = ref(createFormState(user.value))
// Track original form state for change detection
const originalForm = ref(JSON.parse(JSON.stringify(form.value)))

// Watch for form changes and auto-save with debounce
let autoSaveTimeout: NodeJS.Timeout | null = null
watch(
  () => form.value,
  async () => {
    // Clear previous timeout
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout)
    
    // Debounce: wait 1 second after user stops typing before saving
    autoSaveTimeout = setTimeout(async () => {
      if (JSON.stringify(form.value) !== JSON.stringify(originalForm.value)) {
        try {
          await saveProfile(form.value, preferredRole.value)
          originalForm.value = JSON.parse(JSON.stringify(form.value))
        } catch (e) {
          console.error('Auto-save failed:', e)
        }
      }
    }, 1000)
  },
  { deep: true }
)

onMounted(async () => {
  // Fetch fresh user data first to ensure we have latest taxonomy from database
  try {
    await auth.fetchUser()
  } catch (e) {
    // Silently handle fetch errors
  }
  
  // Wait a tick to ensure auth.user is updated
  await nextTick()
  
  // Initialize form from fresh user data
  form.value = createFormState(user.value)
  originalForm.value = JSON.parse(JSON.stringify(form.value))
  
  // Load avatar preview if not already set
  if (!avatarFile.value) {
    const u = user.value as User | null
    avatarPreview.value = resolveAvatar(auth.userAvatar || u?.avatar || u?.avatar_url, u?.name)
  }
  
  // Taxonomy is loaded globally on app init - no need to update refs
  
  // Initialize taxonomy selections with fresh data
  await initializeTaxonomySelection()
})

// Keep avatar preview updated when user data changes (so current avatar shows before editing)
watch(user, (u) => {
  // If the user is currently editing a new avatar file, don't overwrite the preview.
  if (avatarFile.value) return
  const userVal = u as User | null
  avatarPreview.value = resolveAvatar(auth.userAvatar || userVal?.avatar_url || userVal?.avatar, userVal?.name)
}, { immediate: true })

async function initializeTaxonomySelection() {
  const profile = user.value?.profile
  
  if (!profile) {
    // Profile not created yet - start with empty selections
    taxonomySelection.value = { level: null, grade: null, subject: null, topic: null }
    return
  }

  // The API already returns full level and grade objects
  const level = profile.level || null
  const grade = profile.grade || null
  
  // For subjects, we have the IDs in profile.subjects
  // Resolve them using the taxonomy store
  let subjects = null
  const subjectIds = Array.isArray(profile.subjects) ? profile.subjects : []
  
  if (subjectIds.length > 0) {
    // Ensure taxonomy store is loaded
    try {
      // Get store subjects - handle both Ref and plain array
      let currentSubjects = taxonomyStore.subjects || []
      if (Array.isArray(currentSubjects) && currentSubjects.length === 0) {
        await taxonomyStore.fetchAllSubjects()
        currentSubjects = taxonomyStore.subjects || []
      }
      
      // Find subjects from store by IDs
      subjects = subjectIds
        .map((sId: any) => (currentSubjects as any[]).find(s => String(s.id) === String(sId)))
        .filter(Boolean)
    } catch (e) {
      // Taxonomy fetch failed but continue with what we have
    }
  }

  taxonomySelection.value = { level, grade, subject: subjects, topic: null }
}

function triggerAvatarUpload() { 
  avatarInput.value?.click() 
}

async function onAvatarFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    // Call onFile from composable to set preview and file ref
    onFile(e)
    
    // Immediately save the avatar without waiting for form submission
    isUploadingAvatar.value = true
    
    // Create a FormData with just the avatar file
    const formData = new FormData()
    formData.append('avatar', file)
    
    // Call patchMe from useAccountApi to save the avatar
    const updatedUser = await patchMe(formData)
    
    if (!updatedUser || !updatedUser.id) {
      throw new Error('Failed to get updated user data')
    }
    
    // Update auth store immediately so topbar sees the new avatar
    auth.setUser(updatedUser)
    
    // Refresh session to ensure auth is fully updated
    await new Promise(resolve => setTimeout(resolve, 100))
    try {
      const { getSession } = useAuth()
      // Wrap with timeout to prevent recursion
      await Promise.race([
        getSession(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Session fetch timeout')), 3000))
      ])
    } catch (e) {
      // Session refresh may fail but continue
      console.warn('Session refresh failed (non-fatal):', String(e).split(':')[0])
    }
    
    // Fetch fresh user data from API to ensure everything is in sync
    try {
      await auth.fetchUser()
    } catch (e) {
      console.error('Failed to refresh user after avatar upload:', e)
    }
    
    appAlert.push({
      type: 'success',
      message: 'Avatar updated successfully',
      icon: 'heroicons:check-circle'
    })
    
    // Reset the file input so the same file can be selected again
    input.value = ''
    
  } catch (err: any) {
    appAlert.push({
      type: 'error',
      message: err?.message || 'Failed to upload avatar',
      icon: 'heroicons:exclamation-circle'
    })
    
    // Reset preview on error
    avatarFile.value = null
    avatarPreview.value = resolveAvatar(auth.userAvatar || user.value?.avatar || user.value?.avatar_url, user.value?.name)
    input.value = ''
  } finally {
    isUploadingAvatar.value = false
  }
}

function openTaxonomyModal() {
  // Copy current selection to temp for editing
  tempTaxonomySelection.value = JSON.parse(JSON.stringify(taxonomySelection.value))
  showTaxonomyModal.value = true
}

async function confirmTaxonomySelection() {
  taxonomySelection.value = JSON.parse(JSON.stringify(tempTaxonomySelection.value))
  isTaxonomyDirty.value = true
  showTaxonomyModal.value = false
  
  // Auto-save taxonomy changes
  await saveTaxonomy()
}

async function saveTaxonomy() {
  if (!isTaxonomyDirty.value) return
  
  try {
    const profileEndpoint = isQuizMaster.value ? '/api/profile/quiz-master' : '/api/profile/quizee'
    
    const profileData: any = {}
    
    if (taxonomySelection.value.level?.id) {
      profileData.level_id = taxonomySelection.value.level.id
    }
    if (taxonomySelection.value.grade?.id) {
      profileData.grade_id = taxonomySelection.value.grade.id
    }
    if (taxonomySelection.value.subject) {
      if (Array.isArray(taxonomySelection.value.subject)) {
        profileData.subjects = taxonomySelection.value.subject.map(s => s.id)
      } else {
        profileData.subjects = [taxonomySelection.value.subject.id]
      }
    }
    
    const resp = await api.patchJson(profileEndpoint, profileData)
    
    if (!resp.ok) {
      appAlert.push({ message: 'Failed to save areas of interest', type: 'error' })
      isTaxonomyDirty.value = false
      return
    }
    
    isTaxonomyDirty.value = false
    appAlert.push({ message: 'Areas of interest saved automatically', type: 'success' })
  } catch (e: any) {
    appAlert.push({ message: e?.message || 'Failed to save areas of interest', type: 'error' })
    isTaxonomyDirty.value = false
  }
}

// Institution form for institution managers
const { useInstitutionsStore } = await import('~/stores/institutions')
const instStore = useInstitutionsStore()
const institution = computed(() => instStore.institution)

const institutionForm = ref({
  name: '',
  email: '',
  phone: '',
  logo_url: '',
  website: '',
  address: '',
})

const institutionLoading = ref(false)
const institutionError = ref('')
const institutionSuccess = ref('')

// Initialize institution form when institution loads
watch(() => institution.value, (inst) => {
  if (inst) {
    institutionForm.value = {
      name: inst.name || '',
      email: inst.email || '',
      phone: inst.phone || '',
      logo_url: (inst as any).logo_url || '',
      website: inst.website || '',
      address: inst.address || '',
    }
  }
}, { immediate: true, deep: true })

function resetInstitution() {
  if (institution.value) {
    institutionForm.value = {
      name: institution.value.name || '',
      email: institution.value.email || '',
      phone: institution.value.phone || '',
      logo_url: (institution.value as any).logo_url || '',
      website: institution.value.website || '',
      address: institution.value.address || '',
    }
  }
  institutionError.value = ''
  institutionSuccess.value = ''
}

async function saveInstitution() {
  institutionError.value = ''
  institutionSuccess.value = ''
  institutionLoading.value = true

  try {
    if (!institution.value?.id) {
      institutionError.value = 'No institution selected'
      return
    }

    const resp = await api.patchJson(`/api/institutions/${institution.value.id}`, institutionForm.value)
    if (await api.handleAuthStatus(resp)) return

    if (!resp.ok) {
      const json = await api.parseResponse(resp)
      institutionError.value = (json as any)?.message || 'Failed to update institution'
      return
    }

    const json = await api.parseResponse(resp)
    institutionSuccess.value = 'Institution profile updated successfully'
    
    // Refresh institution data
    if (institution.value?.id) {
      await instStore.fetchInstitution(institution.value.id)
    }
    
    await nextTick()
    resetInstitution()
  } catch (e: any) {
    institutionError.value = e?.message || 'Failed to save institution'
  } finally {
    institutionLoading.value = false
  }
}
</script>
