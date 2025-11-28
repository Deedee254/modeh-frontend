import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useUserRole } from './useUserRole'
import { useInstitutionsStore } from '~/stores/institutions'

export function useBottomNavMenus() {
  const { isQuizMaster, isQuizee, isInstitutionManager } = useUserRole()
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
        rightMenu: [
          { id: 'points', label: 'Points', icon: 'heroicons:star', to: '/quizee/points' }
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
        rightMenu: [
          { id: 'wallet', label: 'Wallet', icon: 'heroicons:wallet', to: '/quiz-master/wallet' }
        ]
      },
      institutionManager: {
        explore: [
          { id: 'dashboard', label: 'Dashboard', icon: 'heroicons:presentation-chart-bar', to: resolveInstPath('/institution-manager/institutions/[slug]/analytics') },
          { id: 'institutions', label: 'Institutions', icon: 'heroicons:building-office', to: '/institution-manager/institutions' },
          { id: 'branches', label: 'Branches', icon: 'heroicons:map-pin', to: resolveInstPath('/institution-manager/institutions/[slug]/branches') },
          { id: 'members', label: 'Members', icon: 'heroicons:user-group', to: resolveInstPath('/institution-manager/institutions/[slug]/members') },
          { id: 'subscriptions', label: 'Subscriptions', icon: 'heroicons:credit-card', to: resolveInstPath('/institution-manager/institutions/[slug]/subscriptions') }
        ],
        rightMenu: [
          { id: 'explore', label: 'Explore', icon: 'heroicons:magnifying-glass', to: '/institution-manager/institutions/new' }
        ]
      }
    }

    return base
  })

  /**
   * Get the appropriate menu items for the current user role
   */
  const currentRoleMenus = computed(() => {
    if (isInstitutionManager.value) return menuItems.value.institutionManager
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

