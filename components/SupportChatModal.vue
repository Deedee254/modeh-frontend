<template>
  <ChatModal
    :is-open="isOpen"
    :is-support="true"
    :recipient-name="'Support Team'"
    :recipient-avatar="undefined"
    :recipient-greeting="'Hello! Thank you for reaching out. Our support team is here to help. Please tell us what you need assistance with.'"
    :prefilled-email="prefilledEmail"
    @close="$emit('close')"
    @message-sent="onMessageSent"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ChatModal from '~/components/ChatModal.vue'
import { useAuthStore } from '~/stores/auth'
import useApi from '~/composables/useApi'
import { useAppAlert } from '~/composables/useAppAlert'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'support-message-sent'])

const auth = useAuthStore()
const api = useApi()
const { push: pushAlert } = useAppAlert()

const prefilledEmail = computed(() => {
  return (auth.user as any)?.email || ''
})

function onMessageSent(data: any) {
  // Emit event to parent with support message info
  // Note: Email is collected UI-side for display purposes
  // Backend handles support routing via special recipient_id: -1
  // which automatically routes to all admins (see ChatController)
  emit('support-message-sent', {
    email: data.email,
    message: data.message,
    created_at: data.created_at,
    recipient_id: data.recipient_id // Will be -1 for support
  })

  // Close the modal
  emit('close')
}
</script>
