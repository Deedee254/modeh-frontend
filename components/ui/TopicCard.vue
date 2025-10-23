<template>
  <div class="w-full group block rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.03] hover:rotate-0.5 overflow-hidden relative border border-white/20 dark:border-slate-700/50 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 before:absolute before:inset-0 before:bg-gradient-to-br before:from-emerald-500/10 before:to-teal-500/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-hidden="true"></NuxtLink>

    <!-- Animated background pattern -->
    <div class="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 animate-pulse"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.3),transparent_50%)] animate-spin-slow"></div>
    </div>

    <!-- Header: Cover Image/Palette -->
    <div class="relative h-32 sm:h-40 overflow-hidden">
      <div class="absolute inset-0" :class="image ? '' : paletteClass">
        <img v-if="image" :src="image" :alt="displayTitle" class="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1" />
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none group-hover:from-black/60 transition-all duration-500"></div>

      <!-- Floating topic badge -->
      <div class="absolute top-4 left-4 z-10 transform -rotate-1 group-hover:rotate-0 transition-transform duration-300">
        <div class="inline-flex items-center px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-slate-800 text-xs font-bold shadow-lg border border-white/50 animate-bounce-slow">
          <span class="i-heroicons-tag-16-solid mr-1.5 text-emerald-600 animate-pulse"></span>
          Topic
        </div>
      </div>

      <!-- Animated title overlay -->
      <div class="absolute left-4 right-4 bottom-4 z-10 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
        <h4 class="text-xl sm:text-2xl font-black line-clamp-2 drop-shadow-lg group-hover:text-emerald-100 transition-colors duration-300">{{ displayTitle }}</h4>
        <div v-if="displayGrade" class="mt-1 text-sm text-white/90 line-clamp-1 drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
          {{ displayGrade }}
        </div>
      </div>

      <!-- Hover glow effect -->
      <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
    </div>

    <!-- Body: enhanced metadata and CTA -->
    <div class="p-5 sm:p-6 relative z-10 flex flex-col gap-5 flex-grow">
      <!-- Animated stats section -->
      <div class="flex items-center justify-between transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">
        <div class="flex items-center gap-3">
          <div class="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
            <span class="i-heroicons-document-text-16-solid text-emerald-600 dark:text-emerald-400 text-base group-hover:animate-bounce"></span>
          </div>
          <div class="transform group-hover:scale-105 transition-transform duration-300">
            <div class="text-xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors duration-300">{{ quizzesCount }}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Quizzes</div>
          </div>
        </div>
        <div class="text-right transform group-hover:scale-105 transition-transform duration-300">
          <div class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">Study Material</div>
        </div>
      </div>

      <p v-if="displayDescription" class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300 delay-100">{{ displayDescription }}</p>

      <!-- Animated subject tag -->
      <div v-if="subject" class="flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-200">
        <span class="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-800 dark:to-emerald-700 text-xs font-bold text-emerald-800 dark:text-emerald-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in">
          <span class="i-heroicons-squares-2x2-16-solid mr-2 animate-pulse"></span>
          {{ subject }}
        </span>
      </div>

      <!-- Enhanced CTA Button -->
      <div class="mt-auto pt-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-300">
        <NuxtLink v-if="startLink" :to="startLink" class="w-full inline-flex justify-center items-center px-5 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:via-emerald-800 hover:to-teal-800 text-white rounded-2xl text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:from-emerald-500 dark:via-emerald-600 dark:to-teal-600 dark:hover:from-emerald-600 dark:hover:via-emerald-700 dark:hover:to-teal-700 transform hover:scale-105 hover:-translate-y-0.5 group-hover:animate-pulse-slow relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700">
          <span class="mr-2 relative z-10">{{ startLabel }}</span>
          <span class="i-heroicons-arrow-right-16-solid transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110 relative z-10"></span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  to: { type: [String, Object], default: null },
  title: { type: String, default: '' },
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  badgeText: { type: String, default: '' },
  palette: { type: String, default: '' },
  grade: { type: [String, Number, Object], default: null },
  subject: { type: [String, Object], default: '' },
  quizzesCount: { type: [String, Number], default: 0 },
  startLink: { type: [String, Object], default: null },
  startLabel: { type: String, 'default': 'View Quizzes' },
  // Accept the full topic object to dynamically access related data
  topic: { type: Object, default: null },
});

const displayTitle = computed(() => props.title || props.name || props.topic?.name || 'Topic');
const displayDescription = computed(() => props.description || props.topic?.description || '');

const paletteClass = computed(() => props.palette || 'bg-gradient-to-br from-emerald-400 to-emerald-600');

const displayGrade = computed(() => {
  const g = props.grade || props.topic?.grade || props.topic?.subject?.grade;
  if (!g) return '';
  if (typeof g === 'string' || typeof g === 'number') return g;
  return g.name || g.title || g.label || String(g.id || '');
});

const displayLevel = computed(() => {
  const g = props.grade || props.topic?.grade || props.topic?.subject?.grade;
  if (g && typeof g === 'object') {
    const lvl = g.level || g.level_id || g.levelId;
    if (lvl) return (typeof lvl === 'string' || typeof lvl === 'number') ? String(lvl) : (lvl.name || String(lvl.id || ''));
  }
  return '';
});

const isCourse = computed(() => {
  const g = props.grade || props.topic?.grade || props.topic?.subject?.grade;
  if (!g || typeof g !== 'object') return false
  return String(g.type || '').toLowerCase() === 'course';
});
</script>

<style scoped>
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0px) rotate(-1deg); }
  50% { transform: translateY(-2px) rotate(-1deg); }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.animate-spin-slow {
  animation: spin-slow 30s linear infinite;
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