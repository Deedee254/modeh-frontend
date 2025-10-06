<script setup>
definePageMeta({ layout: 'tutor' })
import { useNotificationsStore } from '~/stores/notifications'
const store = useNotificationsStore()
import { onMounted } from 'vue'
onMounted(() => store.openDrawer())
</script>

<template>
  <div class="p-4">
    <!-- We reuse the NotificationDrawer component so the drawer opens when this page is visited -->
    <NotificationDrawer />
    <div class="mt-6 text-gray-600">If the drawer didn't open, click the bell in the top-right to view notifications.</div>
  </div>
</template>
