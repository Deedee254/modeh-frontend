<template>
  <div class="rich-editor">
    <div class="toolbar mb-2 flex flex-wrap gap-1 border-b pb-2">
      <button @click="toggleBold" title="Bold" class="px-2 py-1 text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded">B</button>
      <button @click="toggleItalic" title="Italic" class="px-2 py-1 text-sm italic hover:bg-gray-100 dark:hover:bg-gray-700 rounded">I</button>
      <button @click="toggleStrike" title="Strikethrough" class="px-2 py-1 text-sm line-through hover:bg-gray-100 dark:hover:bg-gray-700 rounded">S</button>
      <button @click="toggleCodeBlock" title="Code block" class="px-2 py-1 text-xs font-mono hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Code</button>
      <button v-if="features?.math" @click="insertInlineMath" title="Insert math formula" class="px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded">ƒ(x)</button>
    </div>

        <div v-if="editor && editor.value" class="editor-content">
          <TiptapEditorContent :editor="editor" />
        </div>
        <div v-else>
          <textarea :value="modelValue || ''" @input="onTextInput" placeholder="Enter question text..." class="w-full min-h-[120px] border border-gray-200 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
        </div>
  </div>
</template>

<script setup lang="ts">
    import { watch, onBeforeUnmount, defineExpose } from 'vue'
import { useEditor, EditorContent as TiptapEditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import MathExtension from '@aarkue/tiptap-math-extension'

const props = defineProps<{ modelValue?: string; editable?: boolean; features?: { math?: boolean; code?: boolean } }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void; (e: 'ready'): void; (e: 'error', err: Error): void }>()

const editor = process.client ? useEditor({
  content: props.modelValue || '<p></p>',
  editable: props.editable !== false,
  extensions: [StarterKit, ...(props.features?.math ? [MathExtension] : [])],
  onUpdate({ editor: e }) {
    emit('update:modelValue', e.getHTML())
  }
}) : null

// rely on Nuxt/Vue components auto-import for UButton/UIcon

watch(() => props.modelValue, (v) => {
  if (!editor?.value) return
  const current = editor.value.getHTML()
  if (v !== current) editor.value.commands.setContent(v || '<p></p>')
})
onBeforeUnmount(() => { if (editor?.value?.destroy) editor.value.destroy() })

function focus() { try { editor?.value?.commands.focus() } catch (e) {} }
function toggleBold() { try { editor?.value?.commands.toggleBold() } catch (e) {} }
function toggleItalic() { try { editor?.value?.commands.toggleItalic() } catch (e) {} }
function toggleStrike() { try { editor?.value?.commands.toggleStrike() } catch (e) {} }
function toggleCodeBlock() { try { editor?.value?.commands.toggleCodeBlock() } catch (e) {} }
function insertInlineMath() { try { if (props.features?.math && editor?.value) editor.value.commands.insertContent('\\(' + 'a = b + c' + '\\)') } catch (e) {} }
function insertBlockMath() { try { if (props.features?.math && editor?.value) editor.value.commands.insertContent('\n$$E = mc^2$$\n') } catch (e) {} }

function onTextInput(e: Event) {
  const t = e.target as HTMLTextAreaElement | null
  if (!t) return
  emit('update:modelValue', t.value || '')
}

defineExpose({
  focus,
  insertInlineMath,
  insertBlockMath,
  toggleCodeBlock,
  toggleInlineCode: insertInlineMath,
  getHTML: () => editor?.value ? editor.value.getHTML() : '',
  setHTML: (html: string) => { if (editor?.value) editor.value.commands.setContent(html) }
})
</script>

<style scoped>
.rich-editor {
  width: 100%;
}

.editor-content :global(.ProseMirror) {
  outline: none;
  min-height: 120px;
  padding: 0.75rem;
  border: 1px solid rgb(229, 231, 235);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  caret-color: rgb(99, 102, 241);
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.dark .editor-content :global(.ProseMirror) {
  border-color: rgb(75, 85, 99);
  background-color: rgb(55, 65, 81);
  color: rgb(229, 231, 235);
}

.editor-content :global(.ProseMirror:focus) {
  outline: none;
  box-shadow: 0 0 0 2px rgb(79, 70, 229), inset 0 0 0 1px rgb(79, 70, 229);
}

.editor-content :global(.ProseMirror p) {
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.editor-content :global(.ProseMirror p:first-child) {
  margin-top: 0;
}

.editor-content :global(.ProseMirror p:last-child) {
  margin-bottom: 0;
}

.toolbar {
  border-color: rgb(229, 231, 235);
}

.dark .toolbar {
  border-color: rgb(75, 85, 99);
}

.toolbar button {
  font-size: 0.875rem;
  transition: all 0.2s;
  color: rgb(107, 114, 128);
  border: none;
  cursor: pointer;
}

.dark .toolbar button {
  color: rgb(156, 163, 175);
}

.toolbar button:hover {
  background-color: rgb(243, 244, 246);
}

.dark .toolbar button:hover {
  background-color: rgb(75, 85, 99);
}
</style>
