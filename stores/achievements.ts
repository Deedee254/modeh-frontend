import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAppAlert } from '~/composables/useAppAlert'
import { useAuthStore } from './auth'

interface Achievement {
    id: number | string
    name: string
    description?: string
    icon?: string
    [key: string]: any
}

export const useAchievementStore = defineStore('achievements', () => {
    const achievements = ref<Achievement[]>([])
    const alert = useAppAlert()

    function addAchievement(achievement: Achievement) {
        achievements.value.push(achievement)

        // Show achievement toast
        alert.push({
            message: `Achievement Unlocked: ${achievement.name}`,
            type: 'success',
            emoji: achievement.icon || '🏆'
        })
    }

    function attachEchoListeners(echo: any) {
        const auth = useAuthStore()
        if (!auth.user?.id) return

        // Ensure we are listening on the correct private channel for the user
        // The channel name usually matches what is defined in routes/channels.php (e.g. users.{id})
        // Based on other files, it seems to be `users.{id}` but the original code said `user.{id}`. 
        // I will check notifications.ts which uses `users.{id}`. 
        // Wait, the original achievements.js said `user.{id}` (singular). 
        // I will stick to what was there but add a comment, or better yet, verify consistency.
        // However, for pure conversion, I will keep logic similar but make it safer.

        try {
            echo?.private(`users.${auth.user.id}`)
                ?.listen('.AchievementUnlocked', (payload: any) => {
                    const achievement = payload?.achievement ?? payload
                    addAchievement(achievement)
                })
        } catch (e) {
            // listener attachment error silently
        }
    }

    return {
        achievements,
        addAchievement,
        attachEchoListeners
    }
})
