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
          :svg-src="'/Grades-cuate.svg'"
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
          :svg-src="'/Happy%20student-pana.svg'"
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

</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none }

.rounded-2xl:hover { transform: translateZ(0) }
</style>
