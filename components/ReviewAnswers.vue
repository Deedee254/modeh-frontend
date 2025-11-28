<template>
  <!-- Answer Review Modal -->
  <div v-if="open" class="fixed inset-0 bg-gray-50 dark:bg-slate-900 z-50 overflow-y-auto" @click.self="$emit('close')">
    <div class="max-w-4xl mx-auto">
      <div class="sticky top-0 bg-gray-50/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 p-4 border-b border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">Review Your Submission</h2>
            <p class="text-sm text-gray-600 dark:text-slate-400">These are the answers you submitted.</p>
          </div>
          <button @click="$emit('close')" class="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            Back to Checkout
          </button>
        </div>
      </div>

      <div v-if="loading" class="p-6 text-center text-slate-500 dark:text-slate-400">Loading your answers...</div>
      <div v-else-if="error" class="p-6 text-center text-red-500">{{ error }}</div>
      <div v-else class="p-4 md:p-6 space-y-4 pb-24">
        <div v-for="(detail, index) in details" :key="detail.question_id" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4">
          <div>
            <p class="font-semibold text-gray-800 dark:text-slate-200">Question {{ index + 1 }}</p>
            <div class="text-gray-700 dark:text-slate-300 mt-1 prose prose-sm max-w-none dark:prose-invert" v-html="detail.body || detail.question?.body"></div>
          </div>
          <div class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <p class="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Your Answer:</p>
            <div class="text-gray-800 dark:text-slate-200 text-sm">
              <template v-if="detail.provided !== null && detail.provided !== undefined">
                <div v-if="Array.isArray(detail.provided)" class="space-y-1">
                  <p v-for="(ans, i) in detail.provided" :key="i" class="p-2 bg-gray-50 dark:bg-slate-700/50 rounded" v-html="ans"></p>
                </div>
                <div v-else class="p-2 bg-gray-50 dark:bg-slate-700/50 rounded" v-html="detail.provided"></div>
              </template>
              <p v-else class="text-gray-400 dark:text-slate-500 italic">Not answered</p>
            </div>
          </div>
        </div>
      </div>

      <div class="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 p-4">
        <div class="max-w-4xl mx-auto flex justify-end">
          <button class="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors" @click="$emit('close')">Confirm & Continue</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  details: { type: Array, default: () => [] }
})

defineEmits(['close'])
</script>

