<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageHero 
        title="Terms of Service" 
        description="Please read these terms carefully before using Modeh."
        :breadcrumbs="[
          { text: 'Home', href: '/' },
          { text: 'Terms of Service', current: true }
        ]"
      />

      <div class="mt-8 space-y-6 text-gray-700">
        <section>
          <h2 class="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
          <p>By creating an account or using Modeh, you agree to these Terms of Service.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">2. Accounts</h2>
          <ul class="list-disc list-inside space-y-1">
            <li>You are responsible for safeguarding your password.</li>
            <li>You must provide accurate information.</li>
            <li>We may suspend accounts that violate our policies.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">3. Content</h2>
          <p>You retain ownership of content you create. By uploading content, you grant us rights to store and process it to operate the service.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">4. Acceptable Use</h2>
          <p>No unlawful, harmful, or abusive behavior. Respect others' rights and privacy.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">5. Termination</h2>
          <p>We may suspend or terminate your access if you violate these terms.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-2">6. Changes</h2>
          <p>We may update these terms. Continued use means you accept the changes.</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Terms of Service — Modeh',
  meta: [
    { name: 'description', content: 'Read Modeh Terms of Service — rules for using the platform, content ownership, account responsibilities, and termination policies.' },
    { property: 'og:title', content: 'Terms of Service — Modeh' },
    { property: 'og:description', content: 'Read Modeh Terms of Service — rules for using the platform, content ownership, account responsibilities, and termination policies.' }
  ]
})

import PageHero from '~/components/ui/PageHero.vue'
</script>