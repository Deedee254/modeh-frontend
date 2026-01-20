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
              title="Change avatar" 
              class="absolute bottom-0 right-0 bg-brand-600 hover:bg-brand-700 text-white rounded-full p-2 shadow-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M17.414 2.586a2 2 0 010 2.828l-9.193 9.193a1 1 0 01-.464.263l-4 1a1 1 0 01-1.213-1.213l1-4a1 1 0 01.263-.464l9.193-9.193a2 2 0 012.828 0zM15.121 4.05l-1.172-1.172-8.486 8.486-0.588 2.353 2.353-0.588 8.486-8.486L15.12 4.05z" />
              </svg>
            </button>
            <input ref="avatarInput" type="file" class="hidden" @change="onFile" aria-hidden="true" />
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
      <form @submit.prevent="save" class="space-y-6">
        <!-- Profile Fields Grid -->
        <div class="space-y-6">
          <!-- Name Fields - For Quizee only -->
          <div v-if="isQuizee" class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

        <!-- No buttons here - moved to bottom -->
      </form>
    </div>

    <!-- Areas of Interest Card -->
    <div v-if="isQuizMaster || isQuizee" class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 sm:p-8">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Areas of Interest</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Select your areas of expertise</p>

      <!-- Display Current Selections from Profile -->
      <div class="mb-6">
        <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">Your Current Selection</p>
        <div v-if="taxonomySelection && (taxonomySelection.level || taxonomySelection.grade || taxonomySelection.subject)" class="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700">
          <div class="flex flex-wrap gap-2">
            <div v-if="taxonomySelection.level" class="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300">
              <span>📚 {{ taxonomySelection.level.name || 'Level' }}</span>
            </div>
            <div v-if="taxonomySelection.grade" class="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-300">
              <span>📖 {{ taxonomySelection.grade.name || 'Grade' }}</span>
            </div>
            <template v-if="taxonomySelection.subject && Array.isArray(taxonomySelection.subject)">
              <div v-for="subject in taxonomySelection.subject" :key="subject.id" class="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1.5 text-sm font-medium text-purple-700 dark:text-purple-300">
                <span>🎓 {{ subject.name }}</span>
              </div>
            </template>
            <template v-else-if="taxonomySelection.subject">
              <div class="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1.5 text-sm font-medium text-purple-700 dark:text-purple-300">
                <span>🎓 {{ taxonomySelection.subject.name || 'Subject' }}</span>
              </div>
            </template>
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

    <!-- Update Button - Bottom of Profile Tab -->
    <div class="flex gap-3 pt-6 pb-2">
      <button 
        @click="save"
        :disabled="isSavingProfile"
        class="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <svg v-if="isSavingProfile" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span v-if="!isSavingProfile">Update Profile</span>
        <span v-else>Updating...</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import type { Ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useUserRole } from '~/composables/useUserRole'
import { useApi } from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'
import { resolveAssetUrl } from '~/composables/useAssets'
import { useProfileForm } from '~/composables/useProfileForm'
import useTaxonomy from '~/composables/useTaxonomy'
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import TaxonomyFlowPicker from '~/components/taxonomy/TaxonomyFlowPicker.vue'
import VerifiedBadge from '~/components/badge/VerifiedBadge.vue'
import type { User, QuizMasterProfile, QuizeeProfile } from '~/types'

const auth = useAuthStore()
const { isQuizMaster, isInstitutionManager, preferredRole, isQuizee } = useUserRole()
const { createFormState, onFile, saveProfile, avatarPreview, avatarFile } = useProfileForm()
const api = useApi()
const appAlert = useAppAlert()

const avatarInput = ref<HTMLInputElement | null>(null)

const institutionQuery = ref('')
const { fetchGrades, fetchLevels, fetchGradesByLevel } = useTaxonomy()
const taxonomyStore = useTaxonomyStore()

// Taxonomy selection state
const taxonomySelection = ref<{ level: any; grade: any; subject: any; topic: any }>({ level: null, grade: null, subject: null, topic: null })
const tempTaxonomySelection = ref<{ level: any; grade: any; subject: any; topic: any }>({ level: null, grade: null, subject: null, topic: null })
const showTaxonomyModal = ref(false)
const isTaxonomyDirty = ref(false)
const isSavingProfile = ref(false)

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

