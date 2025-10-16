<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold mb-4">Edit question</h1>

    <div v-if="loading">Loading question…</div>
    <div v-else-if="error" class="text-rose-500">{{ error }}</div>
    <div v-else>
      <div class="mb-4 flex gap-2">
        <QuestionBuilder :prefill="question" :editId="id" @saved="onSaved" @cancel="onCancel" :subjectId="question.subject_id" :topicId="question.topic_id" />
      </div>
      <div class="mt-4">
        <button @click="onDelete" class="text-sm bg-rose-600 text-white px-3 py-2 rounded">Delete question</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from '#imports'
import QuestionBuilder from '~/components/question/QuestionBuilder.vue'
import { useAppAlert } from '~/composables/useAppAlert'

const route = useRoute()
const router = useRouter()
const alert = useAppAlert()

const id = route.params.id
const loading = ref(true)
const error = ref('')
const question = ref(null)

onMounted(async () => {
  loading.value = true
  try {
    const res = await fetch(useRuntimeConfig().public.apiBase + `/api/questions/${encodeURIComponent(id)}`, { credentials: 'include' })
    if (!res.ok) throw new Error('Failed to load question')
    const json = await res.json()
    question.value = json.question || json
  } catch (e) {
    error.value = e.message || 'Error loading question'
  } finally { loading.value = false }
})

function onSaved(saved) {
  alert.push({ message: 'Question updated', type: 'success' })
  // store updated question for optimistic update on list page
  try { sessionStorage.setItem('question:updated', JSON.stringify(saved)) } catch (e) {}
  router.push('/quiz-master/questions')
}

function onCancel() {
  router.push('/quiz-master/questions')
}

async function onDelete() {
  if (!confirm('Delete this question? This action cannot be undone.')) return
  try {
    const res = await fetch(useRuntimeConfig().public.apiBase + `/api/questions/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' })
    if (!res.ok) throw new Error('Failed to delete')
    // signal list page to remove item optimistically
    try { sessionStorage.setItem('question:deleted', JSON.stringify({ id })) } catch (e) {}
    alert.push({ message: 'Question deleted', type: 'success' })
    router.push('/quiz-master/questions')
  } catch (e) {
    alert.push({ message: 'Failed to delete question', type: 'error' })
  }
}
</script>

<style scoped></style>
