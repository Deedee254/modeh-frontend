<template>
  <!-- Render nothing on server to avoid portal issues -->
  <Teleport to="body" v-if="mounted">
    <transition name="u-modal-fade">
      <div v-show="modelVisible" class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="onBackdropClick"
          aria-hidden="true"
        ></div>

        <!-- Modal panel -->
        <div
          class="relative z-10 w-full max-h-[95vh] overflow-auto rounded-xl bg-white shadow-xl"
          :class="widthClass"
          role="dialog"
          aria-modal="true"
          @click.stop
        >
          <slot />
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: boolean
  ui?: { width?: string }
  preventClose?: boolean
}>(), { modelValue: false, ui: () => ({}), preventClose: false })

const emit = defineEmits(['update:modelValue'])

const modelVisible = ref(!!props.modelValue)
watch(() => props.modelValue, v => modelVisible.value = !!v)
watch(modelVisible, v => emit('update:modelValue', v))

const mounted = ref(false)
onMounted(() => {
  mounted.value = true
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && !props.preventClose) {
    modelVisible.value = false
  }
}

function onBackdropClick() {
  if (!props.preventClose) modelVisible.value = false
}

const widthClass = computed(() => {
  // Accept a Tailwind width string via props.ui.width, fall back to a sensible default
  return (props.ui && props.ui.width) ? String(props.ui.width) : 'sm:max-w-2xl'
})
</script>

<style scoped>
.u-modal-fade-enter-active, .u-modal-fade-leave-active {
  transition: opacity 200ms ease;
}
.u-modal-fade-enter-from, .u-modal-fade-leave-to {
  opacity: 0;
}
</style>
