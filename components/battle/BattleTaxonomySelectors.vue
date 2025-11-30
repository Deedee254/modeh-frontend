<template>
  <div class="space-y-4">
    <!-- Level Selector -->
    <div>
      <ClientOnly>
        <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Level</label>
        <select v-model="selectedLevel" class="w-full rounded-md border px-3 py-2">
          <option value="">All levels</option>
          <option v-for="l in levels" :key="l.id" :value="l.id">{{ l.name }}</option>
        </select>
      </ClientOnly>
    </div>

    <!-- Grade Selector -->
    <div>
      <ClientOnly>
        <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Grade</label>
        <TaxonomyPicker
          resource="grades"
          :level-id="selectedLevel"
          :model-value="selectedGrade"
          compact
          title="Grades"
          subtitle="Pick a grade or course"
          @selected="onGradeSelected"
        />
        <div v-if="selectedGradeName" class="mt-2 text-xs text-slate-600 dark:text-slate-300">
          Selected: <span class="font-medium">{{ selectedGradeName }}</span>
        </div>
      </ClientOnly>
    </div>

    <!-- Subject Selector -->
    <div>
      <ClientOnly>
        <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Subject</label>
        <TaxonomyPicker
          ref="subjectPicker"
          resource="subjects"
          :grade-id="selectedGrade"
          compact
          v-model="selectedSubject"
          v-model:query="subjectQuery"
        />
        <div v-if="selectedSubjectName" class="mt-2 text-xs text-slate-600 dark:text-slate-300">
          Selected: <span class="font-medium">{{ selectedSubjectName }}</span>
        </div>
      </ClientOnly>
    </div>

    <!-- Topic Selector -->
    <div>
      <ClientOnly>
        <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Topic</label>
        <TaxonomyPicker
          ref="topicPicker"
          resource="topics"
          :subject-id="selectedSubject"
          compact
          v-model="selectedTopic"
          v-model:query="topicQuery"
        >
         
        </TaxonomyPicker>
        <div v-if="selectedTopicName" class="mt-2 text-xs text-slate-600 dark:text-slate-300">
          Selected: <span class="font-medium">{{ selectedTopicName }}</span>
        </div>
      </ClientOnly>
    </div>
  </div>

</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import TaxonomyPicker from '~/components/taxonomy/TaxonomyPicker.vue'
import { useTaxonomyStore } from '~/stores/taxonomyStore'

// Props
const props = defineProps({
  level: { type: [String, Number], default: '' },
  grade: { type: [String, Number], default: '' },
  subject: { type: [String, Number], default: '' },
  topic: { type: [String, Number], default: '' }
})

// Emits
const emit = defineEmits(['update:level', 'update:grade', 'update:subject', 'update:topic'])

// Internal refs
const selectedLevel = ref(props.level)
const selectedGrade = ref(props.grade)
const selectedSubject = ref(props.subject)
const selectedTopic = ref(props.topic)
const subjectPicker = ref(null)
const topicPicker = ref(null)
const showTopicModal = ref(false)
const subjectQuery = ref('')
const topicQuery = ref('')

// Taxonomy store (new centralized store)
const taxonomy = useTaxonomyStore()

// Selected names for display
const selectedGradeName = computed(() => {
  const id = selectedGrade.value
  const g = (taxonomy.grades || []).value ? (taxonomy.grades.value || []).find(x => String(x.id) === String(id)) : null
  return g?.name || ''
})

// Selected names for display
const selectedSubjectName = computed(() => {
  const id = selectedSubject.value
  const s = (taxonomy.subjects || []).value ? (taxonomy.subjects.value || []).find(x => String(x.id) === String(id)) : null
  return s?.name || ''
})

const selectedTopicName = computed(() => {
  const id = selectedTopic.value
  const t = (taxonomy.topics || []).value ? (taxonomy.topics.value || []).find(x => String(x.id) === String(id)) : null
  return t?.name || ''
})

// Watch for prop changes and sync internal state
watch(() => props.level, (nv) => { selectedLevel.value = nv })
watch(() => props.grade, (nv) => { selectedGrade.value = nv })
watch(() => props.subject, (nv) => { selectedSubject.value = nv })
watch(() => props.topic, (nv) => { selectedTopic.value = nv })

// Emit changes back to parent
watch(selectedLevel, (nv) => emit('update:level', nv))
watch(selectedGrade, (nv) => emit('update:grade', nv))
watch(selectedSubject, (nv) => emit('update:subject', nv))
watch(selectedTopic, (nv) => emit('update:topic', nv))

// Auto-focus subject picker after grade selection
watch(selectedGrade, (nv, ov) => {
  if (!nv || String(nv) === String(ov)) return
  // Clear dependent fields
  selectedSubject.value = ''
  selectedTopic.value = ''
  subjectQuery.value = ''
  topicQuery.value = ''
  // Focus subject picker
  nextTick(() => {
    setTimeout(() => { try { subjectPicker.value?.focusSearch?.() } catch(e) {} }, 120)
  })
  // Fetch subjects for the selected grade
  if (nv) {
    taxonomy.fetchSubjectsByGrade(nv)
  }
})

// Auto-focus topic picker after subject selection
watch(selectedSubject, (nv, ov) => {
  if (!nv || String(nv) === String(ov)) return
  // Clear topic field
  selectedTopic.value = ''
  topicQuery.value = ''
  // Focus topic picker
  nextTick(() => {
    setTimeout(() => { try { topicPicker.value?.focusSearch?.() } catch(e) {} }, 120)
  })
  // Preload topics for the selected subject
  if (nv) {
    taxonomy.fetchTopicsBySubject(nv)
  }
})

// Level change handling - fetch grades filtered by level
watch(selectedLevel, async (nv, ov) => {
  if (String(nv) === String(ov)) return
  // Reset downstream selections
  selectedGrade.value = ''
  selectedSubject.value = ''
  selectedTopic.value = ''
  subjectQuery.value = ''
  topicQuery.value = ''
  // Fetch grades for the selected level
  if (nv) {
    try { await taxonomy.fetchGradesByLevel(nv) } catch (e) {}
  } else {
    // If no level selected, fetch all grades
    try { await taxonomy.fetchLevels() } catch (e) {}
  }
})


function onGradeSelected(item) {
  selectedGrade.value = item?.id || ''
  // Auto focus subjects picker after grade selection
  nextTick(() => {
    if (subjectPicker.value) {
      subjectPicker.value.focusSearch()
      if (subjectPicker.value.$el && typeof subjectPicker.value.$el.scrollIntoView === 'function') {
        subjectPicker.value.$el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  })
}

function onTopicCreated(created) {
  if (!created) { showTopicModal.value = false; return }
  try { taxonomy.addTopic(created) } catch (e) {}
  try { selectedTopic.value = created.id ?? created.value ?? created } catch (e) {}
  showTopicModal.value = false
}

// Expose refs for parent access if needed
defineExpose({
  subjectPicker,
  topicPicker
})
</script>
