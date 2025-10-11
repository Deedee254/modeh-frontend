<template>
  <div>
    <quizeeTopBar v-if="isquizee" />
    <TopBar v-else-if="isquiz-master" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import quizeeTopBar from '~/components/quizeeTopBar.vue'
import TopBar from '~/components/TopBar.vue'

const auth = useAuthStore()
const isquizee = computed(() => !!auth.user && (auth.user.role === 'quizee' || (auth.user.roles && auth.user.roles.includes('quizee'))))
const isquiz-master = computed(() => !!auth.user && (auth.user.role === 'quiz-master' || (auth.user.roles && auth.user.roles.includes('quiz-master'))))
</script>

<style scoped></style>
