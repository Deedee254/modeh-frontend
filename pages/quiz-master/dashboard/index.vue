<template>
  <div class="space-y-8">
    <!-- Quick Stats -->
    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in stats" :key="stat.label" class="bg-white p-6 rounded-lg shadow-sm">
        <h3 class="text-sm font-medium text-gray-500">{{ stat.label }}</h3>
        <p class="mt-2 text-3xl font-semibold text-gray-900">{{ stat.value }}</p>
      </div>
    </section>

    <!-- Popular Topics -->
    <section>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Popular Topics</h2>
        <button @click="router.push('/quiz-master/topics')" class="text-sm text-brand-600 hover:text-brand-800">View All →</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <TopicCard
          v-for="(topic, idx) in (Array.isArray(popularTopics) ? popularTopics.filter(Boolean) : [])"
          :key="topic?.id || idx"
          v-bind="topic"
          @click="topic && handleTopicClick(topic)"
        />
      </div>
    </section>

    <!-- Active Grades -->
    <section>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Active Grades</h2>
        <button @click="router.push('/quiz-master/grades')" class="text-sm text-brand-600 hover:text-brand-800">View All →</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <GradeCard
          v-for="(grade, idx) in (Array.isArray(activeGrades) ? activeGrades.filter(Boolean) : [])"
          :key="grade?.id || idx"
          v-bind="grade"
          @click="grade && handleGradeClick(grade)"
        />
      </div>
    </section>

    <!-- Top Subjects -->
    <section>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Top Subjects</h2>
        <button @click="router.push('/quiz-master/subjects')" class="text-sm text-brand-600 hover:text-brand-800">View All →</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <SubjectCard
          v-for="(subject, idx) in (Array.isArray(topSubjects) ? topSubjects.filter(Boolean) : [])"
          :key="subject?.id || idx"
          v-bind="subject"
          @click="subject && handleSubjectClick(subject)"
        />
      </div>
    </section>

    <!-- Recent Quizzes -->
    <section>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Recent Quizzes</h2>
        <button @click="router.push('/quiz-master/quizzes')" class="text-sm text-brand-600 hover:text-brand-800">View All →</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <QuizCard
          v-for="(quiz, idx) in (Array.isArray(recentQuizzes) ? recentQuizzes.filter(Boolean) : [])"
          :key="quiz?.id || idx"
          v-bind="quiz"
          @click="quiz && handleQuizClick(quiz)"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'quiz-master',
})

const router = useRouter()

// Data refs
const stats = ref([
  { label: 'Total Quizzes', value: '0' },
  { label: 'Active Quizees', value: '0' },
  { label: 'Topics Created', value: '0' },
  { label: 'Average Score', value: '0%' }
])
const popularTopics = ref([])
const activeGrades = ref([])
const topSubjects = ref([])
const recentQuizzes = ref([])

// Handler functions
const handleTopicClick = (topic) => {
  router.push(`/quiz-master/topics/${topic.slug}`)
}

const handleGradeClick = (grade) => {
  router.push(`/quiz-master/grades/${grade.slug}`)
}

const handleSubjectClick = (subject) => {
  router.push(`/quiz-master/subjects/${subject.slug}`)
}

const handleQuizClick = (quiz) => {
  router.push(`/quiz-master/quizzes/${quiz.slug}`)
}

// Fetch data
onMounted(async () => {
  try {
    // Fetch stats, topics, grades, subjects and recent quizzes
    // Replace these with your actual API calls
    const [statsData, topicsData, gradesData, subjectsData, quizzesData] = await Promise.all([
      // Add your API calls here
    ])

    stats.value = statsData || stats.value
    popularTopics.value = topicsData || []
    activeGrades.value = gradesData || []
  topSubjects.value = Array.isArray(subjectsData) ? subjectsData.filter(Boolean) : []
    recentQuizzes.value = quizzesData || []
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }
})
</script>