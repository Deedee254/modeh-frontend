<template>
  <div>
    <PageHero
      title="My Quizees"
      description="A list of users who follow you, have liked, or have taken your quizzes."
      :breadcrumbs="[{ text: 'Dashboard', href: '/quiz-master/dashboard' }, { text: 'Quizees', current: true }]"
    >
      <template #eyebrow>Quiz-master tools</template>
    </PageHero>

    <div class="px-4 pb-16 md:pb-6">
      <div class="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside class="order-2 space-y-4 lg:order-1">
          <div class="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-600/90 via-emerald-700/90 to-slate-900/90 p-6 text-white shadow-xl">
            <h2 class="text-lg font-semibold">Grow your community</h2>
            <p class="mt-2 text-sm text-white/80">Share quizzes, respond quickly, and keep your quizees engaged. Active learners are surfaced here.</p>
            <ul class="mt-4 space-y-3 text-sm">
              <li class="flex gap-2">
                <span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-300"></span>
                <span>Invite learners directly from your dashboard or quiz analytics.</span>
              </li>
              <li class="flex gap-2">
                <span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-300"></span>
                <span>Reward engagement with timely feedback and follow-up quizzes.</span>
              </li>
            </ul>
            <NuxtLink to="/quiz-master/quizzes/create" class="mt-6 inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5">
              Create a new quiz
            </NuxtLink>
          </div>

          <div class="rounded-3xl border border-border bg-white/70 p-6 shadow-sm backdrop-blur">
            <h3 class="text-sm font-semibold text-slate-800">Filter</h3>
            <p class="mt-1 text-xs text-slate-500">Quickly narrow down your quizees.</p>
            <USelectMenuTeleport
              class="mt-4"
              :options="filterOptions"
              v-model="selectedFilter"
              placeholder="All quizees"
            />
          </div>
        </aside>

        <section class="order-1 lg:order-2">
          <div v-if="pending" class="flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/70 text-center text-sm text-gray-500">
            Loading quizees...
          </div>
          <div v-else-if="error" class="flex h-64 items-center justify-center rounded-3xl border border-dashed border-red-200 bg-red-50 text-center text-sm text-red-500">
            Failed to load quizees. Please try again later.
          </div>
          <div v-else-if="filteredQuizees.length" class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <UCard
              v-for="(quizee, idx) in filteredQuizees"
              :key="quizee?.id || idx"
              class="rounded-3xl border border-border/60 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div class="flex items-start gap-4">
                <div class="relative h-16 w-16 overflow-hidden rounded-2xl border border-emerald-100">
                  <img v-if="quizee.avatar" :src="quizee.avatar" :alt="quizee.name" class="h-full w-full object-cover">
                  <div v-else class="grid h-full w-full place-items-center bg-emerald-50 text-2xl font-bold text-emerald-700">
                    {{ (quizee.name || '').charAt(0).toUpperCase() }}
                  </div>
                  <span
                    v-if="quizee.status"
                    :class="['absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white', statusBadge(quizee.status)]"
                  ></span>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="truncate text-lg font-semibold text-slate-900">{{ quizee.name }}</h3>
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

                  <div class="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span v-if="quizee.quizzes_taken">
                      <strong class="text-slate-700">{{ quizee.quizzes_taken }}</strong> quizzes taken
                    </span>
                    <span v-if="quizee.likes_given">
                      <strong class="text-slate-700">{{ quizee.likes_given }}</strong> likes
                    </span>
                  </div>

                  <div class="mt-5 flex flex-wrap items-center gap-3">
                    <NuxtLink
                      :to="`/users/${quizee.id}`"
                      class="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-50"
                    >
                      View profile
                    </NuxtLink>
                    <UButton
                      size="sm"
                      color="primary"
                      variant="ghost"
                      class="rounded-full text-sm !bg-brand-600 hover:!bg-brand-700 !text-white"
                      @click="() => openChat(quizee)"
                    >
                      Message
                    </UButton>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
          <div v-else class="flex h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/70 text-center text-gray-500">
            <Icon name="heroicons:users" class="mx-auto h-12 w-12 text-gray-300" />
            <h3 class="mt-3 text-base font-semibold text-slate-800">No engaged users yet</h3>
            <p class="mt-1 max-w-sm text-sm text-slate-500">
              When learners follow you, like your quizzes, or take your assessments regularly they will appear here.
            </p>
            <NuxtLink to="/quiz-master/quizzes" class="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5">
              Promote your quizzes
            </NuxtLink>
          </div>
        </section>
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
const selectedFilter = ref('all')

const filterOptions = [
  { label: 'All quizees', value: 'all' },
  { label: 'Followers', value: 'followers' },
  { label: 'Quiz likers', value: 'likers' },
  { label: 'Recently active', value: 'recent' },
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
  switch (selectedFilter.value) {
    case 'followers':
      return quizees.value.filter(q => q?._source?.includes('follower'))
    case 'likers':
      return quizees.value.filter(q => q?._source?.includes('liker'))
    case 'recent':
      return quizees.value
        .filter(q => q?.last_active_at)
        .sort((a, b) => new Date(b.last_active_at).getTime() - new Date(a.last_active_at).getTime())
    default:
      return quizees.value
  }
})

watch(quizees, val => {
  if (!val || !val.length) {
    selectedFilter.value = 'all'
  }
})
</script>
