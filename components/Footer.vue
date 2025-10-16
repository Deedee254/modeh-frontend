<template>
  <footer class="flex-shrink-0 border-t border-indigo-200/50 bg-indigo-700 text-white dark:bg-slate-950 dark:border-slate-800">
    <div class="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 items-start">
      <div>
        <div class="flex items-center gap-3">
          <img src="/logo/modeh-logo.png" alt="Modeh" class="h-8" />
          <div class="text-2xl font-extrabold">Modeh</div>
        </div>
        <div class="mt-3 text-sm opacity-90">Create and take beautiful quizzes — for quiz-mastering, classrooms and practice. Fast to build, fun to take.</div>
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NuxtLink to="/register?role=quiz-master" class="w-full text-center px-4 py-2 bg-white text-indigo-700 rounded font-medium block">Quiz‑master register</NuxtLink>
          <NuxtLink to="/register?role=quizee" class="w-full text-center px-4 py-2 bg-white text-indigo-700 rounded font-medium block">Quizee register</NuxtLink>
        </div>
      </div>

      <div>
        <div class="font-semibold">Quizzes</div>
        <nav class="mt-3 text-sm opacity-90 space-y-2">
          <NuxtLink to="/quizzes" class="block">Browse quizzes</NuxtLink>
          <NuxtLink to="/quizzes?popular=1" class="block">Popular</NuxtLink>
          <NuxtLink to="/quizzes?recent=1" class="block">New</NuxtLink>
        </nav>
      </div>

      <div>
        <div class="font-semibold">Company</div>
        <nav class="mt-3 text-sm opacity-90 space-y-2">
          <NuxtLink to="/about" class="block">About</NuxtLink>
          <NuxtLink to="/contact" class="block">Contact</NuxtLink>
          <NuxtLink to="/terms" class="block">Terms</NuxtLink>
          <NuxtLink to="/privacy" class="block">Privacy</NuxtLink>
        </nav>
      </div>

      <div>
        <div class="font-semibold">Contact</div>
        <div class="mt-3 text-sm opacity-90 space-y-1">
          <div>Modeh Ltd.</div>
          <div>Nairobi, Kenya</div>
          <div>Email: <a href="mailto:hello@modeh.co" class="underline">hello@modeh.co</a></div>
          <div>Phone: <a href="tel:+254700000000" class="underline">+254 700 000 000</a></div>
        </div>
        <div class="mt-4 text-sm opacity-90">© {{ new Date().getFullYear() }} Modeh — Built with Nuxt</div>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>
