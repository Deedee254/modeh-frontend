<template>
  <div>
    <PageHero
      title="My Quizees"
      description="A list of users who follow you, have liked, or have taken your quizzes."
      :breadcrumbs="[{ text: 'Dashboard', href: '/quiz-master/dashboard' }, { text: 'Quizees', current: true }]"
    >
      <template #eyebrow>Quiz-master tools</template>
    </PageHero>

    <div class="min-h-[calc(100vh-240px)] bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main>
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <!-- Controls: Sort, Per Page -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div class="flex items-center gap-3 ml-auto">
                <USelectMenu v-model="sortBy" :options="sortOptions" class="w-40" />
                <USelect v-model.number="perPage" @change="onPerPageChange" :options="[{label: '6/page', value: 6}, {label: '12/page', value: 12}, {label: '20/page', value: 20}]" class="w-28" />
              </div>
            </div>
            <!-- List -->
            <div v-if="pending" class="flex h-64 items-center justify-center text-center text-sm text-gray-500">
              Loading quizees...
            </div>
            <div v-else-if="error" class="flex h-64 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-center text-sm text-red-500">
              Failed to load quizees. Please try again later.
            </div>
            <div v-else-if="paginatedQuizees.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <UCard
                v-for="(quizee, idx) in paginatedQuizees"
                :key="quizee?.id || idx"
                class="rounded-xl border border-border/60 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div class="flex items-start gap-4">
                  <div class="relative h-16 w-16 overflow-hidden rounded-xl border border-emerald-100 flex-shrink-0">
                    <img v-if="quizee.avatar_url || quizee.avatar || quizee.image || quizee.avatarUrl || quizee.photo" :src="resolveAssetUrl(quizee.avatar_url || quizee.avatar || quizee.image || quizee.avatarUrl || quizee.photo) || quizee.avatar_url || quizee.avatar || quizee.image || quizee.avatarUrl || quizee.photo" :alt="quizee.name" class="h-full w-full object-cover">
                    <div v-else class="grid h-full w-full place-items-center bg-emerald-50 text-lg font-bold text-emerald-700">
                      {{ (quizee.name || '').charAt(0).toUpperCase() }}
                    </div>
                    <span
                      v-if="quizee.status"
                      :class="['absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white', statusBadge(quizee.status)]"
                    ></span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <h3 class="truncate text-base font-semibold text-slate-900">{{ quizee.name }}</h3>
                      <UBadge
                        v-for="badge in quizeeBadges(quizee)"
                        :key="badge.label"
                        :color="badge.color"
                        variant="soft"
                        class="rounded-full text-xs"
                      >
                        {{ badge.label }}
                      </UBadge>
                    </div>
                    <p class="mt-1 text-sm text-slate-500 truncate">{{ quizee.email }}</p>

                    <div v-if="quizee.last_active_at" class="mt-2 flex items-center gap-2 text-xs text-slate-400">
                      <Icon name="heroicons:clock" class="h-4 w-4" />
                      Active {{ formatRelative(quizee.last_active_at) }}
                    </div>

                    <div class="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span v-if="quizee.quizzes_taken">
                        <strong class="text-slate-700">{{ quizee.quizzes_taken }}</strong> quizzes
                      </span>
                      <span v-if="quizee.likes_given">
                        <strong class="text-slate-700">{{ quizee.likes_given }}</strong> likes
                      </span>
                    </div>

                    <div class="mt-4 flex flex-wrap items-center gap-2">
                      <NuxtLink
                        :to="`/quiz-master/followers/${encodeURIComponent(quizee.name)}`"
                        class="inline-flex items-center gap-2 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-50"
                      >
                        View profile
                      </NuxtLink>
                      <UButton
                        size="xs"
                        color="primary"
                        variant="ghost"
                        class="rounded-lg text-xs !bg-brand-600 hover:!bg-brand-700 !text-white"
                        @click="() => openChat(quizee)"
                      >
                        Message
                      </UButton>
                    </div>
                  </div>
                </div>
              </UCard>
            </div>
            <div v-else class="flex h-72 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/70 text-center text-gray-500">
              <Icon name="heroicons:users" class="mx-auto h-12 w-12 text-gray-300" />
              <h3 class="mt-3 text-base font-semibold text-slate-800">No engaged users yet</h3>
              <p class="mt-1 max-w-sm text-sm text-slate-500">
                When Quizees follow you, like your quizzes, or take your assessments regularly they will appear here.
              </p>
              <NuxtLink to="/quiz-master/quizzes" class="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5">
                Promote your quizzes
              </NuxtLink>
            </div>

            <!-- Pagination -->
            <div v-if="paginatedQuizees.length > 0" class="mt-8 pt-6 border-t border-slate-200">
              <Pagination :paginator="paginatorObj" @change-page="onPageChange" />
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { formatDistanceToNowStrict } from 'date-fns'
import PageHero from '~/components/ui/PageHero.vue'
import USelectMenuTeleport from '~/components/ui/USelectMenuTeleport.vue'
import useApi from '~/composables/useApi'
import { resolveAssetUrl } from '~/composables/useAssets'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'quiz-master',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: 'Your quizees and created content as a quiz-master.' }
  ]
})

