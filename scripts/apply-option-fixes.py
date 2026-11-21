# -*- coding: utf-8 -*-
"""Áp dụng bản vá lựa chọn (cân bằng độ dài đáp án) vào các file chương.
Dùng: python scripts/apply-option-fixes.py <thư mục môn> <patch.json> [patch2.json ...]
Patch: { "<id câu>": { "A": "...", "B": "..." } }  -- chỉ ghi đè các lựa chọn được liệt kê, giữ nguyên đáp án đúng (chữ cái) và giải thích."""
import glob
import json
import os
import sys

folder = sys.argv[1]
patch = {}
for p in sys.argv[2:]:
    patch.update(json.load(open(p, encoding='utf-8')))
applied = set()
for f in sorted(glob.glob(os.path.join(folder, '*.json'))):
    if os.path.basename(f) in ('manifest.json', 'exam.json'):
        continue
    raw = open(f, 'rb').read()
    bom = raw.startswith(b'\xef\xbb\xbf')
    d = json.loads(raw.decode('utf-8-sig'))
    if 'topics' not in d:
        continue
    changed = False
    for t in d['topics']:
        for q in t['questions']:
            if q['id'] in patch:
                for k, v in patch[q['id']].items():
                    assert k in q['options'], (q['id'], k)
                    assert v.strip(), (q['id'], k)
                    if q['options'][k] != v:
                        q['options'][k] = v
                        changed = True
                assert len(set(q['options'].values())) == len(q['options']), ('duplicate options', q['id'])
                applied.add(q['id'])
    if changed:
        txt = json.dumps(d, ensure_ascii=False, indent=2)
        open(f, 'wb').write((b'\xef\xbb\xbf' if bom else b'') + txt.encode('utf-8'))
missing = set(patch) - applied
print('applied', len(applied), 'missing', sorted(missing))
