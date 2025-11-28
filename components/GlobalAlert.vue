<template>
  <!-- Increased width for better message display -->
  <div class="fixed top-4 right-4 z-50 w-full max-w-sm sm:max-w-md" aria-live="polite" aria-atomic="true">
    <transition-group name="alert" tag="div" class="space-y-2">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="alert-item"
        role="status"
        tabindex="0"
        :aria-label="alert.title ?? alert.type + ' notification'"
      >
        <UAlert
          :color="alertColor(alert.type)"
          variant="subtle"
          :title="alert.title"
          :icon="alert.icon || defaultIcon(alert.type)"
          :description="alert.message"
          :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }"
          @close="dismiss(alert.id)"
          class="shadow-lg"
          :ui="{
            title: 'text-sm font-semibold',
            description: 'text-sm mt-1 break-words whitespace-normal',
            icon: { base: 'flex-shrink-0 w-5 h-5' },
            closeButton: {
              base: 'ml-auto'
            }
          }"
        >
          <!--
            The UAlert component in Nuxt UI v2.15+ handles title, description, icon, and close button via props.
            The default slot is no longer needed for the main message if you pass it as a description.
            This simplifies the template significantly.
          -->
          <!--
            Old structure for reference:
            <template v-if="alert.emoji" #icon>
              <span aria-hidden="true" class="text-lg">{{ alert.emoji }}</span>
            </template>
            <div class="whitespace-normal break-words">{{ alert.message }}</div>
            <template #append>
              <button @click="dismiss(alert.id)"> × </button>
            </template>
          -->
        </UAlert>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useAppAlert } from '~/composables/useAppAlert'
import { onMounted, onBeforeUnmount } from 'vue'
const { alerts, dismiss } = useAppAlert()

// Map your alert types to Nuxt UI color props
function alertColor(type?: string) {
  switch (type) {
    case 'success': return 'green'
    case 'error': return 'red'
    case 'warning': return 'amber'
    case 'info':
    default:
      return 'blue'
  }
}

// Provide default icons for each type
function defaultIcon(type?: string) {
  switch (type) {
    case 'success': return 'i-heroicons-check-circle'
    case 'error': return 'i-heroicons-x-circle'
    case 'warning': return 'i-heroicons-exclamation-triangle'
    case 'info':
    default:
      return 'i-heroicons-information-circle'
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && alerts.value && alerts.value.length) {
    const last = alerts.value[alerts.value.length - 1]
    if (last) dismiss(last.id)
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.alert-enter-active, .alert-leave-active {
  transition: all 0.3s ease-out;
}
.alert-enter-from,
.alert-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.alert-item { display: block }
</style>
