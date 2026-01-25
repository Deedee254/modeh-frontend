<template>
  <div class="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white rounded-xl shadow-lg p-6 sm:p-8 mb-8">
    <!-- Breadcrumb -->
    <nav v-if="showBreadcrumbs && breadcrumbs.length" class="mb-4 text-sm opacity-90" aria-label="Breadcrumb">
      <ol class="flex items-center gap-2">
        <li v-for="(b, i) in breadcrumbs" :key="i" class="flex items-center">
          <NuxtLink v-if="b.href && !b.current" :to="b.href" class="hover:opacity-75">{{ b.text }}</NuxtLink>
          <span v-else :aria-current="b.current ? 'page' : undefined" class="font-medium">{{ b.text }}</span>
          <svg v-if="i < breadcrumbs.length - 1" class="h-4 w-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </li>
      </ol>
    </nav>

    <h1 class="text-3xl sm:text-4xl font-bold mb-2">{{ title }}</h1>
    <p v-if="description" class="text-base opacity-90 mb-6">{{ description }}</p>

    <slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'PageHero' })

interface Breadcrumb {
  text: string
  href?: string
  current?: boolean
}

interface Props {
  title: string
  description?: string
  breadcrumbs?: Breadcrumb[]
  showBreadcrumbs?: boolean
}

withDefaults(defineProps<Props>(), {
  description: '',
  showBreadcrumbs: true,
  breadcrumbs: () => []
})
</script>
<style>
@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-down {
  animation: fade-in-down 0.5s ease-out forwards;
}

</style>
