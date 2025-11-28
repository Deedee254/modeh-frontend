declare module '~/composables/useProfileForm' {
  import { Ref } from 'vue'

  /** Shape of the profile form state returned by createFormState */
  export interface ProfileFormState {
    display_name: string
    name: string
    email: string
    institution?: string | null
    grade_id?: number | string | null
    level_id?: number | string | null
    phone?: string
    subjects: Array<number | string>
    headline?: string
    bio?: string
    teaching_subjects?: string
    first_name?: string
    last_name?: string
  }

  export function useProfileForm(): {
    avatarFile: Ref<File | null>
    avatarPreview: Ref<string | null>
    createFormState: (u: any | null) => ProfileFormState
    onFile: (e: Event) => void
    resetAvatar: (userAvatarUrl?: string | null) => void
    validateForm: (form: ProfileFormState) => Record<string, string>
    saveProfile: (form: ProfileFormState, isQuizMaster: boolean) => Promise<boolean>
  }
}

