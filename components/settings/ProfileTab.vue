<template>
  <div class="space-y-6">
    <ProfileHeader :title="user?.name" :subtitle="currentProfile?.headline || ''" :avatarUrl="avatarPreview || ''">
      <template #avatarControls>
        <input ref="avatarInput" type="file" class="hidden" @change="onFile" aria-hidden="true" />
        <button type="button" @click="triggerAvatarUpload" title="Change avatar" class="-translate-y-1/4 translate-x-1/4 bg-white rounded-full p-1 shadow flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-700" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M17.414 2.586a2 2 0 010 2.828l-9.193 9.193a1 1 0 01-.464.263l-4 1a1 1 0 01-1.213-1.213l1-4a1 1 0 01.263-.464l9.193-9.193a2 2 0 012.828 0zM15.121 4.05l-1.172-1.172-8.486 8.486-0.588 2.353 2.353-0.588 8.486-8.486L15.12 4.05z" />
          </svg>
        </button>
      </template>
    </ProfileHeader>

    <div>
      <div class="flex items-center justify-end mb-3">
        <div v-if="isQuizMaster || isQuizee">
          <VerifiedBadge v-if="currentProfile?.is_verified" />
        </div>
      </div>

      <div class="bg-white p-4 rounded shadow">
        <form @submit.prevent="save" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-slate-700">Full name</label>
              <input v-model="form.display_name" type="text" class="mt-1 block w-full border border-slate-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-600" />

              <label class="block text-sm font-medium text-slate-700 mt-3">Phone</label>
              <input v-model="form.phone" type="text" class="mt-1 block w-full border border-slate-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-600" />
            </div>

            <!-- Short bio -->
            <div>
              <label class="block text-sm font-medium text-slate-700">Short bio</label>
              <textarea v-model="form.bio" rows="3" class="mt-1 block w-full border border-slate-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-600"></textarea>
            </div>

            <!-- Areas of Interest -->
            <div v-if="isQuizMaster || isQuizee">
              <label class="block text-sm font-medium text-slate-700 mb-2">Areas of Interest</label>
              <TaxonomyFlowPicker class="w-full" v-model="taxonomySelection" :includeTopics="false" :multiSelectSubjects="true" />
            </div>

            <!-- Institution field removed as per request -->

            <!-- Buttons span both columns -->
            <div class="flex gap-2 md:col-span-2">
              <button type="submit" class="px-4 py-2 bg-brand-600 text-white rounded">Save</button>
              <button type="button" @click="reset" class="px-4 py-2 border rounded">Reset</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Institution Profile Section (for institution managers) -->
    <div v-if="isInstitutionManager" class="mt-12 pt-8 border-t">
      <h2 class="text-2xl font-bold text-slate-900 mb-6">Institution Profile</h2>
      
      <div class="bg-white p-4 rounded shadow">
        <form @submit.prevent="saveInstitution" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Institution Name -->
            <div>
              <label class="block text-sm font-medium text-slate-700">Institution Name</label>
              <input v-model="institutionForm.name" type="text" class="mt-1 block w-full border border-slate-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-600" />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-slate-700">Email</label>
              <input v-model="institutionForm.email" type="email" class="mt-1 block w-full border border-slate-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-600" />
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-sm font-medium text-slate-700">Phone</label>
              <input v-model="institutionForm.phone" type="tel" class="mt-1 block w-full border border-slate-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-600" />
            </div>

            <!-- Website -->
            <div>
              <label class="block text-sm font-medium text-slate-700">Website</label>
              <input v-model="institutionForm.website" type="url" class="mt-1 block w-full border border-slate-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-600" />
            </div>

            <!-- Logo URL -->
            <div>
              <label class="block text-sm font-medium text-slate-700">Logo URL</label>
              <input v-model="institutionForm.logo_url" type="url" class="mt-1 block w-full border border-slate-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-600" />
              <p v-if="institutionForm.logo_url" class="mt-2">
                <img :src="institutionForm.logo_url" alt="Institution logo" class="h-20 w-20 rounded object-cover" />
              </p>
            </div>

            <!-- Address -->
            <div>
              <label class="block text-sm font-medium text-slate-700">Address</label>
              <textarea v-model="institutionForm.address" rows="2" class="mt-1 block w-full border border-slate-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-600"></textarea>
            </div>
          </div>

          <!-- Status Messages -->
          <div class="flex gap-2 md:col-span-2 pt-4">
            <button type="submit" :disabled="institutionLoading" class="px-4 py-2 bg-brand-600 text-white rounded disabled:opacity-50">
              {{ institutionLoading ? 'Saving...' : 'Save Institution' }}
            </button>
            <button type="button" @click="resetInstitution" class="px-4 py-2 border rounded">Reset</button>
          </div>

          <div v-if="institutionError" class="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {{ institutionError }}
          </div>
          <div v-if="institutionSuccess" class="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            {{ institutionSuccess }}
          </div>
        </form>
      </div>
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
import ProfileHeader from '~/components/profile/ProfileHeader.vue'
import { useProfileForm } from '~/composables/useProfileForm'
import useTaxonomy from '~/composables/useTaxonomy'
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import TaxonomyFlowPicker from '~/components/taxonomy/TaxonomyFlowPicker.vue'
import InstitutionPicker from '~/components/institution/InstitutionPicker.vue'
import VerifiedBadge from '~/components/badge/VerifiedBadge.vue'
import type { User, QuizMasterProfile, QuizeeProfile } from '~/types'

