<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4">Create Institution / Branch</h1>

    <form @submit.prevent="submit" class="space-y-4 bg-white p-6 rounded shadow">
      <div>
        <label class="block text-sm font-medium text-slate-700">Name</label>
        <input v-model="name" required class="mt-1 block w-full rounded border px-3 py-2" />
        <p v-if="fieldErrors.name" class="mt-1 text-sm text-red-600">{{ fieldErrors.name }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700">Email</label>
        <input v-model="email" type="email" required class="mt-1 block w-full rounded border px-3 py-2" />
        <p v-if="fieldErrors.email" class="mt-1 text-sm text-red-600">{{ fieldErrors.email }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700">Slug (optional)</label>
        <input v-model="slug" placeholder="short-slug-for-url" class="mt-1 block w-full rounded border px-3 py-2" />
        <p v-if="fieldErrors.slug" class="mt-1 text-sm text-red-600">{{ fieldErrors.slug }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700">Parent institution (slug, optional — create a branch)</label>
        <input v-model="parent" placeholder="parent-slug (leave empty to create top-level institution)" class="mt-1 block w-full rounded border px-3 py-2" />
      </div>

      <div class="flex items-center justify-end">
        <button :disabled="loading" type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded">Create</button>
      </div>
    </form>

    <div v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'

const name = ref('')
const email = ref('')
const slug = ref('')
const parent = ref('')
const loading = ref(false)
const error = ref(null)
const fieldErrors = ref({ name: '', email: '', slug: '' })

// validation rules
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const api = useApi()
const router = useRouter()
const route = useRoute()
const alert = useAppAlert()

async function submit() {
  loading.value = true
  error.value = null
  // clear field errors
  fieldErrors.value = { name: '', email: '', slug: '' }

  // basic client-side validation
  if (!name.value || !name.value.trim()) {
    fieldErrors.value.name = 'Name is required'
  }
  if (!email.value || !emailRegex.test(email.value)) {
    fieldErrors.value.email = 'Please enter a valid email address'
  }
  if (slug.value) {
    const s = slug.value.trim().toLowerCase()
    if (s.length < 3 || s.length > 40 || !slugRegex.test(s)) {
      fieldErrors.value.slug = 'Slug must be 3-40 characters, only lowercase letters, numbers and dashes'
    }
    // normalize slug for submission
    slug.value = s
  }

  if (fieldErrors.value.name || fieldErrors.value.email || fieldErrors.value.slug) {
    loading.value = false
    return
  }

  try {
    const body = {
      name: name.value,
      email: email.value,
    }
    if (slug.value) body['slug'] = slug.value
    if (parent.value) body['parent'] = parent.value

    const resp = await api.postJson('/api/institutions', body)
    const json = await api.parseResponse(resp)
    if (resp.ok) {
      alert.push({ message: 'Institution created', type: 'success' })
      const newSlug = json?.institution?.slug || slug.value
      if (newSlug) {
        await router.push(`/institution-manager/institutions/${newSlug}/analytics`)
      } else {
        await router.push('/institution-manager/institutions')
      }
    } else {
      // Map validation errors into the inline fields when possible
      if (json?.errors) {
        for (const k of Object.keys(json.errors)) {
          const v = json.errors[k]
          const msg = Array.isArray(v) ? v[0] : v
          if (k in fieldErrors.value) fieldErrors.value[k] = msg
          else error.value = msg
        }
      } else {
        error.value = json?.message || 'Failed to create institution'
        alert.push({ message: error.value, type: 'error' })
      }
    }
  } catch (e) {
    error.value = e?.message || String(e)
    alert.push({ message: 'Failed to create: ' + error.value, type: 'error' })
  } finally { loading.value = false }
}

// Prefill parent field when ?parent=slug or ?institutionSlug=slug passed
onMounted(() => {
  const p = route.query.parent || route.query.institutionSlug || route.query.parentSlug
  if (p) parent.value = String(p)
})
</script>
