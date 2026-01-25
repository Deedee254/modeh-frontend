<template>
  <div class="rich-editor relative">
    <!-- Bubble Menu for inline formatting -->
  <component 
      :is="bubbleMenuComponent" 
      v-if="ed && bubbleMenuComponent" 
      :editor="ed"
      :tippy-options="{ duration: 100, animation: 'scale-subtle' }" 
      class="bubble-menu"
  >
      <button @click="ed && ed.chain().focus().toggleBold().run()" :class="{ 'is-active': ed && ed.isActive('bold') }" title="Bold">
        <strong>B</strong>
      </button>
      <button @click="ed && ed.chain().focus().toggleItalic().run()" :class="{ 'is-active': ed && ed.isActive('italic') }" title="Italic">
        <em>I</em>
      </button>
      <button @click="ed && ed.chain().focus().toggleStrike().run()" :class="{ 'is-active': ed && ed.isActive('strike') }" title="Strikethrough">
        <s>S</s>
      </button>
      <button @click="ed && ed.chain().focus().toggleCode().run()" :class="{ 'is-active': ed && ed.isActive('code') }" title="Inline Code">
        <code>&lt;&gt;</code>
      </button>
    </component>

    <!-- Toolbar for block elements -->
    <div class="toolbar mb-2 flex flex-wrap gap-1 border-b pb-2">
      <button @click="addCodeBlock" title="Add Code Block" :class="{ 'is-active': ed && ed.isActive('codeBlock') }">
        <span class="text-lg">{ }</span>
        <span class="text-xs ml-1">Code</span>
      </button>
      <label class="ml-2 flex items-center gap-2">
        <span class="text-xs text-slate-500">Lang</span>
        <select v-model="selectedLanguage" @change="setCodeLanguage" class="text-sm border rounded px-2 py-1 bg-white dark:bg-slate-700">
          <option value="">auto</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="css">CSS</option>
        </select>
      </label>
      <button v-if="features?.math" @click="addMathBlock" title="Add Math Block" :class="{ 'is-active': ed && ed.isActive('math-block') }">
        <span class="text-lg">∑</span>
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

import { watch, onBeforeUnmount, defineAsyncComponent, computed } from 'vue'
import { useEditor, EditorContent as TiptapEditorContent } from '@tiptap/vue-3'
// Import the package as a namespace so we can access runtime exports that
// may not be present on the static TypeScript definitions (BubbleMenu etc.)
import * as TiptapVue from '@tiptap/vue-3'

// Import Tiptap extensions individually to have full control
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import Code from '@tiptap/extension-code'
import History from '@tiptap/extension-history'
import Dropcursor from '@tiptap/extension-dropcursor'
import Gapcursor from '@tiptap/extension-gapcursor'
import HardBreak from '@tiptap/extension-hard-break'
import Placeholder from '@tiptap/extension-placeholder'

// Math extension will be dynamically imported on the client to avoid build-time
// failures when optional runtime deps (like `evaluatex`) are not installed.

const props = defineProps<{
  modelValue?: string; 
  editable?: boolean; 
  features?: { math?: boolean; code?: boolean }; 
  placeholder?: string;
}>()
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
  Placeholder.configure({
    placeholder: props.placeholder || 'Start typing...',
    emptyEditorClass: 'is-editor-empty',
  }),
// BubbleMenu is a Vue component (imported above) and not a Tiptap extension.
// Do not add it to the extensions array.
]

import { ref as vueRef, onMounted, getCurrentInstance } from 'vue'
import type { Editor } from '@tiptap/core'
import type { Component } from 'vue'

const isClient = process.client
const bubbleMenuComponent = vueRef<Component | null>(null)
// selected language for code blocks (used when inserting/updating code blocks)
const selectedLanguage = vueRef<string>('javascript')

// Editor instance (ref) — created onMounted so we can dynamically import optional extensions
// Use `any` for the runtime editor reference to avoid strict type mismatches
// between tiptap runtime and its TypeScript definitions in some versions.
const tiptapEditor = vueRef<any>(null)

// Initialization separated so we can call it directly when there's no active
// component instance (some environments or tests may call this module outside
// of a standard component setup). When a component instance exists we attach
// initialization to onMounted; otherwise we initialize immediately on client. // This comment is slightly outdated, but not critical.

