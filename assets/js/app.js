/**
 * app.js — Logic điều hướng chính (SPA đơn giản, show/hide section)
 */
import Storage from './storage.js';
import Quiz from './quiz.js';
import { renderQuestionImages } from './images.js';
import { renderChapterCards, renderSummary, showWrongDetailModal } from './dashboard.js';

let manifest = null;
let subjectsConfig = null;
let currentSubject = null;
let chapterCache = {}; // tên file -> dữ liệu JSON chương (reset khi đổi môn)
let currentChapterContext = null;

const views = ['view-subjects', 'view-home', 'view-chapter', 'view-quiz', 'view-result'];

/** Hiện 1 view, ẩn các view còn lại */
function showView(id) {
  views.forEach((v) => {
    document.getElementById(v).classList.toggle('d-none', v !== id);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** Tải dữ liệu 1 chương (có cache) */
async function loadChapter(chapterOrMeta) {
  const chapterId = typeof chapterOrMeta === 'string' ? chapterOrMeta : chapterOrMeta.chapterId;
  const fileName = typeof chapterOrMeta === 'string'
    ? `${chapterId}.json`
    : (chapterOrMeta.dataFile || `${chapterId}.json`);

  if (chapterCache[fileName]) return chapterCache[fileName];
  const res = await fetch(`data/${encodeURIComponent(currentSubject.folder)}/${fileName}`, { cache: 'no-cache' });
  const data = await res.json();
  chapterCache[fileName] = data;
  return data;
}

/** Tải trước toàn bộ chương (phục vụ tính biểu đồ tổng hợp) */
async function loadAllChapters() {
  const all = {};
  for (const ch of manifest.chapters) {
    all[ch.chapterId] = await loadChapter(ch);
  }
  return all;
}

/** ====== TRANG CHỦ ====== */
async function renderHome() {
  showView('view-home');
  renderChapterCards(manifest, openChapter);
  const all = await loadAllChapters();
  renderSummary(manifest, all);
}

/** ====== TRANG CHƯƠNG: chọn chủ đề + cấu hình ====== */
async function openChapter(chapterId) {
  const chapterMeta = manifest.chapters.find((ch) => ch.chapterId === chapterId) || { chapterId };
  const data = await loadChapter(chapterMeta);
  currentChapterContext = {
    chapterId: chapterMeta.chapterId,
    chapterName: chapterMeta.chapterName || data.chapterName,
    data
  };
  showView('view-chapter');

  document.getElementById('chapterTitle').textContent = `${chapterMeta.chapterId} — ${chapterMeta.chapterName || data.chapterName}`;
  const topicList = document.getElementById('topicListContainer');
  topicList.innerHTML = '';

  data.topics.forEach((topic) => {
    const item = document.createElement('div');
    item.className = 'list-group-item d-flex justify-content-between align-items-center';
    item.innerHTML = `
      <span><i class="bi bi-bookmark-star-fill text-primary me-2"></i>${topic.topicName} <span class="badge rounded-pill text-bg-light border ms-1">${topic.questions.length} câu</span></span>
      <button class="btn btn-sm btn-outline-primary btn-start-topic" data-topic="${topic.topicId}"><i class="bi bi-play-fill"></i> Làm chủ đề này</button>`;
    topicList.appendChild(item);
  });

  topicList.querySelectorAll('.btn-start-topic').forEach((btn) => {
    btn.addEventListener('click', () => {
      const topic = data.topics.find((t) => t.topicId === btn.dataset.topic);
      startQuizConfig({
        type: 'topic',
        chapterId: chapterMeta.chapterId,
        chapterName: chapterMeta.chapterName || data.chapterName,
        topicId: topic.topicId,
        topicName: topic.topicName,
        questions: topic.questions
      });
    });
  });

  document.getElementById('btnStartFullChapter').onclick = () => {
    const allQuestions = data.topics.flatMap((t) => t.questions.map((q) => ({ ...q, _topicName: t.topicName })));
    startQuizConfig({
      type: 'chapter',
      chapterId: chapterMeta.chapterId,
      chapterName: chapterMeta.chapterName || data.chapterName,
      topicId: null,
      topicName: null,
      questions: allQuestions
    });
  };

  document.getElementById('btnViewChapterWrongHistory').onclick = () => {
    showChapterWrongHistoryModal();
  };

  document.getElementById('btnBackHome').onclick = renderHome;
}

/** Lưu tạm nguồn câu hỏi đã chọn, hiện modal cấu hình số câu / shuffle */
let pendingSource = null;
function startQuizConfig(source) {
  pendingSource = source;
  document.getElementById('configMaxCount').textContent = source.questions.length;
  document.getElementById('configCountInput').max = source.questions.length;
  document.getElementById('configCountInput').value = source.questions.length;
  const modal = new bootstrap.Modal(document.getElementById('quizConfigModal'));
  modal.show();
}

document.getElementById('btnConfirmConfig').addEventListener('click', () => {
  const countMode = document.querySelector('input[name="countMode"]:checked').value;
  const countVal = countMode === 'all' ? 'all' : parseInt(document.getElementById('configCountInput').value, 10);
  const shuffleQuestions = document.getElementById('configShuffleQ').checked;
  const shuffleOptions = document.getElementById('configShuffleO').checked;
  const viewMode = document.querySelector('input[name="viewMode"]:checked').value;

  bootstrap.Modal.getInstance(document.getElementById('quizConfigModal')).hide();
  runQuiz(pendingSource, { count: countVal, shuffleQuestions, shuffleOptions }, viewMode);
});

/** ====== TRANG LÀM BÀI ====== */
let quizViewMode = 'single';
let timerInterval = null;

function runQuiz(source, config, viewMode) {
  quizViewMode = viewMode;
  const state = Quiz.start(source, config);
  if (!state || !state.questions || state.questions.length === 0) {
    alert('Không có câu hỏi hợp lệ để làm bài trong lựa chọn này.');
    return;
  }

  showView('view-quiz');
  document.getElementById('quizChapterLabel').textContent =
    `${source.chapterName}${source.topicName ? ' — ' + source.topicName : ''}`;

  startTimer();
  renderQuizBody();
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  const el = document.getElementById('quizTimer');
  timerInterval = setInterval(() => {
    el.textContent = Quiz.formatTime(Date.now() - Quiz.state.startTime);
  }, 1000);
}

function updateProgressBar() {
  const answered = Quiz.getAnsweredCount();
  const total = Quiz.getTotalCount();
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
  const bar = document.getElementById('quizProgressBar');
  bar.style.width = pct + '%';
  bar.textContent = `${answered}/${total}`;
}

function renderQuizNavigator() {
  const list = document.getElementById('quizQuestionList');
  const answeredCountEl = document.getElementById('quizAnsweredCount');
  const flaggedCountEl = document.getElementById('quizFlaggedCount');

  if (!list || !answeredCountEl || !flaggedCountEl) return;

  if (!Quiz.state || !Quiz.state.questions) {
    list.innerHTML = '';
    answeredCountEl.textContent = 'Đã làm 0/0';
    flaggedCountEl.textContent = '0 cờ';
    return;
  }

  const total = Quiz.getTotalCount();
  const answered = Quiz.getAnsweredCount();
  const flagged = Quiz.getFlaggedCount();

  answeredCountEl.textContent = `Đã làm ${answered}/${total}`;
  flaggedCountEl.textContent = `${flagged} cờ`;

  list.innerHTML = Quiz.state.questions
    .map((q, index) => {
      const isCurrent = index === Quiz.state.currentIndex;
      const isAnswered = Object.prototype.hasOwnProperty.call(Quiz.state.userAnswers, String(q.id));
      const isFlagged = Quiz.isFlagged(q.id);
      const className = isCurrent
        ? 'btn-primary'
        : isFlagged
          ? 'btn-warning'
          : isAnswered
            ? 'btn-success'
            : 'btn-outline-secondary';
      return `
        <button type="button" class="btn ${className} quiz-nav-btn" data-index="${index}" data-qid="${q.id}">
          ${index + 1}
        </button>`;
    })
    .join('');

  list.querySelectorAll('.quiz-nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.index);
      const qid = btn.dataset.qid;
      Quiz.goTo(index);
      renderQuizBody();
      if (quizViewMode === 'scroll') {
        window.requestAnimationFrame(() => {
          document.querySelector(`.question-card[data-qid="${qid}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    });
  });
}

function renderQuestionCard(q, index) {
  const selected = Quiz.state.userAnswers[q.id];
  const flagged = Quiz.isFlagged(q.id);
  const optionsHtml = Object.entries(q.options)
    .map(
      ([key, val]) => `
      <div class="form-check option-item">
        <input class="form-check-input" type="radio" name="q_${q.id}" id="q_${q.id}_${key}" value="${key}" ${selected === key ? 'checked' : ''}>
        <label class="form-check-label" for="q_${q.id}_${key}">${key}. ${val}</label>
      </div>`
    )
    .join('');

  return `
    <div class="card question-card mb-3" data-qid="${q.id}">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
          <div class="flex-grow-1">
            <p class="fw-semibold mb-2">Câu ${index + 1}: ${q.question}</p>
            ${renderQuestionImages(q.images)}
            <div class="d-flex flex-wrap gap-2 small">
              ${selected ? '<span class="badge bg-success"><i class="bi bi-check2"></i> Đã chọn đáp án</span>' : '<span class="badge bg-secondary"><i class="bi bi-circle"></i> Chưa làm</span>'}
              ${flagged ? '<span class="badge bg-warning text-dark"><i class="bi bi-flag-fill"></i> Đã gắn cờ</span>' : ''}
            </div>
          </div>
          <button type="button" class="btn btn-sm ${flagged ? 'btn-warning' : 'btn-outline-warning'} btn-flag-question" data-qid="${q.id}">
            <i class="bi ${flagged ? 'bi-flag-fill' : 'bi-flag'}"></i> ${flagged ? 'Bỏ cờ' : 'Gắn cờ'}
          </button>
        </div>
        ${optionsHtml}
      </div>
    </div>`;
}

function attachOptionListeners(container) {
  container.querySelectorAll('.question-card').forEach((card) => {
    const qid = card.dataset.qid;
    card.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.addEventListener('change', () => {
        Quiz.selectAnswer(qid, input.value);
        updateProgressBar();
        renderQuizNavigator();
      });
    });

    const flagButton = card.querySelector('.btn-flag-question');
    if (flagButton) {
      flagButton.addEventListener('click', () => {
        const isFlagged = Quiz.toggleFlag(qid);
        flagButton.innerHTML = isFlagged ? '<i class="bi bi-flag-fill"></i> Bỏ cờ' : '<i class="bi bi-flag"></i> Gắn cờ';
        flagButton.classList.toggle('btn-warning', isFlagged);
        flagButton.classList.toggle('btn-outline-warning', !isFlagged);

        const badgeContainer = card.querySelector('.d-flex.flex-wrap.gap-2.small');
        if (badgeContainer) {
          badgeContainer.innerHTML = `
            ${Object.prototype.hasOwnProperty.call(Quiz.state.userAnswers, String(qid)) ? '<span class="badge bg-success"><i class="bi bi-check2"></i> Đã chọn đáp án</span>' : '<span class="badge bg-secondary"><i class="bi bi-circle"></i> Chưa làm</span>'}
            ${isFlagged ? '<span class="badge bg-warning text-dark"><i class="bi bi-flag-fill"></i> Đã gắn cờ</span>' : ''}
          `;
        }
        renderQuizNavigator();
      });
    }
  });
}

function renderQuizBody() {
  const container = document.getElementById('quizBody');
  const nav = document.getElementById('quizSingleNav');

  if (!Quiz.state || !Quiz.state.questions || Quiz.state.questions.length === 0) {
    nav.classList.add('d-none');
    container.innerHTML = '<div class="alert alert-warning">Không có câu hỏi hợp lệ để làm bài.</div>';
    updateProgressBar();
    return;
  }

  if (quizViewMode === 'scroll') {
    nav.classList.add('d-none');
    container.innerHTML = Quiz.state.questions.map((q, i) => renderQuestionCard(q, i)).join('');
  } else {
    nav.classList.remove('d-none');
    const q = Quiz.getCurrentQuestion();
    container.innerHTML = renderQuestionCard(q, Quiz.state.currentIndex);
    document.getElementById('quizQuestionCounter').textContent =
      `Câu ${Quiz.state.currentIndex + 1}/${Quiz.getTotalCount()}`;
    document.getElementById('btnPrevQuestion').disabled = Quiz.state.currentIndex === 0;
    document.getElementById('btnNextQuestion').disabled = Quiz.state.currentIndex === Quiz.getTotalCount() - 1;
  }

  attachOptionListeners(container);
  renderQuizNavigator();
  updateProgressBar();
}

document.getElementById('btnPrevQuestion').addEventListener('click', () => {
  Quiz.prev();
  renderQuizBody();
});
document.getElementById('btnNextQuestion').addEventListener('click', () => {
  Quiz.next();
  renderQuizBody();
});

document.getElementById('btnSubmitQuiz').addEventListener('click', () => {
  const answered = Quiz.getAnsweredCount();
  const total = Quiz.getTotalCount();
  if (answered < total) {
    document.getElementById('confirmSubmitText').textContent =
      `Bạn còn ${total - answered} câu chưa trả lời. Vẫn nộp bài?`;
  } else {
    document.getElementById('confirmSubmitText').textContent = 'Nộp bài ngay?';
  }
  const modal = new bootstrap.Modal(document.getElementById('confirmSubmitModal'));
  modal.show();
});

document.getElementById('btnConfirmSubmit').addEventListener('click', () => {
  bootstrap.Modal.getInstance(document.getElementById('confirmSubmitModal')).hide();
  clearInterval(timerInterval);
  const attempt = Quiz.submit();
  renderResult(attempt);
});

function showChapterWrongHistoryModal() {
  const modalBody = document.getElementById('chapterWrongHistoryBody');
  const emptyMsg = document.getElementById('chapterWrongHistoryEmpty');
  const summaryEl = document.getElementById('chapterWrongHistorySummary');
  const titleEl = document.getElementById('chapterWrongHistoryTitle');

  if (!currentChapterContext) return;

  const wrongList = Storage.getWrongQuestionsList().filter((item) => item.chapterId === currentChapterContext.chapterId);
  titleEl.textContent = `Lịch sử sai của ${currentChapterContext.chapterName}`;
  summaryEl.textContent = wrongList.length === 0
    ? 'Chương này chưa có câu nào bị làm sai.'
    : `Có ${wrongList.length} câu từng làm sai trong chương này.`;

  modalBody.innerHTML = '';

  if (wrongList.length === 0) {
    emptyMsg.classList.remove('d-none');
  } else {
    emptyMsg.classList.add('d-none');
    wrongList.forEach((item) => {
      const resolved = resolveQuestionFromChapter(item.questionId, currentChapterContext.data);
      const correctText = resolved.correctAnswer ? `${resolved.correctAnswer}. ${resolved.correctAnswerText}` : 'Chưa có đáp án đúng';
      const selectedText = item.lastSelected ? `${item.lastSelected}. ${item.options?.[item.lastSelected] || ''}` : 'Chưa có';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${resolved.question || item.question}${renderQuestionImages(resolved.images || item.images)}</td>
        <td class="text-center"><span class="badge bg-danger">${item.wrongCount}</span></td>
        <td><span class="text-success fw-bold">${correctText}</span></td>
        <td><span class="text-danger fw-bold">${selectedText}</span></td>
        <td class="text-center"><button class="btn btn-sm btn-outline-secondary btn-open-wrong-detail" data-id="${item.questionId}"><i class="bi bi-eye"></i> Xem</button></td>`;
      modalBody.appendChild(tr);
    });

    modalBody.querySelectorAll('.btn-open-wrong-detail').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = wrongList.find((w) => w.questionId === btn.dataset.id);
        showWrongDetailModal(item, { [currentChapterContext.chapterId]: currentChapterContext.data });
      });
    });
  }

  const modal = new bootstrap.Modal(document.getElementById('chapterWrongHistoryModal'));
  modal.show();
}

function resolveQuestionFromChapter(questionId, chapterData) {
  if (!chapterData || !Array.isArray(chapterData.topics)) {
    return { question: '', correctAnswer: null, correctAnswerText: '' };
  }

  for (const topic of chapterData.topics) {
    const found = topic.questions.find((q) => q.id === questionId);
    if (found) {
      return {
        question: found.question,
        images: found.images || [],
        correctAnswer: found.correctAnswer || null,
        correctAnswerText: found.options?.[found.correctAnswer] || ''
      };
    }
  }

  return { question: '', correctAnswer: null, correctAnswerText: '' };
}

/** ====== TRANG KẾT QUẢ ====== */
function renderResult(attempt) {
  showView('view-result');
  const percent = attempt.total > 0 ? Math.round((attempt.correctCount / attempt.total) * 1000) / 10 : 0;

  document.getElementById('resultScoreText').textContent =
    `${attempt.correctCount}/${attempt.total} câu đúng (${percent}%)`;
  document.getElementById('resultTimeText').textContent =
    `Thời gian làm bài: ${Quiz.formatTime(attempt.elapsedMs)}`;
  document.getElementById('resultChapterText').textContent =
    `${attempt.chapterName}${attempt.topicName ? ' — ' + attempt.topicName : ''}`;

  const detailBody = document.getElementById('resultDetailBody');
  detailBody.innerHTML = attempt.answers
    .map((a, i) => {
      const rowClass = a.isCorrect ? 'table-success' : 'table-danger';
      const selectedText = a.selectedAnswer ? `${a.selectedAnswer}. ${a.options[a.selectedAnswer] || ''}` : '(chưa trả lời)';
      const correctText = `${a.correctAnswer}. ${a.options[a.correctAnswer] || ''}`;
      const flagText = a.flagged ? '<br><span class="badge bg-warning text-dark mt-1">Đã gắn cờ</span>' : '';
      return `
        <tr class="${rowClass}">
          <td>${i + 1}</td>
          <td>${a.question}${renderQuestionImages(a.images)}</td>
          <td>${selectedText}${flagText}</td>
          <td>${correctText}</td>
          <td class="text-center">${a.isCorrect ? '<i class="bi bi-check-circle-fill text-success fs-5"></i>' : '<i class="bi bi-x-circle-fill text-danger fs-5"></i>'}</td>
        </tr>`;
    })
    .join('');

  document.getElementById('btnRetryChapter').onclick = () => openChapter(attempt.chapterId);
  document.getElementById('btnBackHomeFromResult').onclick = renderHome;
}

/** ====== LUYỆN TẬP CÂU SAI ====== */
document.getElementById('btnPracticeWrong').addEventListener('click', async () => {
  const wrongList = Storage.getWrongQuestionsList();
  if (wrongList.length === 0) {
    alert('Chưa có câu nào sai để luyện tập!');
    return;
  }
  // Cần tải lại full data câu hỏi (options đầy đủ) từ cache chương tương ứng
  const all = await loadAllChapters();
  const questions = wrongList
    .map((w) => {
      const chapter = all[w.chapterId];
      if (!chapter) return null;
      for (const topic of chapter.topics) {
        const found = topic.questions.find((q) => q.id === w.questionId);
        if (found) return { ...found, _topicName: topic.topicName };
      }
      return null;
    })
    .filter(Boolean);

  startQuizConfig({
    type: 'wrong',
    chapterId: 'WRONG',
    chapterName: 'Luyện tập câu hay sai',
    topicId: null,
    topicName: null,
    questions
  });
});

/** ====== RESET DỮ LIỆU ====== */
document.getElementById('btnResetData').addEventListener('click', () => {
  const modal = new bootstrap.Modal(document.getElementById('resetConfirmModal'));
  modal.show();
});
document.getElementById('btnConfirmReset').addEventListener('click', () => {
  Storage.resetAll();
  bootstrap.Modal.getInstance(document.getElementById('resetConfirmModal')).hide();
  renderHome();
});

/** ====== EXPORT / IMPORT TIẾN ĐỘ ====== */
document.getElementById('btnExportData').addEventListener('click', () => {
  const data = Storage.exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quiz-backup-${currentSubject.id}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('importFileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      Storage.importData(data);
      alert('Nhập dữ liệu thành công!');
      renderHome();
    } catch (err) {
      alert('File không hợp lệ!');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

/** ====== CHỌN MÔN ====== */
function renderSubjects() {
  if (timerInterval) clearInterval(timerInterval);
  showView('view-subjects');
  document.getElementById('navSubjectLabel').textContent = '';
  const container = document.getElementById('subjectCardsContainer');
  container.innerHTML = '';
  subjectsConfig.subjects.forEach((s) => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    col.innerHTML = `
      <div class="card chapter-card h-100 shadow-sm">
        <div class="card-body d-flex flex-column">
          <div class="subject-icon mb-3"><i class="bi ${s.biIcon || 'book-half'}"></i></div>
          <h5 class="card-title">${s.name}</h5>
          <p class="text-muted mb-3">${s.description || ''}</p>
          <button class="btn btn-primary mt-auto">Vào môn này <i class="bi bi-arrow-right"></i></button>
        </div>
      </div>`;
    col.querySelector('button').addEventListener('click', () => selectSubject(s.id));
    container.appendChild(col);
  });
}

async function selectSubject(subjectId) {
  currentSubject = subjectsConfig.subjects.find((s) => s.id === subjectId);
  chapterCache = {};
  Storage.setSubject(currentSubject.id);
  try { localStorage.setItem('quiz_last_subject', currentSubject.id); } catch (e) { /* bỏ qua */ }
  const res = await fetch(`data/${encodeURIComponent(currentSubject.folder)}/manifest.json`, { cache: 'no-cache' });
  manifest = await res.json();
  document.getElementById('navSubjectLabel').textContent = `· ${currentSubject.name}`;
  await renderHome();
}

document.getElementById('btnChangeSubject').addEventListener('click', renderSubjects);
document.getElementById('btnSwitchSubject').addEventListener('click', renderSubjects);

/** ====== KHỞI ĐỘNG APP ====== */
async function init() {
  const res = await fetch('data/subjects.json', { cache: 'no-cache' });
  subjectsConfig = await res.json();
  let last = null;
  try { last = localStorage.getItem('quiz_last_subject'); } catch (e) { /* bỏ qua */ }
  if (last && subjectsConfig.subjects.some((s) => s.id === last)) await selectSubject(last);
  else renderSubjects();
}

init();

/** Bấm vào ảnh trong câu hỏi để phóng to */
document.addEventListener('click', (e) => {
  const img = e.target.closest('img.q-image');
  if (!img) return;
  document.getElementById('imageZoomTarget').src = img.dataset.zoom || img.src;
  new bootstrap.Modal(document.getElementById('imageZoomModal')).show();
});
