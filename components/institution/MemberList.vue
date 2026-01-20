
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { resolveAssetUrl } from '~/composables/useAssets'

type Props = {
  members?: Array<{ id: number; name?: string; email?: string; role?: string; avatar?: string; profile?: any }>;
  meta?: { total?: number; per_page?: number; current_page?: number; last_page?: number };
}
const props = defineProps<Props>()

const route = useRoute()

// Get avatar URL using asset composable
const getAvatarUrl = (member: any) => {
  const val = member?.avatar_url || member?.avatar || member?.image || member?.avatarUrl || member?.photo || null
  return resolveAssetUrl(val) || '/logo/avatar-placeholder.png'
}

// Generate profile detail link based on role
const getProfileLink = (member: any) => {
  const institutionSlug = route.params.slug || 'institution'
  if (member.role === 'quiz-master') {
    // Format: just the name in lowercase
    const slug = member.name ? member.name.toLowerCase().replace(/\s+/g, '-') : member.id
    return `/institution-manager/institutions/${institutionSlug}/quiz-masters/${slug}/details`
  } else if (member.role === 'quizee') {
    const slug = member.name ? member.name.toLowerCase().replace(/\s+/g, '-') : member.id
    return `/institution-manager/institutions/${institutionSlug}/quizees/${slug}/details`
  }
  return '#'
}

const getRoleIcon = (role: string | undefined) => {
  switch (role) {
    case 'quiz-master':
      return '📝'
    case 'quizee':
      return '🎓'
    case 'institution-manager':
      return '⚙️'
    default:
      return '👤'
  }
}

const getRoleColor = (role: string | undefined) => {
  switch (role) {
    case 'quiz-master':
      return 'blue'
    case 'quizee':
      return 'emerald'
    case 'institution-manager':
      return 'purple'
    default:
      return 'gray'
  }
}
</script>

<template>
  <div>
    <div v-if="!members || members.length === 0" class="text-sm text-gray-600">No members found.</div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="m in members"
        :key="m.id"
        :to="getProfileLink(m)"
        class="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
      >
        <!-- Gradient accent -->
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r" :class="{
          'from-blue-500 to-blue-600': getRoleColor(m.role) === 'blue',
          'from-emerald-500 to-emerald-600': getRoleColor(m.role) === 'emerald',
          'from-purple-500 to-purple-600': getRoleColor(m.role) === 'purple',
          'from-gray-500 to-gray-600': getRoleColor(m.role) === 'gray'
        }"></div>

        <!-- Content -->
        <div class="flex items-start gap-4">
          <!-- Avatar -->
          <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            <img :src="getAvatarUrl(m)" :alt="m.name" class="w-full h-full object-cover">
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
              {{ m.name || 'Unknown' }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">{{ m.email }}</p>
            
            <!-- Grade and Level Info -->
            <div class="mt-2 flex flex-wrap gap-2 items-center">
              <!-- Grade -->
              <span v-if="m.profile?.grade?.name" class="text-xs px-2 py-1 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
                📚 {{ m.profile?.grade?.name }}
              </span>
              <!-- Level -->
              <span v-if="m.profile?.level?.name" class="text-xs px-2 py-1 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                ⭐ {{ m.profile?.level?.name }}
              </span>
            </div>

            <!-- Role Badge -->
            <div class="mt-3 flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize" :class="{
                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300': getRoleColor(m.role) === 'blue',
                'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300': getRoleColor(m.role) === 'emerald',
                'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300': getRoleColor(m.role) === 'purple',
                'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300': getRoleColor(m.role) === 'gray'
              }">
                {{ m.role }}
              </span>
            </div>
          </div>

          <!-- Arrow Icon -->
          <div class="flex-shrink-0 text-gray-400 dark:text-gray-600 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div v-if="meta && meta.current_page && meta.last_page && meta.last_page > 1" class="flex items-center justify-between mt-6">
      <div class="text-sm text-gray-600">Page {{ meta.current_page }} of {{ meta.last_page }}</div>
      <div class="space-x-2">
        <button :disabled="meta.current_page <= 1" @click="$emit('page-change', meta.current_page - 1)" class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
        <button :disabled="meta.current_page >= meta.last_page" @click="$emit('page-change', meta.current_page + 1)" class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

