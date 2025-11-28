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
          <NuxtLink to="/register" class="px-4 py-2 bg-white text-brand-600 rounded">Start free trial</NuxtLink>
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

  <!-- Pricing Tabs Section -->
  <section class="w-full bg-white">
    <div class="mx-auto max-w-7xl px-6 py-20">
      <!-- Toggle/Tab Section -->
      <div class="mb-16">
        <div class="flex justify-center mb-12">
          <div class="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1">
            <button 
              @click="pricingTab = 'quizee'"
              :class="[
                'px-6 py-2 rounded-full font-semibold transition-all duration-300',
                pricingTab === 'quizee' 
                  ? 'bg-white text-brand-700 shadow-md' 
                  : 'text-slate-600 hover:text-slate-900'
              ]"
            >
              <svg class="inline-block w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.5 1.5H5.75A2.25 2.25 0 003.5 3.75v12.5A2.25 2.25 0 005.75 18.5h8.5a2.25 2.25 0 002.25-2.25V10M10.5 1.5v4m0-4L16 7m-2 1.5h-8"/>
              </svg>
              For Learners
            </button>
            <button 
              @click="pricingTab = 'institution'"
              :class="[
                'px-6 py-2 rounded-full font-semibold transition-all duration-300',
                pricingTab === 'institution' 
                  ? 'bg-white text-brand-700 shadow-md' 
                  : 'text-slate-600 hover:text-slate-900'
              ]"
            >
              <svg class="inline-block w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.5 2.5h-7A1.5 1.5 0 002 4v12a1.5 1.5 0 001.5 1.5h7m0-14h7a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5h-7m0-14v14m0-14H10v14h.5"/>
              </svg>
              For Institutions
            </button>
          </div>
        </div>

        <!-- Quizee Packages Section -->
        <div v-if="pricingTab === 'quizee'" class="animate-in fade-in duration-300">
          <div class="text-center mb-12">
            <h3 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Designed for Learners</h3>
            <p class="text-lg text-slate-600">Choose your learning journey. Start free or upgrade for premium features.</p>
          </div>

          <div class="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <div v-for="pkg in filterPackages('quizee')" :key="pkg.id" class="group relative">
              <!-- Card Background with Popular highlight -->
              <div :class="[
                'absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 -z-10',
                pkg.popular ? 'bg-gradient-to-br from-brand-600 to-brand-700' : 'bg-gradient-to-br from-slate-200 to-slate-300'
              ]"></div>
              
              <div class="relative rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition duration-300 flex flex-col h-full">
                <!-- Popular Badge -->
                <div v-if="pkg.popular" class="absolute -top-4 right-6">
                  <span class="inline-flex items-center gap-1 rounded-full bg-brand-600 text-white px-3 py-1 text-xs font-semibold shadow-md">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    Most Popular
                  </span>
                </div>

                <!-- Header -->
                <div class="mb-6">
                  <h4 class="text-2xl font-bold text-gray-900">{{ pkg.name }}</h4>
                  <p class="text-sm text-slate-500 mt-2">{{ pkg.short_description }}</p>
                </div>

                <!-- Price -->
                <div class="mb-6">
                  <div class="flex items-baseline gap-1">
                    <span class="text-4xl font-extrabold text-brand-600">{{ pkg.price ? pkg.currency + pkg.price : 'Free' }}</span>
                    <span v-if="pkg.price" class="text-slate-600">/month</span>
                  </div>
                  <p v-if="!pkg.price" class="text-sm text-slate-500 mt-2">Perfect to get started</p>
                </div>

                <!-- CTA Button -->
                <button 
                  @click="onSubscribe(pkg)"
                  :class="[
                    'w-full py-3 px-4 rounded-lg font-semibold transition-all mb-6',
                    pkg.popular 
                      ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:shadow-lg hover:-translate-y-0.5' 
                      : 'border-2 border-brand-600 text-brand-600 hover:bg-brand-50'
                  ]"
                >
                  {{ pkg.price ? 'Start Free Trial' : 'Get Started' }}
                </button>

                <!-- Features List -->
                <div class="flex-grow">
                  <p class="text-xs uppercase font-semibold text-slate-500 mb-4">What's included</p>
                  <ul class="space-y-3">
                    <li v-for="(feat, idx) in (pkg.features?.display || pkg.features || []).slice(0, 5)" :key="idx" class="flex items-start gap-3">
                      <svg class="w-5 h-5 text-brand-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z"/>
                      </svg>
                      <span class="text-sm text-slate-700">{{ feat }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Limits Info -->
                <div v-if="pkg.features?.limits" class="mt-6 pt-6 border-t border-slate-200">
                  <p class="text-xs font-semibold text-slate-500 uppercase mb-3">Daily Limits</p>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between items-center">
                      <span class="text-slate-600">Quiz Results</span>
                      <span class="font-semibold text-slate-900">{{ pkg.features.limits.quiz_results === null ? 'Unlimited' : pkg.features.limits.quiz_results }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-slate-600">Battles</span>
                      <span class="font-semibold text-slate-900">{{ pkg.features.limits.battle_results === null ? 'Unlimited' : pkg.features.limits.battle_results }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Institution Packages Section -->
        <div v-if="pricingTab === 'institution'" class="animate-in fade-in duration-300">
          <div class="text-center mb-12">
            <h3 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Scalable for Teams & Schools</h3>
            <p class="text-lg text-slate-600">From small teams to enterprise. Get dedicated support and custom solutions.</p>
          </div>

          <div class="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            <div v-for="pkg in filterPackages('institution')" :key="pkg.id" class="group relative">
              <!-- Card Background with Popular highlight -->
              <div :class="[
                'absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 -z-10',
                pkg.popular ? 'bg-gradient-to-br from-brand-600 to-brand-700' : 'bg-gradient-to-br from-slate-200 to-slate-300'
              ]"></div>
              
              <div class="relative rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition duration-300 flex flex-col h-full">
                <!-- Popular Badge -->
                <div v-if="pkg.popular" class="absolute -top-4 right-6">
                  <span class="inline-flex items-center gap-1 rounded-full bg-brand-600 text-white px-3 py-1 text-xs font-semibold shadow-md">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    Recommended
                  </span>
                </div>

                <!-- Header -->
                <div class="mb-6">
                  <h4 class="text-2xl font-bold text-gray-900">{{ pkg.name }}</h4>
                  <p class="text-sm text-slate-500 mt-2">{{ pkg.short_description }}</p>
                </div>

                <!-- Price -->
                <div class="mb-6">
                  <div class="flex items-baseline gap-1">
                    <span class="text-4xl font-extrabold text-brand-600">{{ pkg.price ? pkg.currency + pkg.price : 'Custom' }}</span>
                    <span v-if="pkg.price" class="text-slate-600">/month</span>
                  </div>
                  <p class="text-sm text-slate-500 mt-2">{{ pkg.price ? 'for up to 100 users' : 'Contact for pricing' }}</p>
                </div>

                <!-- CTA Button -->
                <button 
                  @click="pricingTab === 'institution' && pkg.price ? onSubscribe(pkg) : router.push('/contact')"
                  :class="[
                    'w-full py-3 px-4 rounded-lg font-semibold transition-all mb-6',
                    pkg.popular 
                      ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:shadow-lg hover:-translate-y-0.5' 
                      : 'border-2 border-brand-600 text-brand-600 hover:bg-brand-50'
                  ]"
                >
                  {{ pkg.price ? 'Start Free Trial' : 'Contact Sales' }}
                </button>

                <!-- Features List -->
                <div class="flex-grow">
                  <p class="text-xs uppercase font-semibold text-slate-500 mb-4">Everything included</p>
                  <ul class="space-y-3">
                    <li v-for="(feat, idx) in (pkg.features?.display || pkg.features || []).slice(0, 6)" :key="idx" class="flex items-start gap-3">
                      <svg class="w-5 h-5 text-brand-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z"/>
                      </svg>
                      <span class="text-sm text-slate-700">{{ feat }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Support Info -->
                <div class="mt-6 pt-6 border-t border-slate-200">
                  <p class="text-xs font-semibold text-slate-500 uppercase mb-3">Support & Management</p>
                  <div class="space-y-2 text-sm text-slate-700">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-brand-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z"/></svg>
                      <span>Priority email & chat support</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-brand-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z"/></svg>
                      <span>User management & analytics</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Enterprise CTA -->
          <div class="mt-16 text-center">
            <div class="inline-block rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100/50 border border-brand-200 p-8">
              <h4 class="text-2xl font-bold text-gray-900 mb-2">Need a custom solution?</h4>
              <p class="text-slate-600 mb-6">Our team can create a tailored package for your institution's specific needs.</p>
              <button 
                @click="router.push('/contact')"
                class="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-700 transition"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
                Talk to our team
              </button>
            </div>
          </div>
        </div>

        <PaymentAwaitingModal :tx="currentTx" :open="modalOpen" @update:open="val => modalOpen = val" @close="() => modalOpen = false" />
      </div>
    </div>
  </section>

    <!-- CTA banner (full width) -->
    <section class="w-full bg-gradient-to-r from-brand-600 to-brand-700">
      <div class="mx-auto max-w-7xl px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
        <div>
          <h3 class="text-3xl font-bold mb-2">Ready to transform learning?</h3>
          <p class="text-lg text-brand-100">Join thousands of educators and learners already using Modeh.</p>
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-4 shrink-0">
          <NuxtLink to="/register" class="inline-flex items-center gap-2 bg-white text-brand-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-100 transition">
            Get Started Free
          </NuxtLink>
          <NuxtLink to="/contact" class="inline-flex items-center gap-2 border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
            Talk to Sales
          </NuxtLink>
        </div>
      </div>
    </section>

  <!-- Testimonials (reuse homepage carousel) -->
  <section class="px-6 py-20 bg-white">
      <div class="mx-auto max-w-7xl">
        <div class="text-center mb-12">
          <h3 class="text-3xl font-bold text-gray-900 mb-3">Loved by educators and learners</h3>
          <p class="text-lg text-slate-600">See what our community has to say about Modeh</p>
        </div>
        <client-only>
          <Carousel :items="safeArray(testimonials)" :perViewLg="3" :perViewMd="2" :perViewSm="1" auto>
            <template #item="{ item }">
              <div class="p-3">
                <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 to-slate-50 p-6 shadow-sm hover:shadow-xl transition border border-brand-100">
                  <div class="flex items-start gap-1 mb-3">
                    <svg v-for="i in 5" :key="i" class="w-4 h-4 text-brand-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  </div>
                  <blockquote class="text-gray-900 mb-4 font-medium">"{{ item.quote || 'Great experience with Modeh!' }}"</blockquote>
                  <div class="flex items-center gap-3 pt-4 border-t border-brand-200">
                    <div class="h-10 w-10 rounded-full bg-brand-600 text-white grid place-items-center font-semibold text-sm">{{ (item.name || 'A').charAt(0) }}</div>
                    <div>
                      <div class="font-semibold text-gray-900">{{ item.name || 'Anonymous' }}</div>
                      <div class="text-xs text-slate-500">{{ item.role || 'User' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Carousel>
        </client-only>
      </div>
    </section>

    <!-- FAQ Section (optional but helpful) -->
    <section class="w-full bg-slate-50 px-6 py-20">
      <div class="mx-auto max-w-3xl">
        <div class="text-center mb-12">
          <h3 class="text-3xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h3>
          <p class="text-lg text-slate-600">Can't find what you're looking for?</p>
        </div>
        <div class="space-y-4">
          <details class="group rounded-lg border border-slate-200 bg-white p-6 hover:border-brand-300 transition cursor-pointer">
            <summary class="flex items-center justify-between font-semibold text-gray-900 select-none">
              Can I switch between plans?
              <svg class="w-5 h-5 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </summary>
            <p class="mt-4 text-slate-600">Yes! You can upgrade or downgrade your plan anytime. Changes take effect at the start of your next billing cycle.</p>
          </details>
          <details class="group rounded-lg border border-slate-200 bg-white p-6 hover:border-brand-300 transition cursor-pointer">
            <summary class="flex items-center justify-between font-semibold text-gray-900 select-none">
              Do you offer discounts for annual billing?
              <svg class="w-5 h-5 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </summary>
            <p class="mt-4 text-slate-600">Absolutely! Contact our sales team to learn about annual billing discounts and enterprise pricing options.</p>
          </details>
          <details class="group rounded-lg border border-slate-200 bg-white p-6 hover:border-brand-300 transition cursor-pointer">
            <summary class="flex items-center justify-between font-semibold text-gray-900 select-none">
              What payment methods do you accept?
              <svg class="w-5 h-5 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </summary>
            <p class="mt-4 text-slate-600">We accept all major credit cards, PayPal, and bank transfers for enterprise accounts.</p>
          </details>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// SEO meta for Pricing page
definePageMeta({
  title: 'Pricing — Modeh',
  meta: [
    { name: 'description', content: 'Flexible plans for individual learners and institutions. Start with a free trial or pick a plan that fits your needs.' },
    { property: 'og:title', content: 'Pricing — Modeh' },
    { property: 'og:description', content: 'Flexible plans for individual learners and institutions. Start with a free trial or pick a plan that fits your needs.' }
  ]
})

import { ref, unref } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'
import PageHero from '~/components/ui/PageHero.vue'
import { getHeroClass } from '~/utils/heroPalettes'
import { useAuthStore } from '~/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import PaymentAwaitingModal from '~/components/PaymentAwaitingModal.vue'
import Carousel from '~/components/ui/Carousel.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const pricingTab = ref('quizee')

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

// Filter packages by type
function filterPackages(type) {
  return packages.value.filter(pkg => {
    const pkgType = pkg.type || pkg.category || (pkg.name?.toLowerCase().includes('institution') ? 'institution' : 'quizee')
    return pkgType.includes(type)
  })
}

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
      // attempt a friendly fallback: use app alert composable
      try { useAppAlert().push({ message: 'Subscription failed. Please try again.', type: 'error' }) } catch (e) { console.error(e) }
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
