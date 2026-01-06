<template>
  <RegisterInstitutionManager />
</template>

<script setup>
definePageMeta({
  middleware: ['guest']
})

import RegisterInstitutionManager from '~/components/Auth/RegisterInstitutionManager.vue'
</script>