const extensions = computed(() => {
  const exts = [...baseExtensions];
  // Code block + syntax highlighting is loaded on the client in onMounted
  // to avoid SSR/runtime resolution issues with lowlight/highlight.js.
  // Math extension is handled via dynamic import inside onMounted
  return exts;
});

onMounted(async () => {
  if (!isClient) return;

  // Resolve the BubbleMenu component from the Tiptap package at runtime.
  // We access it via the namespace import and cast to `any` to avoid
  // TypeScript errors when the type definitions don't mention the export.
  try {
    const anyT = TiptapVue as any
    bubbleMenuComponent.value = anyT.BubbleMenu ?? anyT.default?.BubbleMenu ?? null
  } catch (e) {
    emit('error', new Error('Failed to load Tiptap BubbleMenu component: ' + String(e)));
  }

  const finalExtensions = [...extensions.value]; // Start with base and code extensions
  // Dynamically enable code highlighting (client-only)
  if (props.features?.code) {
    try {
      // load lowlight and a couple of languages lazily
      const lowlightModule = await import('lowlight')
      const lowlight = (lowlightModule && (lowlightModule.lowlight || lowlightModule.default)) || lowlightModule
      // register a default language (javascript). Add more as needed.
      try {
        const js = (await import('highlight.js/lib/languages/javascript')).default || (await import('highlight.js/lib/languages/javascript'))
        lowlight.registerLanguage('javascript', js)
      } catch (e) {
        // non-fatal if a language fails to load
      }
      try {
        const py = (await import('highlight.js/lib/languages/python')).default || (await import('highlight.js/lib/languages/python'))
        lowlight.registerLanguage('python', py)
      } catch (e) {
        // ignore
      }
      try {
        const css = (await import('highlight.js/lib/languages/css')).default || (await import('highlight.js/lib/languages/css'))
        lowlight.registerLanguage('css', css)
      } catch (e) {
        // ignore
      }

      const cbModule = await import('@tiptap/extension-code-block-lowlight')
      const CodeBlockLowlight = cbModule?.default ?? cbModule
      finalExtensions.push(CodeBlockLowlight.configure({ lowlight, languageClassPrefix: 'language-' }))
    } catch (e: unknown) {
      emit('error', new Error('Failed to enable code highlighting: ' + String(e)))
    }
  }

  // Dynamically load math extension client-side to avoid SSR issues
  if (props.features?.math) {
    try {
      const mod = await import('@aarkue/tiptap-math-extension');
      const mathExt = mod?.default ?? mod;
      const configuredExt = mathExt?.configure ? mathExt.configure({}) : mathExt;
      finalExtensions.push(configuredExt);
    } catch (e: unknown) {
      emit('error', new Error('Failed to load math extension: ' + String(e)));
    }
  }

  // useEditor can return either an Editor instance or a ref containing the instance
  // depending on Tiptap version. Normalize and coerce types to avoid TS errors.
  const created: any = useEditor({
    content: props.modelValue || '',
    editable: props.editable !== false,
    // cast extensions to any[] to satisfy AnyExtension[] typing differences across versions
    extensions: finalExtensions as any,
    onUpdate({ editor: e }: { editor: any }) {
      emit('update:modelValue', e.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-2 focus:outline-none',
      },
    },
  });

  // `created` may be a ref (contains `.value`) or the editor directly. Unwrap.
  try {
    if (created && typeof created === 'object' && 'value' in created) {
      tiptapEditor.value = created.value as Editor
    } else {
      tiptapEditor.value = created as Editor
    }
  } catch (err) {
    // Fallback: assign as any to avoid runtime crash
    tiptapEditor.value = (created && (created as any).value) || created || null
  }

  emit('ready');
});

// Helper to obtain the concrete Editor instance (handles nested ref cases)
function getEditorInstance() {
  return tiptapEditor.value;
}

// computed proxy for template-friendly usage. We type it `any` to avoid
// TypeScript incompatibilities between the editor runtime shape and the
// static type definitions shipped by tiptap.
const ed = computed<any>(() => tiptapEditor.value)

