/**
 * dashboard.js — Render trang chủ: danh sách chương + khu vực tổng hợp
 */
import Storage from './storage.js';
import { renderQuestionImages } from './images.js';
import { ansLabel } from './answer.js';
import { renderBarChart, renderDonutChart } from './charts.js';

/** Render danh sách card chương */
export function renderChapterCards(manifest, onOpenChapter) {
  const container = document.getElementById('chapterCardsContainer');
  container.innerHTML = '';

  manifest.chapters.forEach((ch) => {
    const progress = Storage.getChapterProgress(ch.chapterId, ch.questionCount, ch.progressSources || null);
    const best = Storage.getBestScoreForChapter(ch.chapterId);

    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    col.innerHTML = `
      <div class="card chapter-card h-100 shadow-sm">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${ch.chapterId} — ${ch.chapterName}</h5>
          <p class="text-muted mb-2"><i class="bi bi-diagram-3"></i> ${ch.topicCount} chủ đề · <i class="bi bi-patch-question"></i> ${ch.questionCount} câu hỏi</p>
          <div class="progress mb-2" style="height: 8px;">
            <div class="progress-bar" role="progressbar" style="width: ${progress}%"></div>
          </div>
          <p class="small text-secondary mb-3">Đã làm: ${progress}% · Điểm cao nhất: ${best ? best.percent + '%' : '—'}</p>
          <button class="btn btn-primary mt-auto btn-open-chapter" data-chapter="${ch.chapterId}"><i class="bi bi-play-circle-fill"></i> Làm bài</button>
        </div>
      </div>`;
    container.appendChild(col);
  });

  container.querySelectorAll('.btn-open-chapter').forEach((btn) => {
    btn.addEventListener('click', () => onOpenChapter(btn.dataset.chapter));
  });
}

/** Render khu vực tổng hợp: biểu đồ + bảng câu hay sai */
export function renderSummary(manifest, allChaptersData) {
  const history = Storage.getHistory();
  const summaryChapters = manifest.chapters.filter((ch) => !ch.excludeFromSummary);

  // Tổng hợp đúng/sai theo chương dựa trên lịch sử làm bài
  const labels = [];
  const correctData = [];
  const wrongData = [];
  let totalCorrect = 0;
  let totalWrong = 0;

  summaryChapters.forEach((ch) => {
    const attempts = history.filter((h) => h.chapterId === ch.chapterId);
    let c = 0, w = 0;
    attempts.forEach((a) => a.answers.forEach((ans) => (ans.isCorrect ? c++ : w++)));
    labels.push(ch.chapterId);
    correctData.push(c);
    wrongData.push(w);
    totalCorrect += c;
    totalWrong += w;
  });

  renderBarChart('barChartCanvas', labels, correctData, wrongData);
  renderDonutChart('donutChartCanvas', totalCorrect, totalWrong);

  document.getElementById('summaryStatsText').textContent =
    history.length === 0
      ? 'Chưa có dữ liệu làm bài nào. Hãy bắt đầu làm bài để xem thống kê!'
      : `Đã làm ${history.length} lượt · ${totalCorrect} câu đúng / ${totalCorrect + totalWrong} câu.`;

  renderWrongTable(allChaptersData);
}

