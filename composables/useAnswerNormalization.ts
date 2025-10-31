type AnswerValue = string | number | boolean | { body?: string; text?: string } | null | undefined;

/**
 * Normalizes a single answer value to match backend format
 */
function stripHtml(input: string): string {
  // remove simple HTML tags
  return input.replace(/<[^>]*>/g, '');
}

function normalizeValue(val: AnswerValue): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    const v = (val.body || val.text || '') as string;
    return stripHtml(v.toString()).trim().toLowerCase();
  }
  if (typeof val === 'number') return stripHtml(val.toString()).trim().toLowerCase();
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  return stripHtml(val.toString()).trim().toLowerCase();
}

/**
 * Normalizes an array of answers or a single answer to match backend format
 */
export function normalizeAnswer(answer: AnswerValue | AnswerValue[]): string | string[] {
  if (Array.isArray(answer)) {
    return answer
      .map(a => normalizeValue(a))
      .filter(a => a !== '')
      .sort();
  }
  return normalizeValue(answer);
}

/**
 * Formats answers for submission to backend API
 */
export function formatAnswersForSubmission(answers: Record<number, AnswerValue>, timings: Record<number, number> = {}) {
  return Object.keys(answers).map(qid => {
    const questionId = parseInt(qid, 10) || 0;
    // support keys that might be strings or numbers
    const rawValue = (answers as any)[qid] ?? (answers as any)[questionId];
    const timeTaken = (timings as any)[qid] ?? (timings as any)[questionId] ?? null;
    return {
      question_id: questionId,
      selected: normalizeAnswer(rawValue),
      time_taken: timeTaken
    };
  });
}

export function useAnswerNormalization() {
  return {
    normalizeAnswer,
    formatAnswersForSubmission
  };
}