watch(() => props.modelValue, (v) => {
  const e = getEditorInstance()
  if (!e || !e.commands) return // Ensure editor and its commands are available
  try {
    const isSame = e.getHTML() === v
    if (isSame) return
    // `setContent` typing may expect an options object; cast to any to allow
    // boolean flags used in runtime code and avoid TS errors.
    ;(e.commands as any).setContent(v || '', false)
  } catch (e) {
    // sync failed silently
  }
})

onBeforeUnmount(() => {
  if (tiptapEditor.value) {
    tiptapEditor.value.destroy()
  }
})

// --- Toolbar Actions ---
function addCodeBlock() {
  try {
    const inst = getEditorInstance()
    if (!inst) return
    // Inserts a new paragraph after the current block and turns it into a code block.
    // Use the currently selected language when creating the block.
    const lang = selectedLanguage.value || undefined
    // `toggleCodeBlock` may accept attributes in some versions; fallback to toggling then updating attributes.
    try {
      ;(inst.chain() as any).focus().createParagraphNear().toggleCodeBlock({ language: lang }).run()
    } catch (e) {
      ;(inst.chain() as any).focus().createParagraphNear().toggleCodeBlock().updateAttributes('codeBlock', { language: lang }).run()
    }
  } catch (e) {
    console.error('Failed to insert code block', e)
  }
}

function addMathBlock() {
  try { // This assumes a `insertMathBlock` command exists, which is provided by the math extension.
    const inst = getEditorInstance()
    if (!inst || !props.features?.math) return
    // `insertMathBlock` is provided by the math extension at runtime but may
    // not be present in the static `ChainedCommands` type. Cast chain() to
    // any to avoid TypeScript errors while keeping runtime behavior.
    ;(inst.chain() as any).focus().insertMathBlock().run()
  } catch (e) { 
    console.error('Failed to insert math block', e)
  }
}

function setCodeLanguage() {
  try {
    const inst = getEditorInstance()
    if (!inst) return
    const lang = selectedLanguage.value || null
    // update attributes on the current code block (no-op if not in a code block)
    try {
      ;(inst.chain() as any).focus().updateAttributes('codeBlock', { language: lang }).run()
    } catch (e) {
      // Some tiptap versions expose `setNode` instead
      try { (inst.chain() as any).focus().setNode('codeBlock', { language: lang }).run() } catch (_) {}
    }
  } catch (e) {
    console.error('Failed to set code block language', e)
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
    const i = getEditorInstance(); return i ? (i.commands as any).setContent(html, true) : undefined
  },
  clearContent: () => {
    const i = getEditorInstance(); return i ? (i.commands as any).clearContent(true) : undefined
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

.editor-content :global(.ProseMirror.is-editor-empty:before) {
  content: attr(data-placeholder);
  float: left;
  color: rgb(156, 163, 175);
  pointer-events: none;
  height: 0;
}

.dark .editor-content :global(.ProseMirror.is-editor-empty:before) {
  color: rgb(107, 114, 128);
}

/* Bubble Menu Styling */
.bubble-menu {
  display: flex;
  background-color: rgb(31, 41, 55);
  padding: 0.4rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  z-index: 50;
}

.bubble-menu button {
  border: none;
  background: none;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.35rem 0.6rem;
  border-radius: 0.25rem;
  opacity: 0.8;
  transition: all 0.2s ease;
}

.bubble-menu button:hover {
  opacity: 1;
  background-color: rgba(255,255,255,0.1);
}

.bubble-menu button.is-active {
  opacity: 1;
  background-color: rgba(255,255,255,0.15);
  color: rgb(147, 197, 253);
}

/* Toolbar Styling */
.toolbar {
  border-bottom: 1px solid rgb(229, 231, 235);
  padding: 0.75rem;
  background: rgb(250, 250, 250);
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  display: flex;
  gap: 0.25rem;
}
.dark .toolbar {
  border-color: rgb(75, 85, 99);
  background: rgb(41, 49, 63);
}

.toolbar button {
  display: inline-flex;
  align-items: center;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  color: rgb(55, 65, 81);
  background-color: white;
  border: 1px solid rgb(229, 231, 235);
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
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
