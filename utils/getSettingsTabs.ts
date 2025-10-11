export type TabDef = { key: string; label: string; icon?: string }

export function getSettingsTabs(opts: { isquiz-master: boolean; isquizee: boolean }): TabDef[] {
  const base: TabDef[] = [
    { key: 'profile', label: 'Profile', icon: 'i-heroicons-user' },
    { key: 'security', label: 'Security', icon: 'i-heroicons-lock-closed' },
    { key: 'notifications', label: 'Notifications', icon: 'i-heroicons-bell' }
  ]
  const quiz-masterOnly: TabDef[] = [{ key: 'payouts', label: 'Payouts', icon: 'i-heroicons-banknotes' }]
  const quizeeOnly: TabDef[] = [{ key: 'billing', label: 'Billing', icon: 'i-heroicons-credit-card' }]

  const out = [...base]
  if (opts.isquiz-master) out.push(...quiz-masterOnly)
  if (opts.isquizee) out.push(...quizeeOnly)
  return out
}
