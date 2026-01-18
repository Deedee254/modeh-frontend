<template>
  <div class="relative rounded-2xl overflow-hidden shadow-sm transition-shadow duration-200 hover:shadow-lg" :style="{ background: bgGradient }">
    <!-- SVG Illustration (external only) -->
    <div v-if="svgSrc" class="absolute right-0 bottom-0 w-48 h-48 opacity-90 pointer-events-none">
      <img :src="svgSrc" alt="" class="w-full h-full object-contain opacity-90 pointer-events-none" />
    </div>

    <div class="p-6 flex flex-col justify-between h-full text-white relative z-10">
      <div>
        <div class="text-sm uppercase tracking-wide opacity-90">{{ label }}</div>
        <h3 class="mt-2 text-2xl font-bold">{{ title }}</h3>
        <p v-if="description" class="mt-2 text-sm opacity-90">{{ description }}</p>

        <!-- Grades: pills -->
        <div class="mt-4" v-if="variant === 'grades'">
          <div class="flex flex-wrap gap-2">
            <template v-for="(g, i) in shownItems" :key="g.id || i">
              <NuxtLink :to="itemLink(g)" class="inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-light transition" :style="pillStyle">{{ g.name || g.id }}</NuxtLink>
            </template>

            <template v-if="extraCount > 0">
              <NuxtLink :to="moreLink" class="inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-light transition" :style="morePillStyle">+{{ extraCount }} more</NuxtLink>
            </template>
          </div>
        </div>

        <!-- Courses: pills in a line -->
        <div class="mt-4" v-if="variant === 'courses'">
          <div class="flex flex-wrap gap-2">
            <template v-for="(c, idx) in shownItems" :key="c.id || idx">
              <NuxtLink :to="itemLink(c)" class="inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-light transition" :style="pillStyle">{{ c.name || c.title }}</NuxtLink>
            </template>

            <template v-if="extraCount > 0">
              <NuxtLink :to="moreLink" class="inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-light transition" :style="morePillStyle">+{{ extraCount }} more</NuxtLink>
            </template>
          </div>
        </div>
      </div>

      <div class="mt-6 text-left">
        <NuxtLink :to="moreLink" class="inline-flex items-center gap-2 px-4 py-2 rounded-md shadow-sm" :style="buttonStyle">{{ buttonText }}</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  variant: { type: String, default: 'grades' },
  moreLink: { type: [String, Object], default: '/' },
  buttonText: { type: String, default: 'View all' },
  colors: { type: Array, default: () => [] },
  svgSrc: { type: String, default: '' },
  bgGradient: { type: String, default: 'linear-gradient(135deg,#891f21,#b23a3f)' }
})

// Brand burgundy
const burgundy = '#891f21'

const showCount = computed(() => props.variant === 'grades' ? 6 : 4)
const shownItems = computed(() => (Array.isArray(props.items) ? props.items.slice(0, showCount.value) : []))
const extraCount = computed(() => Math.max(0, (Array.isArray(props.items) ? props.items.length : 0) - showCount.value))

const labelClass = computed(() => 'font-semibold')
// white text on gradient panels; button becomes white with burgundy text for contrast
const buttonStyle = computed(() => ({ backgroundColor: 'white', color: burgundy }))
const pillStyle = computed(() => ({ backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.95)' }))
const morePillStyle = computed(() => ({ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)' }))

function itemLink(it) {
  if (!it) return props.moreLink
  const slug = it.slug || it.id
  if (props.variant === 'grades') return `/grades/${slug}`
  return `/courses/${slug}`
}

function courseBg(idx) {
  const palette = props.colors && props.colors.length ? props.colors : ['linear-gradient(135deg,#6f0f12,#a83435)','linear-gradient(135deg,#0f4c81,#17679a)','linear-gradient(135deg,#8b2ddb,#b55ef0)']
  return palette[idx % palette.length]
}

function initials(item) {
  const name = item && (item.name || item.title || '')
  if (!name) return ''
  return name.split(' ').map(s => s.charAt(0)).slice(0,2).join('').toUpperCase()
}
</script>

<style scoped>
.rounded-2xl:hover { transform: translateZ(0) }
</style>
