<template>
  <div class="p-4">
    <h1 class="text-2xl mb-4">Echo Connection Test</h1>
    <div class="bg-gray-100 p-4 rounded">
      <p>Status: {{ connectionStatus }}</p>
      <p v-if="error" class="text-red-500">Error: {{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

const { $echo } = useNuxtApp()
const connectionStatus = ref('Connecting...')
const error = ref(null)

let connection

const onConnect = () => {
  connectionStatus.value = `Connected with socket ID: ${$echo.socketId()}`
  error.value = null
}

const onDisconnect = () => {
  connectionStatus.value = 'Disconnected'
}

const onConnectError = (err) => {
  connectionStatus.value = 'Connection Error'
  error.value = err.message || JSON.stringify(err)
}

definePageMeta({
  middleware: 'sidebase-auth'
})

onMounted(() => {
  if ($echo) {
    // Get the Pusher connection object
    connection = $echo.connector?.pusher?.connection

    if (connection) {
      // Listen for connection events using Pusher's bind method
      connection.bind('connected', onConnect)
      connection.bind('disconnected', onDisconnect)
      connection.bind('error', onConnectError)
      connection.bind('connect_error', onConnectError) // Fallback for some Pusher versions
    } else {
      connectionStatus.value = 'Error'
      error.value = 'Could not find the Pusher connection object.'
    }

    // Only subscribe to channels if user is authenticated
    // This will be handled by watching auth state
  } else {
    connectionStatus.value = 'Error'
    error.value = 'Echo instance ($echo) is not available.'
  }
})

// Watch for authentication changes and subscribe to test channel when authenticated
const auth = useAuthStore()
watch(() => auth.user, (user) => {
  if (user && $echo) {
    // Subscribe to a test channel now that user is authenticated
    $echo.channel('test-channel').listen('TestEvent', (e) => {
      console.log('Received test event:', e)
    })
  }
}, { immediate: true })

onUnmounted(() => {
  // Clean up listeners to prevent memory leaks using Pusher's unbind method
  if (connection) {
    connection.unbind('connected', onConnect)
    connection.unbind('disconnected', onDisconnect)
    connection.unbind('error', onConnectError)
    connection.unbind('connect_error', onConnectError)
  }
})
</script>