<template>
  <div>
    <!-- Render normal on server, teleport to body on client to avoid clipping -->
    <teleport to="body" v-if="mounted">
      <component
        :is="componentName"
        v-model="internalValue"
        v-bind="other"
        :class="teleportClass"
      />
    </teleport>
    <component v-else :is="componentName" v-model="internalValue" v-bind="other" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, useAttrs } from 'vue'

const props = defineProps({
  modelValue: null
})
const emit = defineEmits(['update:modelValue'])

// Capture all incoming props so we can forward them to the wrapped component
const allProps = useAttrs()

const internalValue = ref(props.modelValue)
watch(() => props.modelValue, v => { internalValue.value = v })
watch(internalValue, v => emit('update:modelValue', v))

const mounted = ref(false)
onMounted(() => { mounted.value = true })

// Reference the globally-registered component by name instead of importing the module entry-point
const componentName = 'USelectMenu'

const other = computed(() => {
  // forward all attributes except modelValue
  return allProps
})

const teleportClass = 'z-50'
</script>
