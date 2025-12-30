import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Component } from 'vue'

interface BottomNavHandlers {
    left?: (() => void) | null
    center?: (() => void) | null
    right?: (() => void) | null
}

interface BottomNavSlots {
    left?: Component | null
    center?: Component | null
    right?: Component | null
}

export const useBottomNavStore = defineStore('bottomNav', () => {
    // handlers are functions (e.g., navigation actions)
    const leftHandler = ref<(() => void) | null>(null)
    const centerHandler = ref<(() => void) | null>(null)
    const rightHandler = ref<(() => void) | null>(null)

    // slot components (Vue component objects) to render instead of defaults
    const leftSlot = ref<Component | null>(null)
    const centerSlot = ref<Component | null>(null)
    const rightSlot = ref<Component | null>(null)

    function setHandlers({ left = null, center = null, right = null }: BottomNavHandlers = {}) {
        leftHandler.value = left
        centerHandler.value = center
        rightHandler.value = right
    }

    function setSlots({ left = null, center = null, right = null }: BottomNavSlots = {}) {
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
