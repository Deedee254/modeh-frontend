<template>
  <div class="space-y-8">
    <!-- Topics Section -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Topics</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <TopicCard
          v-for="(topic, idx) in (Array.isArray(topics) ? topics.filter(Boolean) : [])"
          :key="topic?.id || idx"
          v-bind="topic"
          @click="topic && handleTopicClick(topic)"
        />
      </div>
    </section>

    <!-- Grades Section -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Grades</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <GradeCard
          v-for="(grade, idx) in (Array.isArray(grades) ? grades.filter(Boolean) : [])"
          :key="grade?.id || idx"
          v-bind="grade"
          @click="grade && handleGradeClick(grade)"
        />
      </div>
    </section>

    <!-- Subjects Section -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Subjects</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <SubjectCard
          v-for="(subject, idx) in (Array.isArray(subjects) ? subjects.filter(Boolean) : [])"
          :key="subject?.id || idx"
          v-bind="subject"
          @click="subject && handleSubjectClick(subject)"
        />
      </div>
    </section>

    <!-- Recent Quizzes -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Recent Quizzes</h2>
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
import GradeCard from '~/components/ui/GradeCard.vue'
import SubjectCard from '~/components/ui/SubjectCard.vue'
import QuizCard from '~/components/ui/QuizCard.vue'
import useApi from '~/composables/useApi'
import useTaxonomy from '~/composables/useTaxonomy'

definePageMeta({ layout: 'quiz-master' })

const api = useApi()
const router = useRouter()
const { grades, subjects, topics, fetchGrades, fetchAllSubjects, fetchAllTopics, fetchSubjectsByGrade } = useTaxonomy()
const recentQuizzes = ref([])
const loading = ref(false)
const error = ref(null)

// Handler functions
const handleTopicClick = (topic) => { router.push(`/quiz-master/topics/${topic.id}`) }
const handleGradeClick = (grade) => { router.push(`/quiz-master/grades/${grade.id}`) }
const handleSubjectClick = (subject) => { router.push(`/quiz-master/subjects/${subject.id}`) }
const handleQuizClick = (quiz) => { router.push(`/quiz-master/quizzes/${quiz.id}`) }

// Fetch data
onMounted(async () => {
  loading.value = true
  try {
    // Use taxonomy composable to populate grades/subjects/topics (it handles caching and shapes)
    await Promise.all([fetchGrades(), fetchAllSubjects(), fetchAllTopics()])

    // Fetch recent quizzes separately via API composable
    const qRes = await api.get('/api/quizzes?recent=1')
    if (qRes && qRes.ok) {
      const qJson = await qRes.json().catch(()=>[])
      recentQuizzes.value = Array.isArray(qJson) ? qJson : (qJson?.quizzes || [])
    }
  } catch (err) {
    console.error('Error fetching analytics data', err)
    error.value = err.message || String(err)
  } finally {
    loading.value = false
  }
})
</script>
