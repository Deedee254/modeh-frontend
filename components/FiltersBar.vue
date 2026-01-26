<template>
  <aside :class="[
      'transition-all duration-300',
      props.sticky ? 'sticky overflow-y-auto' : ''
    ]"
    :style="props.sticky ? { top: 'var(--topbar-height)', height: 'calc(100vh - var(--topbar-height))' } : {}">

    <!-- STICKY SIDEBAR MODE (Left column, full height) -->
    <template v-if="props.sticky">
      <div class="h-full flex flex-col bg-gradient-to-b from-white via-slate-50 to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900/80 border-r border-slate-200 dark:border-slate-800">
        
        <!-- Header -->
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wide">Filters</h3>
            <button 
              @click="collapsed = !collapsed" 
              class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
              :aria-label="collapsed ? 'Open filters' : 'Collapse filters'"
            >
              <svg class="w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform" :style="{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Refine your search</p>
        </div>

        <!-- Active Filters Chips -->
        <div v-if="hasAnyActive && !collapsed" class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <p class="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Applied filters</p>
          <div class="flex flex-wrap gap-2">
            <template v-if="activeLevelLabel">
              <button @click="removeLevel" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600/10 dark:bg-brand-600/30 text-brand-600 dark:text-accent-500 text-xs font-medium rounded-full hover:bg-brand-600/20 dark:hover:bg-brand-600/50 transition-colors duration-200 group">
                <span>{{ activeLevelLabel }}</span>
                <svg class="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </template>
            <template v-if="activeGradeLabel">
              <button @click="removeGrade" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-medium rounded-full hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors duration-200 group">
                <span>{{ activeGradeLabel }}</span>
                <svg class="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </template>
            <template v-if="activeSubjectLabel">
              <button @click="removeSubject" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors duration-200 group">
                <span>{{ activeSubjectLabel }}</span>
                <svg class="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </template>
            <template v-if="activeTopicLabel">
              <button @click="removeTopic" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs font-medium rounded-full hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors duration-200 group">
                <span>{{ activeTopicLabel }}</span>
                <svg class="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </template>
          </div>
        </div>

        <!-- Filter Controls -->
        <div v-if="!collapsed" class="flex-1 overflow-y-auto">
          <div class="p-6 space-y-6">
            <!-- Level Filter -->
            <div class="space-y-2.5">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Level</label>
              <div class="relative">
                <select v-model="localLevel" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer">
                  <option :value="null" class="text-slate-600">All levels</option>
                  <option v-for="l in filteredLevels" :key="l.id" :value="l.id" class="text-slate-900">{{ l.name || ('Level ' + l.id) }}</option>
                </select>
                <svg v-if="!loadingLevels" class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span v-else class="absolute right-3 top-1/2 -translate-y-1/2">
                  <span class="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin block"></span>
                </span>
              </div>
            </div>

            <!-- Grade Filter -->
            <div class="space-y-2.5">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Grade</label>
              <div class="relative">
                <select v-model="localGrade" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer">
                  <option :value="null" class="text-slate-600">All grades</option>
                  <option v-for="g in filteredGrades" :key="g.id" :value="g.id" class="text-slate-900">{{ g.display_name || g.name || ('Grade ' + g.id) }}</option>
                </select>
                <svg v-if="!loadingGrades" class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span v-else class="absolute right-3 top-1/2 -translate-y-1/2">
                  <span class="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin block"></span>
                </span>
              </div>
            </div>

            <!-- Subject Filter -->
            <div class="space-y-2.5">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Subject</label>
              <div class="relative">
                <select v-model="localSubject" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer">
                  <option :value="null" class="text-slate-600">All subjects</option>
                  <option v-for="s in filteredSubjectsClean" :key="s.id" :value="s.id" class="text-slate-900">{{ s.name || '' }}</option>
                </select>
                <svg v-if="!loadingSubjects" class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span v-else class="absolute right-3 top-1/2 -translate-y-1/2">
                  <span class="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin block"></span>
                </span>
              </div>
            </div>

            <!-- Topic Filter -->
            <div v-if="showTopic" class="space-y-2.5">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Topic</label>
              <div class="relative">
                <select v-model="localTopic" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer">
                  <option :value="null" class="text-slate-600">All topics</option>
                  <option v-for="t in filteredTopicsClean" :key="t.id" :value="t.id" class="text-slate-900">{{ t.name || '' }}</option>
                </select>
                <svg v-if="!loadingTopics" class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span v-else class="absolute right-3 top-1/2 -translate-y-1/2">
                  <span class="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin block"></span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
          <button @click="onClear" class="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200">
            Reset
          </button>
          <button @click="onApply" class="flex-1 px-4 py-2.5 rounded-lg text-white text-sm font-semibold shadow-lg transition-all duration-200" style="background: linear-gradient(to right, #891f21, #a83435); box-shadow: 0 10px 15px -3px rgba(137, 31, 33, 0.3)">
            Apply
          </button>
        </div>
      </div>
    </template>

    <!-- HORIZONTAL MODE (Top bar, responsive) -->
    <template v-else>
      <div class="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <!-- Mobile: Collapsible filters -->
          <div class="block lg:hidden">
            <button 
              @click="collapsed = !collapsed"
              class="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
            >
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span class="text-sm font-semibold text-slate-900 dark:text-slate-50">Filters</span>
                <span v-if="hasAnyActive" class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-brand-600/10 dark:bg-brand-600/30 text-brand-600 dark:text-accent-500 text-xs font-bold">{{ activeFilterCount }}</span>
              </div>
              <svg class="w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform duration-300" :style="{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            <!-- Mobile filter panel -->
            <transition name="slide-down">
              <div v-if="!collapsed" class="mt-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <div class="space-y-1.5">
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Level</label>
                    <select v-model="localLevel" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-brand-600 focus:border-transparent">
                      <option :value="null">All</option>
                      <option v-for="l in filteredLevels" :key="l.id" :value="l.id">{{ l.name }}</option>
                    </select>
                  </div>
                  <div class="space-y-1.5">
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Grade</label>
                    <select v-model="localGrade" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option :value="null">All</option>
                      <option v-for="g in filteredGrades" :key="g.id" :value="g.id">{{ g.display_name || g.name }}</option>
                    </select>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="space-y-1.5">
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Subject</label>
                    <select v-model="localSubject" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                      <option :value="null">All</option>
                      <option v-for="s in filteredSubjectsClean" :key="s.id" :value="s.id">{{ s.name }}</option>
                    </select>
                  </div>
                  <div v-if="showTopic" class="space-y-1.5">
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Topic</label>
                    <select v-model="localTopic" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-rose-500 focus:border-transparent">
                      <option :value="null">All</option>
                      <option v-for="t in filteredTopicsClean" :key="t.id" :value="t.id">{{ t.name }}</option>
                    </select>
                  </div>
                </div>
                <div class="flex gap-2 pt-2">
                  <button @click="onClear" class="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Reset</button>
                  <button @click="onApply" class="flex-1 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-colors" style="background-color: #891f21">Apply</button>
                </div>
              </div>
            </transition>
          </div>

          <!-- Desktop: Inline filters -->
          <div class="hidden lg:flex lg:items-center lg:gap-4">
            <div class="flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-slate-700">
              <svg class="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span class="text-sm font-semibold text-slate-900 dark:text-slate-50">Filters</span>
            </div>

            <div class="flex-1 flex items-center gap-3">
              <div class="min-w-[140px]">
                <select v-model="localLevel" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-50 font-medium focus:ring-2 focus:ring-brand-600">
                  <option :value="null">All levels</option>
                  <option v-for="l in filteredLevels" :key="l.id" :value="l.id">{{ l.name }}</option>
                </select>
              </div>
              <div class="min-w-[140px]">
                <select v-model="localGrade" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-50 font-medium focus:ring-2 focus:ring-teal-500">
                  <option :value="null">All grades</option>
                  <option v-for="g in filteredGrades" :key="g.id" :value="g.id">{{ g.display_name || g.name }}</option>
                </select>
              </div>
              <div class="min-w-[140px]">
                <select v-model="localSubject" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-50 font-medium focus:ring-2 focus:ring-emerald-500">
                  <option :value="null">All subjects</option>
                  <option v-for="s in filteredSubjectsClean" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
              </div>
              <div v-if="showTopic" class="min-w-[140px]">
                <select v-model="localTopic" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-50 font-medium focus:ring-2 focus:ring-rose-500">
                  <option :value="null">All topics</option>
                  <option v-for="t in filteredTopicsClean" :key="t.id" :value="t.id">{{ t.name }}</option>
                </select>
              </div>
            </div>

            <div class="flex gap-2 ml-auto pl-4 border-l border-slate-200 dark:border-slate-700">
              <button @click="onClear" class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Reset
              </button>
              <button @click="onApply" class="px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-lg transition-all" style="background: linear-gradient(to right, #891f21, #a83435); box-shadow: 0 10px 15px -3px rgba(137, 31, 33, 0.3)">
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </aside>
</template>

