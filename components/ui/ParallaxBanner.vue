<template>
  <section :class="['parallax-banner relative overflow-hidden', heightClass]" ref="root">
    <div
      ref="bg"
      class="absolute inset-0 bg-center bg-cover transform-gpu will-change-transform"
      :style="bgStyle"
      aria-hidden="true"
    ></div>

    <div class="absolute inset-0 bg-black/30"></div>

    <div class="relative z-10 mx-auto max-w-7xl px-6 h-full flex items-center">
      <div class="text-white">
        <h3 class="text-2xl font-bold">{{ title }}</h3>
        <p class="mt-2 max-w-xl">{{ subtitle }}</p>
        <div class="mt-4" v-if="ctaText">
          <NuxtLink :to="ctaLink" class="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-indigo-600">{{ ctaText }}</NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useEventListener } from '@vueuse/core'

const props = defineProps({
  image: { type: String, required: true },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  ctaText: { type: String, default: '' },
  ctaLink: { type: String, default: '/quizzes' },
  // smaller default for denser mobile layout; supports responsive values
  height: { type: String, default: 'h-40 sm:h-56' },
})

const { image, height } = props
const root = ref(null)
const bg = ref(null)
const loaded = ref(false)
const bgStyle = ref({ backgroundImage: '', willChange: 'transform' })

const heightClass = height || 'h-40 sm:h-56'

function loadBackground(){
  if (loaded.value) return
  const img = new Image()
  img.src = image
  img.onload = () => {
    loaded.value = true
    bgStyle.value.backgroundImage = `url(${image})`
  }
}

let observer
onMounted(()=>{
  if ('IntersectionObserver' in window){
    observer = new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if (e.isIntersecting){
          loadBackground()
        }
      })
    }, { root: null, threshold: 0.1 })
    if (root.value) observer.observe(root.value)
  } else {
    // fallback
    loadBackground()
  }
})

onBeforeUnmount(()=>{
  if (observer && root.value) observer.unobserve(root.value)
})

// Simple parallax effect — translateY based on scroll position
function onScroll(){
  if (!root.value || !bg.value) return
  const rect = root.value.getBoundingClientRect()
  const windowHeight = window.innerHeight || document.documentElement.clientHeight
  const visible = Math.max(0, Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0))
  const percent = 1 - (rect.top / windowHeight)
  // clamp
  const offset = Math.round((percent - 0.5) * 30) // ±15px
  bg.value.style.transform = `translate3d(0, ${offset}px, 0) scale(1.05)`
}

// useEventListener from @vueuse/core if available, else fallback
try{
  useEventListener(window, 'scroll', onScroll, { passive: true })
  useEventListener(window, 'resize', onScroll, { passive: true })
} catch (e) {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
}

// watch loaded to trigger an initial scroll positioning
watch(loaded, (v)=>{ if (v) setTimeout(onScroll, 50) })
</script>

<style scoped>
.parallax-banner { position: relative; }
.parallax-banner .bg-center { background-position: center; background-size: cover; }
</style>
