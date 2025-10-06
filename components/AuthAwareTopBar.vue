<template>
  <div>
    <StudentTopBar v-if="isStudent" />
    <TopBar v-else-if="isTutor" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import StudentTopBar from '~/components/StudentTopBar.vue'
import TopBar from '~/components/TopBar.vue'

const auth = useAuthStore()
const isStudent = computed(() => !!auth.user && (auth.user.role === 'student' || (auth.user.roles && auth.user.roles.includes('student'))))
const isTutor = computed(() => !!auth.user && (auth.user.role === 'tutor' || (auth.user.roles && auth.user.roles.includes('tutor'))))
</script>

<style scoped></style>
