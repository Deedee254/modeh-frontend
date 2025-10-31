<template>
  <transition name="badge-toast" appear>
  <div v-if="visible" class="fixed left-1/2 transform -translate-x-1/2 bottom-20 z-50 pointer-events-auto" role="status" aria-live="polite">
      <div class="bg-white shadow-lg rounded-lg p-4 flex items-center space-x-4 w-96">
        <img v-if="badge?.icon" :src="badge.icon" alt="badge" class="w-12 h-12" />
        <div>
          <div class="font-semibold text-gray-900">{{ title }}</div>
          <div class="text-sm text-gray-600">{{ message }}</div>
        </div>
        <button @click="close" class="ml-auto text-gray-400 hover:text-gray-700">✕</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
const visible = ref(false)
const title = ref('')
const message = ref('')
const badge = ref(null)
let timeoutId = null

function open(badgeData = {}, opts = {}) {
  badge.value = badgeData
  title.value = opts.title || (`Badge earned: ${badgeData.name ?? 'Badge'}`)
  message.value = opts.message || badgeData.description || ''
  visible.value = true
  // small confetti effect using canvas
  try { runConfetti() } catch (e) { /* ignore */ }
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => { visible.value = false }, opts.duration || 4500)
}

// Listen for global events (fired by composable) to open/close, register listeners once
  if (process.client) {
    const openHandler = (e) => { const { badgeData, opts } = e.detail || {}; open(badgeData, opts) }
    const closeHandler = () => close()
    const _onBadgeToastBeforeUnload = () => {
      try { window.removeEventListener('badge-toast-open', openHandler) } catch (e) {}
      try { window.removeEventListener('badge-toast-close', closeHandler) } catch (e) {}
      try { window.removeEventListener('beforeunload', _onBadgeToastBeforeUnload) } catch (e) {}
    }
    window.addEventListener('badge-toast-open', openHandler)
    window.addEventListener('badge-toast-close', closeHandler)
    // clean up on page unload
    try {
      window.addEventListener('beforeunload', _onBadgeToastBeforeUnload)
    } catch (e) {}

    // also remove listeners when the component is unmounted (SPA navigation)
    onBeforeUnmount(() => {
      try { window.removeEventListener('badge-toast-open', openHandler) } catch (e) {}
      try { window.removeEventListener('badge-toast-close', closeHandler) } catch (e) {}
      try { window.removeEventListener('beforeunload', _onBadgeToastBeforeUnload) } catch (e) {}
      try { clearTimeout(timeoutId) } catch (e) {}
    })
  }

function close() {
  visible.value = false
  clearTimeout(timeoutId)
}

// Tiny confetti using canvas; lightweight and doesn't require external libs
function runConfetti() {
  const cvs = document.createElement('canvas')
  cvs.style.position = 'fixed'
  cvs.style.left = '0'
  cvs.style.top = '0'
  cvs.style.pointerEvents = 'none'
  cvs.style.zIndex = '999999'
  cvs.width = window.innerWidth
  cvs.height = window.innerHeight
  document.body.appendChild(cvs)
  const ctx = cvs.getContext('2d')
  const pieces = []
  const colors = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6']
  for (let i=0;i<80;i++) {
    pieces.push({
      x: Math.random()*cvs.width,
      y: -20 - Math.random()*200,
      vx: -2 + Math.random()*4,
      vy: 2 + Math.random()*6,
      size: 4 + Math.random()*8,
      color: colors[Math.floor(Math.random()*colors.length)],
      rot: Math.random()*Math.PI*2,
      rate: -0.1 + Math.random()*0.2
    })
  }
  let t = 0
  function frame() {
    t++
    ctx.clearRect(0,0,cvs.width,cvs.height)
    for (const p of pieces) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.15
      p.rot += p.rate
      ctx.save()
      ctx.translate(p.x,p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size)
      ctx.restore()
    }
    if (t < 200) requestAnimationFrame(frame)
    else document.body.removeChild(cvs)
  }
  requestAnimationFrame(frame)
}

// expose API for programmatic use
defineExpose({ open, close })
</script>

<style scoped>
.badge-toast-enter-active, .badge-toast-leave-active {
  transition: all .24s ease;
}
.badge-toast-enter-from { opacity: 0; transform: translateY(8px) scale(.98); }
.badge-toast-enter-to { opacity: 1; transform: translateY(0) scale(1); }
.badge-toast-leave-from { opacity: 1; transform: translateY(0) scale(1); }
.badge-toast-leave-to { opacity: 0; transform: translateY(8px) scale(.98); }
</style>