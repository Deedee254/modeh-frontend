<template>
  <div class="space-y-4">
    <ProfileHeader
      :title="form.display_name || user?.name || 'Profile'"
      :subtitle="user?.email"
      :avatar-url="avatarPreview || user?.avatar_url || user?.avatar"
    >
      <template #actions>
        <UButton color="white" @click="triggerAvatarUpload" class="w-full sm:w-auto"> 
          Change photo
        </UButton>
        <input ref="avatarInput" type="file" class="hidden" @change="onFile" accept="image/*" aria-label="Upload avatar" />
      </template>
    </ProfileHeader>

    <form @submit.prevent="save" class="space-y-4 p-4 rounded-xl border bg-white shadow-sm">
      <!-- Display name (from User.name) - only editable field from user table -->
      <UFormGroup label="Display name" name="display_name" required>
        <UInput v-model="form.display_name" placeholder="Your public display name" />
      </UFormGroup>

      <!-- Quizee-specific fields -->
      <template v-if="!isQuizMaster && !isInstitutionManager">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormGroup label="First Name" name="first_name">
            <UInput v-model="form.first_name" />
          </UFormGroup>
          <UFormGroup label="Last Name" name="last_name">
            <UInput v-model="form.last_name" />
          </UFormGroup>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormGroup label="Phone" name="phone">
            <UInput v-model="form.phone" type="tel" placeholder="+254..." />
          </UFormGroup>
        </div>

        <!-- Institution Selector -->
        <fieldset class="border rounded-lg p-4 space-y-3">
          <legend class="text-sm font-medium mb-2">Institution</legend>
          <div v-if="user?.institution_verified" class="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <VerifiedBadge :is-verified="true" :institution-name="form.institution || 'Institution'" size="sm" show-label />
            <span class="text-sm text-green-700 dark:text-green-300">Verified with {{ form.institution }}</span>
          </div>
          <div v-else-if="form.institution_id" class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p class="text-sm text-blue-700 dark:text-blue-300">⏳ Awaiting approval from {{ form.institution }}</p>
          </div>
          <InstitutionPicker
            v-model="form.institution_id"
            :query="institutionQuery"
            @update:query="institutionQuery = $event"
            @selected="onInstitutionSelected"
            title="Select or Create Institution"
            subtitle="Search for existing institutions or add a new one"
          />
        </fieldset>

        <!-- Taxonomy Selection -->
        <fieldset class="border rounded-lg p-4 space-y-3">
          <legend class="text-sm font-medium mb-2">Your Education Background</legend>
          <TaxonomyFlowPicker
            :modelValue="taxonomySelection"
            :includeTopics="false"
            :multiSelectSubjects="true"
            @update:modelValue="updateTaxonomySelection"
          />
        </fieldset>

        <!-- Bio -->
        <UFormGroup label="Bio" name="bio">
          <UTextarea v-model="form.bio" :rows="3" placeholder="Tell others about yourself..." />
        </UFormGroup>
      </template>

      <!-- Quiz Master specific fields -->
      <template v-if="isQuizMaster">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormGroup label="Phone" name="phone">
            <UInput v-model="form.phone" type="tel" placeholder="+254..." />
          </UFormGroup>
        </div>

        <!-- Institution Selector -->
        <fieldset class="border rounded-lg p-4 space-y-3">
          <legend class="text-sm font-medium mb-2">Institution</legend>
          <div v-if="user?.institution_verified" class="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <VerifiedBadge :is-verified="true" :institution-name="form.institution || 'Institution'" size="sm" show-label />
            <span class="text-sm text-green-700 dark:text-green-300">Verified with {{ form.institution }}</span>
          </div>
          <div v-else-if="form.institution_id" class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p class="text-sm text-blue-700 dark:text-blue-300">⏳ Awaiting approval from {{ form.institution }}</p>
          </div>
          <InstitutionPicker
            v-model="form.institution_id"
            :query="institutionQuery"
            @update:query="institutionQuery = $event"
            @selected="onInstitutionSelected"
            title="Select or Create Institution"
            subtitle="Search for existing institutions or add a new one"
          />
        </fieldset>

        <!-- Taxonomy Selection -->
        <fieldset class="border rounded-lg p-4 space-y-3">
          <legend class="text-sm font-medium mb-2">Your Education & Teaching Areas</legend>
          <TaxonomyFlowPicker
            :modelValue="taxonomySelection"
            :includeTopics="false"
            :multiSelectSubjects="true"
            @update:modelValue="updateTaxonomySelection"
          />
        </fieldset>

        <UFormGroup label="Headline" name="headline">
          <UInput v-model="form.headline" placeholder="e.g., Mathematics Expert" />
        </UFormGroup>

        <UFormGroup label="Bio" name="bio">
          <UTextarea v-model="form.bio" :rows="3" placeholder="Tell students about your expertise..." />
        </UFormGroup>
      </template>

      <!-- Institution Manager - minimal fields -->
      <template v-if="isInstitutionManager">
        <div class="text-sm text-slate-600">Institution manager profile information is managed separately.</div>
      </template>


      <div class="flex flex-col sm:flex-row items-center justify-end gap-2">
        <UButton type="button" color="white" variant="soft" @click="reset" class="w-full sm:w-auto">Reset</UButton>
        <UButton type="submit" class="w-full sm:w-auto">Save profile</UButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useUserRole } from '~/composables/useUserRole'
