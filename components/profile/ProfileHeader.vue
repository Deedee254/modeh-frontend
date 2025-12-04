<template>
  <div class="relative overflow-hidden rounded-xl border bg-white shadow-sm">
    <!-- Cover -->
    <div
      class="h-32 sm:h-40 bg-slate-100 flex items-center justify-center"
    :style="resolvedCoverUrl ? { backgroundImage: `url(${resolvedCoverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}"
    >
      <slot name="cover"> </slot>
    </div>

    <!-- Avatar + Meta -->
    <div class="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-end gap-4 items-center">
      <div class="-mt-14 sm:-mt-16">
        <!-- make this a group so children can respond to hover -->
        <div class="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full ring-4 ring-white mx-auto sm:mx-0 group">
          <div class="w-full h-full rounded-full overflow-hidden bg-slate-200">
            <img v-if="resolvedAvatarUrl" :src="resolvedAvatarUrl" alt="avatar" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full grid place-items-center text-slate-400">NA</div>
          </div>

          <!-- optional avatar controls (e.g. edit overlay) - hidden by default, fade in on hover -->
          <div class="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-in-out pointer-events-none group-hover:pointer-events-auto">
            <slot name="avatarControls" />
          </div>
        </div>
      </div>

      <div class="flex-1 text-center sm:text-left">
        <div class="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <h2 class="text-xl sm:text-2xl font-bold">{{ title }}</h2>
          <slot name="badge"></slot>
        </div>
        <p v-if="subtitle" class="text-slate-600 mt-1">{{ subtitle }}</p>
        <div v-if="$slots.meta" class="mt-2 text-sm text-slate-500">
          <slot name="meta"></slot>
        </div>
      </div>

      <div class="flex-shrink-0 flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center justify-start sm:justify-end">
        <!-- Actions slot: children are encouraged to use `w-full sm:w-auto` so they
             become full-width on mobile and auto on larger screens. -->
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { resolveAssetUrl } from '~/composables/useAssets'

const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  coverUrl: { type: String, default: '' },
})

const resolvedAvatarUrl = computed(() => resolveAssetUrl(props.avatarUrl) || null)
const resolvedCoverUrl = computed(() => resolveAssetUrl(props.coverUrl) || null)
</script>
