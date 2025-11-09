import { ref, onMounted, onUnmounted } from 'vue'
import type { Tournament, TournamentBattle } from '~/types/tournament'
import { useAuthStore } from '~/stores/auth'
import Echo from 'laravel-echo'

export function useTournamentRealtime(tournamentId: number | string) {
    const echo = ref<Echo | null>(null)
    const battleUpdates = ref<TournamentBattle[]>([])
    const isConnected = ref(false)

    const auth = useAuthStore()
    const config = useRuntimeConfig()

    onMounted(() => {
        if (!tournamentId) return

        echo.value = new Echo({
            broadcaster: 'pusher',
            key: config.public.pusherKey,
            wsHost: config.public.wsHost,
            wsPort: config.public.wsPort,
            wssPort: config.public.wssPort,
            forceTLS: false,
            enabledTransports: ['ws', 'wss'],
            auth: {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                }
            }
        })

        echo.value.private(`tournament.${tournamentId}`)
            .listen('.battle.started', (e: { battle: TournamentBattle }) => {
                const battle = e.battle
                battleUpdates.value = [...battleUpdates.value.filter(b => b.id !== battle.id), battle]
            })
            .listen('.battle.completed', (e: { battle: TournamentBattle }) => {
                const battle = e.battle
                battleUpdates.value = [...battleUpdates.value.filter(b => b.id !== battle.id), battle]
            })
            .listen('.battle.forfeited', (e: { battle: TournamentBattle }) => {
                const battle = e.battle
                battleUpdates.value = [...battleUpdates.value.filter(b => b.id !== battle.id), battle]
            })
            .listen('.battle.cancelled', (e: { battle: TournamentBattle }) => {
                const battle = e.battle
                battleUpdates.value = [...battleUpdates.value.filter(b => b.id !== battle.id), battle]
            })

        isConnected.value = true
    })

    onUnmounted(() => {
        if (echo.value) {
            echo.value.leave(`tournament.${tournamentId}`)
            isConnected.value = false
        }
    })

    return {
        battleUpdates,
        isConnected
    }
}