/**
 * storage.js — Quản lý toàn bộ dữ liệu tiến độ trong localStorage
 * Không dùng sessionStorage. Có try/catch cho mọi thao tác đọc/ghi.
 */

const BASE_KEYS = {
  HISTORY: 'dbms_quiz_history',       // Lịch sử tất cả các lần làm bài
  WRONG_STATS: 'dbms_quiz_wrong_stats', // Thống kê số lần sai theo từng câu hỏi
  BEST_SCORES: 'dbms_quiz_best_scores', // Điểm cao nhất từng chương/chủ đề
  FLAGGED: 'dbms_quiz_flagged',         // Các câu đã gắn cờ: { questionId: chapterId }
  NOTES: 'dbms_quiz_notes'              // Ghi chú riêng: { questionId: text }
};

// Môn mặc định (DBMS) giữ nguyên key cũ để không mất tiến độ; môn khác thêm hậu tố
const LEGACY_SUBJECT = 'DBMS';
let currentSubject = LEGACY_SUBJECT;

function keyFor(base) {
  return currentSubject === LEGACY_SUBJECT ? base : `${base}__${currentSubject}`;
}

const STORAGE_KEYS = {
  get HISTORY() { return keyFor(BASE_KEYS.HISTORY); },
  get WRONG_STATS() { return keyFor(BASE_KEYS.WRONG_STATS); },
  get BEST_SCORES() { return keyFor(BASE_KEYS.BEST_SCORES); },
  get FLAGGED() { return keyFor(BASE_KEYS.FLAGGED); },
  get NOTES() { return keyFor(BASE_KEYS.NOTES); }
};

