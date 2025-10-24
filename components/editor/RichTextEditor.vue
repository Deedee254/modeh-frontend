<template>
  <div class="rich-editor">
    <div class="toolbar mb-2 flex gap-2">
      <UButton size="sm" variant="soft" class="px-2" @click="toggleBold">B</UButton>
      <UButton size="sm" variant="soft" class="px-2" @click="toggleItalic">I</UButton>
      <UButton size="sm" variant="soft" class="px-2" @click="toggleStrike">S</UButton>
      <UButton size="sm" variant="soft" class="px-2" @click="toggleCodeBlock">Code</UButton>
      <UButton size="sm" variant="soft" class="px-2" @click="insertInlineMath">
        <UIcon name="i-heroicons-calculator" class="h-4 w-4 mr-1" />
        <span class="text-xs">Math</span>
      </UButton>
      <div class="ml-auto">
        <UButton size="sm" variant="ghost" @click="focus">Focus</UButton>
      </div>
    </div>

        <div v-if="editor && editor.value">
          <TiptapEditorContent :editor="editor" />
        </div>
        <div v-else>
          <!-- textarea fallback so the field remains editable before tiptap initializes -->
          <textarea :value="modelValue || ''" @input="onTextInput" class="w-full min-h-[120px] border rounded p-2"></textarea>
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
.editor-root :global(.ProseMirror) {
  outline: none;
  min-height: 120px;
}
.toolbar button { border: 1px solid rgba(0,0,0,0.06); }
</style>
