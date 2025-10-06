<template>
  <div class="max-w-5xl mx-auto px-4 py-10">
    <PageHero title="Contact Us" description="Questions, feedback, or partnership ideas? We’d love to hear from you." align="center" />

    <UCard class="max-w-2xl mx-auto mt-8">
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
</template>

<script setup>
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
