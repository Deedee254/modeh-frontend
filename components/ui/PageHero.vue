<template>
  <section v-bind="$attrs" :class="[
    'relative isolate overflow-hidden',
    props.flush ? '-mt-6 sm:-mt-8' : '',
    padding,
    'mb-12 sm:mb-16'
  ]" :style="backgroundStyle">
    <!-- Decorative background image and overlay -->
    <div v-if="hasBackgroundImage" class="absolute inset-0 -z-10 bg-cover bg-center" :style="backgroundImageStyle" aria-hidden="true"></div>
    <div v-else class="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 opacity-95"></div>

    <!-- Glow accents -->
    <div class="absolute inset-0 -z-10 pointer-events-none">
      <div class="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl"></div>
      <div class="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"></div>
    </div>

    <!-- Content wrapper with full-bleed inner max width -->
    <div class="relative">
      <div class="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <!-- Breadcrumbs slot or props -->
        <div v-if="$slots.breadcrumbs || (breadcrumbs && breadcrumbs.length)" class="mb-6">
          <slot name="breadcrumbs">
            <nav v-if="breadcrumbs && breadcrumbs.length" class="text-sm text-white/80" aria-label="Breadcrumb">
              <ol class="flex items-center gap-2">
                <li v-for="(b, i) in breadcrumbs" :key="i" class="flex items-center">
                  <template v-if="b.href && !b.current">
                    <template v-if="b.href && b.href.startsWith('/')">
                      <NuxtLink :to="b.href" class="hover:text-white">{{ b.text }}</NuxtLink>
                    </template>
                    <template v-else>
                      <a :href="b.href" class="hover:text-white" target="_blank" rel="noopener">{{ b.text }}</a>
                    </template>
                  </template>
                  <template v-else>
                    <span v-bind="b.current ? { 'aria-current': 'page' } : {}" class="font-medium text-white">{{ b.text }}</span>
                  </template>
                  <svg v-if="i < breadcrumbs.length - 1" class="mx-2 h-3 w-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </li>
              </ol>
            </nav>
          </slot>
        </div>

        <div class="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-center">
          <div>
            <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-white/80">
              <slot name="eyebrow">Modeh Learning Hub</slot>
            </div>

            <h1 :class="['mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl', align === 'center' ? 'text-center' : 'text-left']">{{ title }}</h1>
            <p v-if="description" :class="['mt-4 max-w-2xl text-base sm:text-lg text-white/80', align === 'center' ? 'mx-auto text-center' : '']">{{ description }}</p>

            <div class="mt-8 flex flex-col gap-6">
              <slot name="actions">
                <div class="flex flex-wrap items-center justify-center gap-4">
                  <UButton
                    size="lg"
                    color="primary"
                    variant="solid"
                    class="min-w-[180px] shadow-lg hover:-translate-y-0.5 transition-transform"
                    to="/quizzes"
                  >
                    Start a quiz
                  </UButton>
                  <UButton
                    size="lg"
                    variant="outline"
                    class="min-w-[180px] text-white border-white/40 hover:bg-white/10"
                    to="/register?role=quiz-master"
                  >
                    Become a quiz master
                  </UButton>
                </div>
              </slot>

              <div v-if="showSearch" class="w-full">
                <div class="relative flex flex-col gap-3 sm:flex-row sm:items-center">
                  <UiSearch
                    v-model="heroQuery"
                    placeholder="Search quizzes, topics, subjects..."
                    @search="onHeroSearch"
                    class="w-full text-sm"
                    icon="heroicons:magnifying-glass"
                  />
                  <div v-if="$slots['search-aux']" class="sm:ml-3">
                    <slot name="search-aux" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="relative">
            <div class="absolute -top-12 -right-0 hidden h-48 w-48 rotate-6 rounded-3xl border border-white/20 bg-gradient-to-br from-white/20 to-white/5 opacity-70 blur-sm lg:block"></div>
            <div class="relative rounded-3xl border border-white/15 bg-black/20 p-6 shadow-2xl shadow-indigo-950/40 backdrop-blur">
              <div class="flex items-center justify-between text-white/80">
                <slot name="highlight">
                  <div>
                    <p class="text-xs uppercase tracking-wide">Trusted by learners</p>
                    <p class="mt-1 text-2xl font-semibold">15k+ students</p>
                  </div>
                </slot>
                <div class="rounded-full border border-white/20 bg-white/10 p-3 text-white">
                  <slot name="highlight-icon">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 17h16M4 12h16M4 7h16"/></svg>
                  </slot>
                </div>
              </div>

              <div class="mt-6 grid gap-3 sm:grid-cols-2">
                <slot name="stats" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  title: string
  description?: string
  align?: 'left' | 'center'
  variant?: 'default' | 'solid' | 'image' | 'gradient'
  padding?: string
  bgClass?: string
  textClass?: string
  textMutedClass?: string
  image?: string
  imagePosition?: string
  overlayClass?: string
  breadcrumbs?: Array<{ text: string, href?: string, current?: boolean }>
  showSearch?: boolean
  flush?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  align: 'left',
  variant: 'default',
  padding: 'py-12 sm:py-16',
  bgClass: 'bg-gradient-to-br from-gray-900 to-blue-900',
  textClass: 'text-white',
  textMutedClass: 'text-gray-300',
  breadcrumbs: undefined,
  image: undefined,
  imagePosition: 'center',
  overlayClass: 'bg-black/40',
  showSearch: false,
  flush: false
})

// Emit search events when the hero search is used
const emit = defineEmits<{ (e: 'search', query: string): void }>()

// reactive query for the hero search
const heroQuery = ref('')

// Determine whether we have an image provided
const hasBackgroundImage = Boolean(props.image)

const backgroundStyle = computed(() => {
  if (props.variant === 'image' && props.bgClass) {
    return { backgroundColor: undefined }
  }
  if (props.variant === 'solid') {
    return { backgroundColor: props.bgClass || '#1f2937' }
  }
  if (props.variant === 'gradient') {
    return { background: props.bgClass }
  }
  return { backgroundColor: undefined }
})

const backgroundImageStyle = computed(() => {
  if (!hasBackgroundImage || !props.image) return undefined
  return {
    backgroundImage: `url(${props.image})`,
    backgroundSize: 'cover',
    backgroundPosition: props.imagePosition || 'center'
  }
})

const breadcrumbs = props.breadcrumbs

function onHeroSearch() {
  emit('search', heroQuery.value)
}
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