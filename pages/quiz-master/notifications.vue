<script setup>
definePageMeta({ layout: 'quiz-master' })
import { useNotificationsStore } from '~/stores/notifications'
const store = useNotificationsStore()
import { onMounted } from 'vue'
onMounted(() => store.openDrawer())
</script>

<template>
  <div class="bg-gray-50 pb-16 md:pb-0">
    <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <!-- We reuse the NotificationDrawer component so the drawer opens when this page is visited -->
      <NotificationDrawer />
      <div class="mt-6 text-gray-600">If the drawer didn't open, click the bell in the top-right to view notifications.</div>
    </div>
  </div>
</template>
