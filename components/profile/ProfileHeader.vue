<template>
  <div class="relative overflow-hidden rounded-xl border bg-white shadow-sm">
    <!-- Cover -->
    <div
      class="h-32 sm:h-40 bg-slate-100 flex items-center justify-center"
      :style="coverUrl ? { backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}"
    >
      <slot name="cover"> </slot>
    </div>

    <!-- Avatar + Meta -->
    <div class="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-end gap-4">
      <div class="-mt-14 sm:-mt-16">
  <div class="w-20 h-20 sm:w-28 sm:h-28 rounded-full ring-4 ring-white overflow-hidden bg-slate-200">
          <img v-if="avatarUrl" :src="avatarUrl" alt="avatar" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full grid place-items-center text-slate-400">NA</div>
        </div>
      </div>

      <div class="flex-1">
        <div class="flex items-center gap-2 flex-wrap">
          <h2 class="text-xl sm:text-2xl font-bold">{{ title }}</h2>
          <slot name="badge"></slot>
        </div>
        <p v-if="subtitle" class="text-slate-600 mt-1">{{ subtitle }}</p>
        <div v-if="$slots.meta" class="mt-2 text-sm text-slate-500">
          <slot name="meta"></slot>
        </div>
      </div>

      <div class="flex-shrink-0 flex flex-col sm:flex-row gap-2">
  <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  coverUrl: { type: String, default: '' },
})
</script>