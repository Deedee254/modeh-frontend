<template>
  <ClientOnly>
    <template #placeholder>
      <!-- SSR-safe placeholder matching the client-side wrapper to avoid hydration mismatches -->
      <div class="p-2">
        <div class="space-y-3">
          <div class="h-4 bg-slate-200 rounded w-2/3"></div>
          <div class="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    </template>
    <div class="p-2">
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Create a private battle room and invite your friends to join.</p>
      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Battle Name</label>
          <UInput v-model="battleName" placeholder="e.g., 'Friday Night Trivia'" />
        </div>

        <TaxonomyFlowPicker
          v-model="selection"
          :includeTopics="true"
          :multiSelectSubjects="false"
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Difficulty</label>
            <USelect v-model="difficulty" :options="difficulties" />
          </div>
          <div class="md:col-span-2">
            <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Number of Questions</label>
            <USelect v-model="totalQuestions" :options="questionCountOptions" />
          </div>
            <div class="md:col-span-2">
              <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Per-question Time (seconds)</label>
              <UInput v-model.number="perQuestionSeconds" type="number" min="5" placeholder="e.g., 15" />
              <p class="text-xs text-gray-500 mt-1">Seconds per question. Defaults to 15s. This will be used unless you prefer to set a total battle time below.</p>
            </div>
            <div class="md:col-span-2">
              <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Total Battle Time (minutes)</label>
              <UInput v-model.number="totalTimeMinutes" type="number" min="1" placeholder="e.g., 10" />
              <p class="text-xs text-gray-500 mt-1">Optional — if set, each question will be given an equal share of this time (overridden by explicit per-question seconds).</p>
            </div>
          <div class="md:col-span-2">
            <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Max Players</label>
            <USelect v-model="maxPlayers" :options="maxPlayerOptions" />
          </div>
        </div>
      </div>

      <div class="mt-6">
        <button
          @click="startBattle"
          :disabled="starting || !canStart"
          class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 font-semibold rounded-lg text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Create Group Battle
        </button>
      </div>

      <div v-if="starting" class="mt-3 text-sm text-center text-gray-500 dark:text-gray-400">Creating group battle...</div>
    </div>
  </ClientOnly>

</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useBattleCreation } from '~/composables/useBattleCreation'
import TaxonomyFlowPicker from '~/components/taxonomy/TaxonomyFlowPicker.vue'
import { useTaxonomyStore } from '~/stores/taxonomyStore'

const emit = defineEmits(['battleCreated'])

const battleName = ref('')
const maxPlayers = ref(4)
const totalTimeMinutes = ref(null)
const perQuestionSeconds = ref(15)

const maxPlayerOptions = [
  { label: '2 Players', value: 2 },
  { label: '4 Players', value: 4 },
  { label: '6 Players', value: 6 },
  { label: '8 Players', value: 8 },
  { label: '10 Players', value: 10 },
  { label: '16 Players', value: 16 },
]

const { level, grade, subject, topic, difficulty, totalQuestions, difficulties, questionCountOptions, starting, canStart, createBattle } = useBattleCreation({ battleType: 'group', battleName, maxPlayers })

const selection = ref({ level: null, grade: null, subject: null, topic: null })

watch(selection, (nv) => {
  try {
    level.value = nv?.level?.id ?? ''
    grade.value = nv?.grade?.id ?? ''
    if (Array.isArray(nv?.subject)) subject.value = nv.subject[0]?.id ?? ''
    else subject.value = nv?.subject?.id ?? ''
    topic.value = nv?.topic?.id ?? ''
  } catch (e) {}
}, { deep: true })

watch([level, grade, subject, topic], async () => {
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
      await store.fetchGrades()
      sel.grade = (store.grades || []).find(g => String(g.id) === String(grade.value)) || null
      if (sel.grade && sel.grade.grade_id) {
        await store.fetchLevels()
        sel.level = (store.levels || []).find(l => String(l.id) === String(sel.grade.level_id || sel.grade.grade_id || '')) || null
      }
      if (sel.grade) await store.fetchSubjectsByGrade(sel.grade.id)
      if (subject.value) sel.subject = (store.subjects || []).find(s => String(s.id) === String(subject.value)) || null
      if (sel.subject) await store.fetchTopicsBySubject(sel.subject.id)
      if (topic.value) sel.topic = (store.topics || []).find(t => String(t.id) === String(topic.value)) || null
    } else if (subject.value) {
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
    selection.value = sel
  } catch (e) {}
}

onMounted(() => initSelectionFromIds())

async function startBattle() {
  const totalTimeSeconds = totalTimeMinutes && totalTimeMinutes.value ? Math.max(0, Math.floor(totalTimeMinutes.value * 60)) : null
  const perSec = perQuestionSeconds && perQuestionSeconds.value ? Math.max(1, Math.floor(perQuestionSeconds.value)) : null
  const { battle, error } = await createBattle({ totalTimeSeconds, perQuestionSeconds: perSec })
  emit('battleCreated', battle || { error })
}
</script>