<script setup>
import { ref, watch, toRefs, onMounted, computed, unref } from 'vue'
import { useCookie } from '#app'
import { useTaxonomyStore } from '~/stores/taxonomyStore'

const props = defineProps({
  // Accept either raw arrays or reactive refs/objects to remain flexible across callers
  subjectOptions: { type: [Array, Object], default: () => [] },
  topicOptions: { type: [Array, Object], default: () => [] },
  gradeOptions: { type: [Array, Object], default: () => [] },
  showTopic: { type: Boolean, default: true },
  subject: { type: [Number, String], default: null },
  topic: { type: [Number, String], default: null },
  grade: { type: [Number, String], default: null },
  level: { type: [Number, String], default: null },
  storageKey: { type: String, default: '' },
  // when true the sidebar will be sticky and sized to viewport height using --topbar-height
  sticky: { type: Boolean, default: false }
})
const emit = defineEmits(['update:subject', 'update:topic', 'update:grade', 'update:level', 'apply', 'clear'])

const localSubject = ref(props.subject)
const localTopic = ref(props.topic)
const localGrade = ref(props.grade)
const localLevel = ref(props.level)
// start collapsed and fetch taxonomy only when the sidebar is opened
const collapsed = ref(true)
const cookieCollapsed = props.storageKey ? useCookie(props.storageKey + ':collapsed') : null

