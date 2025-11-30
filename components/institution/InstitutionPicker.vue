<template>
  <div class="rounded-xl border bg-white dark:border-slate-700 dark:bg-slate-800/50 w-full min-h-0">
    <div class="p-2 sm:p-3">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div class="min-w-0">
          <h4 class="font-semibold text-xs sm:text-sm">{{ title }}</h4>
          <div class="text-xs text-slate-500">{{ subtitle }}</div>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>

    <div class="space-y-2 sm:space-y-3 p-2 sm:p-3">
      <div class="flex flex-col gap-2">
        <UInput
          ref="searchInput"
          :model-value="query"
          @update:modelValue="v => emit('update:query', v)"
          placeholder="Search institutions or type to add new..."
          @input="onSearch"
          size="sm"
          icon="i-heroicons-magnifying-glass"
          class="w-full text-xs sm:text-sm"
        />
        <UButton
          size="sm"
          variant="ghost"
          color="gray"
          @click="refresh"
          icon="i-heroicons-arrow-path"
          :loading="loading"
          class="w-full text-xs sm:text-sm"
        />
      </div>

      <div class="relative min-h-48 h-48 overflow-y-auto overflow-x-hidden rounded-md border bg-slate-50/50 p-1 dark:border-slate-700 dark:bg-slate-900/20 w-full">
        <div v-show="loading" class="p-1">
          <div class="space-y-1 p-1">
            <UiSelectSkeleton v-for="n in 6" :key="n" />
          </div>
        </div>

        <div v-show="!loading && items.length > 0">
          <ul class="divide-y divide-slate-200/50 dark:divide-slate-700/50">
            <li
              v-for="item in items"
              :key="item.id"
              class="min-w-0 flex cursor-pointer items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 py-2 px-3"
              :class="[isSelected(item) ? 'bg-brand-50 dark:bg-brand-900/30' : '']"
              @click="select(item, false)"
            >
              <div class="flex-1 min-w-0">
                <div
                  class="font-normal sm:font-medium break-words whitespace-normal leading-tight text-slate-800 dark:text-slate-200 text-xs sm:text-sm"
                  :class="[isSelected(item) ? 'text-brand-700 dark:text-brand-300' : '']"
                  :title="item.name"
                >
                  {{ item.name }}
                </div>
                <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ item.email || 'Existing Institution' }}</div>
              </div>
              <UIcon
                v-if="isSelected(item)"
                name="i-heroicons-check-circle-20-solid"
                class="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0"
              />
            </li>
          </ul>
        </div>

        <!-- Allow creating new institution if there's a search query and no exact match -->
        <div v-show="!loading && canCreateNew" class="p-1">
          <button
            @click="selectNewInstitution"
            class="w-full flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 py-2 px-3 rounded text-left"
          >
            <div class="flex-1 min-w-0">
              <div class="font-medium break-words whitespace-normal leading-tight text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                ➕ Create: {{ query }}
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">New institution (not in directory)</div>
            </div>
          </button>
        </div>

        <div v-show="!loading && items.length === 0 && !canCreateNew">
          <div class="flex h-full flex-col items-center justify-center text-center">
            <UIcon name="i-heroicons-circle-stack" class="h-10 w-10 text-slate-400" />
            <h5 class="mt-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">No Results Found</h5>
            <p class="text-xs text-slate-500 dark:text-slate-400">Your search for "{{ query }}" did not return any results.</p>
          </div>
        </div>
      </div>

      <div v-if="meta && meta.total > (effectivePerPage || 0)" class="flex justify-center pt-2">
        <UPagination :model-value="page" @change="(p) => (page = p)" :per-page="effectivePerPage" :total="meta.total" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useApi } from '~/composables/useApi'
import UiSelectSkeleton from '~/components/ui/UiSelectSkeleton.vue'

const props = defineProps({
  modelValue: { type: [String, Number, Object, null], default: null },
  query: { type: String, default: '' },
  perPage: { type: Number, default: 50 },
  title: { type: String, default: 'Select Institution' },
  subtitle: { type: String, default: 'Choose from existing or create new' },
  compact: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'update:query', 'selected'])

