<template>
  <RegisterParent />
</template>

<script setup>
import RegisterParent from '~/components/Auth/RegisterParent.vue'

definePageMeta({
  middleware: ['guest']
})
</script>