// Use taxonomy store for all taxonomy data
const store = useTaxonomyStore()

// Computed properties for loading states (store doesn't have individual loading flags, so assume false)
const loadingLevels = computed(() => false)
const loadingGrades = computed(() => false)
const loadingSubjects = computed(() => false)
const loadingTopics = computed(() => false)

// compute label lookups from either props.options or store
const gradeLookup = computed(() => {
  try {
    const raw = unref(props.gradeOptions)
    const list = Array.isArray(raw) && raw.length ? raw : (store.grades || [])
    return (list || []).reduce((acc, g) => {
      if (g && g.id != null) {
        try {
          acc[String(g.id)] = g
        } catch (e) {
          // ignore invalid grade objects
        }
      }
      return acc
    }, {})
  } catch (e) {
    // Grade lookup computation error
    return {}
  }
})
const subjectLookup = computed(() => {
  try {
    const raw = unref(props.subjectOptions)
    const list = Array.isArray(raw) && raw.length ? raw : (store.subjects || [])
    return (list || []).reduce((acc, s) => {
      if (s && s.id != null) {
        try {
          acc[String(s.id)] = s
        } catch (e) {
          // ignore invalid subject objects
        }
      }
      return acc
    }, {})
  } catch (e) {
    // Subject lookup computation error
    return {}
  }
})
const topicLookup = computed(() => {
  try {
    const raw = unref(props.topicOptions)
    const list = Array.isArray(raw) && raw.length ? raw : (store.topics || [])
    return (list || []).reduce((acc, t) => {
      if (t && t.id != null) {
        try {
          acc[String(t.id)] = t
        } catch (e) {
          // ignore invalid topic objects
        }
      }
      return acc
    }, {})
  } catch (e) {
    // Topic lookup computation error
    return {}
  }
})

