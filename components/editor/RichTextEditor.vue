<template>
  <div class="rich-editor relative">
    <!-- Bubble Menu for inline formatting -->
    <bubble-menu v-if="editor" :editor="editor" :tippy-options="{ duration: 100, animation: 'scale-subtle' }" class="bubble-menu">
      <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }" title="Bold">
        <Icon name="heroicons:bold-20-solid" />
      </button>
      <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }" title="Italic">
        <Icon name="heroicons:italic-20-solid" />
      </button>
      <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'is-active': editor.isActive('strike') }" title="Strikethrough">
        <Icon name="heroicons:bars-3-bottom-left-20-solid" />
      </button>
      <button @click="editor.chain().focus().toggleCode().run()" :class="{ 'is-active': editor.isActive('code') }" title="Inline Code">
        <Icon name="heroicons:code-bracket-20-solid" />
      </button>
    </bubble-menu>

    <!-- Toolbar for block elements -->
    <div class="toolbar mb-2 flex flex-wrap gap-1 border-b pb-2">
      <button @click="addCodeBlock" title="Add Code Block" :class="{ 'is-active': editor?.isActive('codeBlock') }">
        <Icon name="heroicons:code-bracket-square-20-solid" />
        <span class="text-xs ml-1">Code</span>
      </button>
      <button v-if="features?.math" @click="addMathBlock" title="Add Math Block" :class="{ 'is-active': editor?.isActive('math-block') }">
        <Icon name="heroicons:calculator-20-solid" />
        <span class="text-xs ml-1">Math</span>
      </button>
    </div>

    <div v-if="editor" class="editor-content">
      <TiptapEditorContent :editor="editor" />
    </div>
    <textarea v-else :value="modelValue || ''" @input="onTextInput" placeholder="Enter text..." class="fallback-textarea"></textarea>
  </div>
</template>

<script setup lang="ts">
// IMPORTANT: You may need to run `npm install` to make sure all Tiptap extensions are available.

import { watch, onBeforeUnmount, defineExpose, defineAsyncComponent } from 'vue'
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

// Math extension
import MathExtension from '@aarkue/tiptap-math-extension'

const props = defineProps<{ modelValue?: string; editable?: boolean; features?: { math?: boolean; code?: boolean } }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void; (e: 'ready'): void; (e: 'error', err: Error): void }>()

// Manually build the extensions list to disable markdown shortcuts
const extensions = [
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
];

if (props.features?.code !== false) {
  extensions.push(CodeBlock.configure({ languageClassPrefix: 'language-' }))
}
if (props.features?.math) {
  // Note: The math extension itself might still use $...$ as an input rule.
  // This is a feature of the extension itself.
  extensions.push(MathExtension.configure({}))
}

const isClient = typeof window !== 'undefined'

const editor = isClient ? useEditor({
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
}) : null

// Dynamically load the BubbleMenu component at runtime to avoid build-time
// ESM export errors when the installed @tiptap/vue-3 package does not
// provide a named export for BubbleMenu. This uses a dynamic import so
// Vite won't fail at build time if the named export is missing.
const BubbleMenu = isClient
  ? defineAsyncComponent(async () => {
      const mod = await import('@tiptap/extension-bubble-menu')
      // Try common locations for the BubbleMenu component
      if (mod.BubbleMenu) return mod.BubbleMenu
      if (mod.default && mod.default.BubbleMenu) return mod.default.BubbleMenu
      throw new Error('BubbleMenu not found in @tiptap/extension-bubble-menu')
    })
  : null

watch(() => props.modelValue, (v) => {
  if (!editor) return
  const isSame = editor.getHTML() === v
  if (isSame) return
  editor.commands.setContent(v || '', false)
})

onBeforeUnmount(() => {
  if (editor?.destroy) {
    editor.destroy()
  }
})

// --- Toolbar Actions ---
function addCodeBlock() {
  try {
    if (editor) {
      // Inserts a new paragraph after the current block and turns it into a code block.
      editor.chain().focus().createParagraphNear().toggleCodeBlock().run()
    }
  } catch (e) { 
    console.error('Failed to insert code block', e)
  }
}

function addMathBlock() {
  try {
    if (props.features?.math && editor) {
      editor.chain().focus().insertMathBlock().run()
    }
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
  focus: () => editor?.commands.focus(),
  getHTML: () => editor?.getHTML() || '',
  setHTML: (html: string) => editor?.commands.setContent(html, true),
  clearContent: () => editor?.commands.clearContent(true),
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