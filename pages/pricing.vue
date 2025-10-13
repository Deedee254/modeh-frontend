<template>
  <div>
    <PageHero
      title="Plans & Pricing"
      description="Flexible plans for individual learners and institutions. Start with a free trial or pick a plan that fits your needs."
      :flush="true"
    >
      <template #eyebrow>
        Pricing
      </template>

      <template #actions>
        <div class="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <NuxtLink to="/register" class="px-4 py-2 bg-white text-indigo-700 rounded">Start free trial</NuxtLink>
          <NuxtLink to="/contact" class="px-4 py-2 border rounded text-white/90">Contact sales</NuxtLink>
        </div>
      </template>

      <template #highlight>
        <div>
          <p class="text-xs uppercase tracking-wide text-white/70">Choose your plan</p>
          <p class="mt-1 text-2xl font-semibold text-white">Flexible pricing</p>
          <p class="mt-2 text-sm text-white/70">From free trials to enterprise solutions</p>
        </div>
      </template>

      <template #highlight-icon>
        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      </template>

      <template #stats>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Flexible billing</p>
          <p class="mt-2 text-xl font-semibold">Starting at $0</p>
        </div>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Team plans</p>
          <p class="mt-2 text-xl font-semibold">Enterprise options</p>
        </div>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Quizzes created</p>
          <p class="mt-2 text-xl font-semibold">500+</p>
        </div>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Users</p>
          <p class="mt-2 text-xl font-semibold">500+</p>
        </div>
      </template>
    </PageHero>

  <!-- Features section (reused style from About) - full width background -->
  <section class="w-full bg-white">
    <div class="mx-auto max-w-7xl px-6 py-16">
      <h2 class="text-center mb-8 text-3xl font-bold text-indigo-900">Powerful Features</h2>
      <p class="text-center text-slate-600 max-w-2xl mx-auto mb-10">Everything you need to create, deliver and analyse quizzes — built for educators and learners.</p>

  <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="(f, i) in [
          { title: 'Quiz Creation', text: 'Create engaging quizzes with multiple question types and reusable banks.', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
          { title: 'Real-time Analytics', text: 'Track learner performance with real-time analytics and reports.', icon: 'M9 19v-6a2 2 0 00-2-2H5' },
          { title: 'Instant Feedback', text: 'Provide immediate feedback and adaptive retry to improve learning.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }
        ]" :key="i" class="group relative overflow-hidden rounded-2xl bg-white p-6 transition-all duration-300 hover:shadow-xl">
          <div class="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-indigo-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div class="relative">
            <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path :d="f.icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
            </div>
            <h3 class="mb-2 text-xl font-semibold text-gray-900">{{ f.title }}</h3>
            <p class="text-slate-600">{{ f.text }}</p>
          </div>
        </div>
      </div>
    </div>
    </section>

    <!-- Packages / Pricing cards (modernized) - full width background with centered content -->
    <section class="w-full bg-gradient-to-br from-white to-indigo-50">
      <div class="mx-auto max-w-6xl px-6 py-16">
        <h2 class="text-center mb-3 text-3xl font-bold text-indigo-900">Plans & pricing</h2>
        <p class="text-center text-slate-600 max-w-2xl mx-auto mb-8">Choose a plan that fits your teaching or learning needs. Start with a free trial and upgrade anytime for more features and team management.</p>

        <div class="grid gap-8 md:grid-cols-3">
        <div v-for="pkg in packages" :key="pkg.id" class="relative rounded-2xl p-6 shadow-md hover:shadow-xl transition bg-white">
          <div :class="['absolute -inset-px rounded-2xl', pkg.popular ? 'bg-gradient-to-br from-indigo-500 to-violet-500 opacity-10' : 'bg-transparent']"></div>
          <div class="relative z-10 flex items-start justify-between gap-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ pkg.name }}</h3>
              <p class="text-sm text-slate-500 mt-1">{{ pkg.short_description || pkg.description }}</p>
            </div>
            <div class="text-right">
              <div class="text-3xl font-extrabold text-gray-900">{{ pkg.price_display || (pkg.price ? pkg.currency + ' ' + pkg.price : 'Free') }}</div>
              <div class="text-sm text-slate-500">/ month</div>
            </div>
          </div>

          <div class="mt-6 border-t pt-6">
            <ul class="space-y-3 text-sm text-slate-700">
              <li v-for="(feat, idx) in (pkg.features || [])" :key="idx" class="flex items-start gap-3">
                <svg class="w-5 h-5 text-green-500 mt-1 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                <span>{{ feat }}</span>
              </li>
            </ul>
          </div>

          <div class="mt-6 flex items-center justify-between">
            <button class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-white font-semibold shadow" @click="onSubscribe(pkg)">
              {{ pkg.popular ? 'Choose plan' : 'Subscribe' }}
            </button>
            <div class="text-sm text-slate-500">
              <template v-if="pkg.more_link">
                <button @click="navigateToLink(pkg.more_link)" class="underline">Learn more</button>
              </template>
            </div>
          </div>

          <div v-if="pkg.popular" class="absolute top-4 right-4 z-20">
            <span class="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">Popular</span>
          </div>
        </div>
        </div>

        <PaymentAwaitingModal :tx="currentTx" :open="modalOpen" @update:open="val => modalOpen = val" @close="() => modalOpen = false" />
      </div>
    </section>

    <!-- CTA banner (full width) -->
    <section class="w-full bg-indigo-700">
      <div class="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
        <div class="text-center sm:text-left">
          <h3 class="text-xl font-bold">Ready to get started?</h3>
          <p class="mt-1 text-sm text-indigo-100/90">Take a quiz to experience Modeh or contact our team to discuss plans and pricing for your institution.</p>
        </div>

        <div class="flex items-center gap-3 justify-center">
          <NuxtLink to="/quiz" class="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-indigo-700 font-semibold shadow">Take a quiz</NuxtLink>
          <NuxtLink to="/contact" class="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2 text-white/95">Contact us</NuxtLink>
        </div>
      </div>
    </section>

  <!-- Testimonials (reuse homepage carousel) -->
  <section class="px-6 py-12 bg-gradient-to-br from-indigo-100 to-white">
      <div class="mx-auto max-w-7xl">
        <h3 class="text-2xl font-bold text-indigo-900 mb-6 text-center">What our users say</h3>
        <client-only>
          <Carousel :items="safeArray(testimonials)" :perViewLg="3" :perViewMd="2" :perViewSm="1" auto>
            <template #item="{ item }">
              <div class="p-3">
                <div class="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm hover:shadow-xl">
                  <blockquote class="text-lg text-gray-700 mb-4">"{{ item.quote || 'Great experience with Modeh!' }}"</blockquote>
                  <div class="flex items-center gap-3">
                    <div class="h-12 w-12 rounded-full bg-indigo-100 grid place-items-center text-indigo-700 font-semibold">{{ (item.name || 'A').charAt(0) }}</div>
                    <div>
                      <div class="font-semibold text-gray-900">{{ item.name || 'Anonymous' }}</div>
                      <div class="text-sm text-indigo-600">{{ item.role || 'User' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Carousel>
        </client-only>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, unref } from 'vue'
import PageHero from '~/components/ui/PageHero.vue'
import { getHeroClass } from '~/utils/heroPalettes'
import { useAuthStore } from '~/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import PaymentAwaitingModal from '~/components/PaymentAwaitingModal.vue'
import Carousel from '~/components/ui/Carousel.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const config = useRuntimeConfig()
// Fetch packages server-side so pricing is public and SEO-friendly
const { data } = await useFetch(`${config.public.apiBase}/api/packages`, { 
  server: true,
  credentials: 'include'
})
const packages = ref(data.value?.packages || [])

// Fetch testimonials (reuse homepage testimonials)
const { data: testimonialsData } = await useFetch(config.public.apiBase + '/api/testimonials', { credentials: 'include' })
const testimonials = testimonialsData?.value?.testimonials?.data || testimonialsData?.value?.testimonials || testimonialsData?.value || []

// local safeArray helper (same logic as homepage helper)
function safeArray(input) {
  const value = unref(input)
  if (Array.isArray(value)) return value
  if (value == null) return []
  if (Array.isArray(value?.data)) return value.data
  if (typeof value === 'object') {
    if (typeof value.length === 'number') return Array.from(value)
    if (value instanceof Set || value instanceof Map) return Array.from(value)
  }
  return []
}

function saveIntent(intent) {
  if (process.client) {
    try {
      localStorage.setItem('modeh:postLoginIntent', JSON.stringify({ ...intent, ts: Date.now() }))
    } catch (e) {}
  }
}

const modalOpen = ref(false)
const currentTx = ref(null)

async function onSubscribe(pkg) {
  if (auth.user) {
    try {
      const res = await $fetch(`${config.public.apiBase}/api/packages/${pkg.id}/subscribe`, { 
        method: 'POST', 
        credentials: 'include' 
      })
      if (res?.ok && res?.tx) {
        currentTx.value = res.tx
        modalOpen.value = true
        return
      }
      // If subscribe returned success without tx, go to subscription
      if (res?.ok) await router.push('/quizee/subscription')
    } catch (err) {
      console.error(err)
      // attempt a friendly fallback: show a toast if available, otherwise alert
      if (process.client && window.$toast) {
        window.$toast.error('Subscription failed. Please try again.')
      } else {
        alert('Subscription failed. Please try again.')
      }
    }
    return
  }

  // Not authenticated: persist intent and redirect to login
  if (process.client) {
    saveIntent({ type: 'subscribe', packageId: pkg.id, from: route.fullPath })
    // prefer query returnTo so login can redirect back; post-login intent will auto-run
    router.push({ name: 'login', query: { returnTo: route.fullPath } })
  } else {
    router.push({ name: 'login' })
  }
}

function navigateToLink(link) {
  if (!link) return
  // Treat API endpoints and absolute external URLs as full-navigation targets
  const isExternal = /^https?:\/\//.test(link) || link.startsWith('/api')
  if (isExternal) {
    // full-page navigation to avoid SPA router trying to match API paths
    if (process.client) window.location.href = link
    return
  }
  // Otherwise use router for internal app routes
  router.push(link)
}
</script>

<style scoped>
/* small, tasteful polish matching existing theme tokens */
.bg-card { background-color: var(--card); }
.text-muted-foreground { color: var(--muted-foreground); }
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
}
.btn-primary {
  background-color: var(--primary);
  color: var(--primary-foreground);
}
.btn-primary:hover { opacity: 0.95; }
</style>
