/**
 * quiz.js — Logic tạo đề, chạy bài làm, chấm điểm
 */
import Storage from './storage.js';
import { isFill, matchFill } from './answer.js';

const Quiz = {
  state: null, // Trạng thái bài làm hiện tại

  /** Xáo trộn mảng (Fisher-Yates) */
  shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  /**
   * Xác nhận câu hỏi hợp lệ để hiển thị: ít nhất 2 lựa chọn.
   * Không bắt buộc phải có `correctAnswer` — cho phép câu hỏi "practice" không chấm điểm.
   */
  isValidQuestion(q) {
    if (q && q.type === 'essay') return !!q.question;
    if (q && q.type === 'fill') return !!q.correctAnswer;
    return q && q.options && Object.keys(q.options).length >= 2;
  },

  /**
   * Khởi tạo 1 bài làm mới
   * source: { type: 'chapter'|'topic'|'wrong', chapterId, chapterName, topicId, topicName, questions }
   * config: { count: number|'all', shuffleQuestions: bool, shuffleOptions: bool }
   */
  start(source, config) {
    let questions = source.questions.filter(this.isValidQuestion);

    if (config.shuffleQuestions) {
      questions = this.shuffleArray(questions);
    }
    if (config.count !== 'all' && config.count < questions.length) {
      questions = questions.slice(0, config.count);
    }

    // Gắn thêm topicName cho từng câu (phục vụ tracking sai theo chủ đề)
    questions = questions.map((q) => ({ ...q, _topicName: q._topicName || source.topicName || '' }));

    if (config.shuffleOptions) {
      questions = questions.map((q) => {
        if (q.type === 'fill' || q.type === 'essay') return q;
        const entries = Object.entries(q.options);
        const shuffled = this.shuffleArray(entries);
        const newOptions = {};
        const letters = ['A', 'B', 'C', 'D'];
        let newCorrect = q.correctAnswer;
        shuffled.forEach(([origKey, val], idx) => {
          const newKey = letters[idx];
          newOptions[newKey] = val;
          if (origKey === q.correctAnswer) newCorrect = newKey;
        });
        return { ...q, options: newOptions, correctAnswer: newCorrect };
      });
    }

    // Khôi phục cờ đã lưu từ các lần làm trước
    const savedFlags = Storage.getFlagged();
    const initialFlags = {};
    questions.forEach((q) => {
      if (savedFlags[String(q.id)] !== undefined) initialFlags[String(q.id)] = true;
    });

    this.state = {
      chapterId: source.chapterId,
      chapterName: source.chapterName,
      topicId: source.topicId || null,
      topicName: source.topicName || null,
      isWrongPractice: source.type === 'wrong',
      questions,
      currentIndex: 0,
      userAnswers: {}, // questionId -> selectedKey
      flaggedQuestions: initialFlags, // questionId -> true nếu câu được gắn cờ chưa chắc chắn
      startTime: Date.now()
    };
    return this.state;
  },

  getCurrentQuestion() {
    if (!this.state) return null;
    return this.state.questions[this.state.currentIndex];
  },

  selectAnswer(questionId, optionKey) {
    if (!this.state) return;
    const key = String(questionId);
    if (typeof optionKey === 'string' && optionKey.trim() === '') delete this.state.userAnswers[key];
    else this.state.userAnswers[key] = typeof optionKey === 'string' ? optionKey.trim() : optionKey;
  },

  toggleFlag(questionId) {
    if (!this.state) return false;
    const key = String(questionId);
    if (this.state.flaggedQuestions[key]) {
      delete this.state.flaggedQuestions[key];
      Storage.setFlagged(key, false);
      return false;
    }
    this.state.flaggedQuestions[key] = true;
    const q = this.state.questions.find((x) => String(x.id) === key);
    Storage.setFlagged(key, true, (q && q._chapterId) || this.state.chapterId);
    return true;
  },

  isFlagged(questionId) {
    if (!this.state) return false;
    return !!this.state.flaggedQuestions[String(questionId)];
  },

  getFlaggedCount() {
    if (!this.state) return 0;
    return Object.keys(this.state.flaggedQuestions).length;
  },

  getAnsweredCount() {
    if (!this.state) return 0;
    return Object.keys(this.state.userAnswers).length;
  },

  getTotalCount() {
    return this.state ? this.state.questions.length : 0;
  },

  goTo(index) {
    if (!this.state) return;
    if (index >= 0 && index < this.state.questions.length) {
      this.state.currentIndex = index;
    }
  },

  next() {
    this.goTo(this.state.currentIndex + 1);
  },

  prev() {
    this.goTo(this.state.currentIndex - 1);
  },

  /** Chấm điểm và lưu kết quả vào localStorage, trả về object attempt đầy đủ */
  submit(extra) {
    if (!this.state) return null;
    const elapsedMs = Date.now() - this.state.startTime;
    let correctCount = 0;
    let gradedCount = 0;

    const answers = this.state.questions.map((q) => {
      const selected = this.state.userAnswers[q.id] || null;
      let isCorrect = null;
      if (q.correctAnswer) {
        gradedCount += 1;
        isCorrect = isFill(q) ? matchFill(q, selected) : selected === q.correctAnswer;
        if (isCorrect) correctCount += 1;
      } else {
        // Question is ungraded (no correctAnswer in source)
        isCorrect = null;
      }

      return {
        questionId: q.id,
        question: q.question,
        images: q.images || [],
        options: q.options,
        type: q.type || null,
        acceptedAnswers: q.acceptedAnswers || null,
        correctAnswer: q.correctAnswer || null,
        explanation: q.explanation || '',
        selectedAnswer: selected,
        flagged: this.isFlagged(q.id),
        isCorrect,
        topicName: q._topicName,
        chapterId: q._chapterId || null,
        chapterName: q._chapterName || null
      };
    });

    const attempt = {
      chapterId: this.state.chapterId,
      chapterName: this.state.chapterName,
      topicId: this.state.topicId,
      topicName: this.state.topicName,
      isWrongPractice: this.state.isWrongPractice,
      timestamp: new Date().toISOString(),
      elapsedMs,
      total: this.state.questions.length,
      gradedCount,
      ungradedCount: this.state.questions.length - gradedCount,
      correctCount,
      answers
    };
    if (this.state.examMode) attempt.isExam = true;
    if (this.state.timeLimitMs) attempt.timeLimitMs = this.state.timeLimitMs;
    if (extra && extra.timedOut) attempt.timedOut = true;

    return Storage.saveAttempt(attempt);
  },

  formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
};

export default Quiz;
