<template>
  <RegisterQuizMaster />
</template>

<script setup>
definePageMeta({
  middleware: ['guest']
})

import RegisterQuizMaster from '~/components/Auth/RegisterQuizMaster.vue'
</script>
