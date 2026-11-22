# -*- coding: utf-8 -*-
"""Sinh data/ERP2/*.json từ scripts/erp2/ch*.py (câu hỏi tiếng Anh sinh từ giáo trình
'Business Process Configuration with SAP ERP')."""
import importlib
import json
import sys
import zlib
from collections import Counter

sys.path.insert(0, 'scripts/erp2')
OUT = 'data/ERP2/'
LETTERS = 'ABCD'
MODULES = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ts_ps', 'ts_eam', 'ts_fico', 'ts_mm', 'ts_sd']

chapters = []
seen_q = set()
pos_counter = Counter()
longest = total = 0
for name in MODULES:
    m = importlib.import_module(name)
    topics = []
    for ti, (tname, items) in enumerate(m.TOPICS, 1):
        qs = []
        k = 0
        for (q, right, wrongs, expl) in items:
            k += 1
            assert len(wrongs) == 3 and len({right, *wrongs}) == 4, (m.CHAPTER_ID, q)
            if q in seen_q:
                print('SKIP duplicate:', m.CHAPTER_ID, q, file=sys.stderr)
                continue
            seen_q.add(q)
            qid = f'{m.CHAPTER_ID}_T{ti}_Q{k}'
            pos = zlib.crc32(qid.encode()) % 4
            opts = list(wrongs)
            opts.insert(pos, right)
            pos_counter[LETTERS[pos]] += 1
            lens = [len(x) for x in opts]
            total += 1
            if lens[pos] == max(lens) and lens.count(max(lens)) == 1:
                longest += 1
            qs.append({'id': qid, 'question': q, 'options': {LETTERS[i]: opts[i] for i in range(4)},
                       'correctAnswer': LETTERS[pos], 'explanation': expl})
        topics.append({'topicId': f'{m.CHAPTER_ID}_T{ti}', 'topicName': tname, 'questions': qs})
    data = {'chapterId': m.CHAPTER_ID, 'chapterName': m.CHAPTER_NAME, 'topics': topics}
    json.dump(data, open(f'{OUT}{m.CHAPTER_ID}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    chapters.append({'chapterId': m.CHAPTER_ID, 'chapterName': m.CHAPTER_NAME, 'topicCount': len(topics),
                     'questionCount': sum(len(t['questions']) for t in topics)})

manifest = {'chapters': chapters, 'totalQuestions': sum(c['questionCount'] for c in chapters),
            'totalTopics': sum(c['topicCount'] for c in chapters)}
json.dump(manifest, open(OUT + 'manifest.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(manifest['totalQuestions'], 'questions;', dict(pos_counter), '| correct is longest:', f'{longest}/{total}', file=sys.stderr)
