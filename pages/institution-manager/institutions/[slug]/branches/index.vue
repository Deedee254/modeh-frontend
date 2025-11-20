<template>
	<div class="p-6">
		<h1 class="text-2xl font-semibold mb-4">Branches</h1>

		<div v-if="loading" class="text-gray-500">Loading…</div>
		<div v-else>
			<div v-if="!children || children.length === 0" class="p-4 bg-yellow-50 border rounded">No branches for this institution.</div>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div v-for="b in children" :key="b.id" class="border rounded p-4">
					<div class="flex items-center justify-between">
						<div>
							<div class="font-medium">{{ b.name }}</div>
							<div class="text-sm text-slate-500">{{ b.email }} — {{ b.slug }}</div>
						</div>
						<div>
							<NuxtLink :to="`/institution-manager/institutions/${parentSlug}/branches/${b.slug}`" class="text-sm text-indigo-600 underline">View</NuxtLink>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '~/composables/useApi'

const route = useRoute()
const parentSlug = route.params.slug || route.query.institutionSlug || null
const api = useApi()
const loading = ref(false)
const children = ref([])

async function load() {
	if (!parentSlug) return
	loading.value = true
	try {
		const resp = await api.get(`/api/institutions/${parentSlug}`)
		const json = await api.parseResponse(resp)
		children.value = json?.children || []
	} catch (e) { children.value = [] }
	finally { loading.value = false }
}

await load()
</script>

