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
            <UInput ref="searchInput" :model-value="query" @update:modelValue="v => emit('update:query', v)" placeholder="Search..." @input="onSearch" size="sm" icon="i-heroicons-magnifying-glass" class="w-full text-xs sm:text-sm" />
            <UButton size="sm" variant="ghost" color="gray" @click="refresh" icon="i-heroicons-arrow-path" :loading="loading" class="w-full text-xs sm:text-sm" />
          </div>

  <div class="relative min-h-48 h-48 overflow-y-auto overflow-x-hidden rounded-md border bg-slate-50/50 p-1 dark:border-slate-700 dark:bg-slate-900/20 w-full">
        <div v-show="loading" class="p-1">
          <div class="space-y-1 p-1">
            <UiSelectSkeleton v-for="n in 1" :key="n" />
          </div>
        </div>
        <div v-show="!loading && items.length > 0">
          <ul class="divide-y divide-slate-200/50 dark:divide-slate-700/50">
            <li v-for="item in items" :key="item.id" class="min-w-0 flex cursor-pointer items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800" :class="[ props.compact ? 'py-1.5 px-2' : 'py-2 px-3', isSelected(item) ? 'bg-brand-50 dark:bg-brand-900/30' : '' ]" @click="select(item)">
              <div class="flex-1 min-w-0">
                <div class="font-normal sm:font-medium break-words whitespace-normal leading-tight text-slate-800 dark:text-slate-200 text-xs sm:text-sm" :class="[ isSelected(item) ? 'text-brand-700 dark:text-brand-300' : '' ]" :title="item.display_name || item.name">{{ item.display_name || item.name }}</div>
              </div>
              <UIcon v-if="isSelected(item)" name="i-heroicons-check-circle-20-solid" class="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
            </li>
          </ul>
        </div>
        <div v-show="!loading && items.length === 0">
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
import { useTaxonomyStore } from '~/stores/taxonomyStore'
import UiSelectSkeleton from '~/components/ui/UiSelectSkeleton.vue'

const props = defineProps({
  modelValue: { type: [String, Number, Object, null], default: null },
  query: { type: String, default: '' },
  resource: { type: String, required: true }, // 'subjects' or 'topics'
  gradeId: { type: [String, Number], default: null },
  levelId: { type: [String, Number], default: null },
  subjectId: { type: [String, Number], default: null },
  perPage: { type: Number, default: 50 },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  compact: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'update:query', 'selected'])

const items = ref([])
const meta = ref(null)
const loading = ref(false)
const page = ref(1)
const searchInput = ref(null)

const store = useTaxonomyStore()

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
  return (meta.value.per_page ?? meta.value.perPage ?? props.perPage)
})

watch([() => props.gradeId, () => props.subjectId], () => { 
  page.value = 1; 
  emit('update:query', '');
  fetchPage();
})

// when levelId changes, refetch (affects grades resource which filters by level)
watch(() => props.levelId, () => {
  page.value = 1
  emit('update:query', '')
  fetchPage()
})

watch(() => props.modelValue, () => {
  ensureModelPresent()
}, { deep: true, immediate: true })

let debounce = null
function onSearch() {
  clearTimeout(debounce)
  // don't start subject searches until a grade is selected
  if (props.resource === 'subjects' && (props.gradeId === null || props.gradeId === undefined || props.gradeId === '')) {
    // clear results while waiting for grade selection
    items.value = []
    meta.value = null
    return
  }
  // don't start topic searches until a subject is selected
  if (props.resource === 'topics' && (props.subjectId === null || props.subjectId === undefined || props.subjectId === '')) {
    items.value = []
    meta.value = null
    return
  }
  debounce = setTimeout(() => { page.value = 1; fetchPage(); }, 300)
}

async function fetchPage() {
  loading.value = true
  // For subjects we require a gradeId before searching to ensure server receives grade filter
  if (props.resource === 'subjects' && (props.gradeId === null || props.gradeId === undefined || props.gradeId === '')) {
    items.value = []
    meta.value = null
    ensureModelPresent()
    loading.value = false
    return
  }
  // For topics we require a subjectId before searching to ensure server receives subject filter
  if (props.resource === 'topics' && (props.subjectId === null || props.subjectId === undefined || props.subjectId === '')) {
    items.value = []
    meta.value = null
    ensureModelPresent()
    loading.value = false
    return
  }

  const resourceHandlers = {
    subjects: async () => {
      // Use store method if gradeId is provided
      if (!props.gradeId) {
        return { items: [], meta: null }
      }
      try {
        await store.fetchSubjectsByGrade(props.gradeId)
      } catch (e) {
        return { items: [], meta: null }
      }
      const fetched = (store.subjects) ? store.subjects.slice() : []
      return { items: fetched, meta: null }
    },
    topics: async () => {
      const out = await store.fetchTopicsPage({ gradeId: props.gradeId, levelId: props.levelId, subjectId: props.subjectId, page: page.value, perPage: props.perPage, q: props.query });
      let fetched = out.items || [];
      if (props.subjectId) {
        const sKey = String(props.subjectId);
        fetched = fetched.filter(t => {
          const s = t?.subject_id ?? t?.subject ?? (t?.subject && typeof t.subject === 'object' ? t.subject.id : null) ?? '';
          return String(s) === sKey;
        });
      }
      return { items: fetched, meta: out.meta };
    },
    grades: async () => {
      await store.fetchGrades();
      let list = store.grades || [];
      if (props.levelId) {
        list = list.filter(g => String(g.level_id || g.levelId || g.level || '') === String(props.levelId));
      }
      return { items: list, meta: null };
    },
    levels: async () => {
      await store.fetchLevels();
      let list = store.levels || [];
      if (props.query && String(props.query).trim()) {
        const qlow = String(props.query).toLowerCase();
        list = list.filter(l => String(l.name || '').toLowerCase().includes(qlow));
      }
      return { items: list, meta: null };
    }
  };

  const handler = resourceHandlers[props.resource];

  try {
    if (handler) {
      const out = await handler();
      items.value = out.items;
      meta.value = out.meta;
    } else {
      console.error(`TaxonomyPicker: Unknown resource type "${props.resource}"`);
      items.value = [];
    }
    ensureModelPresent()
  } catch (e) {
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
  if (!props.modelValue || !item) return false;
  const modelId = (typeof props.modelValue === 'object' && props.modelValue !== null) ? props.modelValue.id : props.modelValue;
  const itemId = (typeof item === 'object' && item !== null) ? item.id : item;
  return modelId != null && itemId != null && String(modelId) === String(itemId);
}

function select(item) {
  // Emit a model update for v-model usage. Prefer the item's id/value when present
  const newVal = item?.id ?? item?.value ?? item ?? null
  try { emit('update:modelValue', newVal) } catch (e) {}
  emit('selected', item);
}
function refresh() { page.value = 1; emit('update:query', ''); fetchPage(); }

onMounted(() => fetchPage())

// expose a small helper so parent components can focus the search box (auto-open behavior)
function focusSearch() {
  try {
    if (searchInput.value) {
      // If the component exposes focus, call it
      if (typeof searchInput.value.focus === 'function') {
        searchInput.value.focus()
        return
      }
      // Otherwise try to focus the inner input element
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

