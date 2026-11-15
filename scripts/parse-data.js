/**
 * Script parse dữ liệu từ file .txt sang JSON
 * Cách chạy: node scripts/parse-data.js
 *
 * CÁC ĐIỂM ĐÃ FIX so với bản trước:
 * 1. Đáp án đúng chỉ được nhận diện khi dòng kết thúc bằng ĐÚNG 1 dấu cách
 *    (trước đó: dòng có nhiều dấu cách thừa do gõ nhầm cũng bị coi là đúng,
 *    gây nhận nhầm 2 đáp án cùng đúng trong 1 câu).
 * 2. Hỗ trợ thêm định dạng đáp án chữ thường a/b/c/d (không chỉ A/B/C/D).
 * 3. Hỗ trợ thêm dòng "Đáp án: x" để đánh dấu đáp án đúng tường minh
 *    (dùng cho phần đề không có trailing-space, ví dụ mục "Bài test LMS").
 * 4. Hỗ trợ chủ đề dạng tiêu đề tự do, không có tiền tố "Chủ đề"/"Phần"
 *    (ví dụ: "Transparent Data Encryption (TDE)") — nhận diện bằng cách
 *    xem dòng kế tiếp có phải là 1 câu hỏi hay không.
 * 5. Dọn sạch tiền tố dư thừa khi tách tên chủ đề, kể cả khi có en-dash "–"
 *    trong khoảng số (vd "Phần 7–8: Tên" không còn dính "–8:" vào tên).
 */
const fs = require('fs');
const path = require('path');

const DEFAULT_ROOT_DIR = path.resolve(__dirname, '..');

function getProjectPaths(rootDir = DEFAULT_ROOT_DIR) {
  return {
    rootDir,
    dataRawDir: path.join(rootDir, 'data-raw'),
    dataDir: path.join(rootDir, 'data')
  };
}

const DEFAULT_CHAPTER_NAMES = {
  C1: 'Database Configuration',
  C2: 'Table Optimizations',
  C3: 'Indexes & Statistics',
  C4: 'SQL Server Security Model',
  C5: 'Backup & Restore',
  C6: 'Encryption',
  C7: 'SQL Server Metadata',
  C8: 'Locking and Blocking'
};

function ensureDataDir(dataDir) {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Chỉ bỏ BOM, KHÔNG trim ở đây vì cần giữ nguyên khoảng trắng cuối dòng
// (đó chính là dấu hiệu đáp án đúng). Chỉ bỏ \r (CRLF) của Windows.
function normalizeLine(line) {
  return line.replace(/\uFEFF/g, '').replace(/\r$/, '');
}

function getNextNonEmptyLine(lines, index) {
  for (let i = index + 1; i < lines.length; i += 1) {
    const next = normalizeLine(lines[i]).trim();
    if (next) return next;
  }
  return null;
}

// Chấp nhận cả chữ hoa A-D lẫn chữ thường a-d
function isOptionLine(line) {
  return /^[A-Da-d]\.\s?/.test(line.trim());
}

// Dòng "Đáp án: b" / "Đáp án b" / "Đáp án:B" — đánh dấu đáp án đúng tường minh
function getExplicitAnswer(line) {
  const match = line.trim().match(/^Đáp\s*án\s*[:.]?\s*([A-Da-d])\b/i);
  return match ? match[1].toUpperCase() : null;
}

function isExplicitTopicHeader(line) {
  const trimmed = line.trim();
  if (/^(?:Chủ đề|Phần)\s*\d+(?:[\s–—-]*\d+)?[\s:.\-–—]*/i.test(trimmed)) return true;
  return false;
}

// Giữ tên hàm cũ isTopicHeader để tương thích với bản trước (chỉ nhận diện tiêu đề tường minh)
function isTopicHeader(line) {
  return isExplicitTopicHeader(line);
}

function isQuestionLine(line) {
  const trimmed = line.trim();
  if (/^Câu\s*\d+\s*[:.)]?\s*/i.test(trimmed)) return true;
  if (/^\d+(?:\.\d+)*[.)]?\s+/.test(trimmed)) return true;
  return false;
}

