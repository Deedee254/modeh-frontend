<template>
  <div :class="['w-full flex flex-col items-center text-center p-2 sm:p-4 rounded-lg', isActive ? 'ring-2 ring-brand-600 bg-brand-50/30' : '']">
    <div class="relative">
      <img 
        :src="avatarSrc || '/images/avatar-placeholder.png'"
        :alt="player.first_name"
        class="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
      />
      <div v-if="isActive" class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" aria-hidden="true"></div>
      <div v-else class="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-200 rounded-full border-2 border-white dark:border-gray-800" aria-hidden="true"></div>

      <div v-if="typeof score === 'number'" class="absolute -top-2 -right-2 bg-white dark:bg-gray-800 border rounded-full px-2 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300 shadow">
        {{ score }}
      </div>
    </div>
    <h4 class="mt-3 text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 truncate w-full">{{ player.first_name }} {{ player.last_name }}</h4>
    <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{{ role }}</p>
    <div v-if="typeof answered === 'number'" class="text-xs text-gray-500 mt-2">Answered: <span class="font-medium text-gray-700">{{ answered }}</span></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import resolveAssetUrl from '~/composables/useAssets'

const props = defineProps({
  player: { type: Object, required: true },
  role: { type: String, default: 'Player' },
  score: { type: Number, default: null },
  isActive: { type: Boolean, default: false },
  answered: { type: Number, default: null }
})

// Match Leaderboard.vue/Podium.vue's resolvedAvatar pattern for consistency
function resolvePlayerAvatar(v) {
  try {
    // If an object is passed, pick the avatar fields in order (prioritize avatar_url)
    let val = null
    if (v && typeof v === 'object') {
    // Prefer the canonical backend field `avatarUrl` (frontend normalized) then `avatar`, `avatar_url`, `photo`, `profile.avatar`, `profile_image`.
    val = v.avatarUrl || v.avatar || v.avatar_url || v.photo || (v.profile && (v.profile.avatar || v.profile.profile_image)) || null
    } else {
      val = v
    }
    return resolveAssetUrl(val) || val || '/images/avatar-placeholder.png'
  } catch {
    return (typeof v === 'string' ? v : null) || '/images/avatar-placeholder.png'
  }
}

const avatarSrc = computed(() => {
  return resolvePlayerAvatar(props.player)
})
</script>
