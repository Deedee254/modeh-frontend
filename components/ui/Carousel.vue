<template>
  <div class="relative" @mouseenter="pause" @mouseleave="resume">
    <div class="overflow-hidden" ref="containerEl">
      <div
        class="flex transition-transform duration-500"
        :style="{ transform: `translateX(-${currentIndex * slideWidth}px)` }"
        ref="trackEl"
      >
        <div v-for="(item, i) in items" :key="i" class="shrink-0 px-2" :style="{ width: slideWidth + 'px' }">
          <slot name="item" :item="item" :index="i" />
        </div>
      </div>
    </div>

    <!-- Arrows -->
    <button
      v-if="arrows && showNav"
      @click="prev"
      class="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-700 rounded-full w-9 h-9 grid place-items-center shadow"
      aria-label="Previous"
    >
      <UIcon name="i-heroicons-chevron-left" />
    </button>
    <button
      v-if="arrows && showNav"
      @click="next"
      class="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-700 rounded-full w-9 h-9 grid place-items-center shadow"
      aria-label="Next"
    >
      <UIcon name="i-heroicons-chevron-right" />
    </button>

    <!-- Dots -->
    <div v-if="dots && showDots" class="mt-3 flex items-center justify-center gap-2">
      <button
        v-for="(dot, i) in totalPages"
        :key="i"
        @click="goTo(i)"
        :aria-label="`Go to slide ${i + 1}`"
        class="w-2.5 h-2.5 rounded-full transition"
        :class="i === pageIndex ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-gray-300 dark:bg-slate-600'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

interface Props {
  items: any[]
  auto?: boolean
  interval?: number
  perView?: number // xl+
  perViewLg?: number // lg
  perViewMd?: number // md
  perViewSm?: number // sm
  perViewXs?: number // xs
  arrows?: boolean
  dots?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  auto: false,
  interval: 3500,
  perView: 4,
  perViewLg: 3,
  perViewMd: 2,
  perViewSm: 2,
  perViewXs: 1,
  arrows: true,
  dots: true,
})

const containerEl = ref<HTMLElement | null>(null)
const trackEl = ref<HTMLElement | null>(null)
const currentIndex = ref(0)
const containerWidth = ref(0)

const perViewComputed = computed(() => {
  if (typeof window === 'undefined') return props.perView
  if (window.innerWidth < 640) return props.perViewXs
  if (window.innerWidth < 768) return props.perViewSm
  if (window.innerWidth < 1024) return props.perViewMd
  if (window.innerWidth < 1280) return props.perViewLg
  return props.perView
})

const slideWidth = computed(() => {
  return containerWidth.value / perViewComputed.value
})

const showNav = computed(() => (props.items?.length || 0) > perViewComputed.value)

// Dots logic - page-based rather than item index for clarity
const totalPages = computed(() => {
  const len = props.items?.length || 0
  return Math.max(1, Math.ceil(len / perViewComputed.value))
})
const pageIndex = computed(() => {
  const width = slideWidth.value
  if (!width) return 0
  return Math.round(currentIndex.value / perViewComputed.value)
})
const showDots = computed(() => totalPages.value > 1)

let timer: any = null
function startAuto() {
  if (!props.auto) return
  stopAuto()
  timer = setInterval(() => next(), props.interval)
}
function stopAuto() { if (timer) clearInterval(timer); timer = null }
function pause() { stopAuto() }
function resume() { startAuto() }

function next() {
  const maxIndex = Math.max(0, (props.items?.length || 0) - perViewComputed.value)
  currentIndex.value = currentIndex.value >= maxIndex ? 0 : currentIndex.value + 1
}
function prev() {
  const maxIndex = Math.max(0, (props.items?.length || 0) - perViewComputed.value)
  currentIndex.value = currentIndex.value <= 0 ? maxIndex : currentIndex.value - 1
}
function goTo(page: number) {
  const target = Math.min(totalPages.value - 1, Math.max(0, page))
  currentIndex.value = target * perViewComputed.value
}

function measure() {
  if (!containerEl.value) return
  containerWidth.value = containerEl.value.clientWidth
}

onMounted(() => {
  measure()
  window.addEventListener('resize', measure)
  startAuto()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', measure)
  stopAuto()
})

watch(perViewComputed, () => {
  // reset index on breakpoint changes to avoid half-visible cards
  currentIndex.value = 0
  measure()
})
</script>

<style scoped>
/* minimal styles; layout handled via inline widths and Tailwind spacing */
</style>