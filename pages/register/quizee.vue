<template>
  <RegisterQuizee />
</template>

<script setup>
definePageMeta({
  middleware: ['guest']
})

import RegisterQuizee from '~/components/Auth/RegisterQuizee.vue'
</script>
