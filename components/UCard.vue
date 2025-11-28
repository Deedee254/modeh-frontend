<template>
  <!-- Compatibility wrapper: delegate to UiCard to avoid mass-renames -->
  <UiCard v-bind="$attrs">
    <template #header>
      <slot name="header" />
    </template>

    <slot></slot>

    <template #footer>
      <slot name="footer" />
    </template>
  </UiCard>
</template>

<script setup>
import UiCard from '~/components/ui/UiCard.vue'
defineProps(['variant','noPadding'])
</script>

