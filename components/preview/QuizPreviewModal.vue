<template>
  <UModal v-model="open" :ui="{ width: 'sm:max-w-5xl' }">
    <div class="p-4 sm:p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">Quiz Preview</h3>
        <UButton color="gray" variant="ghost" @click="open=false">Close</UButton>
      </div>
      <div class="space-y-6">
        <div>
          <div class="text-xl font-bold">{{ quiz.title }}</div>
          <div class="text-gray-600">Topic: {{ quiz.topic_name || quiz.topic?.name || quiz.topic_name || '—' }}</div>
          <p class="mt-2">{{ quiz.description }}</p>
        </div>
        <div class="space-y-6">
          <div v-for="(q, i) in quiz.questions" :key="i" class="border rounded p-4">
            <div class="font-medium mb-2">Q{{ i+1 }}</div>
            <!-- Prefer `body` (used by backend) falling back to `text` -->
            <div class="prose max-w-none" v-html="rendered[i] || q.body || q.text"></div>
            <ol v-if="Array.isArray(q.options) && q.options.length" class="list-decimal pl-5 mt-2">
              <li v-for="(o, j) in q.options" :key="j" class="mb-1" v-html="(typeof o === 'string' ? o : (o?.text || ''))"></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{ modelValue: boolean, quiz: any }>()
const emit = defineEmits(['update:modelValue'])

const open = ref(props.modelValue)
watch(() => props.modelValue, v => open.value = v)
watch(open, v => emit('update:modelValue', v))

const rendered = ref<string[]>([])

async function renderMathAll() {
  try {
    if (!process.client) return
    const katex = await import('katex')
    const render = (html: string) => {
      let out = html.replace(/\$\$(.*?)\$\$/gs, (m, expr) => {
        try { return katex.renderToString(expr, { throwOnError: false, displayMode: true }) } catch { return m }
      }).replace(/\\\((.*?)\\\)/gs, (m, expr) => {
        try { return katex.renderToString(expr, { throwOnError: false, displayMode: false }) } catch { return m }
      })
      return out
    }
    rendered.value = (props.quiz?.questions || []).map((q:any) => render(q.text || ''))
  } catch {
    rendered.value = (props.quiz?.questions || []).map((q:any) => q.text || '')
  }
}

onMounted(renderMathAll)
watch(() => props.quiz, renderMathAll, { deep: true })
</script>

<style scoped>
.prose :deep(.katex) { font-size: 1em; }
</style>
