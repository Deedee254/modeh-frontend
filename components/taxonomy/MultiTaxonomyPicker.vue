<template>
  <div>
    <!-- Use the existing TaxonomyPicker for searching/pagination when a gradeId/levelId/subjectId is provided
         or when resource is not 'subjects' (TaxonomyPicker already handles levels/grades/topics well). -->
    <div v-if="usePicker">
      <TaxonomyPicker
        :resource="resource"
        :grade-id="gradeId"
        :level-id="levelId"
        :subject-id="subjectId"
        :per-page="perPage"
        :model-value="lastPicked"
        :query="query"
        :compact="compact"
        @selected="onPick"
        @update:query="(v) => query = v"
      />
    </div>

    <!-- Fallback: show a simple list when subjects are available but no gradeId is provided
         (TaxonomyPicker would otherwise show empty results). -->
    <div v-else class="space-y-2">
      <div class="relative h-48 overflow-y-auto overflow-x-hidden rounded-md border bg-slate-50/50 p-1">
        <div v-if="loadingItems" class="p-3 text-sm text-slate-500">Loading subjects…</div>
        <ul v-else class="divide-y divide-slate-200/50">
          <li v-for="item in items" :key="item.id" class="flex items-center justify-between py-2 px-3 cursor-pointer hover:bg-slate-100 gap-2" @click="onPick(item)">
            <div class="flex-1 min-w-0">
              <div class="font-normal sm:font-medium text-slate-800 break-words whitespace-normal leading-tight text-xs sm:text-sm">{{ item.name }}</div>
            </div>
            <svg v-if="isSelected(item)" class="h-5 w-5 text-brand-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8z" clip-rule="evenodd"/></svg>
          </li>
        </ul>
      </div>
    </div>

    <!-- Selected chips -->
    <div class="mt-2 flex flex-wrap gap-2">
      <span v-for="s in selectedItems" :key="s.id" class="inline-flex items-center gap-2 px-2 py-1 rounded bg-gray-100 text-xs sm:text-sm">
        <span class="break-words whitespace-normal leading-tight">{{ s.name }}</span>
        <button type="button" class="text-xs text-gray-600 hover:text-gray-900 flex-shrink-0" @click="remove(s.id)">×</button>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import TaxonomyPicker from '~/components/taxonomy/TaxonomyPicker.vue'
import { useTaxonomyStore } from '~/stores/taxonomyStore'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  resource: { type: String, required: true },
  gradeId: { type: [String, Number], default: null },
  levelId: { type: [String, Number], default: null },
  subjectId: { type: [String, Number], default: null },
  perPage: { type: Number, default: 50 },
  compact: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const store = useTaxonomyStore()

const selectedItems = ref([])
const items = ref([])
const loadingItems = ref(false)
const query = ref('')
// lastPicked used only to feed TaxonomyPicker model-value so it will include an item into its internal list
const lastPicked = ref(null)

const usePicker = computed(() => {
  // Use the nicer TaxonomyPicker when we can (gradeId provided for subjects, or resource isn't 'subjects')
  if (props.resource !== 'subjects') return true
  return props.gradeId !== null && props.gradeId !== undefined && props.gradeId !== ''
})

function normalizeModelArray(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map(v => (v && typeof v === 'object') ? (v.id ?? v.value ?? null) : v).filter(Boolean).map(String)
}

// Initialize selectedItems from modelValue (IDs or objects) by resolving against cached store lists
async function initSelected() {
  const ids = normalizeModelArray(props.modelValue)
  if (!ids.length) { selectedItems.value = []; return }
  // Ensure core lists are loaded
  try {
    if (props.resource === 'subjects') {
      if (!props.gradeId) await store.fetchAllSubjects()
      else await store.fetchSubjectsByGrade(props.gradeId)
      const pool = (store.subjects || [])
      selectedItems.value = ids.map(id => pool.find(p => String(p.id) === String(id)) || { id, name: id }).filter(Boolean)
    } else if (props.resource === 'levels') {
      await store.fetchLevels()
      selectedItems.value = ids.map(id => (store.levels || []).find(l => String(l.id) === String(id)) || { id, name: id }).filter(Boolean)
    } else if (props.resource === 'grades') {
      await store.fetchGrades()
      selectedItems.value = ids.map(id => (store.grades || []).find(g => String(g.id) === String(id)) || { id, name: id }).filter(Boolean)
    } else if (props.resource === 'topics') {
      // topics require subject context to fetch; try to use topics from store if present
      selectedItems.value = ids.map(id => (store.topics || []).find(t => String(t.id) === String(id)) || { id, name: id }).filter(Boolean)
    } else {
      selectedItems.value = ids.map(id => ({ id, name: id }))
    }
  } catch (e) {
    selectedItems.value = ids.map(id => ({ id, name: id }))
  }
}

function isSelected(item) {
  if (!item) return false
  return selectedItems.value.some(s => String(s.id) === String(item.id ?? item))
}

function onPick(item) {
  if (!item) return
  const id = item.id ?? item.value ?? item
  const sid = String(id)
  const idx = selectedItems.value.findIndex(s => String(s.id) === sid)
  if (idx === -1) {
    // add
    const obj = (typeof item === 'object') ? ({ id: String(item.id ?? item.value ?? id), name: item.name ?? item.display_name ?? String(item.id ?? item.value ?? id) }) : ({ id: sid, name: String(item) })
    selectedItems.value.push(obj)
    lastPicked.value = item
  } else {
    // toggle off
    selectedItems.value.splice(idx, 1)
    lastPicked.value = null
  }
  emit('update:modelValue', selectedItems.value.map(s => s.id))
}

function remove(id) {
  const sid = String(id)
  selectedItems.value = selectedItems.value.filter(s => String(s.id) !== sid)
  emit('update:modelValue', selectedItems.value.map(s => s.id))
}

watch(() => props.modelValue, (nv) => {
  initSelected()
}, { immediate: true, deep: true })

watch(() => props.gradeId, async (nv) => {
  // if grade changed and we rely on fallback list, reload items
  if (!usePicker.value && props.resource === 'subjects') {
    await loadItems()
    initSelected()
  } else if (props.resource === 'subjects' && nv) {
    // Also reload when using the picker, as grade changed
    await loadItems()
    initSelected()
  }
})

async function loadItems() {
  loadingItems.value = true
  try {
    if (props.resource === 'subjects') {
      if (props.gradeId) {
        await store.fetchSubjectsByGrade(props.gradeId)
        items.value = (store.subjects || [])
      } else {
        await store.fetchAllSubjects()
        items.value = (store.subjects || [])
      }
    } else if (props.resource === 'levels') {
      await store.fetchLevels()
      items.value = (store.levels || [])
    } else if (props.resource === 'grades') {
      await store.fetchGrades()
      items.value = (store.grades || [])
    } else if (props.resource === 'topics') {
      if (props.subjectId) {
        await store.fetchTopicsBySubject(props.subjectId)
      }
      items.value = (store.topics || [])
    }
  } catch (e) {
    items.value = []
  } finally {
    loadingItems.value = false
  }
}

onMounted(async () => {
  await loadItems()
  await initSelected()
})
</script>

<style scoped>
/* minimal styling kept to wrapper only */
</style>

