<template>
  <div class="w-full group block rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.03] hover:-rotate-1 overflow-hidden relative border border-white/20 dark:border-slate-700/50 focus-within:ring-2 focus-within:ring-rose-500 focus-within:ring-offset-2 before:absolute before:inset-0 before:bg-gradient-to-br before:from-rose-500/10 before:to-pink-500/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-hidden="true"></NuxtLink>

    <!-- Animated background pattern -->
    <div class="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
      <div class="absolute inset-0 bg-gradient-to-br from-rose-400 via-pink-400 to-purple-400 animate-pulse"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(244,114,182,0.3),transparent_50%)] animate-spin-reverse"></div>
    </div>

    <!-- Header: cover image or palette -->
    <div class="relative h-32 sm:h-40 overflow-hidden">
      <div class="absolute inset-0" :class="cover ? '' : paletteClass">
        <img v-if="cover" :src="cover" alt="" class="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:-rotate-2" />
      </div>

      <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none group-hover:from-black/60 transition-all duration-500"></div>

      <!-- Floating grade badge -->
      <div class="absolute top-4 left-4 z-10 transform rotate-2 group-hover:rotate-0 transition-transform duration-300">
        <div class="inline-flex items-center px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-slate-800 text-xs font-bold shadow-lg border border-white/50 animate-bounce-slow">
          <span class="i-heroicons-book-open-16-solid mr-1.5 text-rose-600 animate-pulse"></span>
          {{ isCourse ? 'Course' : 'Grade' }}
        </div>
      </div>

      <!-- Animated title overlay -->
      <div class="absolute left-4 right-4 bottom-4 z-10 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
        <h4 class="text-xl sm:text-2xl font-black line-clamp-2 drop-shadow-lg group-hover:text-rose-100 transition-colors duration-300">{{ displayTitle }}</h4>
        <div v-if="displayLevel" class="mt-1 text-sm text-white/90 line-clamp-1 drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
          {{ displayLevel }}
        </div>
      </div>

      <!-- Hover glow effect -->
      <div class="absolute inset-0 bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
    </div>

    <!-- Body: enhanced metadata and CTA -->
    <div class="p-5 sm:p-6 relative z-10 flex flex-col gap-5 flex-grow">
      <!-- Animated stats section -->
      <div class="grid grid-cols-2 gap-4 transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">
        <div class="flex items-center gap-3">
          <div class="p-3 rounded-xl bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/40 dark:to-rose-800/40 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
            <span class="i-heroicons-document-text-16-solid text-rose-600 dark:text-rose-400 text-base group-hover:animate-bounce"></span>
          </div>
          <div class="transform group-hover:scale-105 transition-transform duration-300">
            <div class="text-xl font-black text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors duration-300">{{ quizzes_count }}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Quizzes</div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
            <span class="i-heroicons-squares-2x2-16-solid text-emerald-600 dark:text-emerald-400 text-base group-hover:animate-bounce"></span>
          </div>
          <div class="transform group-hover:scale-105 transition-transform duration-300">
            <div class="text-xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors duration-300">{{ subjects_count }}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Subjects</div>
          </div>
        </div>
      </div>

      <p v-if="displayDescription" class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300 delay-100">{{ displayDescription }}</p>

      <!-- Animated subject tags -->
      <div v-if="displaySubjects.length" class="flex flex-wrap gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-200">
        <span v-for="(subject, index) in displaySubjects" :key="subject.id" :class="`inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in`" :style="{ animationDelay: `${index * 100}ms` }">
          <span class="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2 animate-pulse"></span>
          {{ subject.name }}
        </span>
        <span v-if="hasMoreSubjects" :class="`inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-xs font-bold text-slate-500 dark:text-slate-400 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in`" :style="{ animationDelay: `${displaySubjects.length * 100}ms` }">
          <span class="w-1.5 h-1.5 bg-rose-400 rounded-full mr-2 animate-pulse"></span>
          +{{ moreSubjectsCount }} more
        </span>
      </div>

      <!-- Enhanced CTA Button -->
      <div class="mt-auto pt-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-300">
        <NuxtLink v-if="actionLink" :to="actionLink" class="w-full inline-flex justify-center items-center px-5 py-3.5 bg-gradient-to-r from-rose-600 via-rose-700 to-pink-700 hover:from-rose-700 hover:via-rose-800 hover:to-pink-800 text-white rounded-2xl text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:from-rose-500 dark:via-rose-600 dark:to-pink-600 dark:hover:from-rose-600 dark:hover:via-rose-700 dark:hover:to-pink-700 transform hover:scale-105 hover:-translate-y-0.5 group-hover:animate-pulse-slow relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700">
          <span class="mr-2 relative z-10">{{ actionLabel }}</span>
          <span class="i-heroicons-arrow-right-16-solid transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110 relative z-10"></span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  to: { type: [String, Object], default: null },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  // optional: accept full grade object for richer display
  grade: { type: Object, default: null },
  badgeText: { type: String, default: '' },
  palette: { type: String, default: '' },
  quizzes_count: { type: [Number, String], default: 0 },
  subjects_count: { type: [Number, String], default: 0 },
  actionLink: { type: [String, Object], default: null },
  actionLabel: { type: String, default: 'Explore Grade' },
  cover: { type: String, default: '' },
  description: { type: String, default: '' }
})

const paletteClass = computed(() => props.palette || 'bg-gradient-to-br from-indigo-400 to-indigo-600')

const displayTitle = computed(() => props.title || props.grade?.name || 'Grade');
const displayDescription = computed(() => props.description || props.grade?.description || props.subtitle || '');

const displayLevel = computed(() => {
  // prefer grade.level if grade object provided, otherwise fall back to subtitle
  if (props.grade && typeof props.grade === 'object') {
    const lvl = props.grade.level || props.grade.level_id || props.grade.levelId
    if (lvl) return (typeof lvl === 'string' || typeof lvl === 'number') ? String(lvl) : (lvl.name || String(lvl.id || ''))
  }
  return props.subtitle || ''
})

const isCourse = computed(() => {
  if (props.grade && typeof props.grade === 'object') return String(props.grade.type || '').toLowerCase() === 'course'
  return false
})

const displaySubjects = computed(() => {
  if (props.grade && Array.isArray(props.grade.subjects)) {
    return props.grade.subjects.slice(0, 3); // Show up to 3 subjects
  }
  return [];
});

const hasMoreSubjects = computed(() => {
  return props.grade && Array.isArray(props.grade.subjects) && props.grade.subjects.length > 3;
});

const moreSubjectsCount = computed(() => {
  if (!hasMoreSubjects.value) return 0;
  return props.grade.subjects.length - 3;
});
</script>

<style scoped>
@keyframes spin-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0px) rotate(2deg); }
  50% { transform: translateY(-2px) rotate(2deg); }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.animate-spin-reverse {
  animation: spin-reverse 25s linear infinite;
}

.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}

.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}
</style>