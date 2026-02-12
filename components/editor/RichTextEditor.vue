<template>
  <div class="rich-editor">
    <div class="toolbar" role="toolbar" aria-label="Rich text formatting">
      <button type="button" @click="toggleBold" :class="{ active: editorApi?.isActive('bold') }" title="Bold (Ctrl+B)">
        <strong>B</strong>
      </button>
      <button type="button" @click="toggleItalic" :class="{ active: editorApi?.isActive('italic') }" title="Italic (Ctrl+I)">
        <em>I</em>
      </button>
      <button type="button" @click="toggleStrike" :class="{ active: editorApi?.isActive('strike') }" title="Strikethrough">
        <s>S</s>
      </button>
      <button
        v-if="featureCode"
        type="button"
        @click="toggleCode"
        :class="{ active: editorApi?.isActive('code') }"
        title="Inline code"
      >
        <code>&lt;/&gt;</code>
      </button>

      <div class="separator"></div>

      <button type="button" @click="toggleHeading(1)" :class="{ active: editorApi?.isActive('heading', { level: 1 }) }" title="Heading 1">
        H1
      </button>
      <button type="button" @click="toggleHeading(2)" :class="{ active: editorApi?.isActive('heading', { level: 2 }) }" title="Heading 2">
        H2
      </button>
      <button type="button" @click="toggleHeading(3)" :class="{ active: editorApi?.isActive('heading', { level: 3 }) }" title="Heading 3">
        H3
      </button>

      <div class="separator"></div>

      <button type="button" @click="toggleBulletList" :class="{ active: editorApi?.isActive('bulletList') }" title="Bullet list">
        UL
      </button>
      <button type="button" @click="toggleOrderedList" :class="{ active: editorApi?.isActive('orderedList') }" title="Ordered list">
        OL
      </button>

      <div class="separator"></div>

      <button type="button" @click="toggleBlockquote" :class="{ active: editorApi?.isActive('blockquote') }" title="Blockquote">
        Quote
      </button>

      <template v-if="featureCode && hasCodeBlock">
        <div class="separator"></div>
        <button type="button" @click="addCodeBlock" :class="{ active: editorApi?.isActive('codeBlock') }" title="Code block">
          Code
        </button>
        <select v-model="codeLanguage" class="language-select" title="Code language">
          <option value="">auto</option>
          <option value="javascript">JS</option>
          <option value="typescript">TS</option>
          <option value="python">Python</option>
          <option value="css">CSS</option>
          <option value="html">HTML</option>
          <option value="sql">SQL</option>
        </select>
      </template>

      <template v-if="featureMath && hasMath">
        <div class="separator"></div>
        <button
          type="button"
          @click="addMathBlock"
          :class="{ active: editorApi?.isActive('math') || editorApi?.isActive('mathBlock') }"
          title="Math block"
        >
          Math
        </button>
      </template>

      <div class="separator"></div>

      <button type="button" @click="undo" title="Undo (Ctrl+Z)">Undo</button>
      <button type="button" @click="redo" title="Redo (Ctrl+Y)">Redo</button>
    </div>

    <div v-if="editorApi" class="editor-content">
      <EditorContent :editor="editorApi" />
    </div>

    <textarea
      v-else
      :value="modelValue || ''"
      :placeholder="placeholder || 'Start typing...'"
      :disabled="editable === false"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import Code from '@tiptap/extension-code'
import History from '@tiptap/extension-history'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Blockquote from '@tiptap/extension-blockquote'
import Placeholder from '@tiptap/extension-placeholder'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    editable?: boolean
    features?: { math?: boolean; code?: boolean }
    placeholder?: string
  }>(),
  {
    modelValue: '',
    editable: true,
    placeholder: 'Start typing...',
    features: () => ({ math: true, code: true }),
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  ready: [editor: any]
}>()

const editor = ref<any>(null)
const codeLanguage = ref('javascript')
const hasCodeBlock = ref(false)
const hasMath = ref(false)

const featureMath = computed(() => props.features?.math !== false)
const featureCode = computed(() => props.features?.code !== false)

let applyingExternalValue = false

const normalizeHtml = (html: string) => (html || '').replace(/\s+/g, ' ').trim()
const getEditorInstance = () => {
  const candidate = editor.value
  if (!candidate) return null
  if (typeof candidate.getHTML === 'function') return candidate
  if (candidate.value && typeof candidate.value.getHTML === 'function') return candidate.value
  return null
}
const editorApi = computed(() => getEditorInstance())

