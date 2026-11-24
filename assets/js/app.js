/**
 * app.js — Logic điều hướng chính (SPA đơn giản, show/hide section)
 */
import Storage from './storage.js';
import Quiz from './quiz.js';
import { renderQuestionImages } from './images.js';
import { isFill, isEssay, matchFill, ansLabel } from './answer.js';
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
  updateFlaggedBadge();
}

function updateFlaggedBadge() {
  const el = document.getElementById('flaggedTotalBadge');
  if (el) el.textContent = Object.keys(Storage.getFlagged()).length;
}

/** ====== TRANG CHƯƠNG: chọn chủ đề + cấu hình ====== */
const topicSelectionMemory = {};
async function openChapter(chapterId) {
  const chapterMeta = manifest.chapters.find((ch) => ch.chapterId === chapterId) || { chapterId };
  const data = await loadChapter(chapterMeta);
  currentChapterContext = {
    chapterId: chapterMeta.chapterId,
    chapterName: chapterMeta.chapterName || data.chapterName,
    data
  };
  showView('view-chapter');

  document.getElementById('chapterTitle').textContent = `${chapterMeta.priority ? `[Ưu tiên ${chapterMeta.priority}] ` : ''}${chapterMeta.chapterId} — ${chapterMeta.chapterName || data.chapterName}`;
  const topicList = document.getElementById('topicListContainer');
  topicList.innerHTML = '';

  data.topics.forEach((topic) => {
    const item = document.createElement('div');
    item.className = 'list-group-item d-flex justify-content-between align-items-center';
    item.innerHTML = `
      <label class="d-flex align-items-center flex-grow-1 mb-0" style="cursor:pointer">
        <input class="form-check-input topic-check me-2 mt-0" type="checkbox" data-topic="${topic.topicId}">
        <span><i class="bi bi-bookmark-star-fill text-primary me-2"></i>${topic.topicName} <span class="badge rounded-pill text-bg-light border ms-1">${topic.questions.length} câu</span></span>
      </label>
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

  // ---- Chọn nhiều chủ đề để làm cùng lúc ----
  const chkAll = document.getElementById('chkTopicAll');
  const btnSelected = document.getElementById('btnStartSelectedTopics');
  const infoEl = document.getElementById('topicSelectedInfo');
  const checks = () => Array.from(topicList.querySelectorAll('.topic-check'));
  const selectedTopics = () => data.topics.filter((t) => checks().some((c) => c.checked && c.dataset.topic === t.topicId));
  const mergeQuestions = (topics) => {
    const seen = new Set();
    return topics
      .flatMap((t) => t.questions.map((q) => ({ ...q, _topicName: t.topicName })))
      .filter((q) => {
        const id = String(q.id);
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
  };
  const updateSelection = () => {
    const all = checks();
    const sel = selectedTopics();
    const qCount = mergeQuestions(sel).length;
    topicSelectionMemory[chapterMeta.chapterId] = sel.map((t) => t.topicId);
    chkAll.checked = all.length > 0 && sel.length === all.length;
    chkAll.indeterminate = sel.length > 0 && sel.length < all.length;
    btnSelected.disabled = sel.length === 0;
    infoEl.textContent = sel.length === 0
      ? 'Tích chọn nhiều chủ đề để làm cùng lúc'
      : `Đã chọn ${sel.length}/${all.length} chủ đề · ${qCount} câu (không trùng)`;
    btnSelected.innerHTML = `<i class="bi bi-play-fill"></i> Làm ${sel.length > 0 ? sel.length + ' chủ đề' : 'các chủ đề'} đã chọn`;
  };
  const savedSel = topicSelectionMemory[chapterMeta.chapterId] || [];
  checks().forEach((c) => { c.checked = savedSel.includes(c.dataset.topic); });
  chkAll.onchange = () => {
    checks().forEach((c) => { c.checked = chkAll.checked; });
    updateSelection();
  };
  topicList.querySelectorAll('.topic-check').forEach((c) => c.addEventListener('change', updateSelection));
  btnSelected.onclick = () => {
    const sel = selectedTopics();
    if (sel.length === 0) return;
    startQuizConfig({
      type: 'topics',
      chapterId: chapterMeta.chapterId,
      chapterName: chapterMeta.chapterName || data.chapterName,
      topicId: null,
      topicName: sel.length === 1 ? sel[0].topicName : `${sel.length} chủ đề đã chọn`,
      questions: mergeQuestions(sel)
    });
  };
  updateSelection();

  document.getElementById('btnStartFullChapter').onclick = () => {
    // Một câu có thể xuất hiện ở nhiều chủ đề (chương tổng hợp) -> chỉ lấy mỗi câu một lần
    const seenIds = new Set();
    const allQuestions = data.topics
      .flatMap((t) => t.questions.map((q) => ({ ...q, _topicName: t.topicName })))
      .filter((q) => {
        const id = String(q.id);
        if (seenIds.has(id)) return false;
        seenIds.add(id);
        return true;
      });
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

function runQuiz(source, config, viewMode, opts = {}) {
  quizViewMode = viewMode;
  const state = Quiz.start(source, config);
  if (!state || !state.questions || state.questions.length === 0) {
    alert('Không có câu hỏi hợp lệ để làm bài trong lựa chọn này.');
    return;
  }

  if (opts.exam) {
    state.examMode = true;
    state.timeLimitMs = Math.max(1, opts.timeLimitMin || 60) * 60 * 1000;
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
  const tick = () => {
    const st = Quiz.state;
    if (!st) return;
    const elapsed = Date.now() - st.startTime;
    if (st.timeLimitMs) {
      const remain = st.timeLimitMs - elapsed;
      el.textContent = 'Còn ' + Quiz.formatTime(Math.max(0, remain));
      el.classList.toggle('text-danger', remain <= 5 * 60 * 1000);
      if (remain <= 0) {
        clearInterval(timerInterval);
        document.querySelectorAll('.modal.show').forEach((m) => bootstrap.Modal.getInstance(m)?.hide());
        renderResult(Quiz.submit({ timedOut: true }));
      }
    } else {
      el.textContent = Quiz.formatTime(elapsed);
      el.classList.remove('text-danger');
    }
  };
  tick();
  timerInterval = setInterval(tick, 1000);
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

/** Giải thích dùng **đậm** kiểu markdown -> <b> */
function fmtExplain(t) {
  return String(t || '').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
}

/** Nhận diện câu dạng bài tập (tính toán / có số liệu), chỉ các câu này mới có nút "Làm câu tương tự" */
function isExerciseQuestion(q) {
  const text = String(q.question || '');
  const hasDigit = /\d/.test(text);
  const calc = /bao nhiêu|giá trị|xấp xỉ|tính|bằng|khoảng nào|chuẩn hóa thành|thứ tự|tập phổ biến|điểm dự đoán|cao nhất|thấp nhất|itemset|số /i.test(text);
  return (hasDigit && calc && !/thường/i.test(text)) || /thứ tự (thăm|duyệt)/i.test(text) || /\bCPT\+?|Prediction Tree|Inverted Index/i.test(text);
}

function escAttr(t) {
  return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderQuestionCard(q, index) {
  const exam = !!(Quiz.state && Quiz.state.examMode);
  const note = Storage.getNote(q.id);
  const selected = Quiz.state.userAnswers[q.id];
  const flagged = Quiz.isFlagged(q.id);
  const checked = !!(Quiz.state.checkedQuestions && Quiz.state.checkedQuestions[String(q.id)]);
  const fillOk = isFill(q) && checked && matchFill(q, selected);
  const optionsHtml = isEssay(q)
    ? `<div class="mb-2"><textarea class="form-control essay-input" data-qid="${q.id}" rows="7" maxlength="6000" placeholder="Tự trình bày câu trả lời của bạn theo dàn ý...">${escAttr(selected || '')}</textarea></div>
       <details class="essay-guide mt-2"><summary class="btn btn-sm btn-outline-primary"><i class="bi bi-compass"></i> Xem định hướng trả lời</summary><div class="alert alert-info mt-2 mb-0 small">${fmtExplain(q.explanation)}</div></details>`
    : isFill(q)
    ? `<div class="mb-2"><input type="text" class="form-control fill-input${checked ? (fillOk ? ' is-valid' : ' is-invalid') : ''}" data-qid="${q.id}" placeholder="Nhập đáp án của bạn..." value="${escAttr(selected || '')}" ${checked ? 'disabled' : ''} autocomplete="off" spellcheck="false"></div>`
    : Object.entries(q.options)
    .map(
      ([key, val]) => `
      <div class="form-check option-item${checked && key === q.correctAnswer ? ' opt-correct' : ''}${checked && key === selected && key !== q.correctAnswer ? ' opt-wrong' : ''}">
        <input class="form-check-input" type="radio" name="q_${q.id}" id="q_${q.id}_${key}" value="${key}" ${selected === key ? 'checked' : ''} ${checked ? 'disabled' : ''}>
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
        ${q.correctAnswer && !exam ? renderCheckArea(q, selected, checked) : ''}
        <div class="mt-2 d-flex flex-wrap gap-2">
          ${q.correctAnswer && !exam && isExerciseQuestion(q) ? '<button type="button" class="btn btn-sm btn-outline-success btn-similar"><i class="bi bi-stars"></i> Làm câu tương tự</button>' : ''}
          <button type="button" class="btn btn-sm ${note ? 'btn-secondary' : 'btn-outline-secondary'} btn-note"><i class="bi bi-journal-text"></i> ${note ? 'Ghi chú của bạn' : 'Ghi chú'}</button>
        </div>
        <div class="note-box mt-2 ${note ? '' : 'd-none'}">
          <textarea class="form-control form-control-sm note-input" rows="2" maxlength="2000" placeholder="Mẹo nhớ / ghi chú riêng của bạn (tự động lưu)...">${escAttr(note)}</textarea>
        </div>
      </div>
    </div>`;
}

function renderCheckArea(q, selected, checked) {
  if (!checked) {
    return `<button type="button" class="btn btn-sm btn-outline-primary mt-2 btn-check-answer" ${selected ? '' : 'disabled'}><i class="bi bi-check2-circle"></i> Kiểm tra đáp án</button>
      ${selected ? '' : '<span class="small text-muted ms-2">Chọn đáp án để kiểm tra</span>'}`;
  }
  const ok = isFill(q) ? matchFill(q, selected) : selected === q.correctAnswer;
  return `<div class="alert ${ok ? 'alert-success' : 'alert-danger'} mt-2 mb-0 py-2">
    ${ok ? '<i class="bi bi-check-circle-fill"></i> Chính xác!' : `<i class="bi bi-x-circle-fill"></i> Sai rồi. Đáp án đúng: <b>${ansLabel(q, q.correctAnswer)}</b>`}
    ${q.explanation ? `<div class="small mt-2 pt-2 border-top"><b><i class="bi bi-lightbulb-fill"></i> Giải thích:</b> ${fmtExplain(q.explanation)}</div>` : ''}
  </div>`;
}

function attachOptionListeners(container, onlyQid) {
  container.querySelectorAll('.question-card').forEach((card) => {
    if (onlyQid && card.dataset.qid !== String(onlyQid)) return;
    const qid = card.dataset.qid;
    card.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.addEventListener('change', () => {
        Quiz.selectAnswer(qid, input.value);
        const cb = card.querySelector('.btn-check-answer');
        if (cb) { cb.disabled = false; if (cb.nextElementSibling) cb.nextElementSibling.remove(); }
        updateProgressBar();
        renderQuizNavigator();
      });
    });

    const checkBtn = card.querySelector('.btn-check-answer');
    if (checkBtn) {
      checkBtn.addEventListener('click', () => {
        Quiz.state.checkedQuestions = Quiz.state.checkedQuestions || {};
        Quiz.state.checkedQuestions[String(qid)] = true;
        const q = Quiz.state.questions.find((x) => String(x.id) === String(qid));
        const idx = Quiz.state.questions.indexOf(q);
        card.outerHTML = renderQuestionCard(q, idx);
        attachOptionListeners(document.getElementById('quizBody'), qid);
      });
    }

    const essayInput = card.querySelector('.essay-input');
    if (essayInput) {
      essayInput.addEventListener('input', () => {
        Quiz.selectAnswer(qid, essayInput.value);
        updateProgressBar();
        renderQuizNavigator();
      });
    }

    const fillInput = card.querySelector('.fill-input');
    if (fillInput) {
      fillInput.addEventListener('input', () => {
        Quiz.selectAnswer(qid, fillInput.value);
        const cb = card.querySelector('.btn-check-answer');
        if (cb) {
          const has = fillInput.value.trim().length > 0;
          cb.disabled = !has;
          if (has && cb.nextElementSibling) cb.nextElementSibling.remove();
        }
        updateProgressBar();
        renderQuizNavigator();
      });
      fillInput.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
          const cb = card.querySelector('.btn-check-answer');
          if (cb && !cb.disabled) cb.click();
        }
      });
    }

    const noteBtn = card.querySelector('.btn-note');
    if (noteBtn) {
      noteBtn.addEventListener('click', () => {
        const box = card.querySelector('.note-box');
        box.classList.toggle('d-none');
        if (!box.classList.contains('d-none')) box.querySelector('textarea').focus();
      });
      card.querySelector('.note-input').addEventListener('input', (ev) => {
        Storage.setNote(qid, ev.target.value);
        const has = ev.target.value.trim().length > 0;
        noteBtn.classList.toggle('btn-secondary', has);
        noteBtn.classList.toggle('btn-outline-secondary', !has);
        noteBtn.innerHTML = `<i class="bi bi-journal-text"></i> ${has ? 'Ghi chú của bạn' : 'Ghi chú'}`;
      });
    }

    const similarBtn = card.querySelector('.btn-similar');
    if (similarBtn) {
      similarBtn.addEventListener('click', () => openSimilarPractice(qid));
    }

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

// Phím tắt khi làm bài: A/B/C/D = chọn đáp án, Enter = kiểm tra đáp án, → = câu sau, ← = câu trước
document.addEventListener('keydown', (ev) => {
  if (ev.ctrlKey || ev.altKey || ev.metaKey || ev.shiftKey || ev.isComposing) return;
  const view = document.getElementById('view-quiz');
  if (!view || view.classList.contains('d-none') || document.querySelector('.modal.show')) return;
  if (!Quiz.state || !Quiz.state.questions || !Quiz.state.questions.length) return;
  const t = ev.target;
  const tag = t && t.tagName;
  const inText = tag === 'TEXTAREA' || tag === 'SELECT' || (tag === 'INPUT' && t.type !== 'radio' && t.type !== 'checkbox');
  if (ev.key === 'Enter') {
    const navBtn = t && (t.id === 'btnNextQuestion' || t.id === 'btnPrevQuestion');
    if (tag === 'TEXTAREA' || (tag === 'BUTTON' && !navBtn) || tag === 'SUMMARY' || (t && t.classList && t.classList.contains('fill-input'))) return;
    const card = (t && t.closest && t.closest('.question-card')) || (quizViewMode === 'single' ? document.querySelector('#quizBody .question-card') : null);
    const cb = card && card.querySelector('.btn-check-answer');
    // Câu điền khuyết / tự luận: Enter đưa con trỏ vào ô nhập để gõ ngay, không cần chuột
    const box = card && card.querySelector('.fill-input:not([disabled]), .essay-input');
    if (box && !box.value.trim()) { ev.preventDefault(); box.focus(); }
    else if (cb && !cb.disabled) { ev.preventDefault(); cb.click(); }
    else if (box) { ev.preventDefault(); box.focus(); }
  } else if (/^[a-dA-D]$/.test(ev.key) && !inText) {
    const card = (t && t.closest && t.closest('.question-card')) || (quizViewMode === 'single' ? document.querySelector('#quizBody .question-card') : null);
    const radio = card && card.querySelector(`input[type="radio"][value="${ev.key.toUpperCase()}"]`);
    if (radio && !radio.disabled) {
      ev.preventDefault();
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } else if ((ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') && quizViewMode === 'single' && !inText) {
    ev.preventDefault();
    const btn = document.getElementById(ev.key === 'ArrowRight' ? 'btnNextQuestion' : 'btnPrevQuestion');
    if (btn && !btn.disabled) btn.click();
  }
}, true);

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
      const typeObj = { type: resolved.type || item.type, options: item.options };
      const correctText = resolved.correctAnswer ? ansLabel({ type: typeObj.type, options: { [resolved.correctAnswer]: resolved.correctAnswerText } }, resolved.correctAnswer) : 'Chưa có đáp án đúng';
      const selectedText = item.lastSelected ? ansLabel(typeObj, item.lastSelected) : 'Chưa có';
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
        type: found.type || null,
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
  const denom = attempt.ungradedCount > 0 && attempt.gradedCount > 0 ? attempt.gradedCount : attempt.total;
  const percent = denom > 0 ? Math.round((attempt.correctCount / denom) * 1000) / 10 : 0;
  const essayOnly = attempt.gradedCount === 0 && attempt.total > 0 && attempt.answers.every((a) => a.type === 'essay');

  document.getElementById('resultScoreText').textContent = essayOnly
    ? `Đã hoàn thành ${attempt.answers.filter((a) => a.selectedAnswer).length}/${attempt.total} câu tự luận (không chấm điểm)`
    : `${attempt.correctCount}/${denom} câu đúng (${percent}%)`;
  document.getElementById('resultTimeText').textContent =
    `Thời gian làm bài: ${Quiz.formatTime(attempt.elapsedMs)}` +
    (attempt.timeLimitMs ? ` / ${Quiz.formatTime(attempt.timeLimitMs)}` : '') +
    (attempt.timedOut ? ' — hết giờ, bài đã tự nộp' : '');
  document.getElementById('resultChapterText').textContent =
    `${attempt.chapterName}${attempt.topicName ? ' — ' + attempt.topicName : ''}`;

  const detailBody = document.getElementById('resultDetailBody');
  detailBody.innerHTML = attempt.answers
    .map((a, i) => {
      const essay = a.type === 'essay';
      const rowClass = essay ? '' : a.isCorrect ? 'table-success' : 'table-danger';
      const selectedText = a.selectedAnswer ? ansLabel(a, a.selectedAnswer) : '(chưa trả lời)';
      const correctText = essay ? `<div class="small">${fmtExplain(a.explanation)}</div>` : ansLabel(a, a.correctAnswer);
      const flagText = a.flagged ? '<br><span class="badge bg-warning text-dark mt-1">Đã gắn cờ</span>' : '';
      return `
        <tr class="${rowClass}">
          <td>${i + 1}</td>
          <td>${a.question}${renderQuestionImages(a.images)}${a.explanation && !essay ? `<div class="small text-muted mt-2"><b><i class="bi bi-lightbulb-fill"></i> Giải thích:</b> ${fmtExplain(a.explanation)}</div>` : ''}${Storage.getNote(a.questionId) ? `<div class="small mt-2"><b><i class="bi bi-journal-text"></i> Ghi chú của bạn:</b> ${escAttr(Storage.getNote(a.questionId))}</div>` : ''}</td>
          <td style="white-space:pre-wrap">${essay ? escAttr(a.selectedAnswer || '(chưa trả lời)') : selectedText}${flagText}</td>
          <td>${correctText}</td>
          <td class="text-center">${essay ? '<i class="bi bi-pencil-square text-primary fs-5"></i>' : a.isCorrect ? '<i class="bi bi-check-circle-fill text-success fs-5"></i>' : '<i class="bi bi-x-circle-fill text-danger fs-5"></i>'}</td>
        </tr>`;
    })
    .join('');

  const retryBtn = document.getElementById('btnRetryChapter');
  const isVirtual = ['FLAGGED', 'WRONG', 'WEAK', 'EXAM'].includes(attempt.chapterId);
  retryBtn.classList.toggle('d-none', isVirtual);
  retryBtn.innerHTML = '<i class="bi bi-arrow-left"></i> Quay lại chọn chủ đề';
  retryBtn.onclick = () => openChapter(attempt.chapterId);
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
        if (found) return { ...found, _topicName: topic.topicName, _chapterId: w.chapterId, _chapterName: chapter.chapterName };
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

/** ====== LÀM LẠI CÂU ĐÃ GẮN CỜ ====== */
document.getElementById('btnPracticeFlagged').addEventListener('click', async () => {
  const flagged = Storage.getFlagged();
  const ids = new Set(Object.keys(flagged));
  if (ids.size === 0) {
    alert('Chưa có câu nào được gắn cờ! Bấm "Gắn cờ" khi làm bài để đánh dấu câu cần làm lại.');
    return;
  }
  const all = await loadAllChapters();
  const questions = [];
  const seen = new Set();
  for (const chapter of Object.values(all)) {
    for (const topic of chapter.topics) {
      for (const q of topic.questions) {
        const key = String(q.id);
        if (ids.has(key) && !seen.has(key)) {
          seen.add(key);
          questions.push({ ...q, _topicName: topic.topicName, _chapterId: chapter.chapterId, _chapterName: chapter.chapterName });
        }
      }
    }
  }
  startQuizConfig({
    type: 'flagged',
    chapterId: 'FLAGGED',
    chapterName: 'Làm lại câu đã gắn cờ',
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

/** ====== LÀM CÂU TƯƠNG TỰ (luyện thêm khi đang làm bài) ====== */
const SIM_STOP = new Set(['la', 'va', 'cua', 'cho', 'cac', 'mot', 'nhung', 'nao', 'gi', 'khi', 'nay', 'the', 'co', 'duoc', 'trong', 'voi', 'de',
  'khong', 'bao', 'nhieu', 'sau', 'day', 'dung', 'sai', 'thi', 'tu', 'den', 'ra', 'vao', 'is', 'of', 'an', 'to', 'in', 'and', 'or']);
function simTokens(text) {
  const t = String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  return new Set((t.match(/[a-z0-9_]{2,}/g) || []).filter((w) => !SIM_STOP.has(w)));
}
function simKey(q) {
  return String(q.question || '').toLowerCase().replace(/\s+/g, ' ').trim();
}
function simText(q) {
  return `${q.question} ${q.options ? q.options[q.correctAnswer] || '' : ''} ${q.explanation || ''}`;
}

async function findSimilarQuestions(base, limit = 8) {
  const all = await loadAllChapters();
  const baseTokens = simTokens(simText(base));
  const seenKeys = new Set([simKey(base)]);
  const seenIds = new Set([String(base.id)]);
  const scored = [];
  Object.values(all).forEach((chapter) => {
    chapter.topics.forEach((topic) => {
      topic.questions.forEach((q) => {
        if (!q.correctAnswer || !Quiz.isValidQuestion(q) || q.type === 'fill') return;
        const id = String(q.id);
        const key = simKey(q);
        if (seenIds.has(id) || seenKeys.has(key)) return;
        seenIds.add(id);
        seenKeys.add(key);
        const tokens = simTokens(simText(q));
        let inter = 0;
        baseTokens.forEach((w) => { if (tokens.has(w)) inter += 1; });
        const union = baseTokens.size + tokens.size - inter;
        let score = union > 0 ? inter / union : 0;
        if (base._topicName && topic.topicName === base._topicName) score += 0.15;
        scored.push({ q: { ...q, _topicName: topic.topicName }, score });
      });
    });
  });
  return scored.filter((s) => s.score >= 0.08).sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.q);
}

const similarState = { list: [], idx: 0, correct: 0, answered: false };

async function openSimilarPractice(qid) {
  const base = Quiz.state && Quiz.state.questions.find((x) => String(x.id) === String(qid));
  if (!base) return;
  const body = document.getElementById('similarModalBody');
  body.innerHTML = '<div class="text-center text-muted py-4"><div class="spinner-border spinner-border-sm"></div> Đang tìm câu tương tự...</div>';
  document.getElementById('btnSimilarNext').classList.add('d-none');
  document.getElementById('similarCounter').textContent = '';
  bootstrap.Modal.getOrCreateInstance(document.getElementById('similarModal')).show();
  try {
    similarState.list = await findSimilarQuestions(base);
  } catch (e) {
    similarState.list = [];
  }
  similarState.idx = 0;
  similarState.correct = 0;
  renderSimilarQuestion();
}

function renderSimilarQuestion() {
  const body = document.getElementById('similarModalBody');
  const nextBtn = document.getElementById('btnSimilarNext');
  const { list, idx } = similarState;
  similarState.answered = false;

  if (list.length === 0) {
    body.innerHTML = '<div class="alert alert-info mb-0">Chưa tìm thấy câu tương tự cho câu này.</div>';
    nextBtn.classList.add('d-none');
    return;
  }
  if (idx >= list.length) {
    body.innerHTML = `<div class="text-center py-4">
      <h4 class="text-primary">${similarState.correct}/${list.length} câu đúng</h4>
      <p class="text-muted">Bạn đã luyện xong các câu tương tự.</p>
      <button type="button" class="btn btn-outline-success me-2" id="btnSimilarRedo"><i class="bi bi-arrow-repeat"></i> Làm lại</button>
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
    </div>`;
    document.getElementById('similarCounter').textContent = `${list.length}/${list.length}`;
    nextBtn.classList.add('d-none');
    document.getElementById('btnSimilarRedo').onclick = () => {
      similarState.idx = 0;
      similarState.correct = 0;
      renderSimilarQuestion();
    };
    return;
  }

  const q = list[idx];
  document.getElementById('similarCounter').textContent = `${idx + 1}/${list.length}`;
  nextBtn.classList.add('d-none');
  nextBtn.innerHTML = idx === list.length - 1 ? 'Xem kết quả <i class="bi bi-flag-fill"></i>' : 'Câu tiếp <i class="bi bi-arrow-right"></i>';
  body.innerHTML = `
    <p class="fw-semibold">${q.question}</p>
    ${renderQuestionImages(q.images)}
    <div id="similarOptions">
      ${Object.entries(q.options).map(([k, v]) => `
        <div class="option-item sim-option" data-key="${k}" role="button" style="cursor:pointer"><label class="form-check-label" style="cursor:pointer">${k}. ${v}</label></div>`).join('')}
    </div>
    <div id="similarFeedback" class="mt-2"></div>`;

  body.querySelectorAll('.sim-option').forEach((el) => {
    el.addEventListener('click', () => {
      if (similarState.answered) return;
      similarState.answered = true;
      const chosen = el.dataset.key;
      const ok = chosen === q.correctAnswer;
      if (ok) similarState.correct += 1;
      body.querySelectorAll('.sim-option').forEach((o) => {
        if (o.dataset.key === q.correctAnswer) o.classList.add('opt-correct');
        else if (o.dataset.key === chosen) o.classList.add('opt-wrong');
      });
      document.getElementById('similarFeedback').innerHTML = `<div class="alert ${ok ? 'alert-success' : 'alert-danger'} py-2 mb-0">
        ${ok ? '<i class="bi bi-check-circle-fill"></i> Chính xác!' : `<i class="bi bi-x-circle-fill"></i> Sai rồi. Đáp án đúng: <b>${q.correctAnswer}. ${q.options[q.correctAnswer]}</b>`}
        ${q.explanation ? `<div class="small mt-2 pt-2 border-top"><b><i class="bi bi-lightbulb-fill"></i> Giải thích:</b> ${fmtExplain(q.explanation)}</div>` : ''}
      </div>`;
      nextBtn.classList.remove('d-none');
    });
  });
}

document.getElementById('btnSimilarNext').addEventListener('click', () => {
  similarState.idx += 1;
  renderSimilarQuestion();
});


/** ====== POOL CÂU HỎI TOÀN MÔN (không tính chương tổng hợp trùng lặp) ====== */
async function collectPool() {
  const all = await loadAllChapters();
  const pool = [];
  const seen = new Set();
  manifest.chapters.filter((ch) => !ch.excludeFromSummary).forEach((ch) => {
    const data = all[ch.chapterId];
    if (!data) return;
    data.topics.forEach((topic) => {
      topic.questions.forEach((q) => {
        const id = String(q.id);
        if (seen.has(id) || !q.correctAnswer || !Quiz.isValidQuestion(q)) return;
        seen.add(id);
        pool.push({ ...q, _topicName: topic.topicName, _chapterId: ch.chapterId, _chapterName: ch.chapterName || data.chapterName });
      });
    });
  });
  return pool;
}

/** ====== THI THỬ CÓ GIỜ ====== */
/** Cấu trúc đề thi thử của môn (data/<môn>/exam.json) - nếu môn chưa có thì thi ngẫu nhiên toàn môn */
let examBlueprint = null;
async function loadExamBlueprint() {
  try {
    const res = await fetch(`data/${encodeURIComponent(currentSubject.folder)}/exam.json`, { cache: 'no-cache' });
    if (!res.ok) return null;
    const data = JSON.parse((await res.text()).replace(/^\uFEFF/, ''));
    return data && Array.isArray(data.slots) && data.slots.length ? data : null;
  } catch (e) {
    return null;
  }
}

document.getElementById('btnExam').addEventListener('click', async () => {
  examBlueprint = await loadExamBlueprint();
  const cnt = document.getElementById('examCount');
  const mins = document.getElementById('examMinutes');
  if (examBlueprint) {
    document.getElementById('examTitle').textContent = examBlueprint.title || 'Thi thử có giờ';
    document.getElementById('examDesc').textContent = examBlueprint.description || '';
    cnt.value = examBlueprint.slots.length;
    cnt.disabled = true;
    mins.value = examBlueprint.durationMin || 60;
  } else {
    const pool = await collectPool();
    document.getElementById('examTitle').textContent = 'Thi thử có giờ';
    document.getElementById('examDesc').textContent =
      `Rút ngẫu nhiên từ toàn bộ ${pool.length} câu của môn. Không có nút kiểm tra đáp án; hết giờ bài tự nộp.`;
    cnt.disabled = false;
    cnt.max = pool.length;
    if (parseInt(cnt.value, 10) > pool.length || !(parseInt(cnt.value, 10) > 0)) cnt.value = Math.min(40, pool.length);
  }
  bootstrap.Modal.getOrCreateInstance(document.getElementById('examModal')).show();
});

/** Dựng đề theo cấu trúc: mỗi vị trí rút ngẫu nhiên 1 câu trong danh sách câu cùng dạng (không trùng câu) */
async function buildBlueprintExam(blueprint) {
  const all = await loadAllChapters();
  const byId = new Map();
  manifest.chapters.forEach((ch) => {
    const data = all[ch.chapterId];
    if (!data) return;
    data.topics.forEach((topic) => {
      topic.questions.forEach((q) => {
        const id = String(q.id);
        if (!byId.has(id) && q.correctAnswer && Quiz.isValidQuestion(q)) {
          byId.set(id, { ...q, _topicName: topic.topicName, _chapterId: ch.chapterId, _chapterName: ch.chapterName || data.chapterName });
        }
      });
    });
  });
  const used = new Set();
  const questions = [];
  blueprint.slots.forEach((slot) => {
    const candidates = slot.pool.filter((id) => byId.has(String(id)) && !used.has(String(id)));
    if (candidates.length === 0) return;
    const pick = String(candidates[Math.floor(Math.random() * candidates.length)]);
    used.add(pick);
    questions.push(byId.get(pick));
  });
  return questions;
}

document.getElementById('btnStartExam').addEventListener('click', async () => {
  const minutes = Math.max(1, parseInt(document.getElementById('examMinutes').value, 10) || 60);
  let source;
  let config;
  if (examBlueprint) {
    const questions = await buildBlueprintExam(examBlueprint);
    source = { type: 'exam', chapterId: 'EXAM', chapterName: examBlueprint.title || 'Thi thử có giờ', topicId: null, topicName: null, questions };
    config = { count: 'all', shuffleQuestions: false, shuffleOptions: true };
  } else {
    const pool = await collectPool();
    const count = Math.min(Math.max(1, parseInt(document.getElementById('examCount').value, 10) || 40), pool.length);
    source = { type: 'exam', chapterId: 'EXAM', chapterName: 'Thi thử có giờ', topicId: null, topicName: null, questions: pool };
    config = { count, shuffleQuestions: true, shuffleOptions: true };
  }
  bootstrap.Modal.getInstance(document.getElementById('examModal')).hide();
  runQuiz(source, config, 'single', { exam: true, timeLimitMin: minutes });
});

/** ====== ÔN TRỌNG TÂM YẾU ====== */
document.getElementById('btnWeak').addEventListener('click', async () => {
  const history = Storage.getHistory();
  if (history.length === 0) {
    alert('Chưa có dữ liệu để xác định phần yếu. Hãy làm vài bài trước, rồi quay lại nhé!');
    return;
  }
  const pool = await collectPool();
  const wrongStats = Storage.getWrongStats();

  // Tỉ lệ đúng theo từng chủ đề (chương + chủ đề) từ lịch sử
  const topicStat = {};
  const everCorrect = new Set();
  history.forEach((h) => {
    h.answers.forEach((a) => {
      const key = `${a.chapterId || h.chapterId}|${a.topicName || ''}`;
      const t = (topicStat[key] = topicStat[key] || { right: 0, total: 0 });
      t.total += 1;
      if (a.isCorrect) { t.right += 1; everCorrect.add(String(a.questionId)); }
    });
  });

  // Trọng số: câu hay sai + chủ đề có tỉ lệ đúng thấp được ưu tiên; câu đã làm đúng và chưa từng sai ít khi xuất hiện
  const scored = pool.map((q) => {
    const ts = topicStat[`${q._chapterId}|${q._topicName}`];
    const acc = ts && ts.total >= 2 ? ts.right / ts.total : null;
    const ws = wrongStats[q.id];
    let w = 1;
    if (acc !== null) w += (1 - acc) * 6;
    if (ws) w += 2 + ws.wrongCount * 3;
    else if (everCorrect.has(String(q.id))) w = Math.min(w, 0.3);
    return { q, key: Math.pow(Math.random(), 1 / w) };
  });
  const picked = scored.sort((a, b) => b.key - a.key).slice(0, 20).map((x) => x.q);

  startQuizConfig({
    type: 'weak',
    chapterId: 'WEAK',
    chapterName: 'Ôn trọng tâm yếu',
    topicId: null,
    topicName: null,
    questions: picked
  });
});
