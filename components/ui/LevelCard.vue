<template>
  <div class="w-full group block rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.03] hover:rotate-1 overflow-hidden relative border border-white/20 dark:border-slate-700/50 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 before:absolute before:inset-0 before:bg-gradient-to-br before:from-indigo-500/10 before:to-purple-500/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500">
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-hidden="true"></NuxtLink>

    <!-- Animated background pattern -->
    <div class="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 animate-pulse"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.3),transparent_50%)] animate-spin-slow"></div>
    </div>

    <!-- Header: cover image or palette -->
    <div class="relative h-32 sm:h-40 overflow-hidden">
      <div class="absolute inset-0" :class="cover ? '' : paletteClass">
        <img v-if="cover" :src="cover" alt="" class="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2" />
      </div>

      <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none group-hover:from-black/60 transition-all duration-500"></div>

      <!-- Floating level badge -->
      <div class="absolute top-4 left-4 z-10 transform -rotate-3 group-hover:rotate-0 transition-transform duration-300">
        <div class="inline-flex items-center px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-slate-800 text-xs font-bold shadow-lg border border-white/50 animate-bounce-slow">
          <span class="i-heroicons-academic-cap-16-solid mr-1.5 text-indigo-600 animate-pulse"></span>
          Level
        </div>
      </div>

      <!-- Animated title overlay -->
      <div class="absolute left-4 right-4 bottom-4 z-10 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
        <h4 class="text-xl sm:text-2xl font-black line-clamp-2 drop-shadow-lg group-hover:text-indigo-100 transition-colors duration-300">{{ displayTitle }}</h4>
        <div v-if="displaySubtitle" class="mt-1 text-sm text-white/90 line-clamp-1 drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{{ displaySubtitle }}</div>
      </div>

      <!-- Hover glow effect -->
      <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
    </div>

    <!-- Body: enhanced metadata and CTA -->
    <div class="p-5 sm:p-6 relative z-10 flex flex-col gap-5 flex-grow">
      <!-- Animated stats section -->
      <div class="flex items-center justify-between transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">
        <div class="flex items-center gap-3">
          <div class="p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
            <span class="i-heroicons-squares-2x2-16-solid text-indigo-600 dark:text-indigo-400 text-base group-hover:animate-bounce"></span>
          </div>
          <div class="transform group-hover:scale-105 transition-transform duration-300">
            <div class="text-xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors duration-300">{{ grades_count }}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Grades</div>
          </div>
        </div>
        <div class="text-right transform group-hover:scale-105 transition-transform duration-300">
          <div class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">Learning Path</div>
        </div>
      </div>

      <!-- Animated grade tags -->
      <div v-if="displayGrades.length" class="flex flex-wrap gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-200">
        <span v-for="(grade, index) in displayGrades" :key="grade.id" :class="`inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in`" :style="{ animationDelay: `${index * 100}ms` }">
          <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2 animate-pulse"></span>
          {{ grade.name }}
        </span>
      </div>

      <!-- Enhanced CTA Button -->
      <div class="mt-auto pt-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-300">
        <NuxtLink v-if="actionLink" :to="actionLink" class="w-full inline-flex justify-center items-center px-5 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:via-indigo-800 hover:to-purple-800 text-white rounded-2xl text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:from-indigo-500 dark:via-indigo-600 dark:to-purple-600 dark:hover:from-indigo-600 dark:hover:via-indigo-700 dark:hover:to-purple-700 transform hover:scale-105 hover:-translate-y-0.5 group-hover:animate-pulse-slow relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700">
          <span class="mr-2 relative z-10">{{ actionLabel }}</span>
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
  subtitle: { type: String, default: '' },
  description: { type: String, default: '' },
  cover: { type: String, default: '' },
  palette: { type: String, default: '' },
  grades_count: { type: [Number, String], default: 0 },
  actionLink: { type: [String, Object], default: null },
  actionLabel: { type: String, default: 'Explore' },
  // Accept the full level object to dynamically access grades
  level: { type: Object, default: null },
});

const paletteClass = computed(() => props.palette || 'bg-gradient-to-br from-indigo-400 to-indigo-600');

const displayTitle = computed(() => props.title || props.level?.name || 'Level');
const displaySubtitle = computed(() => props.subtitle || props.level?.description || '');

const displayGrades = computed(() => {
  if (props.level && Array.isArray(props.level.grades)) {
    return props.level.grades.slice(0, 4); // Show up to 4 grades
  }
  return [];
});
</script>

<style scoped>
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0px) rotate(-3deg); }
  50% { transform: translateY(-2px) rotate(-3deg); }
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
  animation: spin-slow 20s linear infinite;
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
