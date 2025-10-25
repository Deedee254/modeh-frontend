<template>
  <div class="rich-editor relative">
    <!-- Bubble Menu for inline formatting -->
  <BubbleMenu v-if="ed && BubbleMenu" :editor="ed" :tippy-options="{ duration: 100, animation: 'scale-subtle' }" class="bubble-menu">
      <button @click="ed && ed.chain().focus().toggleBold().run()" :class="{ 'is-active': ed && ed.isActive('bold') }" title="Bold">
        <Icon name="heroicons:bold-20-solid" />
      </button>
      <button @click="ed && ed.chain().focus().toggleItalic().run()" :class="{ 'is-active': ed && ed.isActive('italic') }" title="Italic">
        <Icon name="heroicons:italic-20-solid" />
      </button>
      <button @click="ed && ed.chain().focus().toggleStrike().run()" :class="{ 'is-active': ed && ed.isActive('strike') }" title="Strikethrough">
        <Icon name="heroicons:bars-3-bottom-left-20-solid" />
      </button>
      <button @click="ed && ed.chain().focus().toggleCode().run()" :class="{ 'is-active': ed && ed.isActive('code') }" title="Inline Code">
        <Icon name="heroicons:code-bracket-20-solid" />
      </button>
  </BubbleMenu>

    <!-- Toolbar for block elements -->
    <div class="toolbar mb-2 flex flex-wrap gap-1 border-b pb-2">
      <button @click="addCodeBlock" title="Add Code Block" :class="{ 'is-active': ed && ed.isActive('codeBlock') }">
        <Icon name="heroicons:code-bracket-square-20-solid" />
        <span class="text-xs ml-1">Code</span>
      </button>
  <button v-if="features?.math" @click="addMathBlock" title="Add Math Block" :class="{ 'is-active': ed && ed.isActive('math-block') }">
        <Icon name="heroicons:calculator-20-solid" />
        <span class="text-xs ml-1">Math</span>
      </button>
    </div>

    <div v-if="ed" class="editor-content">
      <TiptapEditorContent :editor="ed" />
    </div>
    <textarea v-else :value="modelValue || ''" @input="onTextInput" placeholder="Enter text..." class="fallback-textarea"></textarea>
  </div>
</template>

<script setup lang="ts">
// IMPORTANT: You may need to run `npm install` to make sure all Tiptap extensions are available.

import { watch, onBeforeUnmount, defineExpose, defineAsyncComponent, computed } from 'vue'
import { useEditor, EditorContent as TiptapEditorContent } from '@tiptap/vue-3'
import { Icon } from '#components'

// Import Tiptap extensions individually to have full control
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import Code from '@tiptap/extension-code'
import CodeBlock from '@tiptap/extension-code-block'
import History from '@tiptap/extension-history'
import Dropcursor from '@tiptap/extension-dropcursor'
import Gapcursor from '@tiptap/extension-gapcursor'
import HardBreak from '@tiptap/extension-hard-break'

// Math extension will be dynamically imported on the client to avoid build-time
// failures when optional runtime deps (like `evaluatex`) are not installed.

const props = defineProps<{ modelValue?: string; editable?: boolean; features?: { math?: boolean; code?: boolean } }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void; (e: 'ready'): void; (e: 'error', err: Error): void }>()

// Manually build the extensions list to disable markdown shortcuts
const baseExtensions = [
  Document,
  Paragraph,
  Text,
  Bold,
  Italic,
  Strike,
  Code,
  History,
  Dropcursor,
  Gapcursor,
  HardBreak,
  // Note: BubbleMenu is a Vue component (imported above) and not a Tiptap extension.
  // Do not add it to the extensions array.
]

const isClient = typeof window !== 'undefined'

// Editor instance (ref) — created onMounted so we can dynamically import optional extensions
import { ref as vueRef, onMounted } from 'vue'
import type { Editor } from '@tiptap/core'
const editor = vueRef<Editor | null>(null)

onMounted(async () => {
  if (!isClient) return

  const extensions = [...baseExtensions]
  if (props.features?.code !== false) {
    extensions.push(CodeBlock.configure({ languageClassPrefix: 'language-' }))
  }

  if (props.features?.math) {
    try {
      const mod = await import('@aarkue/tiptap-math-extension')
      const mathExt = mod?.default ?? mod
      if (mathExt?.configure) extensions.push(mathExt.configure({}))
      else extensions.push(mathExt)
    } catch (e) {
      // Notify parent and continue without math support
      emit('error', new Error('Failed to load math extension: ' + (e?.message || e)))
      // Do not rethrow — editor should still work without math extension
      console.warn('Math extension load failed', e)
    }
  }

  // useEditor may return either an Editor instance or a ref containing the instance
  // depending on the installed version. Normalize so `editor.value` is always the
  // raw Editor instance to make methods like `getHTML()` and `chain()` available.
  const created = useEditor({
    content: props.modelValue || '',
    editable: props.editable !== false,
    extensions: extensions,
    onUpdate({ editor: e }) {
      emit('update:modelValue', e.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-2 focus:outline-none',
      },
    },
  })

  // `created` may be a ref (contains `.value`) or the editor directly. Unwrap.
  try {
    // @ts-ignore - defensive runtime check
    editor.value = (created && typeof (created as any).value !== 'undefined') ? (created as any).value : created
  } catch (e) {
    editor.value = created as any
  }
    // Try to dynamically load the BubbleMenu component from tiptap on the client.
    // This avoids static type/import issues during SSR and keeps initial bundle size smaller.
    try {
      const mod = await import('@tiptap/vue-3')
      BubbleMenu.value = mod?.BubbleMenu ?? (mod?.default && mod.default.BubbleMenu) ?? null
    } catch (e) {
      // Non-fatal: editor will work without BubbleMenu
      console.warn('Failed to load Tiptap BubbleMenu component', e)
    }

    emit('ready')
})

