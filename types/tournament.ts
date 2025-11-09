export interface Tournament {
    id: number;
    name: string;
    description: string;
    banner_url?: string;
    start_date: string;
    end_date: string;
    registration_end_date?: string;
    status: 'upcoming' | 'active' | 'completed' | 'cancelled';
    entry_fee: number;
    prize_pool: number;
    max_participants?: number;
    min_participants?: number;
    format: 'single_elimination' | 'double_elimination' | 'round_robin';
    rules: string[];
    requires_premium: boolean;
    is_featured: boolean;
    participants_count: number;
    current_round: number;
    total_rounds: number;
    registration_open: boolean;
    can_start: boolean;
    winner?: User;
}

export interface TournamentBattle {
    id: number;
    tournament_id: number;
    round: number;
    player1_id: number;
    player2_id: number;
    winner_id?: number;
    player1_score?: number;
    player2_score?: number;
    scheduled_at: string;
    started_at?: string;
    completed_at?: string;
    timeout_at?: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'forfeited' | 'cancelled';
    forfeit_reason?: string;
    is_draw: boolean;
    battle_duration?: number;
    is_active: boolean;
    can_start: boolean;
    time_remaining?: number;
    has_timed_out: boolean;
    player1?: User;
    player2?: User;
    winner?: User;
    questions?: Question[];
}

export interface User {
    id: number;
    name: string;
    avatar?: string;
    title?: string;
}

export interface Question {
    id: number;
    content: string;
    type: string;
    options?: string[];
    correct_answer?: string;
    points: number;
    position: number;
}