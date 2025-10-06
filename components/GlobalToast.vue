<template>
  <!-- Deprecated: GlobalToast replaced by GlobalAlert. This component intentionally renders nothing. -->
  <div v-if="false"></div>
</template>

<script setup>
if (process.client && console && console.warn) console.warn('[deprecation] GlobalToast is deprecated. Use GlobalAlert instead.')
</script>

<style scoped></style>
