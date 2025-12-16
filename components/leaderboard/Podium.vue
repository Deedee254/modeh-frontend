<template>
  <div>
    <!-- Full podium for 3+ entries (tablet/desktop) -->
    <div
      v-if="entries && entries.length >= 3"
      class="hidden sm:flex items-end justify-center gap-4 sm:gap-8 text-center"
    >
      <div class="w-1/3" v-for="(p, idx) in topThree" :key="p.id">
        <div class="flex flex-col items-center">
              <div class="relative">
                <img
                  :src="resolvedAvatar(p)"
                  :alt="p.name"
                  :class="avatarClass(idx)"
                />
                <div :class="badgeClass(idx)">{{ idx + 1 }}</div>
              </div>
          <h3 class="font-semibold mt-2 truncate">{{ p.name }}</h3>
          <p class="text-sm text-gray-500">{{ displayPoints(p) }} pts</p>
          <div :class="heightClass(idx)"></div>
        </div>
      </div>
    </div>

    <!-- Mobile stacked top-3 (for small screens) -->
    <div v-if="entries && entries.length >= 3" class="space-y-4 sm:hidden">
          <div v-for="(p, idx) in topThree" :key="p.id" class="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
        <div>
          <div class="relative">
            <img :src="resolvedAvatar(p)" :alt="p.name" class="w-16 h-16 rounded-full object-cover" />
            <div :class="badgeClass(idx)"></div>
          </div>
        </div>
        <div class="flex-1 text-left">
          <div class="font-semibold truncate">{{ p.name }}</div>
          <div class="text-sm text-gray-500">{{ displayPoints(p) }} pts</div>
        </div>
        <div class="text-right text-sm text-gray-500">#{{ idx + 1 }}</div>
      </div>
    </div>

    <!-- Compact for 1-2 entries or fallback on larger screens -->
    <div
      v-else-if="entries && entries.length > 0"
      class="space-y-4 text-center"
    >
      <div v-for="(u, i) in entries" :key="u.id" class="inline-block w-1/3">
        <div class="flex flex-col items-center">
          <div class="relative">
            <!-- crown for first place in compact mode -->
            <svg
              v-if="i === 0"
              class="absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-6 text-amber-400"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M12 2l2.09 4.26L19 7l-3 2.9L16.18 14 12 11.77 7.82 14 9 9.9 6 7l4.91-.74L12 2z"
                fill="currentColor"
              />
            </svg>
            <img
              :src="resolvedAvatar(u)"
              class="w-20 h-20 rounded-full border-4 border-gray-300 object-cover"
            />
            <div
              v-if="i === 0"
              class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-amber-400 text-white rounded-full flex items-center justify-center font-bold"
            >
              1
            </div>
          </div>
          <h3 class="font-semibold mt-2 truncate">{{ u.name }}</h3>
          <p class="text-sm text-gray-500">{{ displayPoints(u) }} pts</p>
          <div class="mt-2 h-16 bg-gray-200 rounded-t-lg w-full"></div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="text-center py-6 text-gray-500">
      <p>No top players yet.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import resolveAssetUrl from '~/composables/useAssets'
const props = defineProps({
  entries: { type: Array, default: () => [] },
  placeholder: { type: String, default: "/logo/avatar-placeholder.png" },
  pointsKey: { type: String, default: "points" },
});

const topThree = computed(() => (props.entries || []).slice(0, 3));

function avatarClass(idx) {
  if (idx === 0)
    return "w-28 h-28 rounded-full border-4 border-amber-400 object-cover";
  if (idx === 1)
    return "w-20 h-20 rounded-full border-4 border-gray-300 object-cover";
  return "w-16 h-16 rounded-full border-4 border-amber-600 object-cover";
}

function badgeClass(idx) {
  const base =
    "absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white";
  if (idx === 0) return base + " bg-amber-400";
  if (idx === 1) return base + " bg-gray-300";
  return base + " bg-amber-600";
}

function heightClass(idx) {
  if (idx === 0) return "mt-2 h-36 bg-amber-300 rounded-t-lg w-full";
  if (idx === 1) return "mt-2 h-24 bg-gray-200 rounded-t-lg w-full";
  return "mt-2 h-20 bg-amber-500 rounded-t-lg w-full";
}

function displayPoints(p) {
  return p[props.pointsKey] ?? p.score ?? 0;
}

function resolvedAvatar(v) {
  try {
    // Backend returns avatar_url (primary DB column) and avatar (accessor)
    let val = null
    if (v && typeof v === 'object') {
      val = v.avatar_url || v.avatar || null
    } else {
      val = v
    }
    return resolveAssetUrl(val) || val || props.placeholder
  } catch {
    return (typeof v === 'string' ? v : null) || props.placeholder
  }
}
</script>

<style scoped>
/* scoped minimal tweaks if needed */
</style>

