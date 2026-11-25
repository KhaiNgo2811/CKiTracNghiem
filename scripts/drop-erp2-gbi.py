# -*- coding: utf-8 -*-
"""Bỏ các câu chỉ hỏi tham số của công ty mẫu GBI; câu hỏi khái niệm thì viết lại cho tổng quát.
Chạy lại được nhiều lần (chạy lại sau khi sinh lại ERP2_C1..C5)."""
import json

BASE = 'data/ERP2/'
DROP = {'ERP2_C1_T2_Q8', 'ERP2_C1_T2_Q9', 'ERP2_C1_T4_Q3', 'ERP2_C2_T1_Q17', 'ERP2_C2_T4_Q6', 'ERP2_C2_T5_Q12',
        'ERP2_C2_T6_Q10', 'ERP2_C4_T2_Q5', 'ERP2_C4_T2_Q16', 'ERP2_C5_T3_Q17'}
REWORD = {
    'ERP2_C1_T2_Q5': 'Which enterprise structure element represents the whole enterprise?',
    'ERP2_C2_T6_Q8': 'An employee tries to post a document that exceeds the limit of their tolerance group. What happens?',
    'ERP2_C4_T4_Q15': 'If all plants use the same valuation grouping code, what must be true of the company codes?',
}

with open(BASE + 'manifest.json', encoding='utf-8-sig') as f:
    manifest = json.load(f)
removed = 0
for meta in manifest['chapters']:
    path = BASE + meta['chapterId'] + '.json'
    with open(path, 'rb') as f:
        raw = f.read()
    chapter = json.loads(raw.decode('utf-8-sig'))
    changed = False
    for topic in chapter['topics']:
        keep = [q for q in topic['questions'] if q['id'] not in DROP]
        removed += len(topic['questions']) - len(keep)
        changed |= len(keep) != len(topic['questions'])
        topic['questions'] = keep
        for q in keep:
            if q['id'] in REWORD and q['question'] != REWORD[q['id']]:
                print(q['id'], '|', q['question'], '=>', REWORD[q['id']])
                q['question'] = REWORD[q['id']]
                changed = True
    if changed:
        with open(path, 'w', encoding='utf-8', newline='\r\n' if b'\r\n' in raw else '\n') as f:
            json.dump(chapter, f, ensure_ascii=False, indent=2)
    meta['questionCount'] = sum(len(t['questions']) for t in chapter['topics'])
manifest['totalQuestions'] = sum(c['questionCount'] for c in manifest['chapters'])
with open(BASE + 'manifest.json', 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)
print('removed', removed, '| total', manifest['totalQuestions'])
