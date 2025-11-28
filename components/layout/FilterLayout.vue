
<template>
  <div class="flex gap-6">
    <aside class="w-full max-w-xs sticky top-0 h-screen overflow-y-auto p-4 bg-gray-50 rounded-lg">
      <div class="mb-4">
        <input 
          type="text" 
          placeholder="Search..." 
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-100"
          @input="$emit('search', $event.target.value)"
        />
      </div>
      <slot name="filters"></slot>
    </aside>
    <main class="flex-1">
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
defineEmits(['search'])
</script>

