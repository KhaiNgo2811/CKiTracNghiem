/**
 * answer.js — Tiện ích chung cho các loại câu hỏi (trắc nghiệm, điền khuyết)
 * Câu điền khuyết: { type: 'fill', correctAnswer: 'SaaS', acceptedAnswers: ['Software as a Service'], options: {} }
 */

export function isFill(q) {
  return !!q && q.type === 'fill';
}

/** Chuẩn hóa đáp án gõ tay: bỏ hoa/thường, dấu tiếng Việt, ký tự thừa; giữ chữ số, dấu chấm và gạch chéo */
export function normalizeAnswer(text) {
  return String(text == null ? '' : text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9./]+/g, ' ')
    .replace(/^[\s./]+|[\s./]+$/g, '')
    .trim();
}

/** Câu điền khuyết: đúng nếu khớp đáp án chính hoặc một trong các đáp án chấp nhận */
export function matchFill(q, typed) {
  const n = normalizeAnswer(typed);
  if (!n) return false;
  return [q.correctAnswer, ...(Array.isArray(q.acceptedAnswers) ? q.acceptedAnswers : [])].some((a) => normalizeAnswer(a) === n);
}

/** Nhãn hiển thị cho một đáp án: "B. nội dung" với trắc nghiệm, hoặc chính chữ đã nhập/đáp án với điền khuyết */
export function ansLabel(obj, key) {
  if (key === null || key === undefined || key === '') return '';
  if (obj && obj.type === 'fill') return String(key);
  return `${key}. ${(obj && obj.options && obj.options[key]) || ''}`;
}