// Keep taxonomySelection in sync with form values
// CRITICAL: Only update form when selection actually changes (not on every re-render)
watch(taxonomySelection, (sel: any) => {
  if (!sel) return
  // Only update if value actually changed to avoid triggering unnecessary saves
  const newLevel = sel.level?.id || ''
  const newGrade = sel.grade?.id || ''
  const newSubjects = sel.subject
    ? (Array.isArray(sel.subject) ? sel.subject.map((s: any) => s.id) : [sel.subject.id])
    : []
  
  // Check if values actually changed before updating form
  const levelChanged = String(newLevel) !== String(form.value.level_id ?? '')
  const gradeChanged = String(newGrade) !== String(form.value.grade_id ?? '')
  const subjectsChanged = JSON.stringify(newSubjects.sort()) !== JSON.stringify((form.value.subjects || []).map(s => String(s)).sort())
  
  if (levelChanged) form.value.level_id = newLevel
  if (gradeChanged) form.value.grade_id = newGrade
  if (subjectsChanged) form.value.subjects = newSubjects
}, { deep: true })

// Watch for user/profile changes and initialize
watch(
  () => currentProfile.value,
  () => {
    form.value = createFormState(user.value)

    // ensure institutionQuery reflects the saved institution string so InstitutionPicker shows it
    institutionQuery.value = form.value.institution || ''
    
    // Update original form state
    originalForm.value = JSON.parse(JSON.stringify(form.value))
    
    initializeTaxonomySelection()
  },
  { deep: true, immediate: true }
)

onMounted(async () => {
  // Load avatar preview if not already set
  if (!avatarFile.value) {
    const u = user.value as User | null
    avatarPreview.value = resolveAssetUrl(auth.userAvatar || u?.avatar || u?.avatar_url) || null
  }
  
  // Initialize taxonomy selections on mount
  await initializeTaxonomySelection()
})

// Keep avatar preview updated when user data changes (so current avatar shows before editing)
watch(user, (u) => {
  // If the user is currently editing a new avatar file, don't overwrite the preview.
  if (avatarFile.value) return
  const userVal = u as User | null
  avatarPreview.value = resolveAssetUrl(auth.userAvatar || userVal?.avatar_url || userVal?.avatar) || null
}, { immediate: true })

async function initializeTaxonomySelection() {
  const profile = user.value?.profile as QuizMasterProfile | QuizeeProfile | undefined
  if (!profile) {
    // Profile not created yet - start with empty selections
    taxonomySelection.value = { level: null, grade: null, subject: null, topic: null }
    return
  }

  // Parallelize initial taxonomy loads
  await Promise.all([
    (async () => {
      if (!taxonomyStore.levels || taxonomyStore.levels.length === 0) {
        await taxonomyStore.fetchLevels().catch(() => {})
      }
    })(),
    (async () => {
      if (Array.isArray(profile.subjects) && profile.subjects.length > 0) {
        if (!taxonomyStore.subjects || taxonomyStore.subjects.length === 0) {
          await taxonomyStore.fetchAllSubjects().catch(() => {})
        }
      }
    })()
  ])

  // Helper to find item in list or fetch if missing
  const resolveItem = async (current: any, list: any[], apiEndpoint: string) => {
    let item = current || null
    const id = item?.id || item // handle if item is just an ID
    if (!id) return null
    
    // 1. Try to find in existing list
    let found = list.find(l => String(l.id) === String(id) || String(l.value) === String(id))
    
    // 2. Fallback: try fetching individual item from API
    if (!found && apiEndpoint) {
      try {
        const resp = await api.get(`${apiEndpoint}/${encodeURIComponent(String(id))}`)
        if (resp.ok) {
          const data = await resp.json().catch(() => null)
          const srv = data?.level || data?.grade || data?.subject || data?.data || data || null
          if (srv) return { id: srv.id, name: srv.name ?? srv.title ?? `Item ${id}`, ...srv }
        }
      } catch (e) {}
    }
    
    return found || ((item && item.name) ? item : { id, name: `Item ${id}` })
  }

  // Resolve Level and Subjects in parallel
  const [level, resolvedSubjects] = await Promise.all([
    resolveItem(
      (profile.level && profile.level.id) ? profile.level : (profile.level_id ? { id: profile.level_id } : null), 
      taxonomyStore.levels || [], 
      '/api/levels'
    ),
    (async () => {
      if (!Array.isArray(profile.subjects) || profile.subjects.length === 0) return null
      
      const results = []
      for (const s of profile.subjects) {
        const sId = s?.id || s
        if (!sId) continue
        
        const found = (taxonomyStore.subjects || []).find(ss => String(ss.id) === String(sId))
        if (found) {
          results.push(found)
        } else {
          results.push((typeof s === 'object' && s.name) ? s : { id: sId, name: `Subject ${sId}` })
        }
      }
      return results
    })()
  ])
  
  // If we found a level, we need its grades before resolving the grade
  if (level && level.id) {
    try { await taxonomyStore.fetchGradesByLevel(level.id) } catch (e) {}
  }

  // Resolve Grade
  const grade = await resolveItem(
    (profile.grade && profile.grade.id) ? profile.grade : (profile.grade_id ? { id: profile.grade_id } : null), 
    taxonomyStore.grades || [], 
    '/api/grades'
  )

  taxonomySelection.value = { level, grade, subject: resolvedSubjects, topic: null }
}

