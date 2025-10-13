<template>
  <div>
    <StudentTopBar v-if="isquizee" />
    <TopBar v-else-if="isQuizMaster" />
    <Header v-else />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import Header from '~/components/Header.vue'
import TopBar from '~/components/TopBar.vue'
import StudentTopBar from '~/components/StudentTopBar.vue'

const auth = useAuthStore()
const isquizee = computed(() => !!auth.user && (auth.user.role === 'quizee' || (auth.user.roles && auth.user.roles.includes('quizee'))))
const isQuizMaster = computed(() => !!auth.user && (auth.user.role === 'quiz-master' || (auth.user.roles && auth.user.roles.includes('quiz-master'))))
</script>
