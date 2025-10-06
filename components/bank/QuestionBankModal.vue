<template>
  <UModal v-model="open" :ui="{ width: 'sm:max-w-4xl' }">
    <div class="p-4 sm:p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">Add from Question Bank</h3>
        <UButton color="gray" variant="ghost" @click="open=false">Close</UButton>
      </div>

      <div class="flex items-center gap-2 mb-4">
        <UInput v-model="q" placeholder="Search..." size="sm" class="w-64" @keydown.enter="fetchItems" />
        <USelect v-model="perPage" :options="perPageOpts" size="sm" class="w-28" />
        <UButton size="sm" @click="fetchItems">Search</UButton>
      </div>

      <div v-if="loading"><UiSkeleton variant="list" :count="4"/></div>
      <div v-else>
        <div v-if="items.length===0" class="text-gray-500">No questions found.</div>
        <div class="space-y-3">
          <div v-for="it in items" :key="it.id" class="border rounded p-3">
            <div class="font-medium">{{ it.title || it.type }}</div>
            <div class="prose max-w-none text-sm" v-html="it.body || it.text"></div>
            <div class="mt-2 flex items-center gap-2">
              <UButton size="2xs" @click="() => add(it)">Add</UButton>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-gray-600">{{ paginator?.total || 0 }} results</div>
        <div class="flex items-center gap-2">
          <UButton size="xs" color="gray" :disabled="page<=1" @click="() => { page--; fetchItems() }">Prev</UButton>
          <span class="text-sm">Page {{ page }}</span>
          <UButton size="xs" color="gray" :disabled="page>=maxPage" @click="() => { page++; fetchItems() }">Next</UButton>
        </div>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import { useRuntimeConfig } from '#imports'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue', 'add'])

const open = ref(props.modelValue)
watch(() => props.modelValue, v => open.value = v)
watch(open, v => emit('update:modelValue', v))

const q = ref('')
const perPage = ref(10)
const page = ref(1)
const items = ref<any[]>([])
const paginator = ref<any>(null)
const loading = ref(false)
const perPageOpts = [5,10,20].map(v => ({ label: String(v), value: v }))
const maxPage = computed(() => paginator.value ? Math.ceil((paginator.value.total || 0) / (paginator.value.per_page || 10)) : 1)
const config = useRuntimeConfig()

async function fetchItems() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (q.value) params.set('q', q.value)
    params.set('per_page', String(perPage.value))
    params.set('page', String(page.value))
  const res = await fetch(config.public.apiBase + '/api/question-bank?' + params.toString(), { credentials: 'include' })
    if (res.ok) {
      const json = await res.json()
      paginator.value = json.questions || json
      items.value = paginator.value.data || []
    } else {
      items.value = []
    }
  } catch {
    items.value = []
  }
  loading.value = false
}

function add(it: any) {
  // Normalize to the builder shape
  const q = {
    uid: Math.random().toString(36).slice(2),
    type: (it.type?.startsWith('mcq') ? it.type : (it.type || 'mcq')),
    text: it.body || it.text || '',
    options: Array.isArray(it.options) ? it.options : [],
    correct: Array.isArray(it.answers) && it.answers.length ? it.answers[0] : -1,
    corrects: Array.isArray(it.answers) ? it.answers : [],
    difficulty: Number(it.difficulty || 2),
    marks: Number(it.marks || 1),
    fill_parts: it.fill_parts || ['', ''],
    media: null,
    explanation: it.explanation || '',
    open: true,
    is_banked: true,
  }
  emit('add', q)
}

onMounted(fetchItems)
</script>