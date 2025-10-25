<template>
    <div class="p-2">
    <div class="space-y-4">
        <div>
          <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Level</label>
          <select v-model="level" class="w-full rounded-md border px-3 py-2">
            <option value="">All levels</option>
            <option v-for="l in (levels || [])" :key="l.id" :value="l.id">{{ l.name }}</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Grade</label>
          <USelect v-model="grade" :options="grades" placeholder="Select grade" />
        </div>
        <div>
          <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Subject</label>
          <TaxonomyPicker
            ref="subjectPicker"
            v-model="subject"
            resource="subjects"
            :grade-id="grade"
            compact
          />
          <div v-if="selectedSubjectName" class="mt-2 text-xs text-slate-600 dark:text-slate-300">Selected: <span class="font-medium">{{ selectedSubjectName }}</span></div>
        </div>
      <div>
        <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Topic</label>
        <TaxonomyPicker
          ref="topicPicker"
          v-model="topic"
          resource="topics"
          :subject-id="subject"
          compact
        >
          <template #actions>
            <UButton size="sm" variant="ghost" @click="openTopicModal" title="Create topic">+</UButton>
          </template>
        </TaxonomyPicker>
        <div v-if="selectedTopicName" class="mt-2 text-xs text-slate-600 dark:text-slate-300">Selected: <span class="font-medium">{{ selectedTopicName }}</span></div>
      </div>
      <div>
        <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Difficulty</label>
        <USelect v-model="difficulty" :options="difficulties" />
      </div>
      <div>
        <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Number of Questions</label>
        <USelect v-model="totalQuestions" :options="questionCountOptions" />
      </div>
        <div>
          <label class="text-sm font-medium text-gray-800 dark:text-gray-200">Total Battle Time (minutes)</label>
          <UInput v-model.number="totalTimeMinutes" type="number" min="1" placeholder="e.g., 10" />
          <p class="text-xs text-gray-500 mt-1">Optional — if set, each question will be given an equal share of this time.</p>
        </div>
    </div>

    <div class="mt-6">
      <button
        @click="startBattle"
        :disabled="starting || !canStart"
        class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        Create 1 vs 1 Battle
      </button>
    </div>

    <div v-if="starting" class="mt-3 text-sm text-center text-gray-500 dark:text-gray-400">Creating battle...</div>
    </div>

  <ClientOnly>
    <Teleport to="#modal-root" v-if="showTopicModal">
      <CreateTopicModal
        :model-value="showTopicModal"
        :grades="taxGrades"
        :subjects="taxSubjects"
        :defaultGradeId="grade"
        :defaultSubjectId="Number(subject) || null"
        @update:modelValue="(v) => (showTopicModal = v)"
        @created="onTopicCreated"
      />
    </Teleport>
  </ClientOnly>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useBattleCreation } from '~/composables/useBattleCreation'
import TaxonomyPicker from '~/components/taxonomy/TaxonomyPicker.vue'
import CreateTopicModal from '~/components/modals/CreateTopicModal.vue'
import useTaxonomy from '~/composables/useTaxonomy'

const emit = defineEmits(['battleCreated'])

const { level, grade, subject, topic, difficulty, totalQuestions, grades, subjects, topics, levels, difficulties, questionCountOptions, starting, canStart, createBattle } = useBattleCreation({ battleType: '1v1' })
const totalTimeMinutes = ref(null)

const subjectPicker = ref(null)
const topicPicker = ref(null)
const showTopicModal = ref(false)

function openTopicModal() { showTopicModal.value = true }

async function onTopicCreated(created) {
  // created may be null/false when cancelled
  if (!created) { showTopicModal.value = false; return }
  // ensure taxonomy cache and local pickers include the new topic
  try {
    if (Array.isArray(taxTopics.value)) taxTopics.value.unshift(created)
  } catch (e) {}
  // set the selected topic to the newly created id (or the object)
  try { topic.value = created.id ?? created.value ?? created } catch (e) {}
  // Refresh topics for the subject so the picker definitely has the latest list
  try {
    const sid = created.subject_id ?? created.subjectId ?? subject.value
    // fetchTopicsPage is provided by the taxonomy composable and may be async
    if (typeof fetchTopicsPage === 'function') await fetchTopicsPage({ subjectId: sid, page: 1, perPage: 50, q: '' })
  } catch (e) {
    // ignore fetch errors; the local unshift above should still make the new topic available
    console.warn('Failed to refresh topics after create', e)
  }

  showTopicModal.value = false
}

const { grades: taxGrades, subjects: taxSubjects, topics: taxTopics, fetchSubjectsPage, fetchTopicsPage } = useTaxonomy()

const selectedSubjectName = computed(() => {
  const id = subject.value
  const s = (taxSubjects.value || []).find(x => String(x.id) === String(id))
  return s?.name || ''
})

const selectedTopicName = computed(() => {
  const id = topic.value
  const t = (taxTopics.value || []).find(x => String(x.id) === String(id))
  return t?.name || ''
})

// autofocus subject picker after grade selection
watch(grade, (nv, ov) => {
  if (!nv) return
  // focus the subject picker search input after a short delay
  setTimeout(() => { try { subjectPicker.value?.focusSearch?.() } catch(e) {} }, 120)
})

// autofocus topic picker after subject selection
watch(subject, (nv, ov) => {
  if (!nv) return
  setTimeout(() => { try { topicPicker.value?.focusSearch?.() } catch(e) {} }, 120)
  // preload topics for the selected subject so picker is ready
  try { fetchTopicsPage({ subjectId: nv, page: 1, perPage: 50, q: '' }) } catch(e){}
})

async function startBattle() {
  const totalTimeSeconds = totalTimeMinutes && totalTimeMinutes.value ? Math.max(0, Math.floor(totalTimeMinutes.value * 60)) : null
  const { battle, error } = await createBattle({ totalTimeSeconds })
  emit('battleCreated', battle || { error })
}
</script>