const activeGradeLabel = computed(() => {
  try {
    if (!localGrade.value) return ''
    const g = gradeLookup.value[String(localGrade.value)]
    return g ? (g.display_name || g.name || g.title || g.label || String(g.id || localGrade.value)) : String(localGrade.value)
  } catch (e) {
    return String(localGrade.value || '')
  }
})
const activeLevelLabel = computed(() => {
  try {
    if (!localLevel.value) return ''
    const list = (store.levels || [])
    const l = list.find(x => x && x.id != null && String(x.id) === String(localLevel.value))
    return l && l.name ? l.name : String(localLevel.value)
  } catch (e) {
    return String(localLevel.value || '')
  }
})
const activeSubjectLabel = computed(() => {
  try {
    if (!localSubject.value) return ''
    const s = subjectLookup.value[String(localSubject.value)]
    return s ? (s.name || s.title || s.label || String(s.id || localSubject.value)) : String(localSubject.value)
  } catch (e) {
    return String(localSubject.value || '')
  }
})
const activeTopicLabel = computed(() => {
  try {
    if (!localTopic.value) return ''
    const t = topicLookup.value[String(localTopic.value)]
    return t ? (t.name || t.title || t.label || String(t.id || localTopic.value)) : String(localTopic.value)
  } catch (e) {
    return String(localTopic.value || '')
  }
})

const hasAnyActive = computed(() => {
  return !!(localLevel.value || localGrade.value || localSubject.value || localTopic.value)
})

const activeFilterCount = computed(() => {
  let count = 0
  if (localLevel.value) count++
  if (localGrade.value) count++
  if (localSubject.value) count++
  if (localTopic.value) count++
  return count
})

// subjects from store
const filteredSubjects = computed(() => {
  return store.subjects || []
})

// compute filtered grades by selected level if levels are available
const gradeOptionsByLevel = computed(() => {
  try {
    if (localLevel.value && Array.isArray(store.levels) && store.levels.length) {
      const l = store.levels.find(x => x && x.id != null && String(x.id) === String(localLevel.value))
      if (l && Array.isArray(l.grades)) {
        // levels may include grade ids (number/string) or partial objects; resolve to full grade objects when possible
        return l.grades.map(g => {
          try {
            if (!g) return null
            if (typeof g === 'object' && g.id != null) return g
            const gStr = String(g || '')
            const resolved = gradeLookup.value[gStr]
            return resolved || { id: gStr, name: gStr }
          } catch (e) {
            return null
          }
        }).filter(Boolean)
      }
      // fallback: filter store grades by level_id if grades not nested in level
      const allGrades = store.grades || []
      const filtered = allGrades.filter(g => g && g.id != null && String(g.level_id || g.level || '') === String(localLevel.value))
      if (filtered.length) return filtered
    }
    const rawGrades = unref(props.gradeOptions)
    return (Array.isArray(rawGrades) && rawGrades.length) ? rawGrades : (store.grades || [])
  } catch (e) {
    return []
  }
})

// compute topics filtered by selected subject (if topicOptions contain subject_id)
const filteredTopics = computed(() => {
  try {
    const raw = unref(props.topicOptions)
    const allTopics = (store.topics && store.topics.length) ? store.topics : (Array.isArray(raw) ? raw : [])
    if (!localSubject.value) return allTopics || []
    return (allTopics || []).filter(t => t && t.id != null && String(t.subject_id || t.subject || '') === String(localSubject.value))
  } catch (e) {
    return []
  }
})

