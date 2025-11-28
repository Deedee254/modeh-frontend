<template>
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
			<div>
				<h1 class="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">Branches</h1>
				<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage branches and sub-institutions</p>
			</div>
			<button
				@click="showCreateModal = true"
				class="w-full sm:w-auto px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors duration-200"
			>
				+ Create Branch
			</button>
		</div>

		<div v-if="loading" class="flex justify-center py-12">
			<div class="animate-spin h-8 w-8 text-brand-600"></div>
		</div>
		<div v-else>
			<div v-if="!children || children.length === 0" class="p-4 sm:p-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-center">
				<p class="text-sm text-amber-900 dark:text-amber-100">No branches yet. Create one to get started!</p>
			</div>
			<div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				<div v-for="b in children" :key="b.id" class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
					<div class="flex flex-col h-full">
						<div class="flex-1">
							<div class="font-semibold text-gray-900 dark:text-white">{{ b.name }}</div>
							<div class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ b.email }}</div>
							<div class="text-xs text-gray-500 dark:text-gray-500 mt-2 font-mono">{{ b.slug }}</div>
						</div>
						<div class="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
							<NuxtLink :to="`/institution-manager/institutions/${parentSlug}/branches/${b.slug}`" class="text-sm text-brand-600 dark:text-brand-400 hover:underline font-medium">
								View Branch →
							</NuxtLink>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Create Branch Modal -->
		<div v-if="showCreateModal" class="fixed inset-0 z-50 overflow-y-auto">
			<!-- Backdrop -->
			<div class="fixed inset-0 bg-black bg-opacity-50" @click="showCreateModal = false"></div>

			<!-- Modal Content -->
			<div class="flex items-center justify-center min-h-screen p-4 sm:p-0">
				<div class="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl">
					<!-- Header -->
					<div class="flex items-center justify-between p-6 sm:p-8 border-b border-gray-200 dark:border-slate-700">
						<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Create New Branch</h2>
						<button
							@click="showCreateModal = false"
							type="button"
							class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
						>
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
							</svg>
						</button>
					</div>

					<!-- Form -->
					<form @submit.prevent="submitBranch" class="p-6 sm:p-8 space-y-6">
						<div>
							<label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Branch Name *</label>
							<input
								v-model="branchName"
								required
								type="text"
								placeholder="e.g., Main Office, Downtown Branch"
								class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
							/>
							<p v-if="fieldErrors.name" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ fieldErrors.name }}</p>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Email *</label>
							<input
								v-model="branchEmail"
								required
								type="email"
								placeholder="branch@example.com"
								class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
							/>
							<p v-if="fieldErrors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ fieldErrors.email }}</p>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Slug (optional)</label>
							<input
								v-model="branchSlug"
								type="text"
								placeholder="branch-slug"
								class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
							/>
							<p v-if="fieldErrors.slug" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ fieldErrors.slug }}</p>
							<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Lowercase letters, numbers, and hyphens (3-40 characters)</p>
						</div>

						<div v-if="error" class="p-3 sm:p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-200">
							{{ error }}
						</div>

						<div class="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
							<button
								type="button"
								@click="showCreateModal = false"
								class="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200 font-medium"
							>
								Cancel
							</button>
							<button
								type="submit"
								:disabled="creatingBranch"
								class="px-4 py-2 bg-brand-600 hover:bg-brand-700 dark:hover:bg-brand-500 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
							>
								{{ creatingBranch ? 'Creating...' : 'Create Branch' }}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'institution' })
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'

const route = useRoute()
const parentSlug = (route.params.slug || route.query.institutionSlug) as string
const api = useApi()
const appAlert = useAppAlert()

const loading = ref(false)
const children = ref([] as any[])
const showCreateModal = ref(false)
const creatingBranch = ref(false)

const branchName = ref('')
const branchEmail = ref('')
const branchSlug = ref('')
const error = ref(null as any)
const fieldErrors = ref<Record<string, string>>({ name: '', email: '', slug: '' })

// Validation regex
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function load() {
	if (!parentSlug) return
	loading.value = true
	try {
		const resp = await api.get(`/api/institutions/${parentSlug}`)
		const json = await api.parseResponse(resp)
		children.value = json?.children || []
	} catch (e) {
		children.value = []
	} finally {
		loading.value = false
	}
}

async function submitBranch() {
	creatingBranch.value = true
	error.value = null
	fieldErrors.value = { name: '', email: '', slug: '' }

	// Validation
	if (!branchName.value || !branchName.value.trim()) {
		fieldErrors.value.name = 'Branch name is required'
	}
	if (!branchEmail.value || !emailRegex.test(branchEmail.value)) {
		fieldErrors.value.email = 'Please enter a valid email address'
	}
	if (branchSlug.value) {
		const s = branchSlug.value.trim().toLowerCase()
		if (s.length < 3 || s.length > 40 || !slugRegex.test(s)) {
			fieldErrors.value.slug = 'Slug must be 3-40 characters, only lowercase letters, numbers and dashes'
		}
		branchSlug.value = s
	}

	if (fieldErrors.value.name || fieldErrors.value.email || fieldErrors.value.slug) {
		creatingBranch.value = false
		return
	}

	try {
		const body: Record<string, string> = {
			name: branchName.value.trim(),
			email: branchEmail.value.trim(),
			parent: parentSlug
		}
		if (branchSlug.value) {
			body.slug = branchSlug.value
		}

		const resp = await api.postJson('/api/institutions', body)
		const json = await api.parseResponse(resp)

		if (resp.ok) {
			appAlert.push({ message: 'Branch created successfully', type: 'success' })
			showCreateModal.value = false
			branchName.value = ''
			branchEmail.value = ''
			branchSlug.value = ''
			await load()
		} else {
			// Map validation errors
			if (json?.errors) {
				for (const k of Object.keys(json.errors)) {
					const v = json.errors[k]
					const msg = Array.isArray(v) ? v[0] : v
					if (k in fieldErrors.value) fieldErrors.value[k] = msg
					else error.value = msg
				}
			} else {
				error.value = json?.message || 'Failed to create branch'
				appAlert.push({ message: error.value, type: 'error' })
			}
		}
	} catch (e: any) {
		error.value = e?.message || String(e)
		appAlert.push({ message: 'Failed to create branch: ' + error.value, type: 'error' })
	} finally {
		creatingBranch.value = false
	}
}

await load()
</script>