function isNumberedTopicHeader(line, nextLine) {
  const trimmed = line.trim();
  if (!/^\d+\.\s+/.test(trimmed)) return false;
  if (!nextLine) return false;
  return /^\d+\.\d+\s+/.test(nextLine.trim());
}

function getTopicName(line) {
  const trimmed = line.trim();
  const match = trimmed.match(/^(?:Chủ đề|Phần)\s*\d+(?:[\s–—-]*\d+)?[\s:.\-–—]*(.+)$/i);
  if (match && match[1]) {
    return match[1].replace(/^[:.\-–—\s]+/, '').trim();
  }
  const numberedHeader = trimmed.match(/^\d+(?:\.\d+)*[.)]?\s*(.+)$/);
  if (numberedHeader && numberedHeader[1]) {
    return numberedHeader[1].trim();
  }
  return trimmed;
}

function getQuestionText(line) {
  const trimmed = line.trim();
  const match = trimmed.match(/^Câu\s*\d+\s*[:.)]?\s*(.+)$/i);
  if (match && match[1]) return match[1].trim();
  const numericQuestion = trimmed.match(/^\d+(?:\.\d+)*[.)]?\s+(.+)$/);
  if (numericQuestion && numericQuestion[1]) return numericQuestion[1].trim();
  return trimmed;
}

/**
 * Kiểm tra dòng có kết thúc bằng ĐÚNG 1 dấu cách hay không (không phải 0, không phải 2+).
 * Đây là cách phân biệt đáp án đúng (1 dấu cách đánh dấu) với lỗi gõ thừa nhiều dấu cách.
 */
function hasSingleTrailingSpace(rawLine) {
  return /[^\s] $/.test(rawLine);
}

function getOptionData(line) {
  const raw = line.replace(/\r?\n$/, '');
  const match = raw.match(/^([A-Da-d])\.\s?(.*)$/);
  if (!match) return null;
  const optionKey = match[1].toUpperCase();
  const optionText = match[2];
  const correct = hasSingleTrailingSpace(raw);
  return { key: optionKey, value: optionText.trim(), correct };
}

function parseFileName(fileName) {
  const match = fileName.match(/^(C\d+)(?:[_-].+)?\.txt$/i);
  if (!match) return null;
  return {
    id: match[1].toUpperCase(),
    name: DEFAULT_CHAPTER_NAMES[match[1].toUpperCase()] || fileName.replace(/^(C\d+)[_-]?/, '').replace(/\.txt$/i, '').replace(/[_-]+/g, ' ')
  };
}

function buildQuestionId(chapterId, topicIndex, questionIndex) {
  return `${chapterId}_T${topicIndex + 1}_Q${questionIndex + 1}`;
}

