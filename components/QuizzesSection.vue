<template>
  <section class="py-12 bg-white">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Main Burgundy Panel -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#6f0f12] via-[#8a1a1f] to-[#b23a3f] shadow-xl p-6 lg:p-10 border border-white/5">
        
        <!-- Section Header: Title + Sorting UI in line -->
        <header v-if="props.showHeader" class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 lg:mb-12">
          <div class="flex-1">
            <h3 class="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Browse Quizzes</h3>
            <p class="mt-2 text-slate-100/80 text-sm max-w-xl hidden sm:block">
              Discover handpicked quizzes across all subjects. Filter by popularity, newness, or featured status.
            </p>
          </div>

          <!-- Sorting Tabs (Horizontal) -->
          <div class="flex items-center gap-1 bg-black/10 p-1 rounded-full overflow-x-auto no-scrollbar -mx-2 px-2 lg:mx-0 lg:px-1">
            <button
              @click="setSelectedTab('new')"
              :class="['whitespace-nowrap px-4 py-1.5 rounded-full transition-all duration-200 text-xs font-bold uppercase tracking-wide', tabClasses('new')]"
              :aria-pressed="props.selectedTab === 'new'"
            >
              Latest
            </button>
            <button
              @click="setSelectedTab('top')"
              :class="['whitespace-nowrap px-4 py-1.5 rounded-full transition-all duration-200 text-xs font-bold uppercase tracking-wide', tabClasses('top')]"
              :aria-pressed="props.selectedTab === 'top'"
            >
              Top
            </button>
            <button
              @click="setSelectedTab('liked')"
              :class="['whitespace-nowrap px-4 py-1.5 rounded-full transition-all duration-200 text-xs font-bold uppercase tracking-wide', tabClasses('liked')]"
              :aria-pressed="props.selectedTab === 'liked'"
            >
              Most Liked
            </button>
            <button
              @click="setSelectedTab('featured')"
              :class="['whitespace-nowrap px-4 py-1.5 rounded-full transition-all duration-200 text-xs font-bold uppercase tracking-wide', tabClasses('featured')]"
              :aria-pressed="props.selectedTab === 'featured'"
            >
              Featured
            </button>
          </div>
        </header>

        <!-- Carousel Area -->
        <div class="relative">
          <div v-if="props.loading" class="flex items-center justify-center py-24">
            <div class="flex flex-col items-center gap-3">
              <svg class="h-8 w-8 animate-spin text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <p class="text-white text-sm font-medium">Loading quizzes...</p>
            </div>
          </div>

          <div v-else>
            <!-- Responsive container: grid/list on mobile/sm/md, horizontal carousel only on lg+ -->
            <div 
              ref="carouselRef" 
              class="no-scrollbar relative z-10 -mx-4 px-4 lg:-mx-2 lg:px-2 lg:overflow-x-auto lg:scroll-smooth"
            >
              <div class="py-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:flex lg:items-stretch lg:gap-6">
                <!-- Card Width optimized: slightly visible next card on mobile -->
                <div 
                  v-for="quiz in visibleQuizzes" 
                  :key="quiz.slug" 
                  class="flex-shrink-0 w-full lg:w-[260px] lg:snap-start first:ml-0"
                >
                      <UiQuizCard
                        :to="{ path: `/quizzes/${quiz.slug}` }"
                        :startLink="quiz.is_paid ? { path: `/quizzes/${quiz.slug}` } : { path: `/quizzes/${quiz.slug}/take` }"
                        :takeLink="{ path: `/quizzes/${quiz.slug}/take` }"
                    :title="quiz.title"
                    :topic="quiz.topic?.name || quiz.topic_name"
                    :subject="quiz.topic?.subject?.name || quiz.subject?.name || quiz.subject_name"
                    :grade="quiz.grade || quiz.grade_id"
                    :questions-count="quiz.questions_count ?? quiz.questions ?? quiz.items_count"
                    :cover="quiz.cover_image || quiz.cover"
                    :palette="props.pickPaletteClass(quiz.topic?.id || quiz.id)"
                    :likes="quiz.likes_count"
                    :quiz-id="quiz.id"
                    :liked="quiz.liked"
                    :description="quiz.description || quiz.summary || ''"
                    @like="props.onQuizLike && props.onQuizLike(quiz, $event)"
                    class="h-full bg-white shadow-lg border-0 hover:translate-y-[-4px] transition-transform"
                  ></UiQuizCard>
                </div>

                <!-- End Spacer/CTA Card? -->
                <div class="flex-shrink-0 w-full lg:w-[260px] lg:snap-start h-full">
                  <NuxtLink to="/quizzes" class="h-full min-h-[300px] flex flex-col items-center justify-center gap-4 rounded-lg bg-white/5 border-2 border-dashed border-white/20 text-white hover:bg-white/10 transition-all p-6 text-center group">
                    <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon name="heroicons:arrow-right" class="h-6 w-6" />
                    </div>
                    <div>
                      <span class="block font-bold">View all quizzes</span>
                      <span class="text-xs text-slate-100/60 mt-1">Discover more content</span>
                    </div>
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- Navigation Arrows (Hidden on small mobile where swipe is king, but shown above that) -->
            <div class="hidden lg:block">
              <button 
                @click="scrollPrev" 
                aria-label="Previous" 
                class="absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-brand-700 hover:bg-slate-50 transition-all"
              >
                <Icon name="heroicons:chevron-left" class="h-6 w-6" />
              </button>

              <button 
                @click="scrollNext" 
                aria-label="Next" 
                class="absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-brand-700 hover:bg-slate-50 transition-all"
              >
                <Icon name="heroicons:chevron-right" class="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import UiQuizCard from '~/components/ui/QuizCard.vue'

const props = defineProps({
  quizzes: { type: Array, default: () => [] },
  selectedTab: { type: String, default: 'new' },
  pickPaletteClass: { type: Function, required: true },
  onQuizLike: { type: Function, default: null },
  loading: { type: Boolean, default: false },
  showHeader: { type: Boolean, default: true }
})

const emit = defineEmits(['update:selectedTab'])

// Carousel ref and helpers
const carouselRef = ref(null)
const visibleQuizzes = computed(() => (props.quizzes || []).slice(0, 8))

function scrollNext() {
  const el = carouselRef.value
  if (!el) return
  const amount = Math.max(el.clientWidth * 0.7, 300)
  el.scrollBy({ left: amount, behavior: 'smooth' })
}

function scrollPrev() {
  const el = carouselRef.value
  if (!el) return
  const amount = Math.max(el.clientWidth * 0.7, 300)
  el.scrollBy({ left: -amount, behavior: 'smooth' })
}

// Computed wrapper to ensure template reactivity is explicit
const currentTab = computed(() => props.selectedTab)

function tabClasses(tab) {
  const active = currentTab.value === tab
  // use lighter/transparent styles on burgundy background
  return active
    ? 'bg-white text-[#6f0f12] shadow-sm'
    : 'bg-white/10 text-slate-100 hover:bg-white/20'
}

function tabLabel(sel) {
  const map = { new: 'Latest', top: 'Most attempted', liked: 'Most liked', featured: 'Featured' }
  return map[sel] || 'Latest'
}

function setSelectedTab(tab) {
  emit('update:selectedTab', tab)
}

// No auto-scroll: user-controlled via arrow buttons only
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none }
</style>
