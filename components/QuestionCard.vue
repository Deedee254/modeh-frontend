<template>
  <div class="border rounded p-3 bg-slate-800/30">
    <div class="flex flex-col sm:flex-row items-start justify-between gap-3">
      <div>
        <div class="font-semibold text-white">{{ question?.text ? stripHtml(question.text) : 'Untitled question' }}</div>
        <div class="text-xs text-slate-400">Type: {{ question?.type || '—' }}</div>
      </div>
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
        <button @click="$emit('toggle')" class="text-xs text-indigo-200">Toggle</button>
        <button @click="$emit('duplicate')" class="text-xs text-slate-200">Clone</button>
        <button @click="$emit('remove')" class="text-xs text-rose-400">Remove</button>
        <button @click="$emit('manage-media', { uid: question.uid })" class="text-xs text-slate-200">Media</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ question: { type: Object, default: null }, index: { type: Number, default: 0 }, expanded: { type: Boolean, default: false } })
const emit = defineEmits(['toggle','duplicate','remove','update','manage-media'])

function stripHtml(s) { try { return String(s).replace(/<[^>]+>/g, '').slice(0,80) } catch (e) { return String(s) }
}
</script>

<style scoped></style>
