import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBottomNavStore = defineStore('bottomNav', () => {
  // handlers are functions (e.g., navigation actions)
  const leftHandler = ref(null)
  const centerHandler = ref(null)
  const rightHandler = ref(null)

  // slot components (Vue component objects) to render instead of defaults
  const leftSlot = ref(null)
  const centerSlot = ref(null)
  const rightSlot = ref(null)

  function setHandlers({ left = null, center = null, right = null } = {}) {
    leftHandler.value = left
    centerHandler.value = center
    rightHandler.value = right
  }

  function setSlots({ left = null, center = null, right = null } = {}) {
    leftSlot.value = left
    centerSlot.value = center
    rightSlot.value = right
  }

  function clearAll() {
    leftHandler.value = null
    centerHandler.value = null
    rightHandler.value = null
    leftSlot.value = null
    centerSlot.value = null
    rightSlot.value = null
  }

  return { leftHandler, centerHandler, rightHandler, leftSlot, centerSlot, rightSlot, setHandlers, setSlots, clearAll }
})
