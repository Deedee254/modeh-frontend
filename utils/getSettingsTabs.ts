export type TabDef = { key: string; label: string; icon?: string }

// Keep compatibility: accept either { isQuizMaster, isquizee } or { isTutor, isStudent }
export function getSettingsTabs(opts: { isQuizMaster?: boolean; isquizee?: boolean } | { isTutor?: boolean; isStudent?: boolean }): TabDef[] {
  const isTutor = (opts as any).isTutor ?? (opts as any).isQuizMaster ?? false
  const isStudent = (opts as any).isStudent ?? (opts as any).isquizee ?? false

  // Base tabs available to everyone
  const base: TabDef[] = [
    { key: 'profile', label: 'Profile', icon: 'i-heroicons-user-circle' },
    { key: 'security', label: 'Account', icon: 'i-heroicons-cog-8-tooth' },
    { key: 'notifications', label: 'Notifications', icon: 'i-heroicons-bell' },
  ]

  const studentOnly: TabDef[] = [
    { key: 'billing', label: 'Billing', icon: 'i-heroicons-credit-card' },
  ]

  const tutorOnly: TabDef[] = [
    { key: 'payouts', label: 'Payouts', icon: 'i-heroicons-banknotes' }
  ]

  const out = [...base]
  if (isTutor) out.push(...tutorOnly)
  if (isStudent) out.push(...studentOnly)
  return out
}
