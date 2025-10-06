export type TabDef = { key: string; label: string; icon?: string }

export function getSettingsTabs(opts: { isTutor: boolean; isStudent: boolean }): TabDef[] {
  const base: TabDef[] = [
    { key: 'profile', label: 'Profile', icon: 'i-heroicons-user' },
    { key: 'security', label: 'Security', icon: 'i-heroicons-lock-closed' },
    { key: 'notifications', label: 'Notifications', icon: 'i-heroicons-bell' }
  ]
  const tutorOnly: TabDef[] = [{ key: 'payouts', label: 'Payouts', icon: 'i-heroicons-banknotes' }]
  const studentOnly: TabDef[] = [{ key: 'billing', label: 'Billing', icon: 'i-heroicons-credit-card' }]

  const out = [...base]
  if (opts.isTutor) out.push(...tutorOnly)
  if (opts.isStudent) out.push(...studentOnly)
  return out
}
