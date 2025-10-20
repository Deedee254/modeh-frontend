export interface AttemptDetail {
  question_id: number;
  correct: boolean;
  body: string;
  provided: string | string[] | number | number[] | null;
  correct_answers?: string | string[] | number | number[];
  explanation?: string | null;
}

export interface AttemptMeta {
  id?: number;
  score?: number;
  points?: number;
  points_earned?: number;
  rank?: number;
  total_participants?: number;
  total_time_seconds?: number;
  per_question_time?: Record<number, number> | number[];
  started_at?: string;
  completed_at?: string;
  badges?: Array<{ id: number; title: string; description?: string }>;
}

export interface AttemptData extends AttemptMeta {
  quiz_id?: number;
  battle_id?: number;
  answers?: Record<number, string | string[] | number | number[] | null>;
  details?: AttemptDetail[];
  questions?: AttemptDetail[];
  attempt?: AttemptData;
  result?: AttemptData;
  battle?: {
    id: number;
    name?: string;
    status?: string;
    initiator_id?: number;
    opponent_id?: number;
    initiator_points?: number;
    opponent_points?: number;
    winner_id?: number | null;
    initiator?: Record<string, any>;
    opponent?: Record<string, any>;
  };
}

export interface AttemptCacheEntry extends AttemptMeta {
  attempt?: AttemptData;
  quiz_id?: number | null;
  battle_id?: number | null;
  result?: AttemptData;
}

export type QuestionId = number;
export type Answer = string | string[] | number | number[] | null;

export interface QuestionAnswer {
  question_id: QuestionId;
  answer: Answer;
}