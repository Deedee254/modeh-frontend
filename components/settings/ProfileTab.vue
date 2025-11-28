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
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormGroup label="Display name" name="display_name" required>
          <UInput v-model="form.display_name" />
        </UFormGroup>
        <UFormGroup label="Email" name="email">
          <UInput :model-value="user?.email" readonly disabled />
        </UFormGroup>
      </div>

      <!-- If user is a quizee, surface First/Last near the top so they don't need to re-enter -->
      <template v-if="!isQuizMaster && !isInstitutionManager">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormGroup label="First Name" name="first_name">
            <UInput v-model="form.first_name" />
          </UFormGroup>
          <UFormGroup label="Last Name" name="last_name">
            <UInput v-model="form.last_name" />
          </UFormGroup>
        </div>
      </template>

      <!-- Institution managers only need core user fields handled by /api/me -->
      <template v-if="isInstitutionManager">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormGroup label="Phone" name="phone">
            <UInput v-model="form.phone" />
          </UFormGroup>
          <div />
        </div>

        <UFormGroup label="Bio" name="bio">
          <UTextarea v-model="form.bio" :rows="4" class="mt-1 block w-full" />
        </UFormGroup>
      </template>

      <!-- Non-institution users (quizee or quiz-master) keep the extended profile fields -->
      <template v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormGroup label="Institution" name="institution">
            <UInput v-model="form.institution" />
          </UFormGroup>
          <UFormGroup label="Level" name="level_id">
            <USelect
              v-model="form.level_id"
              :options="[{ name: 'Select a level', id: '' }, ...levels]"
              option-attribute="name"
              value-attribute="id"
            />
          </UFormGroup>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormGroup label="Grade" name="grade_id">
            <USelect
              v-model="form.grade_id"
              :options="[{ name: 'Select a grade', id: '' }, ...filteredGrades]"
              option-attribute="name"
              value-attribute="id"
            />
          </UFormGroup>
          <UFormGroup label="Phone" name="phone">
            <UInput v-model="form.phone" />
          </UFormGroup>
        </div>

        <!-- Subject Selection (after level and grade) -->
        <fieldset>
          <legend class="block text-sm font-medium mb-2">Subjects</legend>
          <div class="border rounded-lg p-2">
            <MultiTaxonomyPicker resource="subjects" :grade-id="form.grade_id" v-model="form.subjects" compact />
          </div>
        </fieldset>
      </template>

      <!-- Quiz Master specific fields -->
      <template v-if="isQuizMaster">
        <UFormGroup label="Headline" name="headline">
          <UInput v-model="form.headline" />
        </UFormGroup>

        <UFormGroup label="Bio" name="bio">
          <UTextarea v-model="form.bio" :rows="4" class="mt-1 block w-full" />
        </UFormGroup>

        <!-- Removed duplicate free-text subjects input; use MultiTaxonomyPicker instead -->
      </template>


      <div class="flex flex-col sm:flex-row items-center justify-end gap-2">
        <UButton type="button" color="white" variant="soft" @click="reset" class="w-full sm:w-auto">Reset</UButton>
        <UButton type="submit" class="w-full sm:w-auto">Save profile</UButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useUserRole } from '~/composables/useUserRole'
import { resolveAssetUrl } from '~/composables/useAssets'
import ProfileHeader from '~/components/profile/ProfileHeader.vue'
import { useProfileForm } from '~/composables/useProfileForm'
import useTaxonomy from '~/composables/useTaxonomy'
import MultiTaxonomyPicker from '~/components/taxonomy/MultiTaxonomyPicker.vue'

const auth = useAuthStore()
const { isQuizMaster, isInstitutionManager, preferredRole } = useUserRole()
const { createFormState, onFile, saveProfile, avatarPreview, avatarFile } = useProfileForm()

const avatarInput = ref(null)

// Data lists
const grades = ref([])
const levels = ref([])
const { fetchGrades, fetchLevels, fetchGradesByLevel, grades: taxGrades, levels: taxLevels } = useTaxonomy()

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
  },
  { deep: true, immediate: true }
)

// Filtered grades based on selected level
const filteredGrades = computed(() => {
  if (!form.value.level_id) return grades.value
  return grades.value.filter(g => String(g.level_id) === String(form.value.level_id))
})

// When level changes, fetch grades for that level and reset grade if it doesn't belong to the new level
watch(
  () => form.value.level_id,
  async (newLevelId) => {
    if (!newLevelId) {
      // No level selected, fetch all grades
      try {
        await fetchGrades()
        grades.value = Array.isArray(taxGrades.value) ? taxGrades.value : []
      } catch (err) {
        console.error('Failed to fetch grades:', err)
      }
    } else {
      // Fetch grades for the selected level
      try {
        if (typeof fetchGradesByLevel === 'function') {
          await fetchGradesByLevel(newLevelId)
        } else {
          await fetchGrades()
        }
        grades.value = Array.isArray(taxGrades.value) ? taxGrades.value : []
      } catch (err) {
        console.error('Failed to fetch grades for level:', err)
      }
    }
    
    // Reset grade if it doesn't belong to the new level
    if (form.value.grade_id) {
      const gradeExists = grades.value.some(g => String(g.id) === String(form.value.grade_id))
      if (!gradeExists) {
        form.value.grade_id = ''
      }
    }
  }
)

// Avatar preview initialization and fetch grades/levels
onMounted(async () => {
  avatarPreview.value = resolveAssetUrl(user?.avatar_url || user?.avatar) || null
  
  // Fetch grades and levels
  try {
    await Promise.all([fetchGrades(), fetchLevels()])
    grades.value = Array.isArray(taxGrades.value) ? taxGrades.value : []
    levels.value = Array.isArray(taxLevels.value) ? taxLevels.value : []
    
    // Force grade update to trigger MultiTaxonomyPicker's watcher
    // This ensures subjects load with proper grade context after mounting
    if (form.value.grade_id) {
      const currentGradeId = form.value.grade_id
      form.value.grade_id = ''
      await nextTick()
      form.value.grade_id = currentGradeId
    }
  } catch (err) {
    console.error('Failed to fetch form data:', err)
    grades.value = []
    levels.value = []
  }
})

function triggerAvatarUpload() {
  avatarInput.value?.click()
}

function reset() {
  form.value = createFormState(user.value)
  avatarPreview.value = resolveAssetUrl(user.value?.avatar_url || user.value?.avatar) || null
  avatarFile.value = null
}

async function save() {
  // Pass the preferred role so institution-managers won't trigger role-specific profile endpoints
  // preferredRole is one of: 'institution-manager' | 'quiz-master' | 'quizee'
  const success = await saveProfile(form.value, preferredRole.value)
  if (success) {
    // Form will auto-update via the watcher when auth.user changes
    // But ensure it updates immediately
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


