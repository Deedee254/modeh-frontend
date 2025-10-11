<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto p-4 sm:p-6 lg:p-8">
      <div class="max-w-4xl mx-auto space-y-6">
        <ProfileHeader
          :title="form.name || user?.name || 'quiz-master'"
          :subtitle="user?.email"
          :avatar-url="preview || userAvatar"
          cover-url="/placeholder/cover.jpg"
        >
          <template #actions>
            <label for="file-upload" class="px-3 py-2 border rounded-md text-sm bg-white hover:bg-gray-50 cursor-pointer">
              Change photo
            </label>
            <input id="file-upload" type="file" @change="onFile" class="hidden" />
          </template>
          <template #meta>
            <span v-if="user?.wallet" class="inline-flex items-center gap-1">
              <svg class="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="currentColor"><path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM3 6h18v12H3V6zm1 12h16v-2H4v2zm0-4h16V8H4v6z"/></svg>
              <span class="font-medium">${{ user.wallet }}</span>
            </span>
          </template>
        </ProfileHeader>

        <div class="rounded-xl border bg-white shadow-sm p-6">
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
              <textarea id="bio" v-model="form.bio" rows="4" class="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
            </div>

            <div class="flex flex-col sm:flex-row justify-end gap-3">
              <NuxtLink to="/quiz-master/dashboard" class="px-4 py-2 border rounded-md text-sm bg-white hover:bg-gray-50 w-full sm:w-auto text-center">Cancel</NuxtLink>
              <button type="submit" class="px-4 py-2 rounded-md text-sm text-white bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'quiz-master' })
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import ProfileHeader from '~/components/profile/ProfileHeader.vue'
import { useAppAlert } from '~/composables/useAppAlert'
import { useAccountApi } from '~/composables/useAccountApi'

const auth = useAuthStore()
const { patchMe } = useAccountApi()
const alert = useAppAlert()

interface User {
  name?: string
  email?: string
  bio?: string
  avatar_url?: string
  wallet?: number
}

const user = computed<User>(() => (auth.user ? auth.user : {}))
const userAvatar = computed(() => user.value.avatar_url || '/logo/avatar-placeholder.png')

const form = ref({ name: '', email: '', bio: '' })
const file = ref<File|null>(null)
const preview = ref<string|null>(null)
const errors = ref<Record<string,string>>({})

if (user.value) {
  form.value.name = user.value.name || ''
  form.value.email = user.value.email || ''
  form.value.bio = user.value.bio || ''
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
  errors.value = {}
  if (!form.value.name || form.value.name.length < 2) {
    errors.value.name = 'Name must be at least 2 characters.'
  }
  if (Object.keys(errors.value).length) {
    alert.push({
      type: 'error',
      message: Object.values(errors.value)[0] ?? 'Unknown error',
      icon: 'heroicons:exclamation-circle'
    })
    return
  }

  const data = new FormData()
  data.append('name', form.value.name)
  data.append('bio', form.value.bio)
  if (file.value) {
    data.append('avatar', file.value)
  }

  try {
    await patchMe(data)
    await auth.fetchUser()
    alert.push({ type: 'success', message: 'Profile updated', icon: 'heroicons:check-circle' })
  } catch (e: any) {
    alert.push({ type: 'error', message: e?.message || 'Update failed', icon: 'heroicons:exclamation-circle' })
  }
}
</script>

<style scoped>
</style>