function createSampleChapter(chapterId, chapterName) {
  return {
    chapterId,
    chapterName,
    topics: [
      {
        topicId: `${chapterId}_T1`,
        topicName: 'Sample Topic',
        questions: [
          {
            id: buildQuestionId(chapterId, 0, 0),
            question: 'Sample question?',
            options: { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' },
            correctAnswer: 'A'
          }
        ]
      }
    ]
  };
}

function parseFile(filePath, chapterId, chapterName) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split(/\r?\n/).map(normalizeLine);

  const topics = [];
  let currentTopic = null;
  let currentQuestion = null;
  let questionCount = 0;

  const pushPending = () => {
    if (currentQuestion && currentTopic) {
      currentTopic.questions.push(currentQuestion);
      currentQuestion = null;
    }
  };

  const startNewTopic = (name) => {
    pushPending();
    if (currentTopic) topics.push(currentTopic);
    currentTopic = { topicId: `${chapterId}_T${topics.length + 1}`, topicName: name, questions: [] };
    questionCount = 0;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 1) Dòng đáp án tường minh "Đáp án: x" — kiểm tra trước tiên
    const explicitAnswer = getExplicitAnswer(line);
    if (explicitAnswer) {
      if (currentQuestion) currentQuestion.correctAnswer = explicitAnswer;
      continue;
    }

    // 2) Dòng đáp án A/B/C/D hoặc a/b/c/d
    if (isOptionLine(line) && currentQuestion) {
      const optionData = getOptionData(line);
      if (optionData) {
        currentQuestion.options[optionData.key] = optionData.value;
        if (optionData.correct) {
          currentQuestion.correctAnswer = optionData.key;
        }
      }
      continue;
    }

    const nextLine = getNextNonEmptyLine(lines, i);

    // 3) Dòng tiêu đề chủ đề dạng số "1. Table Partitioning" — nhận diện trước
    //    vì dòng này không phải câu hỏi.
    if (isNumberedTopicHeader(line, nextLine)) {
      startNewTopic(getTopicName(line));
      continue;
    }

    // 4) Dòng câu hỏi "Câu N:" hoặc "N. ..."
    if (isQuestionLine(line)) {
      pushPending();
      if (!currentTopic) {
        currentTopic = { topicId: `${chapterId}_T${topics.length + 1}`, topicName: 'General', questions: [] };
        questionCount = 0;
      }
      questionCount += 1;
      currentQuestion = {
        id: `${chapterId}_T${topics.length + 1}_Q${questionCount}`,
        question: getQuestionText(line),
        options: {},
        correctAnswer: null
      };
      continue;
    }

    // 5) Dòng tiêu đề chủ đề tường minh "Chủ đề N:" / "Phần N:"
    if (isExplicitTopicHeader(line)) {
      startNewTopic(getTopicName(line));
      continue;
    }

    // 6) Tiêu đề chủ đề tự do (không tiền tố) — nhận diện bằng cách xem dòng
    //    kế tiếp có phải câu hỏi hay không (vd "Transparent Data Encryption (TDE)")
    if (nextLine && isQuestionLine(nextLine) && trimmed.length < 100) {
      startNewTopic(trimmed);
      continue;
    }

    // 6) Dòng lạ khác (rác, dòng trống thừa...) — bỏ qua
  }

  pushPending();
  if (currentTopic) topics.push(currentTopic);

  const cleanedTopics = topics.map((topic, topicIndex) => ({
    topicId: `${chapterId}_T${topicIndex + 1}`,
    topicName: topic.topicName,
    questions: topic.questions.map((question, questionIndex) => ({
      id: buildQuestionId(chapterId, topicIndex, questionIndex),
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer
    }))
  })).filter((topic) => topic.questions.length > 0);

  const questionCountTotal = cleanedTopics.reduce((sum, topic) => sum + topic.questions.length, 0);
  if (questionCountTotal === 0) {
    return createSampleChapter(chapterId, chapterName);
  }

  return {
    chapterId,
    chapterName,
    topics: cleanedTopics
  };
}

function buildManifestFromExistingJson(dataDir) {
  const manifest = {
    chapters: [],
    totalQuestions: 0,
    totalTopics: 0,
    generatedAt: new Date().toISOString()
  };

  if (!fs.existsSync(dataDir)) return manifest;

  const jsonFiles = fs.readdirSync(dataDir)
    .filter((file) => file.toLowerCase().endsWith('.json') && file.toLowerCase() !== 'manifest.json')
    .sort();

  jsonFiles.forEach((file) => {
    const filePath = path.join(dataDir, file);
    try {
      const chapterData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const questionCount = (chapterData.topics || []).reduce((sum, topic) => sum + (topic.questions ? topic.questions.length : 0), 0);
      manifest.chapters.push({
        chapterId: chapterData.chapterId || file.replace(/\.json$/i, ''),
        chapterName: chapterData.chapterName || file.replace(/\.json$/i, ''),
        topicCount: chapterData.topics ? chapterData.topics.length : 0,
        questionCount
      });
      manifest.totalQuestions += questionCount;
      manifest.totalTopics += chapterData.topics ? chapterData.topics.length : 0;
    } catch (err) {
      console.warn(`⚠️ Bỏ qua file JSON không đọc được: ${file}`, err.message);
    }
  });

  return manifest;
}

