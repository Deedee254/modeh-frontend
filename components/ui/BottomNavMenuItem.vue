<!-- MenuItemButton.vue -->
<template>
  <button
    role="menuitem"
    @click.stop="onClickItem"
    class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50"
  >
    <div class="flex items-center gap-3">
      <Icon :name="icon" class="h-5 w-5 text-slate-600" />
      <span class="text-sm text-slate-700">{{ label }}</span>
    </div>
    <Icon name="heroicons:chevron-right" class="h-4 w-4 text-slate-400" />
  </button>
</template>
<script setup>
import { defineProps, toRefs } from 'vue'
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