<template>
  <component :is="compName" :class="[baseClass, cardClass, $attrs.class]" v-bind="$attrs">
    <div v-if="$slots.image" class="relative">
      <div :class="[
  // default to a slightly smaller top image height for denser layout
  imageLayout === 'top' ? 'w-full h-24 sm:h-40' : 'absolute inset-0',
        imageLayout === 'side' ? 'lg:relative lg:w-48 lg:h-full' : ''
      ]">
  <slot name="image"></slot>
      </div>
    </div>

    <div :class="[
      imageLayout === 'side' ? 'lg:flex lg:gap-6' : '',
      imageLayout === 'side' ? 'lg:min-h-[12rem]' : ''
    ]">
      <div v-if="imageLayout === 'side'" class="hidden lg:block lg:w-48 shrink-0">
        <!-- Spacer for side image -->
      </div>
      
      <div class="flex-1">
        <div v-if="$slots.header" class="px-4 sm:px-5 pt-4 flex items-start gap-3">
          <slot name="header"></slot>
        </div>

        <div :class="[noPadding ? '' : contentPadding]">
          <slot></slot>
        </div>

        <div v-if="$slots.footer" class="px-4 sm:px-5 pb-4 pt-3">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'default' },
  noPadding: { type: Boolean, default: false },
  imageLayout: { type: String, default: 'none', validator: (v) => ['none', 'top', 'side'].includes(v) }
})

// Slightly larger radius and smoother transitions for a bubbly feel
const baseClass = computed(() => 'rounded-2xl overflow-hidden transition-transform duration-200')

const interactive = 'group hover:-translate-y-0.5 transition-transform duration-200'
const shadowMobile = 'shadow-sm sm:shadow'
const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2'

const cardClass = computed(() => {
  switch (props.variant) {
    case 'elevated': return `bg-white ${shadowMobile} hover:shadow-lg ${interactive} ${focusRing}`
    case 'muted': return `bg-gray-50 ${interactive} ${focusRing}`
    case 'accent': return `bg-gradient-to-r from-indigo-600 to-indigo-500 text-white ${shadowMobile} ${interactive} ${focusRing}`
    default: return `bg-white ${shadowMobile} border border-gray-100 ${interactive} ${focusRing}`
  }
})

const contentPadding = 'p-3 sm:p-4'

const inst = getCurrentInstance()
const hasNuxtCard = !!(inst && inst.appContext && inst.appContext.components && (inst.appContext.components['NUXCard'] || inst.appContext.components['NuxtCard']))
const compName = hasNuxtCard ? (inst.appContext.components['NUXCard'] ? 'NUXCard' : 'NuxtCard') : 'div'
</script>
