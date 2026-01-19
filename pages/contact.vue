<template>
  <div>
    <div class="max-w-7xl mx-auto px-4 py-6">
      <nav class="text-sm text-gray-600 mb-4">
        <NuxtLink to="/" class="hover:text-brand-600">Home</NuxtLink>
        <span class="mx-2">›</span>
        <span>Contact Us</span>
      </nav>
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Contact Us</h1>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-10">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left: Contact details and map -->
      <div class="lg:col-span-1 space-y-6">
        <UCard>
          <template #header>
            <div class="font-semibold">Get in touch</div>
          </template>
          <div class="space-y-3 text-sm text-slate-700">
            <div>
              <div class="text-xs uppercase text-brand-600 font-medium">Address</div>
              <div class="mt-1 font-medium text-gray-800">123 Education Street</div>
              <div class="text-sm text-gray-500">San Francisco, CA 94105</div>
            </div>

            <div>
              <div class="text-xs uppercase text-brand-600 font-medium">Phone</div>
              <div class="mt-1"><a href="tel:+254703155693" class="text-brand-600">+254 703 155 693</a></div>
            </div>

            <div>
              <div class="text-xs uppercase text-brand-600 font-medium">Email</div>
              <div class="mt-1"><a href="mailto:info@modeh.co.ke" class="text-brand-600">info@modeh.co.ke</a></div>
            </div>

            <div>
              <div class="text-xs uppercase text-brand-600 font-medium">Office hours</div>
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
              <UButton type="submit" color="primary" :loading="loading" class="!bg-brand-600 hover:!bg-brand-700">Send message</UButton>
              <span v-if="success" class="text-green-600 text-sm">Thanks! We'll get back to you soon.</span>
              <span v-if="error" class="text-red-600 text-sm">{{ error }}</span>
            </div>
          </form>
        </UCard>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
// SEO meta for Contact page
definePageMeta({
  title: 'Contact — Modeh',
  meta: [
    { name: 'description', content: "Questions, feedback, or partnership ideas? We'd love to hear from you. Get in touch with the Modeh team for support and partnerships." },
    { property: 'og:title', content: 'Contact — Modeh' },
    { property: 'og:description', content: "Questions, feedback, or partnership ideas? We'd love to hear from you. Get in touch with the Modeh team for support and partnerships." }
  ]
})

import { ref, reactive } from 'vue'

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
