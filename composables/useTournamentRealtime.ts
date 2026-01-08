import { ref, onMounted, onUnmounted } from 'vue'
import type { Tournament, TournamentBattle } from '~/types/tournament'
import { useAuthStore } from '~/stores/auth'
import Echo from 'laravel-echo'
import { useApi } from '~/composables/useApi'

export function useTournamentRealtime(tournamentId: number | string) {
    const echo = ref<any>(null)
    const battleUpdates = ref<TournamentBattle[]>([])
    const isConnected = ref(false)

    const auth = useAuthStore()
    const config = useRuntimeConfig()
    const api = useApi()

    onMounted(async () => {
        if (!tournamentId) return

        // Get Bearer token for WebSocket authentication (if user is authenticated)
        let authHeaders: Record<string, string> = { 'X-Requested-With': 'XMLHttpRequest' }
        try {
            const token = api.getAuthToken()
            if (token) {
                authHeaders['Authorization'] = `Bearer ${token}`
            }
        } catch (e) {
            // Continue without Bearer token if not authenticated - public channels may be accessible
        }

        if (window.Echo) {
            echo.value = window.Echo;
        } else {
            const key = config.public.pusherKey || config.public.pusherAppKey || '5a6916ce972fd4a06074';
            echo.value = new Echo({
                broadcaster: 'pusher',
                key: key,
                wsHost: config.public.wsHost,
                wsPort: config.public.wsPort,
                wssPort: config.public.wsPort,
                forceTLS: false,
                enabledTransports: ['ws', 'wss'],
                auth: {
                    headers: authHeaders
                }
            })
        }

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