const Storage = {
  /** Chọn môn đang dùng; mọi thao tác đọc/ghi sau đó chỉ ảnh hưởng môn này */
  setSubject(subjectId) {
    currentSubject = subjectId || LEGACY_SUBJECT;
  },

  /** Đọc dữ liệu JSON từ localStorage, trả về defaultValue nếu lỗi/không có */
  _get(key, defaultValue) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;
      return JSON.parse(raw);
    } catch (err) {
      console.error(`Lỗi đọc localStorage [${key}]:`, err);
      return defaultValue;
    }
  },

  /** Ghi dữ liệu JSON vào localStorage */
  _set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`Lỗi ghi localStorage [${key}]:`, err);
      return false;
    }
  },

  getHistory() {
    return this._get(STORAGE_KEYS.HISTORY, []);
  },

  /** Lưu 1 kết quả bài làm mới, cập nhật luôn thống kê sai và điểm cao nhất */
  saveAttempt(attempt) {
    const history = this.getHistory();
    attempt.attemptId = 'attempt_' + Date.now();
    history.unshift(attempt); // Mới nhất lên đầu
    this._set(STORAGE_KEYS.HISTORY, history);

    this._updateWrongStats(attempt);
    this._updateBestScore(attempt);
    return attempt;
  },

  /** Cập nhật số lần trả lời sai cho từng câu hỏi */
  _updateWrongStats(attempt) {
    const wrongStats = this._get(STORAGE_KEYS.WRONG_STATS, {});
    attempt.answers.forEach((ans) => {
      if (!ans.isCorrect && ans.type !== 'essay') {
        if (!wrongStats[ans.questionId]) {
          wrongStats[ans.questionId] = {
            questionId: ans.questionId,
            question: ans.question,
            images: ans.images || [],
            options: ans.options,
            type: ans.type || null,
            acceptedAnswers: ans.acceptedAnswers || null,
            correctAnswer: ans.correctAnswer,
            chapterId: ans.chapterId || attempt.chapterId,
            chapterName: ans.chapterName || attempt.chapterName,
            topicName: ans.topicName || '',
            wrongCount: 0,
            lastSelected: null
          };
        }
        wrongStats[ans.questionId].wrongCount += 1;
        wrongStats[ans.questionId].lastSelected = ans.selectedAnswer;
      } else if (wrongStats[ans.questionId]) {
        // Nếu lần này làm đúng, không xoá lịch sử sai, giữ nguyên để tham khảo
      }
    });
    this._set(STORAGE_KEYS.WRONG_STATS, wrongStats);
  },

  getWrongStats() {
    return this._get(STORAGE_KEYS.WRONG_STATS, {});
  },

  getWrongQuestionsList() {
    const stats = this.getWrongStats();
    return Object.values(stats).sort((a, b) => b.wrongCount - a.wrongCount);
  },

  /** Cập nhật điểm cao nhất cho 1 chương */
  _updateBestScore(attempt) {
    const bestScores = this._get(STORAGE_KEYS.BEST_SCORES, {});
    const key = attempt.chapterId;
    const percent = attempt.total > 0 ? (attempt.correctCount / attempt.total) * 100 : 0;
    if (!bestScores[key] || percent > bestScores[key].percent) {
      bestScores[key] = {
        percent: Math.round(percent * 10) / 10,
        correctCount: attempt.correctCount,
        total: attempt.total,
        date: attempt.timestamp
      };
    }
    this._set(STORAGE_KEYS.BEST_SCORES, bestScores);
  },

  getBestScores() {
    return this._get(STORAGE_KEYS.BEST_SCORES, {});
  },

  /** Câu đã gắn cờ (lưu bền): { questionId: chapterId } */
  getFlagged() {
    return this._get(STORAGE_KEYS.FLAGGED, {});
  },

  setFlagged(questionId, flagged, chapterId) {
    const f = this.getFlagged();
    if (flagged) f[String(questionId)] = chapterId || '';
    else delete f[String(questionId)];
    this._set(STORAGE_KEYS.FLAGGED, f);
  },

  /** Ghi chú riêng cho từng câu: { questionId: text } */
  getNotes() {
    return this._get(STORAGE_KEYS.NOTES, {});
  },

  getNote(questionId) {
    return this.getNotes()[String(questionId)] || '';
  },

  setNote(questionId, text) {
    const n = this.getNotes();
    const t = String(text || '').trim();
    if (t) n[String(questionId)] = String(text).slice(0, 2000);
    else delete n[String(questionId)];
    this._set(STORAGE_KEYS.NOTES, n);
  },

  getBestScoreForChapter(chapterId) {
    const scores = this.getBestScores();
    return scores[chapterId] || null;
  },

  /** Lấy % số câu đã từng làm đúng ít nhất 1 lần / tổng câu của chương (dùng cho progress trên card) */
  getChapterProgress(chapterId, totalQuestions, progressSources = null) {
    const chapterIds = Array.isArray(progressSources) && progressSources.length > 0 ? [chapterId, ...progressSources] : [chapterId];
    const history = this.getHistory().filter((h) => chapterIds.includes(h.chapterId));
    if (history.length === 0 || totalQuestions === 0) return 0;
    const answeredIds = new Set();
    history.forEach((h) => h.answers.forEach((a) => answeredIds.add(a.questionId)));
    return Math.round((answeredIds.size / totalQuestions) * 100);
  },

  /** Xoá toàn bộ dữ liệu tiến độ */
  resetAll() {
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      localStorage.removeItem(STORAGE_KEYS.WRONG_STATS);
      localStorage.removeItem(STORAGE_KEYS.BEST_SCORES);
      localStorage.removeItem(STORAGE_KEYS.FLAGGED);
      localStorage.removeItem(STORAGE_KEYS.NOTES);
      return true;
    } catch (err) {
      console.error('Lỗi reset dữ liệu:', err);
      return false;
    }
  },

  /** Xuất toàn bộ dữ liệu tiến độ ra 1 object JSON để backup */
  exportData() {
    return {
      exportedAt: new Date().toISOString(),
      history: this.getHistory(),
      wrongStats: this.getWrongStats(),
      bestScores: this.getBestScores(),
      flagged: this.getFlagged(),
      notes: this.getNotes()
    };
  },

  /** Nhập dữ liệu tiến độ từ file JSON đã export trước đó (ghi đè toàn bộ) */
  importData(data) {
    try {
      if (data.history) this._set(STORAGE_KEYS.HISTORY, data.history);
      if (data.wrongStats) this._set(STORAGE_KEYS.WRONG_STATS, data.wrongStats);
      if (data.bestScores) this._set(STORAGE_KEYS.BEST_SCORES, data.bestScores);
      if (data.flagged) this._set(STORAGE_KEYS.FLAGGED, data.flagged);
      if (data.notes) this._set(STORAGE_KEYS.NOTES, data.notes);
      return true;
    } catch (err) {
      console.error('Lỗi import dữ liệu:', err);
      return false;
    }
  }
};

export default Storage;
