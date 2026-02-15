<template>
  <ClientOnly>
    <div class="p-2">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left Column: Taxonomy -->
        <div>
          <TaxonomyFlowPicker
            v-model="selection"
            :includeTopics="true"
            :multiSelectSubjects="false"
          />
        </div>

        <!-- Right Column: Settings -->
        <div class="space-y-6">
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Difficulty</label>
              <USelect v-model="difficulty" :options="difficulties" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Number of Questions</label>
              <USelect v-model="totalQuestions" :options="questionCountOptions" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Per-question Time (seconds)</label>
              <UInput v-model.number="perQuestionSeconds" type="number" min="5" placeholder="e.g., 15" />
              <p class="text-xs text-gray-500 mt-1">Seconds per question. Defaults to 15s.</p>
            </div>
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-700 dark:text-red-200">{{ errorMessage }}</p>
          </div>

          <div>
            <button
              @click="startBattle"
              :disabled="starting || !canStart"
              class="w-full inline-flex items-center justify-center gap-2 py-3 px-4 font-bold rounded-xl text-white bg-gradient-to-r from-brand-600 to-brand-950 hover:from-brand-700 hover:to-brand-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Create 1 vs 1 Battle
            </button>
            <div v-if="starting" class="mt-3 text-sm text-center text-gray-500 dark:text-gray-400">Creating battle...</div>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useBattleCreation } from '~/composables/useBattleCreation'
import TaxonomyFlowPicker from '~/components/taxonomy/TaxonomyFlowPicker.vue'
import { useTaxonomyStore } from '~/stores/taxonomyStore'

const emit = defineEmits(['battleCreated'])

const { level, grade, subject, topic, difficulty, totalQuestions, difficulties, questionCountOptions, starting, canStart, createBattle } = useBattleCreation({ battleType: '1v1' })
// Selection object used by TaxonomyFlowPicker (objects with id/name)
const selection = ref({ level: null, grade: null, subject: null, topic: null })

// Sync selection -> primitive refs expected by useBattleCreation
watch(selection, (nv) => {
  try {
    level.value = nv?.level?.id ?? ''
    grade.value = nv?.grade?.id ?? ''
    // subject can be array (multi) or single; pick first id when array
    if (Array.isArray(nv?.subject)) subject.value = nv.subject[0]?.id ?? ''
    else subject.value = nv?.subject?.id ?? ''
    topic.value = nv?.topic?.id ?? ''
  } catch (e) {}
}, { deep: true })

// Sync primitive refs -> selection so picker initializes correctly
watch([level, grade, subject, topic], async () => {
  // Only update selection shallowly to avoid breaking object refs
  selection.value = {
    level: selection.value.level,
    grade: selection.value.grade,
    subject: selection.value.subject,
    topic: selection.value.topic
  }
}, { immediate: true })

// Resolve primitive ids -> taxonomy objects so the FlowPicker shows current selection
const store = useTaxonomyStore()
async function initSelectionFromIds() {
  try {
    const sel = { level: null, grade: null, subject: null, topic: null }

    // Try to resolve level -> grade -> subject -> topic cascade
    if (level.value) {
      await store.fetchLevels()
      sel.level = (store.levels || []).find(l => String(l.id) === String(level.value)) || null
      if (sel.level) {
        await store.fetchGradesByLevel(sel.level.id)
      } else {
        await store.fetchGrades()
      }
      if (grade.value) {
        sel.grade = (store.grades || []).find(g => String(g.id) === String(grade.value)) || null
        if (sel.grade) await store.fetchSubjectsByGrade(sel.grade.id)
      }
      if (subject.value) {
        sel.subject = (store.subjects || []).find(s => String(s.id) === String(subject.value)) || null
        if (sel.subject) await store.fetchTopicsBySubject(sel.subject.id)
      }
      if (topic.value) {
        sel.topic = (store.topics || []).find(t => String(t.id) === String(topic.value)) || null
      }
    } else if (grade.value) {
      // No level but grade exists — fetch grades and try to infer level
      await store.fetchGrades()
      sel.grade = (store.grades || []).find(g => String(g.id) === String(grade.value)) || null
      if (sel.grade && sel.grade.grade_id) {
        // sometimes grade carries level info
        await store.fetchLevels()
        sel.level = (store.levels || []).find(l => String(l.id) === String(sel.grade.level_id || sel.grade.grade_id || '')) || null
      }
      if (sel.grade) await store.fetchSubjectsByGrade(sel.grade.id)
      if (subject.value) sel.subject = (store.subjects || []).find(s => String(s.id) === String(subject.value)) || null
      if (sel.subject) await store.fetchTopicsBySubject(sel.subject.id)
      if (topic.value) sel.topic = (store.topics || []).find(t => String(t.id) === String(topic.value)) || null
    } else if (subject.value) {
      // Try to resolve subject and infer grade/level
      await store.fetchAllSubjects()
      sel.subject = (store.subjects || []).find(s => String(s.id) === String(subject.value)) || null
      if (sel.subject && sel.subject.grade_id) {
        await store.fetchGrades()
        sel.grade = (store.grades || []).find(g => String(g.id) === String(sel.subject.grade_id)) || null
        if (sel.grade && sel.grade.level_id) {
          await store.fetchLevels()
          sel.level = (store.levels || []).find(l => String(l.id) === String(sel.grade.level_id)) || null
        }
      }
      if (topic.value) {
        await store.fetchTopicsBySubject(sel.subject?.id)
        sel.topic = (store.topics || []).find(t => String(t.id) === String(topic.value)) || null
      }
    }

    // assign resolved objects to selection — this will flow down to primitive refs via the selection watcher
    selection.value = sel
  } catch (e) {
    // ignore resolution errors
    // Failed to init taxonomy selection
  }
}

onMounted(() => {
  // Initialize once on mount to hydrate picker when editing drafts
  initSelectionFromIds()
})
const perQuestionSeconds = ref(15)
const errorMessage = ref(null)

async function startBattle() {
  errorMessage.value = null
  try {
    const perSec = perQuestionSeconds && perQuestionSeconds.value ? Math.max(1, Math.floor(perQuestionSeconds.value)) : null
    const result = await createBattle({ perQuestionSeconds: perSec })
    if (result && result.battle) {
      emit('battleCreated', result.battle)
    } else if (result && result.error) {
      errorMessage.value = result.error
    }
  } catch (err) {
    errorMessage.value = err.message || 'Failed to create battle'
  }
}
</script>

