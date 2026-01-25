<template>
  <div class="max-w-5xl mx-auto px-4 py-10">
    <PageHero 
      title="Privacy Policy" 
      description="Your privacy matters. Learn how Modeh collects and uses your data."
      :breadcrumbs="[
        { text: 'Home', href: '/' },
        { text: 'Privacy Policy', current: true }
      ]"
    />

    <div class="mt-8 space-y-6 text-gray-700">
      <section>
        <h2 class="text-xl font-semibold mb-2">1. Data We Collect</h2>
        <ul class="list-disc list-inside space-y-1">
          <li>Account details like name and email</li>
          <li>Usage data such as page views and actions</li>
          <li>Content you create (e.g., quizzes, questions)</li>
        </ul>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-2">2. How We Use Data</h2>
        <p>To provide and improve the service, personalize content, and ensure security.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-2">3. Cookies</h2>
        <p>We use cookies for authentication and essential functionality.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-2">4. Your Choices</h2>
        <p>You can request data export or deletion by contacting support.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-2">5. Contact</h2>
        <p>Questions? Email privacy@modeh.example.</p>
      </section>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Privacy Policy — Modeh',
  meta: [
    { name: 'description', content: 'Your privacy matters. Learn how Modeh collects and uses your data, and what choices you have about your information.' },
    { property: 'og:title', content: 'Privacy Policy — Modeh' },
    { property: 'og:description', content: 'Your privacy matters. Learn how Modeh collects and uses your data, and what choices you have about your information.' }
  ]
})

import PageHero from '~/components/ui/PageHero.vue'
</script>