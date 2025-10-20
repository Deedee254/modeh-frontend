<template>
  <div class="rounded-xl border bg-white dark:border-slate-700 dark:bg-slate-800/50">
    <div class="p-3">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-semibold text-sm">{{ title }}</h4>
          <div class="text-xs text-slate-500">{{ subtitle }}</div>
        </div>
        <div class="flex items-center gap-2">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>

    <div class="space-y-3 p-3">
          <div class="flex items-center gap-2">
            <UInput ref="searchInput" v-model="query" placeholder="Search..." @input="onSearch" size="sm" icon="i-heroicons-magnifying-glass" class="flex-grow" />
            <UButton size="sm" variant="ghost" color="gray" @click="refresh" icon="i-heroicons-arrow-path" :loading="loading" />
          </div>

      <div class="relative h-48 overflow-y-auto rounded-md border bg-slate-50/50 p-1 dark:border-slate-700 dark:bg-slate-900/20">
        <div v-show="loading" class="p-1">
          <div class="space-y-1 p-1">
            <UiSelectSkeleton v-for="n in 6" :key="n" />
          </div>
        </div>
        <div v-show="!loading && items.length > 0">
          <ul class="divide-y divide-slate-200/50 dark:divide-slate-700/50">
            <li v-for="item in items" :key="item.id" :class="['flex cursor-pointer items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800', props.compact ? 'py-1.5 px-2' : 'py-2 px-3', { 'bg-indigo-50 dark:bg-indigo-900/30': isSelected(item) }]" @click="select(item)">
              <div class="flex-1">
                <div :class="['font-medium', props.compact ? 'text-xs' : 'text-sm', 'text-slate-800 dark:text-slate-200', { 'text-indigo-700 dark:text-indigo-300': isSelected(item) }]">{{ item.name }}</div>
              </div>
              <UIcon v-if="isSelected(item)" name="i-heroicons-check-circle-20-solid" class="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </li>
          </ul>
        </div>
        <div v-show="!loading && items.length === 0">
          <div class="flex h-full flex-col items-center justify-center text-center">
            <UIcon name="i-heroicons-circle-stack" class="h-10 w-10 text-slate-400" />
            <h5 class="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">No Results Found</h5>
            <p class="text-xs text-slate-500 dark:text-slate-400">Your search for "{{ query }}" did not return any results.</p>
          </div>
        </div>
      </div>

      <div v-if="meta && meta.total > (meta.per_page || 0)" class="flex justify-center pt-2">
        <UPagination v-model="page" :page-count="meta.per_page" :total="meta.total" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import useTaxonomy from '~/composables/useTaxonomy'
import UiSelectSkeleton from '~/components/ui/UiSelectSkeleton.vue'

const props = defineProps({
  modelValue: { type: [String, Number, Object, null], default: null },
  resource: { type: String, required: true }, // 'subjects' or 'topics'
  gradeId: { type: [String, Number], default: null },
  subjectId: { type: [String, Number], default: null },
  perPage: { type: Number, default: 50 },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  compact: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'selected'])

const query = ref('')
const items = ref([])
const meta = ref(null)
const loading = ref(false)
const page = ref(1)
const searchInput = ref(null)

const { fetchSubjectsPage, fetchTopicsPage } = useTaxonomy()

watch([() => props.gradeId, () => props.subjectId], () => { 
  page.value = 1; 
  query.value = '';
  fetchPage();
})

let debounce = null
function onSearch() {
  clearTimeout(debounce)
  debounce = setTimeout(() => { page.value = 1; fetchPage() }, 300)
}

async function fetchPage() {
  loading.value = true
  const fetcherMap = {
    subjects: fetchSubjectsPage,
    topics: fetchTopicsPage,
  };
  const fetcher = fetcherMap[props.resource];
  if (!fetcher) {
    console.error(`TaxonomyPicker: Unknown resource type "${props.resource}"`);
    items.value = [];
    loading.value = false;
    return;
  }

  try {
    const out = await fetcher({ gradeId: props.gradeId, subjectId: props.subjectId, page: page.value, perPage: props.perPage, q: query.value });
    items.value = out.items || [];
    meta.value = out.meta;
  } catch (e) {
    items.value = []
    meta.value = null
  } finally {
    loading.value = false
  }
}

watch(page, () => {
  fetchPage()
})

function isSelected(item) {
  if (!props.modelValue || !item) return false;
  const modelId = typeof props.modelValue === 'object' ? props.modelValue.id : props.modelValue;
  const itemId = item.id ?? item.value;
  return String(modelId) === String(itemId);
}

function select(item) {
  // Emit a model update for v-model usage. Prefer the item's id/value when present
  const newVal = item?.id ?? item?.value ?? item ?? null
  try { emit('update:modelValue', newVal) } catch (e) {}
  emit('selected', item)
}
function refresh() { page.value = 1; query.value = ''; fetchPage() }

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
