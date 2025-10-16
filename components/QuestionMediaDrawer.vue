<template>
  <div class="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
    <div class="pointer-events-auto w-full max-w-xl p-4">
      <div class="rounded-lg bg-white/5 p-4 shadow-lg">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-white">Question media</h3>
          <button @click="$emit('close')" class="text-slate-400 hover:text-white">Close</button>
        </div>

        <div class="mt-4">
          <p class="text-xs text-slate-300">Attach an image or audio file for this question.</p>

          <div class="mt-3">
            <input type="file" @change="onFile" />
            <div v-if="preview" class="mt-2">
              <p class="text-xs text-slate-200">Selected: {{ preview }}</p>
              <button class="mt-2 inline-block text-xs text-indigo-200" @click="remove">Remove</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
defineProps({ question: { type: Object, required: false } })
const emit = defineEmits(['close', 'update', 'upload'])

const preview = ref('')

watch(() => (typeof question !== 'undefined' ? question : null), (q) => {
  preview.value = q && q.media ? (q.media.name || q.media) : ''
}, { immediate: true })

function onFile(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  preview.value = file.name
  // emit upload to parent so it can store file for multipart
  emit('upload', { uid: question && question.uid, file })
  // also emit update so question.media is updated for immediate preview
  emit('update', { uid: question && question.uid, media: file })
}

function remove() {
  preview.value = ''
  emit('update', { uid: question && question.uid, media: null })
}
</script>

<style scoped>
/* small visual niceties to make the drawer usable during development */
</style>
