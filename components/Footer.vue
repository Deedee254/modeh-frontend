<template>
  <footer class="flex-shrink-0 border-t dark:border-slate-800 bg-white dark:bg-slate-900" style="color: brand-600">
    <div class="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 items-start">
      <div>
        <div class="flex items-center gap-3">
          <img src="/logo/modeh-logo.png" alt="Modeh" class="h-8" />
        </div>
        <div class="mt-3 text-sm text-brand-600/80">Create and take beautiful quizzes — for quiz-mastering, classrooms and practice. Fast to build, fun to take.</div>
        <div class="mt-4 flex gap-4">
          <a href="https://twitter.com/modeh" target="_blank" rel="noopener noreferrer" class="text-brand-600 hover:text-brand-700 transition" aria-label="Twitter">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0016 3c-2.5 0-4.5 2.5-4 5a10.66 10.66 0 01-7.73-3.9 4.48 4.48 0 001.39 6A4.48 4.48 0 012 6.5v.06A4.48 4.48 0 004.47 11a4.52 4.52 0 01-2.02.08 4.48 4.48 0 004.19 3.11A9 9 0 012 19.54a12.65 12.65 0 006.86 2c8.32 0 12.87-6.88 12.87-12.85 0-.2 0-.39-.02-.58A9.22 9.22 0 0023 3z" />
            </svg>
          </a>
          <a href="https://facebook.com/modeh" target="_blank" rel="noopener noreferrer" class="text-brand-600 hover:text-brand-700 transition" aria-label="Facebook">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a6 6 0 00-6 6v3H7v4h2v8h4v-8h3l1-4h-4V8a1 1 0 011-1h3z"/></svg>
          </a>
          <a href="https://instagram.com/modeh" target="_blank" rel="noopener noreferrer" class="text-brand-600 hover:text-brand-700 transition" aria-label="Instagram">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/></svg>
          </a>
          <a href="https://linkedin.com/company/modeh" target="_blank" rel="noopener noreferrer" class="text-brand-600 hover:text-brand-700 transition" aria-label="LinkedIn">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2" fill="currentColor"/></svg>
          </a>
        </div>
      </div>

      <div>
        <div class="font-semibold text-brand-600 mb-3">Register</div>
        <nav class="mt-3 text-sm space-y-2 text-brand-600/70">
          <NuxtLink to="/register/quiz-master" class="block hover:text-brand-600">Quiz-master</NuxtLink>
          <NuxtLink to="/register/quizee" class="block hover:text-brand-600">Quizee</NuxtLink>
          <NuxtLink to="/register/parent" class="block hover:text-brand-600">Parent</NuxtLink>
        </nav>
      </div>

      <div>
        <div class="font-semibold text-brand-600">Company</div>
        <nav class="mt-3 text-sm space-y-2 text-brand-600/70">
          <NuxtLink to="/about" class="block hover:text-brand-600" active-class="" exact-active-class="">About</NuxtLink>
          <NuxtLink to="/contact" class="block hover:text-brand-600" active-class="" exact-active-class="">Contact</NuxtLink>
          <NuxtLink to="/terms" class="block hover:text-brand-600" active-class="" exact-active-class="">Terms</NuxtLink>
          <NuxtLink to="/privacy" class="block hover:text-brand-600" active-class="" exact-active-class="">Privacy</NuxtLink>
        </nav>
      </div>

      <div>
        <div class="font-semibold text-brand-600">Contact</div>
        <div class="mt-3 text-sm space-y-1 text-brand-600/70">
          <div>Modeh Ltd.</div>
          <div>Nairobi, Kenya</div>
          <div>Email: <a href="mailto:info@modeh.co.ke" class="underline text-brand-600 hover:text-brand-700">info@modeh.co.ke</a></div>
          <div>Phone: <a href="tel:+254703155693" class="underline text-brand-600 hover:text-brand-700">+254 703 155 693</a></div>
        </div>
        <div class="mt-4 text-sm text-brand-600/70">© {{ new Date().getFullYear() }} Modeh</div>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

