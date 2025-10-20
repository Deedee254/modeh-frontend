<template>
  <div class="flex items-center gap-1 mt-1 text-[10px] sm:text-xs" :class="isOwn ? 'justify-end pr-1 text-primary-foreground/70' : 'justify-start pl-1 text-muted-foreground'">
    <span class="text-[11px] mr-1">{{ time }}</span>
    <template v-if="isOwn">
      <template v-if="status === 'sending'">
        <span class="text-xs opacity-80">…</span>
      </template>
      <template v-else-if="status === 'failed'">
  <div class="text-xs text-red-600 flex items-center gap-2"><span>!</span><slot name="retry"></slot></div>
      </template>
      <template v-else>
        <!-- sent/delivered/read ticks -->
        <svg v-if="status === 'sent'" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5" /></svg>
        <svg v-else-if="status === 'delivered'" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5" /><path d="M22 10L12 20l-5-5" /></svg>
        <svg v-else-if="status === 'read'" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5" /><path d="M22 10L12 20l-5-5" /></svg>
      </template>
    </template>
  </div>
</template>

<script setup>
defineProps({ time: { type: String, default: '' }, isOwn: { type: Boolean, default: false }, status: { type: String, default: 'sent' } })
</script>