function triggerAvatarUpload() { 
  avatarInput.value?.click() 
}

function openTaxonomyModal() {
  // Copy current selection to temp for editing
  tempTaxonomySelection.value = JSON.parse(JSON.stringify(taxonomySelection.value))
  showTaxonomyModal.value = true
}

function confirmTaxonomySelection() {
  taxonomySelection.value = JSON.parse(JSON.stringify(tempTaxonomySelection.value))
  isTaxonomyDirty.value = true
  showTaxonomyModal.value = false
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
      return
    }
    
    // Update auth with new profile data
    await auth.fetchUser()
    isTaxonomyDirty.value = false
    appAlert.push({ message: 'Areas of interest saved successfully', type: 'success' })
  } catch (e: any) {
    console.error('Save taxonomy error:', e)
    appAlert.push({ message: e?.message || 'Failed to save areas of interest', type: 'error' })
  }
}

async function save() {
  isSavingProfile.value = true
  try {
    const success = await saveProfile(form.value, preferredRole.value)
    if (!success) {
      isSavingProfile.value = false
      return
    }

  if (form.value.institution_id || form.value.institution) {
    try {
      const institutionPayload = form.value.institution_id ? { institution_id: form.value.institution_id } : { institution: form.value.institution, is_custom: true }
      const resp = await api.postJson('/api/onboarding/step', { step: 'institution', data: institutionPayload })
      if (await api.handleAuthStatus(resp)) return
      const json = await api.parseResponse(resp)
      if (resp.ok) {
        appAlert.push({ message: form.value.institution_id ? `Request sent to ${form.value.institution}! Awaiting manager approval for verification.` : `Custom institution "${form.value.institution}" saved to your profile!`, type: 'success' })
      } else {
        appAlert.push({ message: (json as any)?.message || 'Failed to set institution', type: 'error' })
      }
    } catch (e: any) { console.error('Institution save error:', e) }
  }

  // If user typed an institution into the search field but didn't select/create it explicitly,
  // fall back to using the typed text as a custom institution string.
  if ((!form.value.institution_id && !form.value.institution) && institutionQuery.value && institutionQuery.value.trim()) {
    try {
      const institutionPayload = { institution: institutionQuery.value.trim(), is_custom: true }
      const resp = await api.postJson('/api/onboarding/step', { step: 'institution', data: institutionPayload })
      if (await api.handleAuthStatus(resp)) return
      const json = await api.parseResponse(resp)
      if (resp.ok) {
        appAlert.push({ message: `Custom institution "${institutionQuery.value.trim()}" saved to your profile!`, type: 'success' })
        await auth.fetchUser()
      } else {
        appAlert.push({ message: (json as any)?.message || 'Failed to set institution', type: 'error' })
      }
    } catch (e: any) { console.error('Institution save error (typed fallback):', e) }
  }

  await nextTick()
  // Re-initialize state to reflect saved data
  form.value = createFormState(user.value)
  originalForm.value = JSON.parse(JSON.stringify(form.value))
  const u = user.value as User | null
  avatarPreview.value = resolveAssetUrl(auth.userAvatar || u?.avatar_url || u?.avatar) || null
  avatarFile.value = null

  // Reload taxonomy selection from fresh database data
  await initializeTaxonomySelection()

  if (form.value.grade_id) {
    const currentGradeId = form.value.grade_id
    form.value.grade_id = ''
    await nextTick()
    form.value.grade_id = currentGradeId
  }
  } finally {
    isSavingProfile.value = false
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
    
    // Reset form with new data
    await nextTick()
    resetInstitution()
  } catch (e: any) {
    console.error('Institution save error:', e)
    institutionError.value = e?.message || 'Failed to save institution'
  } finally {
    institutionLoading.value = false
  }
}
</script>
