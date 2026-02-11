<template>
  <Teleport to="body">
    <transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <!-- Modal -->
        <div class="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-slate-800 overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-slate-800">
            <div class="flex items-center gap-3">
              <img
                :src="recipientAvatar"
                :alt="recipientName"
                class="w-10 h-10 rounded-full object-cover"
              />
              <h2 class="text-lg font-semibold text-white">{{ isSupport ? 'Contact Support' : `Message ${recipientName}` }}</h2>
            </div>
            <button
              @click="close"
              class="text-slate-400 hover:text-white transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Initial Message -->
          <div class="p-6 border-b border-slate-800">
            <div class="flex gap-3">
              <img
                :src="recipientAvatar"
                :alt="recipientName"
                class="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div class="flex-1 bg-slate-700 rounded-lg p-3">
                <p class="text-slate-100 text-sm">{{ recipientGreeting }}</p>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="p-6 space-y-4">
            <!-- Email field for support mode -->
            <div v-if="isSupport">
              <label class="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                v-model="email"
                type="email"
                placeholder="your@email.com"
                class="w-full bg-slate-800 text-white placeholder-slate-500 rounded-lg border-2 border-slate-600 focus:border-brand-500 focus:outline-none px-4 py-2 transition"
              />
            </div>

            <!-- Message textarea -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Message</label>
              <textarea
                v-model="message"
                :placeholder="`Write a message to ${recipientName}...`"
                class="w-full bg-slate-800 text-white placeholder-slate-500 rounded-lg border-2 border-slate-600 focus:border-brand-500 focus:outline-none p-4 resize-none transition"
                rows="5"
              ></textarea>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 p-6 border-t border-slate-800 justify-end">
            <button
              @click="close"
              class="px-6 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition font-medium"
            >
              Cancel
            </button>
            <button
              @click="sendMessage"
              :disabled="!message.trim() || (isSupport && !email.trim()) || isSending"
              class="px-6 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition font-medium flex items-center gap-2"
            >
              <svg v-if="!isSending" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSending ? 'Sending...' : 'Send Message' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import useApi from '~/composables/useApi'
import { resolveAvatar } from '~/composables/useAssets'
import { useAppAlert } from '~/composables/useAppAlert'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  recipientId: {
    type: [String, Number],
    default: null
  },
  recipientName: {
    type: String,
    default: 'Support Team'
  },
  recipientAvatar: {
    type: String,
    default: () => null
  },
  recipientGreeting: {
    type: String,
    default: 'Hi there! Feel free to send me a message about quizzes or anything else.'
  },
  isSupport: {
    type: Boolean,
    default: false
  },
  prefilledEmail: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'message-sent'])

const message = ref('')
const email = ref('')
const isSending = ref(false)
const api = useApi()
const { push: pushAlert } = useAppAlert()

const resolvedAvatar = computed(() => {
  return resolveAvatar(props.recipientAvatar, props.recipientName)
})

async function sendMessage() {
  // Validate message
  if (!message.value.trim()) {
    pushAlert({
      type: 'error',
      message: 'Please enter a message'
    })
    return
  }

  // Validate email for support mode
  if (props.isSupport && !email.value.trim()) {
    pushAlert({
      type: 'error',
      message: 'Please enter your email address'
    })
    return
  }

  // Validate email format for support mode
  if (props.isSupport && email.value.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value)) {
      pushAlert({
        type: 'error',
        message: 'Please enter a valid email address'
      })
      return
    }
  }

  isSending.value = true
  try {
    // Use existing /api/chat/send endpoint
    // For support: use special recipient_id = -1 (backend handles admin routing)
    // For direct: use provided recipientId
    const payload = {
      content: message.value.trim(),
      recipient_id: props.isSupport ? -1 : props.recipientId
    }

    const response = await api.postJson('/api/chat/send', payload)

    if (response && response.ok) {
      const data = response.data || response
      pushAlert({
        type: 'success',
        message: props.isSupport ? 'Support request sent successfully!' : 'Message sent successfully!'
      })

      // Emit event to notify parent/chat widget
      // Data includes email for support mode but backend stores it in message type='support'
      emit('message-sent', {
        recipient_id: props.isSupport ? -1 : props.recipientId,
        recipient_name: props.recipientName,
        message: message.value.trim(),
        email: props.isSupport ? email.value.trim() : undefined,
        thread_id: data.thread_id,
        created_at: new Date().toISOString()
      })

      message.value = ''
      email.value = ''
      close()
    } else {
      const errorMessage = response?.message || 'Failed to send message'
      pushAlert({
        type: 'error',
        message: errorMessage
      })
    }
  } catch (error) {
    console.error('Error sending message:', error)
    pushAlert({
      type: 'error',
      message: 'An error occurred while sending the message'
    })
  } finally {
    isSending.value = false
  }
}

function close() {
  message.value = ''
  email.value = ''
  emit('close')
}

defineExpose({
  open: () => {
    message.value = ''
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}
</style>
