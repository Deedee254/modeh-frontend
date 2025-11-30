<template>
  <PageHero
    title="Create Institution"
    description="Set up a new institution or branch organization"
    :breadcrumbs="[
      { text: 'Institution Manager', href: '/institution-manager/dashboard' },
      { text: 'Institutions', href: '/institution-manager/institutions' },
      { text: 'Create New', current: true }
    ]"
  >
    <template #eyebrow>
      Institution Setup
    </template>
  </PageHero>

  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

    <div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
      <div class="p-6 sm:p-8 border-b border-gray-200 dark:border-slate-700">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Create Institution</h2>
      </div>
      <div class="p-6 sm:p-8">
        <form @submit.prevent="submit" class="space-y-6 max-w-2xl">
          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Name *</label>
            <input
              v-model="name"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p v-if="fieldErrors.name" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ fieldErrors.name }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Email *</label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p v-if="fieldErrors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ fieldErrors.email }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Slug (optional)</label>
            <input
              v-model="slug"
              placeholder="short-slug-for-url"
              class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p v-if="fieldErrors.slug" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ fieldErrors.slug }}</p>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Lowercase letters, numbers, and hyphens (3-40 characters)</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Parent Institution (optional)</label>
            <input
              v-model="parent"
              placeholder="parent-slug to create a branch"
              class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Leave empty to create a top-level institution</p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200 dark:border-slate-700">
            <NuxtLink
              to="/institution-manager/institutions"
              class="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200 text-center font-medium"
            >
              Cancel
            </NuxtLink>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 bg-brand-600 hover:bg-brand-700 dark:hover:bg-brand-500 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              Create Institution
            </button>
          </div>

          <div v-if="error" class="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-200">
            {{ error }}
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'institution' })
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'
import PageHero from '~/components/ui/PageHero.vue'

const name = ref('')
const email = ref('')
const slug = ref('')
const parent = ref('')
const loading = ref(false)
const error = ref<any>(null)
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