onMounted(async () => {
  const extensions: any[] = [
    Document,
    Paragraph,
    Text,
    Bold,
    Italic,
    Strike,
    Code,
    History,
    Heading.configure({ levels: [1, 2, 3] }),
    BulletList,
    OrderedList,
    ListItem,
    Blockquote,
    Placeholder.configure({ placeholder: props.placeholder || 'Start typing...' }),
  ]

  if (featureCode.value) {
    try {
      const { lowlight } = await import('lowlight')
      const js = await import('highlight.js/lib/languages/javascript').then((m) => m.default)
      const py = await import('highlight.js/lib/languages/python').then((m) => m.default)
      const css = await import('highlight.js/lib/languages/css').then((m) => m.default)
      const ts = await import('highlight.js/lib/languages/typescript').then((m) => m.default)
      const html = await import('highlight.js/lib/languages/xml').then((m) => m.default)
      const sql = await import('highlight.js/lib/languages/sql').then((m) => m.default)

      lowlight.registerLanguage('javascript', js)
      lowlight.registerLanguage('python', py)
      lowlight.registerLanguage('css', css)
      lowlight.registerLanguage('typescript', ts)
      lowlight.registerLanguage('html', html)
      lowlight.registerLanguage('sql', sql)

      const CodeBlockLowlight = await import('@tiptap/extension-code-block-lowlight').then((m) => m.default)
      extensions.push(CodeBlockLowlight.configure({ lowlight, languageClassPrefix: 'language-' }))
      hasCodeBlock.value = true
    } catch (e) {
      console.warn('Code highlighting unavailable:', e)
    }
  }

  if (featureMath.value) {
    try {
      const mathExt = await import('@aarkue/tiptap-math-extension').then((m) => m.default)
      extensions.push(mathExt.configure ? mathExt.configure({}) : mathExt)
      hasMath.value = true
    } catch (e) {
      console.warn('Math extension unavailable:', e)
    }
  }

  editor.value = useEditor({
    content: props.modelValue || '',
    editable: props.editable !== false,
    extensions,
    onUpdate: ({ editor: instance }) => {
      if (applyingExternalValue) return
      emit('update:modelValue', instance.getHTML())
    },
  })

  const instance = getEditorInstance()
  if (instance) {
    emit('ready', instance)
  }
})

watch(
  () => props.modelValue,
  (nextValue) => {
    const instance = getEditorInstance()
    if (!instance) return
    const incoming = nextValue || ''
    const current = instance.getHTML()
    if (normalizeHtml(incoming) === normalizeHtml(current)) return
    applyingExternalValue = true
    instance.commands.setContent(incoming, false)
    applyingExternalValue = false
  }
)

watch(
  () => props.editable,
  (value) => {
    const instance = getEditorInstance()
    instance?.setEditable(value !== false)
  }
)

const toggleBold = () => getEditorInstance()?.chain().focus().toggleBold().run()
const toggleItalic = () => getEditorInstance()?.chain().focus().toggleItalic().run()
const toggleStrike = () => getEditorInstance()?.chain().focus().toggleStrike().run()
const toggleCode = () => {
  if (!featureCode.value) return
  getEditorInstance()?.chain().focus().toggleCode().run()
}
const toggleHeading = (level: number) => {
  getEditorInstance()?.chain().focus().toggleHeading({ level }).run()
}
const toggleBulletList = () => getEditorInstance()?.chain().focus().toggleBulletList().run()
const toggleOrderedList = () => getEditorInstance()?.chain().focus().toggleOrderedList().run()
const toggleBlockquote = () => getEditorInstance()?.chain().focus().toggleBlockquote().run()
const addCodeBlock = () => {
  if (!featureCode.value || !hasCodeBlock.value) return
  getEditorInstance()?.chain().focus().toggleCodeBlock({ language: codeLanguage.value }).run()
}
const addMathBlock = () => {
  if (!featureMath.value || !hasMath.value) return
  const instance = getEditorInstance()
  ;(instance?.chain() as any)?.focus().insertMathBlock?.().run()
}
const undo = () => getEditorInstance()?.chain().focus().undo().run()
const redo = () => getEditorInstance()?.chain().focus().redo().run()

onBeforeUnmount(() => {
  getEditorInstance()?.destroy()
})

defineExpose({
  editor,
  focus: () => getEditorInstance()?.commands.focus(),
  getHTML: () => getEditorInstance()?.getHTML() || '',
  setHTML: (html: string) => getEditorInstance()?.commands.setContent(html),
})
</script>