const filteredLevels = computed(() => {
  try {
    return (store.levels || []).filter(x => x && x.id != null)
  } catch (e) {
    return []
  }
})

const filteredGrades = computed(() => {
  try {
    return (gradeOptionsByLevel.value || []).filter(x => x && x.id != null)
  } catch (e) {
    return []
  }
})

const filteredSubjectsClean = computed(() => {
  try {
    return (filteredSubjects.value || []).filter(x => x && x.id != null)
  } catch (e) {
    return []
  }
})

const filteredTopicsClean = computed(() => {
  try {
    return (filteredTopics.value || []).filter(x => x && x.id != null)
  } catch (e) {
    return []
  }
})

// restore collapsed from localStorage if storageKey provided - do this after mount to avoid hydration mismatches
onMounted(() => {
  if (!props.storageKey) return
  try {
    // prefer cookie (server-surfaced) then localStorage
    if (cookieCollapsed && cookieCollapsed.value !== undefined && cookieCollapsed.value !== null) {
      collapsed.value = cookieCollapsed.value === 'true'
    } else {
      const raw = localStorage.getItem(props.storageKey + ':collapsed')
      if (raw !== null) collapsed.value = raw === 'true'
    }
  } catch (e) {}
})

watch(() => props.subject, (v) => { localSubject.value = v })
watch(() => props.topic, (v) => { localTopic.value = v })
watch(() => props.grade, (v) => { localGrade.value = v })
watch(() => props.level, (v) => { localLevel.value = v })
watch(collapsed, (v) => {
  if (props.storageKey) {
    try { if (cookieCollapsed) cookieCollapsed.value = String(v) } catch (e) {}
    if (process.client) { try { localStorage.setItem(props.storageKey + ':collapsed', String(v)) } catch (e) {} }
  }
})

// When grade changes, clear dependent selections and emit
watch(localGrade, (v) => {
  if (process.client && props.storageKey) { try { localStorage.setItem(props.storageKey + ':grade', String(v)) } catch (e) {} }
  // when grade changes, clear dependent subject/topic selections
  localSubject.value = null
  localTopic.value = null
  emit('update:grade', v)
})

// When subject changes, clear dependent topic and emit
watch(localSubject, (v) => {
  if (process.client && props.storageKey) { try { localStorage.setItem(props.storageKey + ':subject', String(v)) } catch (e) {} }
  emit('update:subject', v)
})

// When level changes, clear dependent selections and emit
watch(localLevel, (v) => {
  if (process.client && props.storageKey) { try { localStorage.setItem(props.storageKey + ':level', String(v)) } catch (e) {} }
  // when level changes, clear grade/subject/topic
  localGrade.value = null
  localSubject.value = null
  localTopic.value = null
  emit('update:grade', null)
  emit('update:level', v)
})

function onApply() {
  emit('update:subject', localSubject.value)
  emit('update:topic', localTopic.value)
  emit('update:grade', localGrade.value)
  emit('apply')
}

function onClear() {
  localSubject.value = null
  localTopic.value = null
  localGrade.value = null
  localLevel.value = null
  emit('update:subject', null)
  emit('update:topic', null)
  emit('update:grade', null)
  emit('update:level', null)
  emit('clear')
}

function removeGrade() {
  localGrade.value = null
  localSubject.value = null
  localTopic.value = null
}

function removeSubject() {
  localSubject.value = null
  localTopic.value = null
}

function removeTopic() {
  localTopic.value = null
}

function removeLevel() {
  localLevel.value = null
  localGrade.value = null
  localSubject.value = null
  localTopic.value = null
}
</script>

<style scoped>
/* Smooth transitions for dropdown chevrons */
select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

/* Smooth slide animation for mobile filter panel */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Smooth hover transitions */
button {
  transition: all 0.2s ease;
}
</style>

