<template>
  <div class="space-y-4">
    <ProfileHeader
      :title="form.display_name || user?.name || 'Profile'"
      :subtitle="user?.email"
      :avatar-url="avatarPreview || user?.avatar_url || user?.avatar"
    >
      <template #actions>
        <label class="px-3 py-2 border rounded-md text-sm bg-white hover:bg-gray-50 cursor-pointer">
          <input type="file" class="hidden" @change="onFile" accept="image/*" />
          Change photo
        </label>
      </template>
    </ProfileHeader>

    <form @submit.prevent="save" class="space-y-4 p-4 rounded-xl border bg-white shadow-sm">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium">Display name</label>
          <input v-model="form.display_name" class="mt-1 block w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium">Email</label>
          <input :value="user?.email" class="mt-1 block w-full border rounded px-3 py-2 bg-gray-50" readonly />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium">Bio</label>
  <UTextarea v-model="form.bio" rows="4" class="mt-1 block w-full" />
      </div>

      <div v-if="isQuizMaster" class="space-y-2">
        <label class="block text-sm font-medium">Teaching subjects (comma separated)</label>
        <input v-model="form.teaching_subjects" class="mt-1 block w-full border rounded px-3 py-2" />
      </div>

      <div class="flex items-center justify-end gap-2">
        <button type="button" class="px-3 py-2 bg-gray-100 rounded" @click="reset">Reset</button>
        <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded">Save profile</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import UiTextarea from '~/components/ui/UiTextarea.vue'
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useAppAlert } from '~/composables/useAppAlert'
import { useUserRole } from '~/composables/useUserRole'
import ProfileHeader from '~/components/profile/ProfileHeader.vue'
import { useAccountApi } from '~/composables/useAccountApi'

const { patchMe } = useAccountApi()
const auth = useAuthStore()
const alert = useAppAlert()
const { isQuizMaster } = useUserRole()

const user = auth.user

const form = ref({
  display_name: user?.name || '',
  bio: user?.bio || '',
  teaching_subjects: (user?.teaching_subjects || []).join ? (user?.teaching_subjects || []).join(', ') : (user?.teaching_subjects || '')
})

const avatarPreview = ref(user?.avatar_url || user?.avatar || null)
let avatarFile = null

function onFile(e) {
  const input = e.target
  const f = input.files?.[0]
  if (!f) return
  avatarFile = f
  const url = URL.createObjectURL(f)
  avatarPreview.value = url
}

function reset() {
  form.value.display_name = user?.display_name || user?.name || ''
  form.value.bio = user?.bio || ''
  form.value.teaching_subjects = (user?.teaching_subjects || []).join ? (user?.teaching_subjects || []).join(', ') : (user?.teaching_subjects || '')
  avatarPreview.value = user?.avatar_url || user?.avatar || null
}

async function save() {
  try {
    if (!form.value.display_name || form.value.display_name.trim().length === 0) {
      alert.push({ type: 'error', message: 'Please enter a display name' })
      return
    }
    const data = new FormData()
    data.append('name', form.value.display_name)
    data.append('bio', form.value.bio)
  if (isQuizMaster.value) data.append('teaching_subjects', form.value.teaching_subjects || '')
    if (avatarFile) data.append('avatar', avatarFile)

    const json = await patchMe(data)
    auth.setUser(json)
    alert.push({ type: 'success', message: 'Profile updated', icon: 'heroicons:check' })
  } catch (e) {
    alert.push({ type: 'error', message: 'Failed to save profile', icon: 'heroicons:x-mark' })
  }
}
</script>

