<template>
  <div class="p-6 max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-4">Echo Server Connection Test</h1>
    
    <!-- Connection Status -->
    <div class="mb-6 p-4 rounded-lg" :class="[
      connectionStatus === 'connected' ? 'bg-emerald-50 border border-emerald-200' :
      connectionStatus === 'connecting' ? 'bg-yellow-50 border border-yellow-200' :
      'bg-red-50 border border-red-200'
    ]">
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 rounded-full" :class="[
          connectionStatus === 'connected' ? 'bg-emerald-600 animate-pulse' :
          connectionStatus === 'connecting' ? 'bg-yellow-600 animate-pulse' :
          'bg-red-600'
        ]"></div>
        <div>
          <p class="font-semibold" :class="[
            connectionStatus === 'connected' ? 'text-emerald-900' :
            connectionStatus === 'connecting' ? 'text-yellow-900' :
            'text-red-900'
          ]">
            {{ connectionStatus === 'connected' ? '✓ Connected' : 
               connectionStatus === 'connecting' ? '⏳ Connecting...' : 
               '✗ Disconnected' }}
          </p>
          <p class="text-sm" :class="[
            connectionStatus === 'connected' ? 'text-emerald-700' :
            connectionStatus === 'connecting' ? 'text-yellow-700' :
            'text-red-700'
          ]">
            {{ statusMessage }}
          </p>
        </div>
      </div>
    </div>

    <!-- Configuration Info -->
    <div class="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <h2 class="font-semibold text-slate-900 mb-3">Configuration</h2>
      <div class="space-y-2 text-sm font-mono text-slate-700">
        <div><span class="font-semibold">API Base:</span> {{ apiBase }}</div>
        <div><span class="font-semibold">Pusher Key:</span> {{ pusherKey }}</div>
        <div><span class="font-semibold">Pusher Cluster:</span> {{ pusherCluster }}</div>
      </div>
    </div>

    <!-- Send Test Message -->
    <div class="mb-6 space-y-3">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">Test Channel</label>
        <input 
          v-model="testChannel" 
          type="text" 
          placeholder="e.g., payment-updates"
          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">Test Event</label>
        <input 
          v-model="testEvent" 
          type="text" 
          placeholder="e.g., payment.completed"
          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button 
        @click="sendTestMessage"
        :disabled="connectionStatus !== 'connected'"
        class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        Subscribe & Listen
      </button>
    </div>

    <!-- Messages Log -->
    <div class="p-4 bg-slate-50 rounded-lg border border-slate-200">
      <h2 class="font-semibold text-slate-900 mb-3">Messages Received</h2>
      <div class="space-y-2 max-h-64 overflow-y-auto">
        <div v-if="messages.length === 0" class="text-sm text-slate-500 italic">
          No messages yet. Subscribe to a channel above.
        </div>
        <div 
          v-for="(msg, idx) in messages" 
          :key="idx"
          class="p-2 bg-white rounded border border-slate-200 text-sm"
        >
          <div class="font-mono text-xs text-slate-500">{{ msg.timestamp }}</div>
          <div class="font-semibold text-slate-900">{{ msg.event }}</div>
          <div class="text-slate-700 mt-1 font-mono text-xs">{{ JSON.stringify(msg.data, null, 2) }}</div>
        </div>
      </div>
    </div>

    <!-- Errors Log -->
    <div v-if="errors.length > 0" class="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
      <h2 class="font-semibold text-red-900 mb-3">Errors</h2>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div 
          v-for="(err, idx) in errors" 
          :key="idx"
          class="p-2 bg-white rounded border border-red-200 text-sm"
        >
          <div class="font-mono text-xs text-red-500">{{ err.timestamp }}</div>
          <div class="text-red-900">{{ err.message }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const route = useRoute()

const connectionStatus = ref<'connected' | 'connecting' | 'disconnected'>('connecting')
const statusMessage = ref('Initializing connection...')
const messages = ref<any[]>([])
const errors = ref<any[]>([])
const testChannel = ref('payment-updates')
const testEvent = ref('payment.completed')
const activeChannelListener = ref<any>(null)

// Display config values
const apiBase = computed(() => config.public.apiBase)
const pusherKey = computed(() => config.public.pusherKey)
const pusherCluster = computed(() => config.public.pusherCluster)

const addLog = (message: string, type: 'info' | 'error' = 'info') => {
  console.log(`[Echo Test ${type.toUpperCase()}]`, message)
}

const addError = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  errors.value.unshift({ message, timestamp })
  if (errors.value.length > 10) errors.value.pop()
  addLog(message, 'error')
}

const addMessage = (event: string, data: any) => {
  const timestamp = new Date().toLocaleTimeString()
  messages.value.unshift({ event, data, timestamp })
  if (messages.value.length > 10) messages.value.pop()
  addLog(`Message received on ${event}`)
}

onMounted(() => {
  addLog('Echo Test Component mounted')
  
  nextTick(() => {
    const echo = (window as any).Echo
    
    if (!echo) {
      addError('Echo not initialized. Check plugin and browser console.')
      connectionStatus.value = 'disconnected'
      return
    }

    const pusher = (echo.connector as any)?.pusher
    
    if (!pusher) {
      addError('Pusher not initialized in Echo connector')
      connectionStatus.value = 'disconnected'
      return
    }

    // Monitor connection state
    if (pusher.connection) {
      pusher.connection.bind('connected', () => {
        connectionStatus.value = 'connected'
        statusMessage.value = `Connected (Socket ID: ${pusher.connection.socket_id})`
        addLog('Echo connected successfully')
      })

      pusher.connection.bind('error', (err: any) => {
        connectionStatus.value = 'disconnected'
        statusMessage.value = `Error: ${err?.message || 'Unknown error'}`
        addError(`Connection error: ${JSON.stringify(err)}`)
      })

      pusher.connection.bind('disconnected', () => {
        connectionStatus.value = 'disconnected'
        statusMessage.value = 'Disconnected'
        addLog('Echo disconnected')
      })

      // Check current state
      if (pusher.connection.state === 'connected') {
        connectionStatus.value = 'connected'
        statusMessage.value = `Connected (Socket ID: ${pusher.connection.socket_id})`
        addLog('Already connected on mount')
      } else {
        statusMessage.value = `Waiting for connection... (State: ${pusher.connection.state})`
      }
    } else {
      addError('Pusher connection object not available')
    }
  })
})

function sendTestMessage() {
  const echo = (window as any).Echo
  
  if (!echo) {
    addError('Echo not available')
    return
  }

  try {
    // Remove previous listener if exists
    if (activeChannelListener.value) {
      activeChannelListener.value.stopListening(testEvent.value)
    }

    // Listen on the channel
    activeChannelListener.value = echo.channel(testChannel.value)
    activeChannelListener.value.listen(testEvent.value, (data: any) => {
      addMessage(testEvent.value, data)
    })

    addLog(`Listening on channel "${testChannel.value}" for event "${testEvent.value}"`)
  } catch (e) {
    addError(`Failed to subscribe: ${(e as any)?.message || String(e)}`)
  }
}

// Cleanup on unmount
onUnmounted(() => {
  if (activeChannelListener.value) {
    try {
      const echo = (window as any).Echo
      if (echo) {
        echo.leave(testChannel.value)
      }
    } catch (e) {
      addLog(`Cleanup error: ${(e as any)?.message}`)
    }
  }
})
</script>

<style scoped>
</style>
