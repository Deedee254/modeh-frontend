<template>
  <div v-if="isVerified" :class="['inline-flex items-center gap-1', sizeClass]">
    <UIcon
      :name="iconName"
      :class="[iconSizeClass, colorClass]"
      :title="`Verified ${institutionName}`"
    />
    <span v-if="showLabel" :class="['font-semibold', textSizeClass, colorClass]">
      Verified
    </span>
    <UTooltip v-if="showTooltip" :text="`Verified member of ${institutionName}`" :shortcuts="[]">
      <UIcon name="i-heroicons-information-circle-20-solid" :class="[textSizeClass, colorClass]" />
    </UTooltip>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isVerified: { type: Boolean, default: false },
  institutionName: { type: String, default: 'Institution' },
  size: { type: String, enum: ['xs', 'sm', 'md', 'lg'], default: 'sm' },
  showLabel: { type: Boolean, default: true },
  showTooltip: { type: Boolean, default: false },
  variant: { type: String, enum: ['badge', 'icon', 'inline'], default: 'inline' }
})

const iconName = 'i-heroicons-check-badge-20-solid'

const sizeClass = computed(() => {
  const sizes = {
    xs: 'gap-0.5',
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2'
  }
  return sizes[props.size] || sizes.sm
})

const iconSizeClass = computed(() => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  return sizes[props.size] || sizes.sm
})

const textSizeClass = computed(() => {
  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }
  return sizes[props.size] || sizes.sm
})

const colorClass = 'text-green-600 dark:text-green-400'
</script>
