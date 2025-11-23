import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useUserRole } from './useUserRole'
import { useInstitutionsStore } from '~/stores/institutions'

export function useBottomNavMenus() {
  const { isQuizMaster, isQuizee } = useUserRole()
  const instStoreRaw = useInstitutionsStore()
  const instStore: InstitutionStore = {
    activeInstitutionSlug: instStoreRaw.activeInstitutionSlug ?? undefined,
    institution: instStoreRaw.institution ?? undefined
  }

  /**
   * Resolve institution slug in paths like '/institution-manager/institutions/[slug]/...'
   */
interface InstitutionStore {
    activeInstitutionSlug?: string
    institution?: { slug?: string }
}

/**
 * Resolves a path by replacing [slug] with the active institution slug.
 * If no slug is available, falls back to /institutions.
 */
function resolveInstPath(path: string): string {
    try {
        const instSlug: string | undefined = instStore.activeInstitutionSlug || instStore.institution?.slug
        if (!instSlug) {
            return String(path).replace('/institutions/[slug]', '/institutions')
        }
        return String(path).replace('[slug]', String(instSlug))
    } catch (e) {
        return path
    }
}

  /**
   * Common menu items structure: { id, label, icon, to }
   */
  const menuItems = computed(() => {
    const base = {
      quizee: {
        explore: [
          { id: 'grades', label: 'Grades', icon: 'heroicons:scale', to: '/grades' },
          { id: 'subjects', label: 'Subjects', icon: 'heroicons:bookmark', to: '/subjects' },
          { id: 'levels', label: 'Levels', icon: 'heroicons:chart-pie', to: '/levels' },
          { id: 'topics', label: 'Topics', icon: 'heroicons:book-open', to: '/topics' },
          { id: 'quiz-masters', label: 'Quiz Masters', icon: 'heroicons:user-group', to: '/quizee/quiz-masters' }
        ],
        settings: [
          { id: 'profile', label: 'Profile', icon: 'heroicons:user', to: '/profile' },
          { id: 'preferences', label: 'Preferences', icon: 'heroicons:cog-6-tooth', to: '/preferences' },
          { id: 'help', label: 'Help', icon: 'heroicons:question-mark-circle', to: '/help' }
        ]
      },
      quizMaster: {
        explore: [
          { id: 'grades', label: 'Grades', icon: 'heroicons:scale', to: '/grades' },
          { id: 'quizzes', label: 'My Quizzes', icon: 'heroicons:clipboard-document-list', to: '/quiz-master/quizzes' },
          { id: 'quizees', label: 'Quizees', icon: 'heroicons:user-group', to: '/quiz-master/quizees' },
          { id: 'topics', label: 'Topics', icon: 'heroicons:book-open', to: '/quiz-master/topics' },
          { id: 'analytics', label: 'Analytics', icon: 'heroicons:presentation-chart-bar', to: '/quiz-master/analytics' }
        ],
        settings: [
          { id: 'profile', label: 'Profile', icon: 'heroicons:user', to: '/profile' },
          { id: 'preferences', label: 'Preferences', icon: 'heroicons:cog-6-tooth', to: '/preferences' },
          { id: 'help', label: 'Help', icon: 'heroicons:question-mark-circle', to: '/help' }
        ]
      },
      institutionManager: {
        explore: [
          { id: 'analytics', label: 'Dashboard', icon: 'heroicons:chart-pie', to: resolveInstPath('/institution-manager/institutions/[slug]/analytics') },
          { id: 'members', label: 'Members', icon: 'heroicons:user-group', to: resolveInstPath('/institution-manager/institutions/[slug]/members') },
          { id: 'quiz-masters', label: 'Quiz Masters', icon: 'heroicons:user', to: '/institution-manager/quiz-masters' },
          { id: 'subscriptions', label: 'Subscriptions', icon: 'heroicons:credit-card', to: resolveInstPath('/institution-manager/institutions/[slug]/subscriptions') }
        ],
        settings: [
          { id: 'institution-settings', label: 'Institution Settings', icon: 'heroicons:cog-6-tooth', to: resolveInstPath('/institution-manager/institutions/[slug]/settings') },
          { id: 'profile', label: 'Profile', icon: 'heroicons:user', to: '/profile' },
          { id: 'help', label: 'Help', icon: 'heroicons:question-mark-circle', to: '/help' }
        ]
      }
    }

    return base
  })

  /**
   * Get the appropriate menu items for the current user role
   */
  const currentRoleMenus = computed(() => {
    if (isQuizMaster.value) return menuItems.value.quizMaster
    if (isQuizee.value) return menuItems.value.quizee
    
    // Fallback to quizee
    return menuItems.value.quizee
  })

  return {
    menuItems,
    currentRoleMenus,
    resolveInstPath
  }
}