// Import the BubbleMenu component under a different local name to avoid
// redeclaring the same identifier (which caused a TDZ / initialization error).
// BubbleMenu is a client-only UI component from Tiptap. Import it dynamically
// inside onMounted to avoid type/import issues during SSR and keep the
// initial bundle small. Expose as a ref so the template can render it once
// it's available.
const BubbleMenu = vueRef(null)

// Helper to obtain the concrete Editor instance (handles nested ref cases)
function getEditorInstance() {
  const e: any = editor.value
  if (!e) return null
  if (typeof e.getHTML === 'function') return e
  if (e && typeof e.value !== 'undefined' && e.value && typeof e.value.getHTML === 'function') return e.value
  return null
}

// computed proxy for template-friendly usage. Template auto-unwraps refs,
// but we prefer to expose the concrete instance here so template calls
// like `ed.isActive()` work reliably.
const ed = computed(() => getEditorInstance())

watch(() => props.modelValue, (v) => {
  const e = getEditorInstance()
  if (!e) return
  try {
    const isSame = e.getHTML() === v
    if (isSame) return
    e.commands.setContent(v || '', false)
  } catch (e) {
    console.warn('Failed to sync editor content', e)
  }
})

onBeforeUnmount(() => {
  if (editor.value?.destroy) {
    editor.value.destroy()
  }
})

// --- Toolbar Actions ---
function addCodeBlock() {
  try {
    const inst = getEditorInstance()
    if (!inst) return
    // Inserts a new paragraph after the current block and turns it into a code block.
    inst.chain().focus().createParagraphNear().toggleCodeBlock().run()
  } catch (e) { 
    console.error('Failed to insert code block', e)
  }
}

function addMathBlock() {
  try {
    const inst = getEditorInstance()
    if (!inst || !props.features?.math) return
    inst.chain().focus().insertMathBlock().run()
  } catch (e) { 
    console.error('Failed to insert math block', e)
  }
}

function onTextInput(e: Event) {
  const t = e.target as HTMLTextAreaElement | null
  if (!t) return
  emit('update:modelValue', t.value || '')
}

// --- Expose Methods ---
defineExpose({
  focus: () => {
    const i = getEditorInstance(); return i ? i.commands?.focus() : undefined
  },
  getHTML: () => {
    const i = getEditorInstance(); return i ? i.getHTML() : ''
  },
  setHTML: (html: string) => {
    const i = getEditorInstance(); return i ? i.commands?.setContent(html, true) : undefined
  },
  clearContent: () => {
    const i = getEditorInstance(); return i ? i.commands?.clearContent(true) : undefined
  },
})

</script>

<style>
.rich-editor {
  width: 100%;
  border: 1px solid rgb(229, 231, 235);
  border-radius: 0.5rem;
  background-color: white;
}
.dark .rich-editor {
  border-color: rgb(75, 85, 99);
  background-color: rgb(31, 41, 55);
}

.editor-content :global(.ProseMirror) {
  outline: none;
  min-height: 120px;
  padding: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.6;
  caret-color: rgb(99, 102, 241);
}

.dark .editor-content :global(.ProseMirror) {
  color: rgb(229, 231, 235);
}

/* Bubble Menu Styling */
.bubble-menu {
  display: flex;
  background-color: #262626;
  padding: 0.2rem;
  border-radius: 0.5rem;
}

.bubble-menu button {
  border: none;
  background: none;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.3rem 0.5rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.bubble-menu button:hover, .bubble-menu button.is-active {
  opacity: 1;
}

/* Toolbar Styling */
.toolbar {
  border-color: rgb(229, 231, 235);
  padding: 0.5rem;
}
.dark .toolbar {
  border-color: rgb(75, 85, 99);
}

.toolbar button {
  display: inline-flex;
  align-items: center;
  font-size: 0.875rem;
  transition: all 0.2s;
  color: rgb(107, 114, 128);
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
}

.dark .toolbar button {
  color: rgb(156, 163, 175);
}

.toolbar button:hover {
  background-color: rgb(243, 244, 246);
  border-color: rgb(229, 231, 235);
}

.dark .toolbar button:hover {
  background-color: rgb(55, 65, 81);
  border-color: rgb(75, 85, 99);
}

.toolbar button.is-active {
  background-color: rgb(239, 246, 255);
  color: rgb(29, 78, 216);
}

.dark .toolbar button.is-active {
  background-color: rgb(30, 41, 59);
  color: rgb(191, 219, 254);
}

.fallback-textarea {
  width: 100%;
  min-height: 120px;
  border: 1px solid rgb(229, 231, 235);
  border-radius: 0.5rem;
  padding: 0.75rem;
  background-color: white;
  color: rgb(17, 24, 39);
}
.dark .fallback-textarea {
  background-color: rgb(55, 65, 81);
  border-color: rgb(75, 85, 99);
  color: rgb(229, 231, 235);
}
</style>