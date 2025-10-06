import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'

export const useAchievementStore = defineStore('achievements', () => {
  const achievements = ref([])
  const alert = useAppAlert()

  function addAchievement(achievement) {
    achievements.value.push(achievement)
    
    // Show achievement toast
    alert.push({ 
      message: `Achievement Unlocked: ${achievement.name}`, 
      type: 'success',
      emoji: achievement.icon || '🏆'
    })
  }

  function attachEchoListeners(echo) {
    echo?.private(`user.${useAuthStore().user?.id}`)
      ?.listen('.AchievementUnlocked', (payload) => {
        const achievement = payload?.achievement ?? payload
        addAchievement(achievement)
      })
  }

  return {
    achievements,
    addAchievement,
    attachEchoListeners
  }
})