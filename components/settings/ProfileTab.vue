<template>
  <div class="space-y-4">
    <ProfileHeader
      :title="form.display_name || user?.name || 'Profile'"
      :subtitle="user?.email"
      :avatar-url="avatarPreview || user?.avatar_url || user?.avatar"
    >
      <template #actions>
        <UButton color="white" @click="triggerAvatarUpload">
          Change photo
        </UButton>
        <input ref="avatarInput" type="file" class="hidden" @change="onFile" accept="image/*" />
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

      <!-- Subject Selection -->
      <fieldset>
        <legend class="block text-sm font-medium mb-2">Subjects</legend>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 border rounded-lg p-4">
          <template v-for="s in subjects" :key="s?.id">
            <UCheckbox
              v-if="s && s.id"
              :value="s.id"
              v-model="form.subjects"
              :label="s.name || 'Unknown Subject'"
              class="p-2 hover:bg-gray-50 rounded"
            />
          </template>
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

        <UFormGroup label="Teaching subjects (comma separated)" name="teaching_subjects">
          <UInput v-model="form.teaching_subjects" />
        </UFormGroup>
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
import { useAppAlert } from '~/composables/useAppAlert'
import { useUserRole } from '~/composables/useUserRole'
import ProfileHeader from '~/components/profile/ProfileHeader.vue'
import { useAccountApi } from '~/composables/useAccountApi'
import useApi from '~/composables/useApi'
import useTaxonomy from '~/composables/useTaxonomy'

const { patchMe } = useAccountApi()
const auth = useAuthStore()
const alert = useAppAlert()
const { isQuizMaster } = useUserRole()

const user = auth.user
const api = useApi()

const avatarInput = ref(null)
// Data lists
const grades = ref([])
const subjects = ref([])
const { fetchGrades, fetchAllSubjects, grades: taxGrades, subjects: taxSubjects } = useTaxonomy()

/**
 * Creates a clean form state object from the user data.
 * @param {object | null} u - The user object from the auth store.
 * @returns {object} A form state object.
 */
function createFormState(u) {
  return {
    display_name: u?.name || '',
    institution: u?.institution || '',
    grade_id: u?.grade?.id || '',
    subjects: Array.isArray(u?.subjects) ? u.subjects.map(s => s.id).filter(Boolean) : [],
    headline: u?.headline || '',
    bio: u?.bio || '',
    teaching_subjects: Array.isArray(u?.teaching_subjects) ? u.teaching_subjects.join(', ') : (u?.teaching_subjects || ''),
    first_name: u?.first_name || '',
    last_name: u?.last_name || ''
  }
}

const form = ref(createFormState(user))
const avatarPreview = ref(user?.avatar_url || user?.avatar || null)
let avatarFile = null

/**
 * Fetches grades and subjects from the API and populates the refs.
 */
async function fetchGradesAndSubjects() {
  try {
    await Promise.all([fetchGrades(), fetchAllSubjects()])
    grades.value = Array.isArray(taxGrades.value) ? taxGrades.value : []
    subjects.value = Array.isArray(taxSubjects.value) ? taxSubjects.value : []
  } catch (err) {
    console.error('Failed to fetch form data:', err)
    alert.push({ type: 'error', message: 'Failed to load form options.' })
    grades.value = []
    subjects.value = []
  }
}

onMounted(async () => {
  await fetchGradesAndSubjects();
});

function onFile(e) {
  const input = e.target
  const f = input.files?.[0]
  if (!f) return
  avatarFile = f
  const url = URL.createObjectURL(f)
  avatarPreview.value = url
}

function triggerAvatarUpload() {
  avatarInput.value?.click()
}

function reset() {
  form.value = createFormState(user)
  avatarPreview.value = user?.avatar_url || user?.avatar || null
  avatarFile = null
}

async function save() {
  try {
    if (!form.value.display_name || form.value.display_name.trim().length === 0) {
      alert.push({ type: 'error', message: 'Please enter a display name' })
      return
    }

    const data = new FormData()
    data.append('name', form.value.display_name)
  // include institution if present on user
  if (user?.institution) data.append('institution', user.institution)
    data.append('grade_id', form.value.grade_id)
    data.append('subjects', JSON.stringify(form.value.subjects))

    if (isQuizMaster.value) {
      data.append('headline', form.value.headline)
      data.append('bio', form.value.bio)
      data.append('teaching_subjects', form.value.teaching_subjects || '')
    } else {
      data.append('first_name', form.value.first_name)
      data.append('last_name', form.value.last_name)
    }

    if (avatarFile) {
      data.append('avatar', avatarFile)
    }

    const json = await patchMe(data)
    // patchMe may return the updated user object or a success payload; normalize if needed
    if (json && json.id) {
      auth.setUser(json)
    } else if (json && json.user) {
      auth.setUser(json.user)
    }
    alert.push({ type: 'success', message: 'Profile updated', icon: 'heroicons:check' })
  } catch (e) {
    alert.push({ type: 'error', message: 'Failed to save profile', icon: 'heroicons:x-mark' })
  }
}
</script>
