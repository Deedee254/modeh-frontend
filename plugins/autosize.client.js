// Lightweight autosize directive for textareas
import autosize from 'autosize'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  // Register the directive directly on the Vue app so it's available at runtime
  nuxtApp.vueApp.directive('autosize', {
    mounted(el) { if (el && el.tagName === 'TEXTAREA') autosize(el) },
    unmounted(el) { try { autosize.destroy(el) } catch (e) {} }
  })
})
