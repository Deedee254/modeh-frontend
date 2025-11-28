<template>
  <footer class="flex-shrink-0 border-t dark:border-slate-800 bg-white dark:bg-slate-900" style="color: brand-600">
    <div class="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 items-start">
      <div>
        <div class="flex items-center gap-3">
          <img src="/logo/modeh-logo.png" alt="Modeh" class="h-8" />
          <div class="text-2xl font-extrabold text-brand-600">Modeh</div>
        </div>
        <div class="mt-3 text-sm text-brand-600/80">Create and take beautiful quizzes — for quiz-mastering, classrooms and practice. Fast to build, fun to take.</div>
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NuxtLink to="/register?role=quiz-master" class="w-full text-center px-4 py-2 rounded font-medium block bg-brand-600 text-white hover:bg-brand-700">Quiz‑master register</NuxtLink>
          <NuxtLink to="/register?role=quizee" class="w-full text-center px-4 py-2 rounded font-medium block bg-brand-600 text-white hover:bg-brand-700">Quizee register</NuxtLink>
        </div>
      </div>

      <div>
        <div class="font-semibold text-brand-600">Quizzes</div>
        <nav class="mt-3 text-sm space-y-2 text-brand-600/70">
          <NuxtLink to="/quizzes" class="block hover:text-brand-600" active-class="" exact-active-class="">Browse quizzes</NuxtLink>
          <NuxtLink to="/quizzes?popular=1" class="block hover:text-brand-600" active-class="" exact-active-class="">Popular</NuxtLink>
          <NuxtLink to="/quizzes?recent=1" class="block hover:text-brand-600" active-class="" exact-active-class="">New</NuxtLink>
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
        <div class="mt-4 text-sm text-brand-600/70">© {{ new Date().getFullYear() }} Modeh — Built with Nuxt</div>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