<style scoped>
.rich-editor {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #ffffff;
  overflow: hidden;
}

.dark .rich-editor {
  border-color: #4b5563;
  background: #1f2937;
}

.toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  flex-wrap: wrap;
  align-items: center;
  overflow-x: auto;
}

.dark .toolbar {
  border-color: #4b5563;
  background: #293140;
}

.toolbar button,
.language-select {
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}

.dark .toolbar button,
.dark .language-select {
  border-color: #4b5563;
  background: #374151;
  color: #d1d5db;
}

.toolbar button:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.dark .toolbar button:hover {
  background: #4b5563;
  border-color: #6b7280;
}

.toolbar button.active {
  background: #dbeafe;
  color: #0c4a6e;
  border-color: #0284c7;
  font-weight: 600;
}

.dark .toolbar button.active {
  background: #1e293b;
  color: #93c5fd;
  border-color: #0ea5e9;
}

.separator {
  width: 1px;
  height: 1.5rem;
  background: #d1d5db;
  margin: 0 0.25rem;
}

.dark .separator {
  background: #4b5563;
}

.language-select {
  font-size: 0.75rem;
  max-width: 100px;
}

.editor-content :deep(.ProseMirror) {
  outline: none;
  min-height: 200px;
  padding: 1.5rem;
  font-size: 0.95rem;
  line-height: 1.7;
  color: #1f2937;
}

.dark .editor-content :deep(.ProseMirror) {
  color: #f3f4f6;
}

.editor-content :deep(h1) {
  font-size: 1.875rem;
  font-weight: 800;
  margin: 1rem 0 0.5rem 0;
  color: #000000;
}

.dark .editor-content :deep(h1) {
  color: #f9fafb;
}

.editor-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0.9rem 0 0.45rem 0;
  color: #111827;
}

.dark .editor-content :deep(h2) {
  color: #f3f4f6;
}

.editor-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.8rem 0 0.4rem 0;
  color: #1f2937;
}

.dark .editor-content :deep(h3) {
  color: #e5e7eb;
}

.editor-content :deep(ul),
.editor-content :deep(ol) {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.editor-content :deep(li) {
  margin-bottom: 0.25rem;
}

.editor-content :deep(blockquote) {
  border-left: 4px solid #3b82f6;
  padding-left: 1.25rem;
  margin: 1rem 0;
  color: #6b7280;
  font-style: italic;
}

.dark .editor-content :deep(blockquote) {
  border-left-color: #60a5fa;
  color: #d1d5db;
}

.editor-content :deep(pre) {
  background: #1f2937;
  color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
  line-height: 1.5;
  font-size: 0.85rem;
  border: 1px solid #374151;
}

.dark .editor-content :deep(pre) {
  background: #0f172a;
  border-color: #1e293b;
}

.editor-content :deep(code) {
  background: #f3f4f6;
  color: #be185d;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: "Courier New", monospace;
  font-size: 0.9em;
}

.dark .editor-content :deep(code) {
  background: #1f2937;
  color: #f9a8d4;
}

.editor-content :deep(pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
  border-radius: 0;
}

.editor-content :deep(.math-inline) {
  background: #ede9fe;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-style: italic;
}

.dark .editor-content :deep(.math-inline) {
  background: #3730a3;
}

.editor-content :deep(.math-block) {
  background: #f5f3ff;
  border: 1px solid #e9d5ff;
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
}

.dark .editor-content :deep(.math-block) {
  background: #2d1b4e;
  border-color: #5b21b6;
}

.editor-content :deep(.hljs-string) {
  color: #22c55e;
}

.editor-content :deep(.hljs-number) {
  color: #f59e0b;
}

.editor-content :deep(.hljs-literal) {
  color: #a78bfa;
}

.editor-content :deep(.hljs-attr) {
  color: #60a5fa;
}

.editor-content :deep(.hljs-title) {
  color: #38bdf8;
}

.editor-content :deep(.hljs-name) {
  color: #7c3aed;
}

.editor-content :deep(.hljs-comment) {
  color: #6b7280;
  font-style: italic;
}

textarea {
  width: 100%;
  min-height: 200px;
  padding: 1.5rem;
  border: 0;
  font-family: inherit;
  resize: vertical;
  background: #ffffff;
  color: #1f2937;
}

.dark textarea {
  background: #1f2937;
  color: #f3f4f6;
}
</style>
