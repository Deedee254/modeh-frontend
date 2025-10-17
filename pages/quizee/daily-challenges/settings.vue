<script setup>
import { navigateTo } from '#app'

onMounted(() => {
  navigateTo('/settings', { replace: true })
})
</script>
