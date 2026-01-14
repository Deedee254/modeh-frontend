<template>
  <div>
    <!-- Always use TopBar for authenticated users, as it's now role-aware -->
    <TopBar v-if="isAuthed" />
    <Header v-else />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import Header from '~/components/Header.vue'
import TopBar from '~/components/TopBar.vue'

const { status } = useAuth()
const auth = useAuthStore()
const isAuthed = computed(() => {
  if (status.value === 'unauthenticated') return false
  return !!auth.user && Object.keys(auth.user).length > 0
})
const isquizee = computed(() => !!auth.user && (auth.user.role === 'quizee' || (auth.user.roles && auth.user.roles.includes('quizee'))))
const isQuizMaster = computed(() => !!auth.user && (auth.user.role === 'quiz-master' || (auth.user.roles && auth.user.roles.includes('quiz-master'))))
</script>

