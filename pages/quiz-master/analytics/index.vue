<template>
  <div class="space-y-8">
    <!-- Topics Section -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Topics</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <TopicCard
          v-for="topic in topics"
          :key="topic.id"
          v-bind="topic"
          @click="handleTopicClick(topic)"
        />
      </div>
    </section>

    <!-- Grades Section -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Grades</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <GradeCard
          v-for="grade in grades"
          :key="grade.id"
          v-bind="grade"
          @click="handleGradeClick(grade)"
        />
      </div>
    </section>

    <!-- Subjects Section -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Subjects</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <SubjectCard
          v-for="subject in subjects"
          :key="subject.id"
          v-bind="subject"
          @click="handleSubjectClick(subject)"
        />
      </div>
    </section>

    <!-- Recent Quizzes -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Recent Quizzes</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <QuizCard
          v-for="quiz in recentQuizzes"
          :key="quiz.id"
          v-bind="quiz"
          @click="handleQuizClick(quiz)"
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
const topics = ref([])
const grades = ref([])
const subjects = ref([])
const recentQuizzes = ref([])

// Handler functions
const handleTopicClick = (topic) => {
  router.push(`/quiz-master/topics/${topic.id}`)
}

const handleGradeClick = (grade) => {
  router.push(`/quiz-master/grades/${grade.id}`)
}

const handleSubjectClick = (subject) => {
  router.push(`/quiz-master/subjects/${subject.id}`)
}

const handleQuizClick = (quiz) => {
  router.push(`/quiz-master/quizzes/${quiz.id}`)
}

// Fetch data
onMounted(async () => {
  try {
    // Fetch topics, grades, subjects and recent quizzes
    // Replace these with your actual API calls
    const [topicsData, gradesData, subjectsData, quizzesData] = await Promise.all([
      // Add your API calls here
    ])

    topics.value = topicsData || []
    grades.value = gradesData || []
    subjects.value = subjectsData || []
    recentQuizzes.value = quizzesData || []
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})
</script>
