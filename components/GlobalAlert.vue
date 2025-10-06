<template>
  <div class="fixed top-4 right-4 z-50 w-80" aria-live="polite" aria-atomic="true">
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
          :type="alert.type"
          :title="alert.title"
          :icon="alert.icon"
          class="shadow-lg flex items-start justify-between p-3"
          :ui="{
            wrapper: 'min-w-[300px] pr-2',
            title: 'text-sm font-medium',
            description: 'text-sm'
          }"
        >
          <template v-if="alert.emoji" #icon>
            <span aria-hidden="true" class="text-lg">{{ alert.emoji }}</span>
          </template>

          <div class="whitespace-normal break-words">{{ alert.message }}</div>

          <template #append>
            <button
              type="button"
              @click="dismiss(alert.id)"
              class="ml-3 text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded"
              :aria-label="'Dismiss ' + (alert.title ?? alert.message)"
            >
              ×
            </button>
          </template>
        </UAlert>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useAppAlert } from '~/composables/useAppAlert'
import { onMounted, onBeforeUnmount } from 'vue'
const { alerts, dismiss } = useAppAlert()

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
  transition: all .18s cubic-bezier(.2,.8,.2,1);
}
.alert-enter-from { transform: translateY(-6px); opacity: 0 }
.alert-enter-to { transform: translateY(0); opacity: 1 }
.alert-leave-from { transform: translateY(0); opacity: 1 }
.alert-leave-to { transform: translateY(-6px); opacity: 0 }

.alert-item { display: block }

/* Ensure button has sufficient hit target */
.alert-item button { line-height: 1; padding: 0.25rem 0.4rem }
</style>