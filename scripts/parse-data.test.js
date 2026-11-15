const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { runParser } = require('./parse-data.js');

test('runParser creates a manifest when data-raw is missing but JSON data already exists', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dbms-quiz-'));
  const dataDir = path.join(tempRoot, 'data');
  fs.mkdirSync(dataDir, { recursive: true });

  const chapterData = {
    chapterId: 'C1',
    chapterName: 'Sample Chapter',
    topics: [
      {
        topicId: 'C1_T1',
        topicName: 'Sample Topic',
        questions: [
          {
            id: 'C1_T1_Q1',
            question: 'Sample question?',
            options: { A: 'Option A', B: 'Option B' },
            correctAnswer: 'A'
          }
        ]
      }
    ]
  };

  fs.writeFileSync(path.join(dataDir, 'C1.json'), JSON.stringify(chapterData, null, 2));

  const result = runParser(tempRoot);

  assert.equal(result.status, 'ok');
  assert.ok(fs.existsSync(path.join(dataDir, 'manifest.json')));
  const manifest = JSON.parse(fs.readFileSync(path.join(dataDir, 'manifest.json'), 'utf8'));
  assert.equal(manifest.chapters.length, 1);
  assert.equal(manifest.totalQuestions, 1);
});

test('runParser parses numbered topic headers and sub-questions from raw text', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dbms-quiz-'));
  const dataRawDir = path.join(tempRoot, 'data-raw');
  const dataDir = path.join(tempRoot, 'data');
  fs.mkdirSync(dataRawDir, { recursive: true });
  fs.mkdirSync(dataDir, { recursive: true });

  const rawContent = [
    '1. Table Partitioning',
    '1.1 Question one',
    'A. Option A ',
    'B. Option B',
    '2. Implementing Partitioning',
    '2.1 Question two',
    'A. Option A',
    'B. Option B'
  ].join('\n');

  fs.writeFileSync(path.join(dataRawDir, 'C2.txt'), rawContent, 'utf8');

  const result = runParser(tempRoot);
  assert.equal(result.status, 'ok');

  const chapterData = JSON.parse(fs.readFileSync(path.join(dataDir, 'C2.json'), 'utf8'));
  assert.equal(chapterData.topics.length, 2);
  assert.equal(chapterData.topics[0].questions.length, 1);
  assert.equal(chapterData.topics[1].questions.length, 1);
  assert.equal(chapterData.topics[0].questions[0].question, 'Question one');
  assert.equal(chapterData.topics[1].questions[0].question, 'Question two');
});
