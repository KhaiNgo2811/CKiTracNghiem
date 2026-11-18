"""Gộp giải thích từ scripts/explanations/<tiền tố>_*.json vào data/<môn>/*.json
Tiền tố: attt_ -> data/ATTT ; nk_ -> data/Nhà kho.  Dạng file: {"<id câu hỏi>": "giải thích"}.
Chạy: python scripts/apply-explanations.py"""
import json, os, glob
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SUBJ = {'attt_': 'ATTT', 'nk_': 'Nhà kho'}
for pre, sub in SUBJ.items():
    exp = {}
    for f in sorted(glob.glob(os.path.join(ROOT, 'scripts', 'explanations', pre + '*.json'))):
        exp.update(json.load(open(f, encoding='utf8')))
    if not exp: continue
    used = set(); total = 0
    for f in glob.glob(os.path.join(ROOT, 'data', sub, '*.json')):
        raw = open(f, encoding='utf-8-sig').read(); d = json.loads(raw)
        if 'topics' not in d: continue
        ch = False
        for t in d['topics']:
            for q in t['questions']:
                total += 1
                if q['id'] in exp:
                    used.add(q['id'])
                    if q.get('explanation') != exp[q['id']]: q['explanation'] = exp[q['id']]; ch = True
        if ch: json.dump(d, open(f, 'w', encoding='utf8'), ensure_ascii=False, indent=2)
    missing = set(exp) - used
    print(sub, 'applied', len(used), 'of', len(exp), 'unknown ids:', sorted(missing)[:5])
