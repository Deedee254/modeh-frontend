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

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormGroup label="Institution" name="institution">
          <UInput v-model="form.institution" />
        </UFormGroup>
        <UFormGroup label="Grade" name="grade_id">
          <USelect
            v-model="form.grade_id"
            :options="[{ name: 'Select a grade', id: '' }, ...grades]"
            option-attribute="name"
            value-attribute="id"
          />
        </UFormGroup>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormGroup label="Level" name="level_id">
          <USelect
            v-model="form.level_id"
            :options="[{ name: 'Select a level', id: '' }, ...levels]"
            option-attribute="name"
            value-attribute="id"
          />
        </UFormGroup>
        <UFormGroup label="Phone" name="phone">
          <UInput v-model="form.phone" />
        </UFormGroup>
      </div>

      <!-- Subject Selection -->
      <fieldset>
        <legend class="block text-sm font-medium mb-2">Subjects</legend>
        <div class="border rounded-lg p-2">
          <MultiTaxonomyPicker resource="subjects" :grade-id="form.grade_id" v-model="form.subjects" compact />
        </div>
      </fieldset>

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

      <!-- Quizee specific fields -->
      <template v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormGroup label="First Name" name="first_name">
            <UInput v-model="form.first_name" />
          </UFormGroup>
          <UFormGroup label="Last Name" name="last_name">
            <UInput v-model="form.last_name" />
          </UFormGroup>
        </div>
      </template>

      <div class="flex flex-col sm:flex-row items-center justify-end gap-2">
        <UButton type="button" color="white" variant="soft" @click="reset" class="w-full sm:w-auto">Reset</UButton>
        <UButton type="submit" class="w-full sm:w-auto">Save profile</UButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useUserRole } from '~/composables/useUserRole'
import { resolveAssetUrl } from '~/composables/useAssets'
import ProfileHeader from '~/components/profile/ProfileHeader.vue'
import { useProfileForm } from '~/composables/useProfileForm'
import useTaxonomy from '~/composables/useTaxonomy'
import MultiTaxonomyPicker from '~/components/taxonomy/MultiTaxonomyPicker.vue'

const auth = useAuthStore()
const { isQuizMaster } = useUserRole()
const { createFormState, onFile, saveProfile, avatarPreview, avatarFile } = useProfileForm()

const user = auth.user
const avatarInput = ref(null)

// Data lists
const grades = ref([])
const levels = ref([])
const { fetchGrades, fetchLevels, grades: taxGrades, levels: taxLevels } = useTaxonomy()

// Initialize form from user data
const form = ref(createFormState(user))

// Avatar preview initialization
onMounted(() => {
  avatarPreview.value = resolveAssetUrl(user?.avatar_url || user?.avatar) || null
})

/**
 * Fetches grades and levels from the API
 */
async function fetchGradesAndLevels() {
  try {
    await Promise.all([fetchGrades(), fetchLevels()])
    grades.value = Array.isArray(taxGrades.value) ? taxGrades.value : []
    levels.value = Array.isArray(taxLevels.value) ? taxLevels.value : []
  } catch (err) {
    console.error('Failed to fetch form data:', err)
    grades.value = []
    levels.value = []
  }
}

onMounted(async () => {
  await fetchGradesAndLevels()
})

function triggerAvatarUpload() {
  avatarInput.value?.click()
}

function reset() {
  form.value = createFormState(user)
  avatarPreview.value = resolveAssetUrl(user?.avatar_url || user?.avatar) || null
  avatarFile.value = null
}

async function save() {
  const success = await saveProfile(form.value, isQuizMaster.value)
  if (success) {
    // Reset form with updated user data
    form.value = createFormState(auth.user)
    avatarPreview.value = auth.user?.avatar_url || auth.user?.avatar || null
    avatarFile.value = null
  }
}
</script>

