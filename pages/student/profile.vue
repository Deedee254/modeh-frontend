<template>
  <div class="min-h-screen">
    <div class="max-w-4xl mx-auto space-y-6">
      <ProfileHeader
        :title="form.name || user?.name || 'Student'"
        :subtitle="user?.email"
        :avatar-url="preview || userAvatar"
      >
        <template #meta>
          <span v-if="pointsDisplay" class="inline-flex items-center gap-1 text-slate-700">
            <span class="inline-flex w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span class="font-medium">{{ pointsDisplay }}</span>
          </span>
        </template>
        <template #actions>
          <label for="student-avatar-upload" class="px-3 py-2 border rounded-md text-sm bg-white hover:bg-gray-50 cursor-pointer">
            Change photo
          </label>
          <input id="student-avatar-upload" type="file" @change="onFile" class="hidden" accept="image/*" />
        </template>
      </ProfileHeader>

      <UiCard class="shadow-sm">
        <template #header>
          <div class="text-sm font-semibold">Profile details</div>
        </template>
        <form @submit.prevent="submit" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="name" class="block text-sm font-medium text-slate-700">Name</label>
              <input id="name" v-model="form.name" class="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-slate-700">Email</label>
              <input id="email" v-model="form.email" class="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-50" readonly />
            </div>
          </div>

          <div>
            <label for="bio" class="block text-sm font-medium text-slate-700">Bio</label>
            <UiTextarea id="bio" v-model="form.bio" :rows="4" placeholder="Tell us about yourself" />
          </div>

          <div class="flex flex-col sm:flex-row justify-end gap-3">
            <NuxtLink to="/student/dashboard" class="px-4 py-2 border rounded-md text-sm bg-white hover:bg-gray-50 w-full sm:w-auto text-center">Cancel</NuxtLink>
            <button type="submit" class="px-4 py-2 rounded-md text-sm text-white bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">Save</button>
          </div>
        </form>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import ProfileHeader from '~/components/profile/ProfileHeader.vue'
import UiCard from '~/components/ui/UiCard.vue'
import UiTextarea from '~/components/ui/UiTextarea.vue'
import { useAppAlert } from '~/composables/useAppAlert'
import { useAccountApi } from '~/composables/useAccountApi'

definePageMeta({ layout: 'student' })

const auth = useAuthStore()
const alert = useAppAlert()
const { patchMe } = useAccountApi()

const user = computed(() => auth.user || {})
const userAvatar = computed(() => auth.user?.avatar_url || '/logo/avatar-placeholder.png')
const pointsDisplay = computed(() => {
  const p = (auth.user as any)?.points ?? (auth.user as any)?.rewards?.points
  return typeof p === 'number' ? `${p} points` : ''
})

const form = ref({ name: '', email: '', bio: '' })
const file = ref<File|null>(null)
const preview = ref<string|null>(null)

if (user.value) {
  form.value.name = (user.value as any).name || ''
  form.value.email = (user.value as any).email || ''
  form.value.bio = (user.value as any).bio || ''
}

function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  if (!f) return
  file.value = f
  const reader = new FileReader()
  reader.onload = (ev) => { preview.value = String(ev.target?.result || '') }
  reader.readAsDataURL(f)
}

async function submit() {
  try {
    const data = new FormData()
    data.append('name', form.value.name)
    data.append('bio', form.value.bio || '')
    if (file.value) data.append('avatar', file.value)
    await patchMe(data)
    await auth.fetchUser?.()
    alert.push({ type: 'success', message: 'Profile updated', icon: 'heroicons:check-circle' })
  } catch (e: any) {
    alert.push({ type: 'error', message: e?.message || 'Update failed', icon: 'heroicons:exclamation-circle' })
  }
}
</script>