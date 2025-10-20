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

onMounted(() => {
  if ($echo) {
    // Determine the correct connection object based on the driver
    connection = $echo.connector.socket || $echo.connector.pusher?.connection

    if (connection) {
      // Listen for connection events
      connection.on('connect', onConnect)
      connection.on('connected', onConnect) // Pusher uses 'connected'
      connection.on('disconnect', onDisconnect)
      connection.on('error', onConnectError) // Pusher uses 'error'
      connection.on('connect_error', onConnectError) // Socket.IO uses 'connect_error'
    } else {
      connectionStatus.value = 'Error'
      error.value = 'Could not find the connection object (socket or pusher).'
    }

    // Subscribe to a test channel
    $echo.channel('test-channel').listen('TestEvent', (e) => {
      console.log('Received test event:', e)
    })
  } else {
    connectionStatus.value = 'Error'
    error.value = 'Echo instance ($echo) is not available.'
  }
})

onUnmounted(() => {
  // Clean up listeners to prevent memory leaks
  if (connection) {
    connection.off('connect', onConnect)
    connection.off('connected', onConnect)
    connection.off('disconnect', onDisconnect)
    connection.off('error', onConnectError)
    connection.off('connect_error', onConnectError)
  }
})
</script>