const auth = useAuthStore()
const { isQuizMaster, isInstitutionManager, preferredRole, isQuizee } = useUserRole()
const { createFormState, onFile, saveProfile, avatarPreview, avatarFile } = useProfileForm()
const api = useApi()
const appAlert = useAppAlert()

const avatarInput = ref<HTMLInputElement | null>(null)

// Data lists
const institutionQuery = ref('')
const { fetchGrades, fetchLevels, fetchGradesByLevel } = useTaxonomy()
const taxonomyStore = useTaxonomyStore()

// Taxonomy selection state
const taxonomySelection = ref<{ level: any; grade: any; subject: any; topic: any }>({ level: null, grade: null, subject: null, topic: null })

// Make user reactive and form depend on it
const user = computed(() => auth.user as User | null)

// Get the current profile object based on role
const currentProfile = computed(() => {
  const u = user.value as User | null
  return isQuizMaster.value ? u?.quizMasterProfile : u?.quizeeProfile
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
  // use user.value (computed) to read actual user object, but don't overwrite when editing a new file
  if (!avatarFile.value) {
    const u = user.value as User | null
    avatarPreview.value = resolveAssetUrl(auth.userAvatar || u?.avatarUrl || u?.avatar || u?.avatar_url || u?.image || u?.photo) || null
  }
})

// Keep avatar preview updated when user data changes (so current avatar shows before editing)
watch(user, (u) => {
  // If the user is currently editing a new avatar file, don't overwrite the preview.
  if (avatarFile.value) return
  const userVal = u as User | null
  avatarPreview.value = resolveAssetUrl(auth.userAvatar || userVal?.avatarUrl || userVal?.avatar || userVal?.avatar_url || userVal?.image || userVal?.photo) || null
}, { immediate: true })

async function initializeTaxonomySelection() {
  const profile = isQuizMaster.value ? user.value?.quizMasterProfile : user.value?.quizeeProfile
  if (!profile) return

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

function onInstitutionSelected(institution: any) {
  if (institution.is_new) {
    form.value.institution = institution.name
    form.value.institution_id = null
  } else {
    form.value.institution = institution.name
    form.value.institution_id = institution.id
  }
}

function reset() {
  form.value = createFormState(user.value)
  const u = user.value as User | null
  avatarPreview.value = resolveAssetUrl(auth.userAvatar || u?.avatarUrl || u?.avatar || u?.avatar_url || u?.image || u?.photo) || null
  avatarFile.value = null
}

async function save() {
  const success = await saveProfile(form.value, preferredRole.value)
  if (!success) return

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
  avatarPreview.value = resolveAssetUrl(auth.userAvatar || u?.avatarUrl || u?.avatar || u?.avatar_url || u?.image || u?.photo) || null
  avatarFile.value = null


  if (form.value.grade_id) {
    const currentGradeId = form.value.grade_id
    form.value.grade_id = ''
    await nextTick()
    form.value.grade_id = currentGradeId
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
