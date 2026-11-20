# -*- coding: utf-8 -*-
"""Sinh data/Nhà kho/exam.json: cấu trúc đề thi thử theo đề năm ngoái (49 câu + 1 câu thế chỗ câu 35 từ gợi ý của thầy).
Mỗi vị trí (slot) có một danh sách câu cùng dạng: câu gốc năm ngoái + các câu biến thể tương tự; khi thi sẽ rút ngẫu nhiên 1 câu / slot."""
import json
import re
import sys
import unicodedata

D = 'data/Nhà kho/'


def load(f):
    return json.load(open(D + f, encoding='utf-8-sig'))


def norm_tokens(t):
    t = unicodedata.normalize('NFD', str(t).lower())
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn').replace('đ', 'd')
    return set(re.findall(r'[a-z0-9_]{2,}', t))


def text_of(q):
    return f"{q['question']} {q['options'].get(q['correctAnswer'], '')} {q.get('explanation', '')}"


hot = {q['id']: q for t in load('HOT.json')['topics'] for q in t['questions']}
c5 = {q['id']: q for t in load('C5.json')['topics'] for q in t['questions']}
cd = load('CD.json')['topics']
variants = {}   # id -> (topicName, question)
for t in cd:
    if t['topicName'].split('. ', 1)[-1].startswith('Biến thể'):
        for q in t['questions']:
            variants[q['id']] = (t['topicName'], q)

GROUPS = [  # (các số câu năm ngoái, từ khóa tên chủ đề biến thể được phép lấy)
    (list(range(1, 16)), ['Kiến trúc']),
    ([16, 19, 20], ['Entropy']),
    ([17, 18, 21, 22, 23, 24, 25], ['Chuẩn hóa', 'Tiền xử lý']),
    ([26], ['SMA']),
    ([27, 28, 29, 30, 34], ['Association Rules', 'Tiền xử lý']),
    ([31, 32, 33], ['FP-Growth']),
    ([36, 37, 48, 49, 50], ['PageRank', 'Graph, Blockchain']),
    ([38, 39], ['CPT']),
    (list(range(40, 48)), ['Graph, Blockchain']),
]
CALC = re.compile(r'bao nhiêu|giá trị|xấp xỉ|tính|bằng|khoảng nào|chuẩn hóa thành|thứ tự|tập phổ biến|điểm|cao nhất|thấp nhất|itemset|số ', re.I)


def is_exercise(q):
    t = q['question']
    return bool(re.search(r'\d', t) and CALC.search(t) and 'thường' not in t) or bool(re.search(r'thứ tự (thăm|duyệt)', t)) or bool(re.search(r'CPT\+?|Prediction Tree|Inverted Index', t) and re.search(r'điểm|dự đoán|Dự đoán|đuôi|chuỗi nào|bao nhiêu', t))


EXERCISE = {16, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33, 36, 37, 38, 35}
K = 4
slots = []
for nums, keys in GROUPS:
    allowed_all = [(i, q) for i, (tn, q) in variants.items() if any(k in tn for k in keys)]
    for n in nums:
        qid = f'HOT_Q{n}'
        if qid not in hot:
            continue
        base = hot[qid]
        want_ex = n in EXERCISE
        allowed = allowed_all if n in (19, 20, 22, 31) else [(i, q) for i, q in allowed_all if is_exercise(q) == want_ex]
        bt = norm_tokens(text_of(base))
        scored = []
        for i, q in allowed:
            tk = norm_tokens(text_of(q))
            inter = len(bt & tk)
            j = inter / max(1, len(bt | tk))
            if i != qid:
                scored.append((j, i))
        scored.sort(reverse=True)
        strong = [x for x in scored if x[0] >= 0.18]
        scored = strong if len(strong) >= 2 else [x for x in scored if x[0] >= 0.08][:2]
        pool = [qid] + [i for _, i in scored[:K]]
        slots.append({'no': n, 'type': 'exercise' if n in EXERCISE else 'theory', 'pool': pool})

# Câu 35 (không có trong dữ liệu đề năm ngoái) -> thay bằng 2 mục gợi ý thầy mà đề năm ngoái không hỏi: Lift và Support {c,d,b}
extra = ['C5_T1_Q16', 'C5_T1_Q18']
for i, (tn, q) in variants.items():
    if 'Với luật L: {c} → {d,e}, Lift(L)' in q['question'] or 'Độ hỗ trợ (Support) của itemset {c,d,b}' in q['question']:
        extra.append(i)
assert all(e in c5 or e in variants for e in extra), extra
slots.append({'no': 35, 'type': 'exercise', 'pool': extra})
slots.sort(key=lambda s: s['no'])

ex = sum(1 for s in slots if s['type'] == 'exercise')
data = {
    'title': 'Thi thử theo cấu trúc đề năm ngoái',
    'description': (f'Đề {len(slots)} câu, làm trong 60 phút, theo cấu trúc đề năm ngoái (khoảng {len(slots) - ex} lý thuyết + {ex} bài tập) và bám 40 mục gợi ý của thầy. '
                    'Câu 1–15: kiến trúc & pipeline; câu 16–35: tiền xử lý & khai phá dữ liệu; câu 36–50: PageRank, CPT, Graph, Blockchain, Vector, AI Act & BI. '
                    'Mỗi vị trí được rút ngẫu nhiên từ các câu cùng dạng. Không có nút kiểm tra đáp án; hết giờ bài tự nộp.'),
    'durationMin': 60,
    'slots': slots,
}
json.dump(data, open(D + 'exam.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(slots), 'slots;', ex, 'exercise;', 'pool sizes', sorted({len(s['pool']) for s in slots}), file=sys.stderr)
