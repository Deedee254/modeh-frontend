// Lightweight autosize directive for textareas
import autosize from 'autosize'
export default defineNuxtPlugin(() => {
  return {
    directives: {
      autosize: {
        mounted(el) { if (el && el.tagName === 'TEXTAREA') autosize(el) },
        unmounted(el) { try { autosize.destroy(el) } catch (e) {} }
      }
    }
  }
})
