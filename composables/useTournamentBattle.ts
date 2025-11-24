import { ref, computed } from 'vue'
import type { TournamentBattle } from '~/types/tournament'

export function useTournamentBattle(battle: TournamentBattle) {
    const api = useApi()
    const loading = ref(false)
    const error = ref<string | null>(null)

    const timeRemaining = computed(() => {
        if (!battle.timeout_at || !battle.is_active) return 0
        const timeout = new Date(battle.timeout_at).getTime()
        const now = Date.now()
        return Math.max(0, Math.floor((timeout - now) / 1000))
    })

    const forfeit = async (reason?: string): Promise<boolean> => {
        try {
            loading.value = true
            error.value = null

            const response = await api.postJson(`/tournaments/battles/${battle.id}/forfeit`, {
                reason
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.message || 'Failed to forfeit battle')
            }

            return true
        } catch (e) {
            console.error('Failed to forfeit battle:', e)
            error.value = e instanceof Error ? e.message : 'Failed to forfeit battle'
            return false
        } finally {
            loading.value = false
        }
    }

    const submit = async (answers: Record<string, any>): Promise<boolean> => {
        try {
            loading.value = true
            error.value = null

            const response = await api.postJson(`/tournaments/battles/${battle.id}/submit`, {
                answers
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.message || 'Failed to submit battle')
            }

            return true
        } catch (e) {
            console.error('Failed to submit battle:', e)
            error.value = e instanceof Error ? e.message : 'Failed to submit battle'
            return false
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        error,
        timeRemaining,
        forfeit,
        submit
    }
}