function runParser(rootDir = DEFAULT_ROOT_DIR) {
  const { dataRawDir, dataDir } = getProjectPaths(rootDir);
  ensureDataDir(dataDir);

  console.log('=== DBMS Quiz Data Parser ===\n');

  if (!fs.existsSync(dataRawDir)) {
    console.log('⚠️ Thư mục data-raw không tồn tại. Đang dùng dữ liệu JSON hiện có trong data/ nếu có.');
    const manifest = buildManifestFromExistingJson(dataDir);
    const manifestPath = path.join(dataDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log('=== Kết quả ===');
    console.log(`📊 Tổng: ${manifest.chapters.length} chương, ${manifest.totalTopics} chủ đề, ${manifest.totalQuestions} câu hỏi`);
    console.log(`📋 Manifest: ${manifestPath}`);
    console.log('\n✅ Hoàn thành!');
    return { status: 'ok', manifest, dataRawDir, dataDir };
  }

  const files = fs.readdirSync(dataRawDir)
    .filter((file) => file.toLowerCase().endsWith('.txt'))
    .sort();

  if (files.length === 0) {
    console.log('Không tìm thấy file .txt nào trong data-raw/');
    const manifest = buildManifestFromExistingJson(dataDir);
    const manifestPath = path.join(dataDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log('=== Kết quả ===');
    console.log(`📊 Tổng: ${manifest.chapters.length} chương, ${manifest.totalTopics} chủ đề, ${manifest.totalQuestions} câu hỏi`);
    console.log(`📋 Manifest: ${manifestPath}`);
    console.log('\n✅ Hoàn thành!');
    return { status: 'ok', manifest, dataRawDir, dataDir };
  }

  const manifest = {
    chapters: [],
    totalQuestions: 0,
    totalTopics: 0,
    generatedAt: new Date().toISOString()
  };

  for (const file of files) {
    const filePath = path.join(dataRawDir, file);
    const fileInfo = parseFileName(file);
    if (!fileInfo) {
      console.log(`Bỏ qua file không đúng format: ${file}`);
      continue;
    }

    console.log(`📄 Parsing: ${file}`);
    console.log(`   Chapter: ${fileInfo.id} - ${fileInfo.name}`);

    const chapterData = parseFile(filePath, fileInfo.id, fileInfo.name);
    const outputPath = path.join(dataDir, `${fileInfo.id}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(chapterData, null, 2), 'utf-8');

    const questionCount = chapterData.topics.reduce((sum, topic) => sum + topic.questions.length, 0);
    const noAnswerCount = chapterData.topics.reduce(
      (sum, topic) => sum + topic.questions.filter((q) => !q.correctAnswer).length,
      0
    );
    manifest.chapters.push({
      chapterId: chapterData.chapterId,
      chapterName: chapterData.chapterName,
      topicCount: chapterData.topics.length,
      questionCount
    });
    manifest.totalQuestions += questionCount;
    manifest.totalTopics += chapterData.topics.length;

    console.log(`   ✅ ${chapterData.topics.length} chủ đề, ${questionCount} câu hỏi`);
    if (noAnswerCount > 0) {
      console.log(`   ⚠️  ${noAnswerCount} câu KHÔNG xác định được đáp án đúng (thiếu dấu cách/"Đáp án:" trong file gốc)`);
    }
    console.log(`   💾 Đã lưu: ${outputPath}\n`);
  }

  const manifestPath = path.join(dataDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log('=== Kết quả ===');
  console.log(`📊 Tổng: ${manifest.chapters.length} chương, ${manifest.totalTopics} chủ đề, ${manifest.totalQuestions} câu hỏi`);
  console.log(`📋 Manifest: ${manifestPath}`);
  console.log('\n✅ Hoàn thành!');
  return { status: 'ok', manifest, dataRawDir, dataDir };
}

function main() {
  return runParser();
}

if (require.main === module) {
  main();
}

module.exports = {
  runParser,
  parseFileName,
  parseFile,
  createSampleChapter,
  normalizeLine,
  getOptionData,
  getTopicName,
  getQuestionText,
  isTopicHeader,
  isQuestionLine,
  isOptionLine,
  getExplicitAnswer,
  hasSingleTrailingSpace
};
