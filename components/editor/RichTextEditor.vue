<template>
  <div>
    <!-- Toolbar -->
    <div v-if="ready" class="flex items-center gap-2 mb-2">
      <UButton size="2xs" color="gray" @click="cmd('bold')" title="Bold"><strong>B</strong></UButton>
      <UButton size="2xs" color="gray" @click="cmd('italic')" title="Italic"><em>I</em></UButton>
      <UButton size="2xs" color="gray" @click="cmd('code')" title="Inline code">code</UButton>
      <UButton size="2xs" color="gray" @click="cmd('codeBlock')" title="Code block">code block</UButton>
      <UDivider orientation="vertical" />
      <UButton size="2xs" color="gray" @click="insertInlineMath" title="Inline math">Inline Math</UButton>
      <UButton size="2xs" color="gray" @click="insertBlockMath" title="Block math">Block Math</UButton>
    </div>

    <!-- Editor -->
    <component
      v-if="ready"
      :is="EditorContent"
      :editor="editor"
      class="prose max-w-none"
    />

    <!-- Skeleton fallback -->
    <div v-else>
      <UiSkeleton variant="list" :count="2" />
      <UiTextarea v-model="localValue" class="mt-2" placeholder="Loading editor..." />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
// lightweight debounce implementation to avoid external dependency
function debounce<T extends (...args: any[]) => any>(fn: T, wait = 200) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn.apply(this, args)
    }, wait)
  }
}
import UiSkeleton from '~/components/ui/UiSkeleton.vue'
import UiTextarea from '~/components/ui/UiTextarea.vue'

const props = defineProps<{ modelValue: string, editable?: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'ready'): void
}>()

// Editor refs
const EditorContent = ref<any>(null)
const editor = ref<any>(null)
const ready = ref(false)
const localValue = ref(props.modelValue || '<p></p>')

// Keep modelValue in sync
watch(() => props.modelValue, (v) => {
  if (!editor.value) {
    localValue.value = v || '<p></p>'
    return
  }
  const html = v || '<p></p>'
  if (html !== editor.value.getHTML()) {
    editor.value.commands.setContent(html, false)
  }
})

onMounted(async () => {
  if (typeof window === 'undefined') return
  try {
    const [{ Editor }, { default: StarterKit }, tipVue] = await Promise.all([
      import('@tiptap/core'),
      import('@tiptap/starter-kit'),
      import('@tiptap/vue-3')
    ])

    // Try the preferred package first (@aarkue/tiptap-math-extension),
    // then fall back to the older tiptap-extension-math-katex if available.
    let MathKatex: any = null
    try {
      // @ts-ignore - optional dependency, may not be installed in some environments
      const mod = await import('@aarkue/tiptap-math-extension')
      MathKatex = mod?.default ?? mod
    } catch (e) {
      try {
        // @ts-ignore - optional dependency fallback
        const mod2 = await import('tiptap-extension-math-katex')
        MathKatex = mod2?.default ?? mod2
      } catch (e2) {
        MathKatex = null
      }
    }

    const extensions = [StarterKit]
    if (MathKatex) {
      // Some extensions export a factory with `.configure()`, others export
      // the extension object directly. Handle both safely.
      try {
        if (typeof MathKatex.configure === 'function') {
          extensions.push(MathKatex.configure({ katexOptions: { throwOnError: false } }))
        } else {
          extensions.push(MathKatex)
        }
      } catch (e) {
        // If configuration fails, still attempt to use the raw extension
        extensions.push(MathKatex)
      }
    }

    editor.value = new Editor({
      editable: props.editable !== false,
      content: localValue.value || '<p></p>',
      extensions,
      onUpdate: debounce(({ editor: ed }: any) => {
        emit('update:modelValue', ed.getHTML())
      }, 200)
    })

    EditorContent.value = tipVue.EditorContent
    await nextTick()
    ready.value = true
    emit('ready')
  } catch (e) {
    console.warn('Failed to init TipTap', e)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy?.()
})

/** Toolbar commands */
function cmd(action: 'bold'|'italic'|'code'|'codeBlock') {
  if (!editor.value) return
  const chain = editor.value.chain().focus()
  if (action === 'bold') chain.toggleBold()
  else if (action === 'italic') chain.toggleItalic()
  else if (action === 'code') chain.toggleCode()
  else if (action === 'codeBlock') chain.toggleCodeBlock()
  chain.run()
}

/** Inline Math insertion */
function insertInlineMath() {
  if (!editor.value) return
  try {
    editor.value.chain().focus()
      .insertContent({ type: 'mathInline', attrs: { content: 'a = b + c' } })
      .run()
  } catch {
    // Fallback: raw KaTeX syntax (can be post-processed)
    editor.value.commands.insertContent('<span class="katex-fallback">\\(a = b + c\\)</span>')
  }
}

/** Block Math insertion */
function insertBlockMath() {
  if (!editor.value) return
  try {
    editor.value.chain().focus()
      .insertContent({ type: 'mathBlock', attrs: { content: 'E = mc^2' } })
      .run()
  } catch {
    editor.value.commands.insertContent('<div class="katex-fallback">$$E = mc^2$$</div>')
  }
}
</script>

<style scoped>
.prose :deep(.katex) {
  font-size: inherit;
}
.katex-fallback {
  font-family: monospace;
  background: #f5f5f5;
  padding: 2px 4px;
  border-radius: 4px;
}
</style>
