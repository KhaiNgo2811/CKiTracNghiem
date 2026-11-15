/**
 * images.js — Sinh HTML ảnh minh hoạ (công thức, đồ thị, bảng) cho câu hỏi.
 * Ảnh bấm vào để phóng to (xử lý trong app.js).
 */
export function renderQuestionImages(images) {
  if (!Array.isArray(images) || images.length === 0) return '';
  return `<div class="q-images">${images
    .map((src) => `<img src="${src}" class="q-image" alt="Hình minh hoạ" data-zoom="${src}">`)
    .join('')}</div>`;
}