/** Render bảng câu hỏi hay sai */
function renderWrongTable(allChaptersData) {
  const wrongList = Storage.getWrongQuestionsList();
  const tbody = document.getElementById('wrongTableBody');
  const emptyMsg = document.getElementById('wrongTableEmpty');
  tbody.innerHTML = '';

  if (wrongList.length === 0) {
    emptyMsg.classList.remove('d-none');
    return;
  }
  emptyMsg.classList.add('d-none');

  wrongList.forEach((item) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.chapterId}</td>
      <td>${item.topicName || '—'}</td>
      <td>${item.question}</td>
      <td class="text-center"><span class="badge bg-danger">${item.wrongCount}</span></td>
      <td class="text-center"><button class="btn btn-sm btn-outline-secondary btn-view-wrong" data-id="${item.questionId}"><i class="bi bi-eye"></i> Xem</button></td>`;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-view-wrong').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = wrongList.find((w) => w.questionId === btn.dataset.id);
      showWrongDetailModal(item, allChaptersData);
    });
  });
}

export function showWrongDetailModal(item, allChaptersData) {
  const modalBody = document.getElementById('wrongDetailModalBody');
  const resolved = resolveWrongItemFromData(item, allChaptersData);
  const optionsSource = resolved.options || item.options || {};
  const optionsHtml = Object.entries(optionsSource)
    .map(([key, val]) => {
      let cls = '';
      if (key === resolved.correctAnswer) cls = 'text-success fw-bold';
      else if (key === item.lastSelected) cls = 'text-danger fw-bold';
      return `<div class="${cls}">${key}. ${val} ${key === resolved.correctAnswer ? '<i class="bi bi-check-circle-fill"></i>' : ''} ${key === item.lastSelected ? '(bạn chọn)' : ''}</div>`;
    })
    .join('');
  const correctText = resolved.correctAnswer ? ansLabel({ type: resolved.type, options: { [resolved.correctAnswer]: resolved.correctAnswerText } }, resolved.correctAnswer) : 'Chưa có đáp án đúng';
  const lastSelectedText = item.lastSelected ? ansLabel({ type: resolved.type || item.type, options: item.options }, item.lastSelected) : 'Chưa có dữ liệu lần chọn gần nhất';

  modalBody.innerHTML = `
    <div class="mb-3">
      <div class="d-flex flex-wrap gap-2 mb-2">
        <span class="badge bg-danger">Số lần sai: ${item.wrongCount}</span>
        <span class="badge bg-primary">Chương: ${item.chapterId}</span>
        <span class="badge bg-secondary">Chủ đề: ${item.topicName || '—'}</span>
      </div>
      <p class="fw-semibold mb-2">${item.question}</p>
      ${renderQuestionImages(resolved.images || item.images)}
      <p class="mb-1"><span class="fw-semibold">Đáp án đúng:</span> <span class="text-success fw-bold">${correctText}</span></p>
      <p class="mb-0"><span class="fw-semibold">Lần chọn sai gần nhất:</span> <span class="text-danger fw-bold">${lastSelectedText}</span></p>
    </div>
    <div class="border-top pt-3">
      <div class="fw-semibold mb-2">Các đáp án</div>
      ${optionsHtml}
    </div>
  `;
  // Bootstrap không hỗ trợ 2 modal chồng nhau: nếu đang có modal khác mở (ví dụ
  // "Lịch sử sai") thì đóng nó trước, hiện chi tiết, rồi mở lại modal cũ khi đóng chi tiết.
  const detailEl = document.getElementById('wrongDetailModal');
  const modal = bootstrap.Modal.getOrCreateInstance(detailEl);
  const openEl = document.querySelector('.modal.show');
  if (openEl && openEl !== detailEl) {
    const prev = bootstrap.Modal.getOrCreateInstance(openEl);
    openEl.addEventListener('hidden.bs.modal', () => {
      modal.show();
      detailEl.addEventListener('hidden.bs.modal', () => prev.show(), { once: true });
    }, { once: true });
    prev.hide();
  } else {
    modal.show();
  }
}

function resolveWrongItemFromData(item, allChaptersData) {
  const preferredChapterIds = ['C1_C8', item.chapterId];
  const chapterIds = [
    ...preferredChapterIds,
    ...Object.keys(allChaptersData || {}).filter((chapterId) => !preferredChapterIds.includes(chapterId))
  ];

  for (const chapterId of chapterIds) {
    const chapter = allChaptersData?.[chapterId];
    if (!chapter || !Array.isArray(chapter.topics)) continue;

    for (const topic of chapter.topics) {
      const found = topic.questions.find((q) => q.id === item.questionId);
      if (found) {
        return {
          chapterId,
          question: found.question,
          images: found.images || [],
          options: found.options || item.options || {},
          type: found.type || item.type || null,
          correctAnswer: found.correctAnswer || item.correctAnswer || null,
          correctAnswerText: found.options?.[found.correctAnswer] || item.options?.[item.correctAnswer] || ''
        };
      }
    }
  }

  return {
    chapterId: item.chapterId,
    question: item.question,
    options: item.options || {},
    type: item.type || null,
    correctAnswer: item.correctAnswer || null,
    correctAnswerText: item.options?.[item.correctAnswer] || ''
  };
}
