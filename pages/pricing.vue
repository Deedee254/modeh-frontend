<template>
  <div class="max-w-6xl mx-auto py-16 px-6">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-extrabold">Plans & Pricing</h1>
      <p class="mt-4 text-lg text-muted-foreground">Choose a plan that fits your learning goals. Start with a trial or subscribe for full access.</p>
    </div>

    <div class="grid gap-8 md:grid-cols-3">
      <div v-for="pkg in packages" :key="pkg.id" class="border rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow bg-card">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold">{{ pkg.name }}</h2>
            <p class="text-sm text-muted-foreground mt-1">{{ pkg.short_description || pkg.description }}</p>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold">{{ pkg.price_display || (pkg.price ? pkg.currency + ' ' + pkg.price : 'Free') }}</div>
            <div class="text-sm text-muted-foreground">/ month</div>
          </div>
        </div>

        <ul class="mt-6 space-y-2 text-sm text-muted-foreground">
          <li v-for="(feat, idx) in (pkg.features || [])" :key="idx" class="flex items-start gap-3">
            <svg class="w-4 h-4 text-green-500 mt-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            <span>{{ feat }}</span>
          </li>
        </ul>

        <div class="mt-6 flex items-center justify-between">
          <button class="btn btn-primary" @click="onSubscribe(pkg)">
            Subscribe
          </button>
          <template v-if="pkg.more_link">
            <button @click="navigateToLink(pkg.more_link)" class="text-sm text-muted-foreground hover:underline bg-transparent border-0 p-0">Learn more</button>
          </template>
        </div>
      </div>
    </div>

    <PaymentAwaitingModal :tx="currentTx" :open="modalOpen" @update:open="val => modalOpen = val" @close="() => modalOpen = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import PaymentAwaitingModal from '~/components/PaymentAwaitingModal.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

// Fetch packages server-side so pricing is public and SEO-friendly
const { data } = await useFetch('/api/packages', { server: true })
const packages = ref(data.value?.packages || [])

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
      const res = await $fetch(`/api/packages/${pkg.id}/subscribe`, { method: 'POST', credentials: 'include' })
      if (res?.ok && res?.tx) {
        currentTx.value = res.tx
        modalOpen.value = true
        return
      }
      // If subscribe returned success without tx, go to subscription
      if (res?.ok) await router.push('/student/subscription')
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