useHead({
  title: 'My Quizees'
})

const router = useRouter()
const data = ref(null)
const pending = ref(true)
const error = ref(null)
const sortBy = ref('newest')
const perPage = ref(12)
const currentPage = ref(1)

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Most Active', value: 'active' }
]

const api = useApi()

async function loadFollowers() {
  pending.value = true
  error.value = null
  try {
  // backend API routes are mounted under /api (see backend routes/api.php)
  // ensure we call the API-prefixed path so the request hits the correct controller
  const res = await api.get('/api/quiz-master/followers')
    if (api.handleAuthStatus(res)) {
      // handleAuthStatus will redirect to login when needed
      return
    }
    if (!res.ok) throw new Error('Failed to fetch')
    const json = await res.json()
    data.value = json
  } catch (err) {
    console.error('Failed to load quiz-master followers', err)
    error.value = err
    data.value = null
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  loadFollowers()
})

function formatRelative(date) {
  if (!date) return ''
  try {
    return formatDistanceToNowStrict(new Date(date), { addSuffix: true })
  } catch (e) {
    return ''
  }
}

function quizeeBadges(quizee) {
  const badges = []
  if (quizee?._source?.includes('follower')) {
    badges.push({ label: 'Follower', color: 'emerald' })
  }
  if (quizee?._source?.includes('liker')) {
    badges.push({ label: 'Likes your quizzes', color: 'sky' })
  }
  return badges
}

function statusBadge(status) {
  switch ((status || '').toLowerCase()) {
    case 'online':
      return 'bg-emerald-500'
    case 'away':
      return 'bg-amber-400'
    default:
      return 'bg-slate-300'
  }
}

function openChat(quizee) {
  if (!quizee?.id) return
  router.push({ path: '/quiz-master/chat', query: { user: quizee.id } })
}

// Merge followers and likers into single de-duped list while preserving source badges
const quizees = computed(() => {
  const resp = data.value || {}
  const followers = Array.isArray(resp.followers) ? resp.followers : []
  const likers = Array.isArray(resp.likers) ? resp.likers : []

  const map = new Map()
  followers.forEach(u => {
    if (!u || !u.id) return
    map.set(u.id, { ...u, _source: ['follower'] })
  })
  likers.forEach(u => {
    if (!u || !u.id) return
    const existing = map.get(u.id)
    if (existing) {
      existing._source = Array.from(new Set([...(existing._source || []), 'liker']))
      map.set(u.id, existing)
    } else {
      map.set(u.id, { ...u, _source: ['liker'] })
    }
  })

  return Array.from(map.values())
})

const filteredQuizees = computed(() => {
  if (!Array.isArray(quizees.value)) return []
  
  let result = [...quizees.value]
  
  // Apply sorting
  switch (sortBy.value) {
    case 'oldest':
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      break
    case 'active':
      result.sort((a, b) => {
        const aActive = new Date(a.last_active_at || 0).getTime()
        const bActive = new Date(b.last_active_at || 0).getTime()
        return bActive - aActive
      })
      break
    case 'newest':
    default:
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      break
  }
  
  return result
})

const paginatorObj = computed(() => ({
  total: filteredQuizees.value.length,
  pageSize: perPage.value,
  currentPage: currentPage.value
}))

const paginatedQuizees = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredQuizees.value.slice(start, end)
})

function onPerPageChange() {
  currentPage.value = 1 // Reset to first page when changing per-page count
}

function onPageChange(page) {
  currentPage.value = page
}

watch(quizees, val => {
  currentPage.value = 1 // Reset pagination when data changes
})
</script>
