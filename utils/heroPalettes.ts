export const heroPalettes: Record<string, string> = {
  subjects: 'bg-emerald-600 text-white',
  topics: 'bg-indigo-600 text-white',
  grades: 'bg-yellow-600 text-white',
  quizzes: 'bg-sky-600 text-white',
  pricing: 'bg-purple-600 text-white',
  'quiz-masters': 'bg-pink-600 text-white',
  contact: 'bg-slate-700 text-white',
  privacy: 'bg-gray-700 text-white',
  terms: 'bg-gray-700 text-white',
}

export function getHeroClass(key?: string) {
  if (!key) return 'bg-indigo-600 text-white'
  return heroPalettes[key] || 'bg-indigo-600 text-white'
}
