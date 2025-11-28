import { ref } from 'vue'

interface Alert {
  id: number
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  icon?: string
  emoji?: string
  title?: string
  timeout?: number
}

const alerts = ref<Alert[]>([])
let counter = 0

export function useAppAlert() {
  const push = (options: Omit<Alert, 'id'>) => {
    const id = ++counter
    const alert: Alert = {
      id,
      timeout: 5000,
      ...options,
      type: options.type ?? 'info'
    }

    // Add icon based on type if not provided and no emoji
    if (!alert.icon && !alert.emoji) {
      switch (alert.type) {
        case 'success':
          alert.icon = 'heroicons:check-circle'
          break
        case 'info':
          alert.icon = 'heroicons:information-circle'
          break
        case 'warning':
          alert.icon = 'heroicons:exclamation-triangle'
          break
        case 'error':
          alert.icon = 'heroicons:x-circle'
          break
      }
    }

    alerts.value.push(alert)

    if (alert.timeout && alert.timeout > 0) {
      setTimeout(() => {
        dismiss(id)
      }, alert.timeout)
    }

    return id
  }

  const dismiss = (id: number) => {
    const idx = alerts.value.findIndex(a => a.id === id)
    if (idx !== -1) alerts.value.splice(idx, 1)
  }

  return { alerts, push, dismiss }
}

