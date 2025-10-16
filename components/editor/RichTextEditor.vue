<template>
  <div @click="focusInput">
    <!-- Simple textarea fallback to isolate TipTap during debugging -->
    <UTextarea
      ref="inputRef"
      v-model="localValue"
      :rows="6"
      :disabled="props.editable === false"
      class="w-full"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, defineExpose } from 'vue'
import UTextarea from '~/components/ui/UiTextarea.vue'

const props = defineProps<{ modelValue?: string; editable?: boolean; features?: { math?: boolean; code?: boolean } }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void; (e: 'ready'): void; (e: 'error', err: Error): void }>()

const localValue = ref(props.modelValue ?? '')
const inputRef = ref<any>(null)

watch(
  () => props.modelValue,
  (v) => {
    if (v !== localValue.value) localValue.value = v ?? ''
  }
)

watch(localValue, (v) => emit('update:modelValue', v))

onMounted(() => {
  emit('ready')
})

function focusInput() {
  try {
    // prefer exposed focus method from UiTextarea (component ref)
    if (inputRef.value && typeof inputRef.value.focus === 'function') {
      inputRef.value.focus()
      return
    }
    // fallback: try underlying DOM element
    const el = inputRef.value && inputRef.value.$el ? inputRef.value.$el : inputRef.value
    if (el && typeof el.focus === 'function') el.focus()
  } catch (e) {}
}

// Expose a compact imperative API similar to the full editor (safe no-op / simple implementations)
defineExpose({
  focus: () => inputRef.value?.focus(),
  insertInlineMath: (content = 'a = b + c') => {
    localValue.value = (localValue.value || '') + ` \\(${content}\\)`
  },
  insertBlockMath: (content = 'E = mc^2') => {
    localValue.value = (localValue.value || '') + `\n$$${content}$$\n`
  },
  toggleCodeBlock: () => { localValue.value = (localValue.value || '') + "\n```\ncode\n```\n" },
  toggleInlineCode: () => { localValue.value = (localValue.value || '') + '`code`' },
  getHTML: () => localValue.value || '',
  setHTML: (html: string) => { localValue.value = html }
})
</script>

<style scoped>
.katex-fallback {
  font-family: monospace;
  background: #f5f5f5;
  padding: 2px 4px;
  border-radius: 4px;
  max-width: 100%;
  overflow-x: auto;
}

/* Basic styling for the textarea fallback */
.w-full {
  width: 100%;
}
</style>
