/**
 * Core domain types for Modeh application
 * These types represent the main entities used across the frontend
 */

export interface User {
  id: number
  name?: string
  email?: string
  phone?: string
  avatar?: string
  avatar_url?: string
  bio?: string
  headline?: string
  role?: string
  email_verified_at?: string
  affiliate_code?: string
  is_profile_completed?: boolean
  created_at?: string

  // Profile data (unified for both QuizMaster and Quizee)
  profile?: QuizMasterProfile | QuizeeProfile

  // Institution relationships
  institutions?: Institution[]
  institution_id?: number
  institution?: Institution | string | number

  // Affiliate relationship
  affiliate?: any

  // Profile completion status
  profile_status?: {
    is_completed: boolean
    missing_fields: string[]
    missing_messages: Record<string, string>
  }

  // Pivot data for institution membership
  pivot?: {
    role?: string
    status?: string
    approved?: boolean | string
    created_at?: string
    updated_at?: string
  }
}

export interface QuizMasterProfile {
  id?: number
  user_id?: number
  institution_id?: number
  bio?: string
  is_verified?: boolean
  headline?: string
  created_at?: string
  updated_at?: string
  
  // Taxonomy data
  grade_id?: number
  level_id?: number
  subjects?: Subject[] | Array<{ id: number; name: string }>
  grade?: Grade
  level?: Level
}

export interface QuizeeProfile {
  id?: number
  user_id?: number
  institution_id?: number
  grade_id?: number
  level_id?: number
  bio?: string
  headline?: string
  is_verified?: boolean
  created_at?: string
  updated_at?: string

  // Taxonomy data
  grade?: Grade
  level?: Level
  subjects?: Subject[] | Array<{ id: number; name: string }>
}

export interface InstitutionManagerProfile {
  id?: number
  user_id?: number
  institution_id?: number
  bio?: string
  headline?: string
  created_at?: string
  updated_at?: string
}

export interface Institution {
  id: number
  name: string
  slug: string
  email?: string
  phone?: string
  website?: string
  address?: string
  is_active: boolean
  metadata?: Record<string, any>
  users?: User[]
  children?: Institution[] // Sub-institutions/branches
  branches?: Institution[] // Fallback for branches
  created_at?: string
  updated_at?: string
  pivot?: {
    role?: string
    status?: string
    approved?: boolean | string
    created_at?: string
    updated_at?: string
  }
}

export interface Subject {
  id: number
  name: string
  icon?: string
  created_at?: string
  updated_at?: string
}

export interface Grade {
  id: number | string
  name?: string
  level?: number
  created_at?: string
  updated_at?: string
}

export interface Level {
  id: number | string
  name?: string
  created_at?: string
  updated_at?: string
}

export interface Topic {
  id: number
  name: string
  subject_id: number
  image?: string
  created_at?: string
  updated_at?: string
}

export interface Notification {
  id: string
  type: string
  data?: Record<string, any>
  title?: string
  body?: string
  message?: string
  read: boolean
  created_at: string
  icon?: string
  time_ago?: string
}

export interface ApiResponse<T> {
  ok: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
}

export interface AuthResponse {
  user?: User
  data?: User
  ok?: boolean
  message?: string
  error?: string
}

export interface LoginRequest {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
  role: 'quizee' | 'quiz-master' | 'institution-manager'
  remember?: boolean
}

export interface ProfileUpdateRequest {
  name?: string
  display_name?: string
  email?: string
  phone?: string
  bio?: string
  headline?: string
  avatar?: File
  institution_id?: number
  institution?: string | number
  grade_id?: number
  level_id?: number
  subjects?: number[]
}

export interface JoinInstitutionRequest {
  step: string
  data: {
    institution_id: number
    branch_id?: number
  }
}

// Core Quiz type used across the frontend. Add any missing fields here
// to ensure TypeScript recognizes `slug` on quiz objects.
export interface Quiz {
  id?: number | string
  slug?: string
  title?: string
  description?: string
  cover?: string
  cover_image?: string
  topic?: any
  topic_name?: string
  subject?: any
  subject_name?: string
  grade?: any
  grade_id?: number | string | null
  level_id?: number | string | null
  questions_count?: number
  items_count?: number
  likes_count?: number
  liked?: boolean
  is_paid?: boolean
  created_at?: string
  updated_at?: string
  created_by?: {
    id: number
    name?: string
    avatar?: string | null
    avatar_url?: string | null
    avatarUrl?: string | null
    image?: string | null
    photo?: string | null
    [k: string]: any
  }
  [key: string]: any
}