import { useApi } from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'
import { resolveAssetUrl } from '~/composables/useAssets'
import ProfileHeader from '~/components/profile/ProfileHeader.vue'
import { useProfileForm } from '~/composables/useProfileForm'
import useTaxonomy from '~/composables/useTaxonomy'
import TaxonomyFlowPicker from '~/components/taxonomy/TaxonomyFlowPicker.vue'
import InstitutionPicker from '~/components/institution/InstitutionPicker.vue'
import VerifiedBadge from '~/components/badge/VerifiedBadge.vue'

const auth = useAuthStore()
const { isQuizMaster, isInstitutionManager, preferredRole } = useUserRole()
const { createFormState, onFile, saveProfile, avatarPreview, avatarFile } = useProfileForm()
const api = useApi()
const appAlert = useAppAlert()

const avatarInput = ref(null)

// Data lists
const institutionQuery = ref('')
const { fetchGrades, fetchLevels, fetchGradesByLevel, grades: taxGrades, levels: taxLevels } = useTaxonomy()

// Taxonomy selection state
const taxonomySelection = ref({
  level: null,
  grade: null,
  subject: null,
  topic: null
})

// Make user reactive and form depend on it
const user = computed(() => auth.user)

// Get the current profile object based on role
const currentProfile = computed(() => {
  return isQuizMaster.value ? user.value?.quizMasterProfile : user.value?.quizeeProfile
})

// Initialize form from user data - will react to user changes
const form = ref(createFormState(user.value))

// Watch for user data updates and refresh form when profile data loads or changes
// Use the currentProfile computed as the source for better reactivity
watch(
  currentProfile,
  () => {
    form.value = createFormState(user.value)
    // Also initialize taxonomy selection from loaded profile data
    initializeTaxonomySelection()
  },
  { deep: true, immediate: true }
)

// Avatar preview initialization
onMounted(async () => {
  avatarPreview.value = resolveAssetUrl(user?.avatar_url || user?.avatar) || null
})

function initializeTaxonomySelection() {
  // Build taxonomy selection from form data (used when loading existing profile)
  const profile = isQuizMaster.value ? user.value?.quizMasterProfile : user.value?.quizeeProfile
  
  if (!profile) return
  
  // Build level object if level_id exists
  const level = profile.level_id ? (profile.level || { id: profile.level_id }) : null
  
  // Build grade object if grade_id exists
  const grade = profile.grade_id ? (profile.grade || { id: profile.grade_id }) : null
  
  // Build subjects array if subjects exist
  let subject = null
  if (Array.isArray(profile.subjects) && profile.subjects.length > 0) {
    // Convert subjects array to objects with id and name
    subject = profile.subjects.map(s => {
      if (typeof s === 'object' && s?.id) {
        return { id: s.id, name: s.name || `Subject #${s.id}` }
      }
      return { id: s, name: `Subject #${s}` }
    })
  }
  
  taxonomySelection.value = {
    level,
    grade,
    subject,
    topic: null
  }
}

function triggerAvatarUpload() {
  avatarInput.value?.click()
}

function onInstitutionSelected(institution) {
  // Handle selected institution
  if (institution.is_new) {
    // Custom institution
    form.value.institution = institution.name
    form.value.institution_id = null
  } else {
    // Existing institution
    form.value.institution = institution.name
    form.value.institution_id = institution.id
  }
}

function updateTaxonomySelection(selection) {
  // Update the taxonomy selection state
  taxonomySelection.value = selection
  
  // Extract IDs and update form
  if (selection.level) {
    form.value.level_id = selection.level.id
  }
  if (selection.grade) {
    form.value.grade_id = selection.grade.id
  }
  if (selection.subject) {
    // Handle both single subject and multiple subjects
    if (Array.isArray(selection.subject)) {
      form.value.subjects = selection.subject.map(s => s.id)
    } else {
      form.value.subjects = [selection.subject.id]
    }
  }
}

function reset() {
  form.value = createFormState(user.value)
  avatarPreview.value = resolveAssetUrl(user.value?.avatar_url || user.value?.avatar) || null
  avatarFile.value = null
}

async function save() {
  // First save the main profile
  const success = await saveProfile(form.value, preferredRole.value)
  if (success) {
    // If institution was selected, submit through onboarding step
    if (form.value.institution_id || form.value.institution) {
      try {
        const institutionPayload = form.value.institution_id
          ? { institution_id: form.value.institution_id }
          : { institution: form.value.institution, is_custom: true }

        const resp = await api.postJson('/api/onboarding/step', {
          step: 'institution',
          data: institutionPayload
        })

        if (api.handleAuthStatus(resp)) return

        const json = await api.parseResponse(resp)
        if (resp.ok) {
          appAlert.push({
            message: form.value.institution_id
              ? `Request sent to ${form.value.institution}! Awaiting manager approval for verification.`
              : `Custom institution "${form.value.institution}" saved to your profile!`,
            type: 'success'
          })
          await auth.fetchUser()
        } else {
          appAlert.push({
            message: json?.message || 'Failed to set institution',
            type: 'error'
          })
        }
      } catch (e) {
        console.error('Institution save error:', e)
      }
    }

    // Form will auto-update via the watcher when auth.user changes
    await nextTick()
    form.value = createFormState(user.value)
    
    avatarPreview.value = user.value?.avatar_url || user.value?.avatar || null
    avatarFile.value = null
    
    // Trigger grade change to re-initialize MultiTaxonomyPicker with latest subjects
    if (form.value.grade_id) {
      const currentGradeId = form.value.grade_id
      form.value.grade_id = ''
      await nextTick()
      form.value.grade_id = currentGradeId
    }
  }
}
</script>


