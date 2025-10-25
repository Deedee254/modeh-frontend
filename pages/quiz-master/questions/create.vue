<template>
  <div class="p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-xl font-semibold mb-4">Create question</h1>

      <QuestionBuilder ref="builder" @saved="onSaved" @cancel="onCancel" :subjectId="subjectId" :topicId="topicId" />

      <div class="mt-6 flex gap-3">
        <UButton size="sm" color="white" variant="outline" @click="onCancel">Cancel</UButton>
        <UButton size="sm" color="primary" @click="saveAndReturn" :loading="saving">Save and return to quiz</UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
// Admin/creator page — do not index
definePageMeta({ layout: 'quiz-master', meta: [ { name: 'robots', content: 'noindex, nofollow' }, { name: 'description', content: 'Create new questions for your quizzes as a quiz-master.' } ] })

import { ref } from 'vue'
import { useRoute, useRouter, useRuntimeConfig } from '#imports'
import QuestionBuilder from '~/components/question/QuestionBuilder.vue'
import { useAppAlert } from '~/composables/useAppAlert'

const route = useRoute()
const router = useRouter()
const alert = useAppAlert()
const cfg = useRuntimeConfig()

const subjectId = route.query.subject_id || ''
const topicId = route.query.topic_id || ''
const builder = ref(null)
const saving = ref(false)

function pushPending(saved) {
  try {
    const raw = sessionStorage.getItem('quiz:pending_questions')
    const arr = raw ? JSON.parse(raw) : []
    arr.push(saved)
    sessionStorage.setItem('quiz:pending_questions', JSON.stringify(arr))
  } catch (e) {
    // fallback: use window temporary store
    window._pendingQuestions = window._pendingQuestions || []
    window._pendingQuestions.push(saved)
  }
}

function onSaved(saved) {
  // store the saved question so the quiz create page can pick it up
  pushPending(saved)
  alert.push({ message: 'Question saved. You can create another or return to the quiz.', type: 'success' })
  // reset the builder for another question by remounting it (use key)
  try { builder.value && builder.value.$el && builder.value.$el.focus && builder.value.$el.focus() } catch (e) {}
  // trick: emit an event to the component via resetting its key; simpler: navigate to same route to remount
  router.replace({ path: route.path, query: route.query })
}

function onCancel() {
  // go back to question list
  router.push('/quiz-master/questions')
}

async function saveAndReturn() {
  // instruct builder to save by dispatching a DOM event to its internal save button using ref
  try {
    saving.value = true
    // if builder exposes a method to save, call it; otherwise simulate click
    if (builder.value && typeof builder.value.onSave === 'function') {
      await builder.value.onSave()
    } else {
      // find a save button inside the component and click it
      const btn = builder.value?.$el?.querySelector('button[type="button"], button')
      if (btn) btn.click()
    }
    // after save the QuestionBuilder should emit 'saved' and sessionStorage will have pending questions
    // redirect back to quiz create page
    router.push('/quiz-master/quizzes/create')
  } catch (e) {
    // no-op
  } finally { saving.value = false }
}
</script>