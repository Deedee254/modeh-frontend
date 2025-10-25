<template>
  <div class="max-w-7xl mx-auto px-4 py-10">
    <PageHero
      title="Contact Us"
      description="Questions, feedback, or partnership ideas? We’d love to hear from you."
      :flush="true"
    >
      <template #eyebrow>
        Contact
      </template>

      <template #highlight>
        <div>
          <p class="text-xs uppercase tracking-wide text-white/70">Get in touch</p>
          <p class="mt-1 text-2xl font-semibold text-white">We're here to help</p>
          <p class="mt-2 text-sm text-white/70">Support, partnerships, and feedback welcome</p>
        </div>
      </template>

      <template #highlight-icon>
        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </template>

      <template #stats>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Support</p>
          <p class="mt-2 text-xl font-semibold">24h response</p>
        </div>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Partners</p>
          <p class="mt-2 text-xl font-semibold">Welcome</p>
        </div>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Quizzes</p>
          <p class="mt-2 text-xl font-semibold">500+</p>
        </div>
        <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
          <p class="text-xs uppercase tracking-wide text-white/60">Users</p>
          <p class="mt-2 text-xl font-semibold">500+</p>
        </div>
      </template>
    </PageHero>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
      <!-- Left: Contact details and map -->
      <div class="lg:col-span-1 space-y-6">
        <UCard>
          <template #header>
            <div class="font-semibold">Get in touch</div>
          </template>
          <div class="space-y-3 text-sm text-slate-700">
            <div>
              <div class="text-xs uppercase text-indigo-600 font-medium">Address</div>
              <div class="mt-1 font-medium text-gray-800">123 Education Street</div>
              <div class="text-sm text-gray-500">San Francisco, CA 94105</div>
            </div>

            <div>
              <div class="text-xs uppercase text-indigo-600 font-medium">Phone</div>
              <div class="mt-1"><a href="tel:+15551234567" class="text-indigo-600">+1 (555) 123-4567</a></div>
            </div>

            <div>
              <div class="text-xs uppercase text-indigo-600 font-medium">Email</div>
              <div class="mt-1"><a href="mailto:support@modeh.example" class="text-indigo-600">support@modeh.example</a></div>
            </div>

            <div>
              <div class="text-xs uppercase text-indigo-600 font-medium">Office hours</div>
              <div class="mt-1 text-sm text-gray-600">Mon–Fri: 9:00 AM — 6:00 PM PST<br/>Sat: 10:00 AM — 2:00 PM PST</div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="font-semibold">Visit us</div>
          </template>
          <div class="mt-2">
            <div class="w-full h-36 sm:h-48 rounded overflow-hidden">
              <!-- Map embed (OpenStreetMap) -->
              <iframe
                title="Office location"
                class="w-full h-full border-0"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-122.409%2C37.787%2C-122.405%2C37.789&amp;layer=mapnik"
                aria-hidden="false"
              ></iframe>
            </div>
            <div class="mt-2 text-sm text-gray-600">Map is an approximate location.</div>
          </div>
        </UCard>
      </div>

      <!-- Right: Contact form -->
      <div class="lg:col-span-2">
        <UCard>
          <template #header>
            <div class="font-semibold">Send us a message</div>
          </template>

          <form class="space-y-5" @submit.prevent="submit">
            <div class="grid sm:grid-cols-2 gap-4">
              <UFormGroup label="Name" required>
                <UInput v-model="form.name" placeholder="Your full name" />
              </UFormGroup>
              <UFormGroup label="Email" required>
                <UInput v-model="form.email" type="email" placeholder="you@example.com" />
              </UFormGroup>
            </div>

            <UFormGroup label="Subject">
              <USelect v-model="form.subject" :options="subjects" placeholder="Choose a subject" />
            </UFormGroup>

            <UFormGroup label="Message" required>
              <UTextarea v-model="form.message" :rows="6" placeholder="How can we help?" />
            </UFormGroup>

            <div class="flex items-center gap-3">
              <UButton type="submit" color="primary" :loading="loading">Send message</UButton>
              <span v-if="success" class="text-green-600 text-sm">Thanks! We’ll get back to you soon.</span>
              <span v-if="error" class="text-red-600 text-sm">{{ error }}</span>
            </div>
          </form>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup>
// SEO meta for Contact page
definePageMeta({
  title: 'Contact — Modeh',
  meta: [
    { name: 'description', content: 'Questions, feedback, or partnership ideas? We’d love to hear from you. Get in touch with the Modeh team for support and partnerships.' },
    { property: 'og:title', content: 'Contact — Modeh' },
    { property: 'og:description', content: 'Questions, feedback, or partnership ideas? We’d love to hear from you. Get in touch with the Modeh team for support and partnerships.' }
  ]
})

import { ref, reactive } from 'vue'
import PageHero from '~/components/ui/PageHero.vue'

const subjects = ['General', 'Support', 'Partnership', 'Feedback']
const loading = ref(false)
const success = ref(false)
const error = ref('')
const form = reactive({ name: '', email: '', subject: '', message: '' })

async function submit() {
  error.value = ''
  success.value = false
  if (!form.name || !form.email || !form.message) {
    error.value = 'Please fill required fields.'
    return
  }
  loading.value = true
  try {
    // If backend has a contact endpoint, wire here. Placeholder only:
    await new Promise(r => setTimeout(r, 600))
    success.value = true
  } catch (e) {
    error.value = 'Unable to send message. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
