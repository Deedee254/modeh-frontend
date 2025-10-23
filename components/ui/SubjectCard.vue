<template>
  <div class="w-full group block rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-0.5 hover:scale-[1.01] overflow-hidden relative">
    <NuxtLink v-if="to" :to="to" class="absolute inset-0 z-0" aria-hidden="true"></NuxtLink>

    <!-- Header: Cover Image/Palette -->
    <div class="relative h-24 sm:h-32 overflow-hidden">
      <div class="absolute inset-0" :class="image ? '' : paletteClass">
        <img v-if="image" :src="image" :alt="displayTitle" class="w-full h-full object-cover" />
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
      <div class="absolute left-4 right-4 bottom-4 z-10 text-white">
        <h4 class="text-lg sm:text-xl font-semibold line-clamp-2">{{ displayTitle }}</h4>
        <div v-if="displayGrade" class="mt-1 text-xs inline-flex items-center gap-2">
          <span class="inline-flex items-center px-2 py-0.5 rounded bg-white/80 text-slate-800 text-xs font-medium">{{ isCourse ? 'Course' : 'Grade' }}</span>
          <span class="text-xs text-white/90">{{ displayGrade }}</span>
        </div>
      </div>
    </div>

    <!-- Body: Metadata, Topics, and CTA -->
    <div class="p-3 sm:p-4 relative z-10 flex flex-col gap-3 flex-grow">
      <div class="flex items-center justify-start gap-6 text-sm text-gray-700 dark:text-gray-300">
        <div class="flex items-center gap-3">
          <div class="font-semibold text-indigo-700 dark:text-indigo-400">{{ topicsCount }}</div>
          <div class="text-gray-500 dark:text-gray-400">topics</div>
        </div>
        <div class="flex items-center gap-3">
          <div class="font-semibold text-indigo-700 dark:text-indigo-400">{{ quizzes_count }}</div>
          <div class="text-gray-500 dark:text-gray-400">quizzes</div>
        </div>
      </div>

      <p v-if="displayDescription" class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{{ displayDescription }}</p>

      <!-- Display list of random topics -->
      <div v-if="displayTopics.length" class="flex flex-wrap gap-1.5">
        <span v-for="topic in displayTopics" :key="topic.id" class="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
          {{ topic.name }}
        </span>
      </div>

      <div class="mt-auto pt-2">
        <NuxtLink v-if="startLink" :to="startLink" class="w-full inline-flex justify-center items-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold dark:bg-indigo-500 dark:hover:bg-indigo-600">{{ startLabel }}</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  to: { type: [String, Object], default: null },
  title: { type: String, default: '' },
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  image: { type: String, default: '' },
  grade: { type: [String, Number, Object], default: null },
  badgeText: { type: String, default: '' },
  palette: { type: String, default: '' },
  topicsCount: { type: [Number, String], default: 0 },
  quizzes_count: { type: [Number, String], default: 0 },
  startLink: { type: [String, Object], default: null },
  startLabel: { type: String, default: 'Explore Topics' },
  // Accept the full subject object to dynamically access topics
  subject: { type: Object, default: null },
})

const displayTitle = computed(() => props.title || props.name || props.subject?.name || 'Subject');
const displayDescription = computed(() => props.description || props.subject?.description || props.subtitle || '');

const paletteClass = computed(() => props.palette || 'bg-gradient-to-br from-indigo-400 to-indigo-600');

const displayGrade = computed(() => {
  const g = props.grade || props.subject?.grade;
  if (!g) return '';
  if (typeof g === 'string' || typeof g === 'number') return g;
  return g.name || g.title || g.label || String(g.id || '');
});

const displayLevel = computed(() => {
  if (props.grade && typeof props.grade === 'object') {
    const lvl = props.grade.level || props.grade.level_id || props.grade.levelId
    if (lvl) return (typeof lvl === 'string' || typeof lvl === 'number') ? String(lvl) : (lvl.name || String(lvl.id || ''))
  }
  return ''
});

const isCourse = computed(() => {
  const g = props.grade || props.subject?.grade;
  if (!g || typeof g !== 'object') return false;
  return String(g.type || '').toLowerCase() === 'course';
});

const displayTopics = computed(() => {
  if (props.subject && Array.isArray(props.subject.topics) && props.subject.topics.length > 0) {
    // Shuffle the array and take the first 3 for a random selection
    const shuffled = [...props.subject.topics].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }
  return [];
});
</script>