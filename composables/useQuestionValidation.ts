export function getQuestionValidationErrors(question: any): string[] {
  const errors: string[] = []
  if (!question) { errors.push('Question data is missing.'); return errors }
  if (!question.text?.trim() || question.text === '<p></p>') errors.push('Question text cannot be empty.')
  if (!question.type) errors.push('A question type must be selected.')
  if (!question.marks || question.marks < 1) errors.push('Marks must be at least 1.')
  if (!question.difficulty || question.difficulty < 1 || question.difficulty > 3) errors.push('A difficulty level must be set.')

  switch (question.type) {
    case 'mcq':
      if (!Array.isArray(question.options) || question.options.length < 2) errors.push('MCQ questions require at least 2 options.')
      if (!Array.isArray(question.answers) && typeof question.correct === 'undefined') errors.push('A correct option must be selected for MCQ.')
      break
    case 'multi':
      if (!Array.isArray(question.options) || question.options.length < 2) errors.push('Multiple select questions require at least 2 options.')
      if (!Array.isArray(question.answers) && !Array.isArray(question.corrects)) errors.push('At least one valid correct option must be selected for multiple select.')
      break
    case 'fill_blank':
      if (!Array.isArray(question.options) || question.options.length < 2) errors.push('Fill in the blanks questions require at least 2 options.')
      if (!Array.isArray(question.answers) && !Array.isArray(question.corrects)) errors.push('At least one valid correct option must be selected for fill in the blanks.')
      break
    case 'short':
    case 'numeric':
      if (!Array.isArray(question.answers) || question.answers.length === 0 || !question.answers.some((a: any) => String(a).trim())) errors.push('At least one answer must be provided.')
      break
  }
  return errors
}

export default function useQuestionValidation() {
  return { getQuestionValidationErrors }
}
