<template>
  <section class="py-12">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <BannerCard
          label="Grades"
          title="Browse by grade"
          description="Find quizzes and resources organised by grade level so learners can follow curriculum-aligned practice."
          :items="propsGrades"
          variant="grades"
          more-link="/grades"
          :icon-svg="gradesIcon"
          :bg-gradient="colors[0]"
          button-text="View all grades"
        />

        <BannerCard
          label="Courses"
          title="Tertiary & Course tracks"
          description="Explore higher education and course-level tracks with curated quizzes and resources for deeper study."
          :items="propsCourses"
          variant="courses"
          more-link="/courses"
          :icon-svg="coursesIcon"
          :colors="colors"
          :bg-gradient="colors[2]"
          button-text="View all courses"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

import BannerCard from '~/components/BannerCard.vue'

const props = defineProps({
  grades: { type: Array, default: () => [] },
  courses: { type: Array, default: () => [] }
})

const colors = ['linear-gradient(135deg,#891f21,#b23a3f)','linear-gradient(135deg,#0f4c81,#17679a)','linear-gradient(135deg,#8b2ddb,#b55ef0)','linear-gradient(135deg,#0f6b3a,#0fa86b)','linear-gradient(135deg,#d97706,#f59e0b)']

// normalize inputs
const propsGrades = computed(() => Array.isArray(props.grades) ? props.grades : [])
const propsCourses = computed(() => Array.isArray(props.courses) ? props.courses : [])

const gradesIcon = `
<svg width="84" height="84" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 5a2 2 0 012-2h8l4 4v12a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M7 7h6M7 11h6M7 15h3" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const coursesIcon = `
<svg width="84" height="84" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2l7 4v6a6 6 0 01-6 6H11a6 6 0 01-6-6V6l7-4z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M7 10h10" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none }

.rounded-2xl:hover { transform: translateZ(0) }
</style>
