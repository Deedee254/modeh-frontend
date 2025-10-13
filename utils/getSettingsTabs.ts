export type TabDef = { key: string; label: string; icon?: string }

export function getSettingsTabs(opts: { isQuizMaster: boolean; isquizee: boolean }): TabDef[] {
  const all: TabDef[] = [
    { key: 'profile', label: 'Profile', icon: 'i-heroicons-user-circle' },
    { key: 'account', label: 'Account', icon: 'i-heroicons-cog-8-tooth' }
  ]
  const quizMasterOnly: TabDef[] = [{ key: 'payouts', label: 'Payouts', icon: 'i-heroicons-banknotes' }]

  const out = [...all]

  if (opts.isQuizMaster) out.push(...quizMasterOnly)

  return out
}
