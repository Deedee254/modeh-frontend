<template>
  <component :is="compName" :class="gridClass"><slot /></component>
</template>

<script setup>
import { getCurrentInstance } from 'vue'
const props = defineProps({ cols: { type: [Number,String], default: '3' } })
const gridClass = props.cols === 'auto' ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6' : `grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-${props.cols} gap-3 sm:gap-6`

const inst = getCurrentInstance()
const hasNuxtGrid = !!(inst && inst.appContext && inst.appContext.components && (inst.appContext.components['NUXGrid'] || inst.appContext.components['NuxtGrid']))
const compName = hasNuxtGrid ? (inst.appContext.components['NUXGrid'] ? 'NUXGrid' : 'NuxtGrid') : 'div'
</script>
