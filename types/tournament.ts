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
    sponsor?: Sponsor;
    subject?: Subject;
    grade?: Grade;
    grade_id?: number;
    level_id?: number;
    access_type?: 'public' | 'grade' | 'level';
    topic?: Topic;
    participants?: User[];
    battles?: TournamentBattle[];
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
    email?: string;
    role?: string;
}

export interface Question {
    id: number;
    content: string;
    body?: string;
    type: 'mcq' | 'multi' | 'text' | 'true_false';
    options?: Option[];
    correct_option_id?: string | number;
    correct_answer?: string;
    points: number;
    marks?: number;
    position: number;
    media_url?: string;
    media?: string;
    media_path?: string;
}

export interface Option {
    id: number | string;
    content: string;
    text?: string;
}

export interface Sponsor {
    id: number;
    name: string;
    logo?: string;
    website?: string;
}

export interface Subject {
    id: number;
    name: string;
    icon?: string;
}

export interface Grade {
    id: number;
    name: string;
    level?: number;
}

export interface Topic {
    id: number;
    name: string;
    subject_id: number;
    image?: string;
}

// Request/Response Types
export interface TournamentCreateRequest {
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    status?: 'upcoming' | 'active' | 'completed';
    entry_fee?: number;
    prize_pool?: number;
    max_participants?: number;
    min_participants?: number;
    format?: 'single_elimination' | 'double_elimination' | 'round_robin';
    rules?: string[];
    subject_id: number;
    topic_id?: number;
    grade_id: number;
    level_id?: number;
    access_type?: 'public' | 'grade' | 'level';
    requires_approval?: boolean;
    is_featured?: boolean;
}

export interface TournamentUpdateRequest extends Partial<TournamentCreateRequest> {
}

export interface BattleAnswer {
    question_id: number;
    answer: string | string[] | null;
}

export interface BattleSubmitRequest {
    answers: BattleAnswer[];
    score?: number;
}

export interface BattleDraftRequest {
    answers: BattleAnswer[];
    current_question_index?: number;
    time_remaining?: number;
}

export interface BattleDraft {
    battle_id: number;
    player_id: number;
    answers: BattleAnswer[];
    current_question_index: number;
    time_remaining?: number;
    saved_at: string;
}

export interface BattleResult {
    player1_score: number;
    player2_score: number;
    winner_id?: number;
    is_draw: boolean;
    player1_attempts?: BattleAttempt[];
    player2_attempts?: BattleAttempt[];
}

export interface BattleAttempt {
    question_id: number;
    player_id: number;
    answer: string | string[] | null;
    points: number;
}

export interface TournamentLeaderboardEntry {
    id: number;
    name: string;
    avatar?: string;
    points: number;
    rank?: number;
    completed_at?: string;
}

export interface TournamentLeaderboard {
    tournament: {
        id: number;
        name: string;
        status: string;
    };
    leaderboard: TournamentLeaderboardEntry[];
}

export interface RegistrationStatus {
    isRegistered: boolean;
    status?: 'approved' | 'pending' | 'rejected';
}