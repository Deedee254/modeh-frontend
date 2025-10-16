<template>
  <div class="min-h-screen bg-gradient-to-b from-white to-indigo-50/30">
    <!-- Hero with animated background -->
    <section class="relative isolate overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-6 py-24 sm:py-32">
      <!-- Animated background elements -->
      <div class="absolute inset-0 -z-10">
        <div class="absolute -left-1/4 top-0 h-96 w-96 animate-blob rounded-full bg-gradient-to-br from-violet-400/20 to-violet-400/10 mix-blend-multiply blur-3xl"></div>
        <div class="absolute -right-1/4 top-1/4 h-96 w-96 animate-blob animation-delay-2000 rounded-full bg-gradient-to-br from-sky-400/20 to-sky-400/10 mix-blend-multiply blur-3xl"></div>
      </div>

      <!-- Hero content -->
      <div class="mx-auto max-w-3xl text-center">
        <h1 class="bg-gradient-to-r from-indigo-600 via-sky-600 to-violet-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl">
          Empowering Education Through Innovation
        </h1>
        <p class="mt-6 text-lg leading-8 text-slate-600">
          We help quiz-masters create engaging quizzes and quizees learn faster with instant feedback. Our platform combines simplicity with powerful features to transform the learning experience.
        </p>
        <div class="mt-10 flex items-center justify-center gap-4">
          <NuxtLink 
            to="/register?role=quiz-master" 
            class="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-violet-500 p-[2px] font-semibold text-white transition hover:shadow-lg hover:shadow-indigo-500/25"
          >
            <span class="inline-flex h-full items-center gap-2 rounded-[10px] bg-gradient-to-r from-indigo-500 via-sky-500 to-violet-500 px-8 py-3 transition group-hover:bg-none">
              Start Your Journey
            </span>
          </NuxtLink>
          <a 
            href="#contact" 
            class="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border-2 border-indigo-500/20 bg-white px-8 py-3 font-semibold text-indigo-600 transition hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>

    <!-- Mission & Vision -->
    <section class="mx-auto max-w-7xl px-6 py-16">
      <div class="grid gap-8 md:grid-cols-2">
        <!-- Mission Card -->
        <div class="group relative rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-indigo-50 p-8 transition-all duration-300 hover:shadow-xl">
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-indigo-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-2xl"></div>
          <div class="relative">
            <div class="mb-6 inline-flex rounded-xl bg-indigo-100 p-3 text-indigo-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 class="mb-4 text-2xl font-bold text-indigo-900">Our Mission</h2>
            <p class="text-slate-600">We exist to make practice and assessment delightful, fast, and actionable. quiz-masters should spend time teaching — not wrestling with tools. quizees should get immediate feedback that helps them improve.</p>
            <div class="mt-6 flex flex-wrap gap-2">
              <span class="rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700">Accessibility</span>
              <span class="rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700">Speed</span>
              <span class="rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700">Learning Outcomes</span>
            </div>
          </div>
        </div>

        <!-- Vision Card -->
        <div class="group relative rounded-2xl bg-gradient-to-br from-violet-50 via-white to-violet-50 p-8 transition-all duration-300 hover:shadow-xl">
          <div class="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-violet-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-2xl"></div>
          <div class="relative">
            <div class="mb-6 inline-flex rounded-xl bg-violet-100 p-3 text-violet-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 class="mb-4 text-2xl font-bold text-violet-900">Our Vision</h2>
            <p class="text-slate-600">To create a world where quality education is accessible to all, where technology enhances rather than complicates the learning process, and where every quizee has the tools they need to succeed.</p>
            <div class="mt-6 flex flex-wrap gap-2">
              <span class="rounded-full bg-violet-100 px-3 py-1 text-sm text-violet-700">Innovation</span>
              <span class="rounded-full bg-violet-100 px-3 py-1 text-sm text-violet-700">Accessibility</span>
              <span class="rounded-full bg-violet-100 px-3 py-1 text-sm text-violet-700">Global Impact</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="mx-auto max-w-7xl px-6 py-16">
      <h2 class="text-center mb-12 text-3xl font-bold text-indigo-900">
        Powerful Features
        <span class="mt-2 block text-base font-normal text-indigo-600">Everything you need to succeed</span>
      </h2>

      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <!-- Quiz Creation -->
        <div class="group relative overflow-hidden rounded-2xl bg-white p-6 transition-all duration-300 hover:shadow-xl">
          <div class="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-indigo-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div class="relative">
            <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 class="mb-2 text-xl font-semibold text-gray-900">Quiz Creation</h3>
            <p class="text-slate-600">Create engaging quizzes with multiple question types, rich media support, and reusable question banks.</p>
          </div>
        </div>

        <!-- Real-time Analytics -->
        <div class="group relative overflow-hidden rounded-2xl bg-white p-6 transition-all duration-300 hover:shadow-xl">
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-sky-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div class="relative">
            <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 class="mb-2 text-xl font-semibold text-gray-900">Real-time Analytics</h3>
            <p class="text-slate-600">Track quizee progress in real-time with detailed analytics and performance insights.</p>
          </div>
        </div>

        <!-- Smart Assignment -->
        <div class="group relative overflow-hidden rounded-2xl bg-white p-6 transition-all duration-300 hover:shadow-xl">
          <div class="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-rose-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div class="relative">
            <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="mb-2 text-xl font-semibold text-gray-900">Smart Assignment</h3>
            <p class="text-slate-600">Set flexible schedules, deadlines, and access rules for your quizzes and assignments.</p>
          </div>
        </div>

        <!-- Collaboration Tools -->
        <div class="group relative overflow-hidden rounded-2xl bg-white p-6 transition-all duration-300 hover:shadow-xl">
          <div class="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div class="relative">
            <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="mb-2 text-xl font-semibold text-gray-900">Collaboration Tools</h3>
            <p class="text-slate-600">Work together with other quiz-masters, share resources, and build a knowledge base.</p>
          </div>
        </div>

        <!-- Instant Feedback -->
        <div class="group relative overflow-hidden rounded-2xl bg-white p-6 transition-all duration-300 hover:shadow-xl">
          <div class="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div class="relative">
            <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="mb-2 text-xl font-semibold text-gray-900">Instant Feedback</h3>
            <p class="text-slate-600">Provide immediate feedback to help quizees understand and learn from their mistakes.</p>
          </div>
        </div>

        <!-- Mobile Access -->
        <div class="group relative overflow-hidden rounded-2xl bg-white p-6 transition-all duration-300 hover:shadow-xl">
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div class="relative">
            <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="mb-2 text-xl font-semibold text-gray-900">Mobile Access</h3>
            <p class="text-slate-600">Access your quizzes and analytics on any device, anywhere, anytime.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Full-width CTA Banner -->
    <section class="bg-gradient-to-r from-indigo-600 to-violet-600 py-16">
      <div class="mx-auto max-w-7xl px-6">
        <div class="relative overflow-hidden rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
          <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-white/0"></div>
          <div class="relative flex flex-col items-center text-center md:flex-row md:justify-between md:text-left">
            <div class="mb-6 md:mb-0">
              <h2 class="text-2xl font-bold text-white sm:text-3xl">Ready to transform your teaching?</h2>
              <p class="mt-2 text-indigo-100">Join thousands of quiz-masters already using Modeh to improve learning outcomes.</p>
            </div>
            <div class="flex flex-wrap justify-center gap-4">
              <NuxtLink 
                to="/register?role=quiz-master" 
                class="inline-flex items-center rounded-xl bg-white px-6 py-3 font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50"
              >
                Start Free Trial
              </NuxtLink>
              <a 
                href="#contact" 
                class="inline-flex items-center rounded-xl border-2 border-white px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Schedule Demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Form -->
    <section id="contact" class="mx-auto max-w-7xl px-6 py-16">
      <div class="grid gap-8 lg:grid-cols-2">
        <!-- Contact Info -->
        <div>
          <h2 class="text-3xl font-bold text-indigo-900">Get in Touch</h2>
          <p class="mt-4 text-lg text-slate-600">Have questions about our platform? We'd love to help you get started.</p>
          
          <div class="mt-8 space-y-6">
            <div class="flex items-start gap-4">
              <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Email Us</h3>
                <p class="mt-1 text-slate-600">support@modeh.example</p>
                <p class="text-sm text-slate-500">We aim to respond within 24 hours</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Office Location</h3>
                <p class="mt-1 text-slate-600">123 Education Street</p>
                <p class="text-slate-600">San Francisco, CA 94105</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Support Hours</h3>
                <p class="mt-1 text-slate-600">Monday - Friday: 9am - 6pm PST</p>
                <p class="text-slate-600">Weekend: 10am - 4pm PST</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="rounded-2xl bg-white p-8 shadow-sm">
          <form class="space-y-6">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
              <input 
                type="text" 
                id="name" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                id="email" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
            </div>

            <div>
              <label for="subject" class="block text-sm font-medium text-gray-700">Subject</label>
              <select 
                id="subject" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option>General Inquiry</option>
                <option>Technical Support</option>
                <option>Partnership</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label for="message" class="block text-sm font-medium text-gray-700">Message</label>
              <UTextarea id="message" rows="4" class="mt-1 block w-full" />
            </div>

            <button 
              type="submit" 
              class="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-white shadow-sm hover:from-indigo-700 hover:to-violet-700"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import UiTextarea from '~/components/ui/UiTextarea.vue'
</script>

<style scoped>
/* Animation utilities */
@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(20px, -30px) scale(1.1); }
  50% { transform: translate(-20px, 20px) scale(0.9); }
  75% { transform: translate(20px, 30px) scale(0.95); }
}

.animate-blob {
  animation: blob 10s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Blur utilities */
.blur-3xl {
  --tw-blur: blur(64px);
  filter: var(--tw-blur);
}
</style>