const api = useApi()
const items = ref([])
const meta = ref(null)
const loading = ref(false)
const page = ref(1)
const searchInput = ref(null)

function extractId(val) {
  if (val === null || typeof val === 'undefined') return null
  if (typeof val === 'object') {
    if (val.id != null) return val.id
    if (val.value != null) return val.value
  }
  return val
}

function resolveModelItem() {
  const mv = props.modelValue
  if (!mv || (typeof mv === 'string' && mv.trim() === '')) return null
  if (typeof mv === 'object') {
    const id = extractId(mv)
    if (id == null) return null
    return { ...mv, id }
  }
  return null
}

function ensureModelPresent() {
  const modelItem = resolveModelItem()
  if (!modelItem) return
  const id = extractId(modelItem)
  if (id == null) return
  const target = String(id)
  for (let i = 0; i < items.value.length; i++) {
    const existing = items.value[i]
    const existingId = extractId(existing)
    if (existingId != null && String(existingId) === target) {
      if (typeof existing === 'object' && existing !== null) {
        items.value.splice(i, 1, { ...existing, ...modelItem })
      } else {
        items.value.splice(i, 1, modelItem)
      }
      return
    }
  }
  items.value = [modelItem, ...items.value]
}

const effectivePerPage = computed(() => {
  if (!meta.value) return props.perPage
  return meta.value.per_page ?? meta.value.perPage ?? props.perPage
})

const canCreateNew = computed(() => {
  if (!props.query || props.query.trim() === '') return false
  // Don't show create option if an exact match exists
  return !items.value.some(item => item.name.toLowerCase() === props.query.toLowerCase())
})

watch(() => props.modelValue, () => {
  ensureModelPresent()
}, { deep: true, immediate: true })

let debounce = null

function onSearch() {
  clearTimeout(debounce)
  debounce = setTimeout(() => {
    page.value = 1
    fetchPage()
  }, 300)
}

async function fetchPage() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.set('page', String(page.value))
    params.set('per_page', String(props.perPage))
    if (props.query && props.query.trim()) {
      params.set('search', props.query.trim())
    }

    const resp = await api.get(`/api/institutions?${params.toString()}`)
    if (api.handleAuthStatus(resp)) {
      items.value = []
      meta.value = null
      loading.value = false
      return
    }

    const json = await api.parseResponse(resp)
    items.value = json?.data || []
    meta.value = json?.meta || null
    ensureModelPresent()
  } catch (e) {
    console.error('Error fetching institutions:', e)
    items.value = []
    meta.value = null
    ensureModelPresent()
  } finally {
    loading.value = false
  }
}

watch(page, () => {
  fetchPage()
})

function isSelected(item) {
  if (!props.modelValue || !item) return false
  const modelId = typeof props.modelValue === 'object' && props.modelValue !== null ? props.modelValue.id : props.modelValue
  const itemId = typeof item === 'object' && item !== null ? item.id : item
  return modelId != null && itemId != null && String(modelId) === String(itemId)
}

function select(item, isNew = false) {
  const newVal = item?.id ?? item?.value ?? item ?? null
  try {
    emit('update:modelValue', newVal)
  } catch (e) {}
  emit('selected', { ...item, is_new: isNew })
}

function selectNewInstitution() {
  const newInstitution = {
    id: null,
    name: props.query.trim(),
    is_new: true,
    type: 'new'
  }
  try {
    emit('update:modelValue', newInstitution)
  } catch (e) {}
  emit('selected', newInstitution)
}

function refresh() {
  page.value = 1
  emit('update:query', '')
  fetchPage()
}

onMounted(() => fetchPage())

function focusSearch() {
  try {
    if (searchInput.value) {
      if (typeof searchInput.value.focus === 'function') {
        searchInput.value.focus()
        return
      }
      const el = searchInput.value.$el || searchInput.value
      const input = el && el.querySelector ? el.querySelector('input') : null
      if (input && typeof input.focus === 'function') input.focus()
    }
  } catch (e) {
    // ignore
  }
}

defineExpose({ focusSearch })
</script>
