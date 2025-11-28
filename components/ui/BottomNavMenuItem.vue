<!-- MenuItemButton.vue -->
<template>
  <button
    role="menuitem"
    @click.stop="onClickItem"
    class="w-full flex items-center justify-between gap-3 px-4 py-2 rounded hover:bg-gray-50 dark:hover:bg-slate-700"
  >
    <div class="flex items-center gap-3">
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
        <Icon :name="icon" class="h-5 w-5" />
      </div>
      <span class="text-sm text-slate-700 dark:text-slate-300">{{ label }}</span>
    </div>
    <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400 dark:text-slate-500" />
  </button>
</template>
<script setup>
import { toRefs } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  }
})

const { to } = toRefs(props)
const router = useRouter()

function onClickItem() {
  if (to.value) {
    router.push(to.value)
  }
}
</script>
