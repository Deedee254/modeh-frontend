type AnswerValue = string | number | boolean | { body?: string; text?: string } | null | undefined;

/**
 * Normalizes a single answer value to match backend format
 */
function normalizeValue(val: AnswerValue): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    return val.body || val.text || '';
  }
  if (typeof val === 'number') return val.toString();
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  return val.toString().trim().toLowerCase();
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
    return {
      question_id: questionId,
      selected: normalizeAnswer(answers[questionId]),
      time_taken: timings[questionId] || null
    };
  });
}

export function useAnswerNormalization() {
  return {
    normalizeAnswer,
    formatAnswersForSubmission
  };
}
