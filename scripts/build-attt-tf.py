"""Chuyển câu Đúng/Sai ATTT thành trắc nghiệm 4 đáp án (A-D).
- ATTT_C1/C3/C5/C6/C7: thay Phần II (đúng/sai) bằng câu 4 đáp án (giữ explanation).
- ATTT_BO: thêm lại 52 câu đúng/sai đã chuyển thành 4 đáp án.
Dữ liệu câu hỏi: scripts/attt_tf_mcq_data.py. Chạy: python scripts/build-attt-tf.py"""
import json, os, re, sys, zlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import attt_tf_mcq_data as D

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR = os.path.join(ROOT, 'data', 'ATTT')

def load(n): return json.load(open(os.path.join(DIR, n), encoding='utf8'))
def save(n, d): json.dump(d, open(os.path.join(DIR, n), 'w', encoding='utf8'), ensure_ascii=False, indent=2)

def make(qid, item, explanation=None):
    stem, correct, *wrong = item
    assert len(wrong) == 3 and correct not in wrong, qid
    pos = zlib.crc32(qid.encode()) % 4          # vị trí đáp án đúng, cố định theo id
    texts = wrong[:pos] + [correct] + wrong[pos:]
    q = {'id': qid, 'question': stem, 'options': dict(zip('ABCD', texts)), 'correctAnswer': 'ABCD'[pos]}
    if explanation: q['explanation'] = explanation
    return q

# 1) các chương
for n in (1, 3, 5, 6, 7):
    f = f'ATTT_C{n}.json'; d = load(f); data = getattr(D, f'C{n}')
    t = d['topics'][1]
    new = []
    for q in t['questions']:
        k = int(q['id'].rsplit('_Q', 1)[1])
        new.append(make(q['id'], data[k], q.get('explanation')))
    assert len(new) == len(data) == 20
    t['questions'] = new; t['topicName'] = 'Phần II – Khái niệm & nhận định'
    save(f, d)

# 2) bộ đề ôn tập: thêm lại câu đúng/sai
RANGES = [(35, 42), (64, 69), (91, 96), (132, 139), (165, 172), (201, 208), (247, 254)]
d = load('ATTT_BO.json')
for i, (a, b) in enumerate(RANGES):
    t = d['topics'][i]
    have = {int(q['id'].rsplit('_Q', 1)[1]) for q in t['questions']}
    for n in range(a, b + 1):
        if n not in have:
            t['questions'].append(make(f"{t['topicId']}_Q{n}", D.BO[n]))
    t['questions'].sort(key=lambda q: int(q['id'].rsplit('_Q', 1)[1]))
save('ATTT_BO.json', d)

# 3) manifest
m = load('manifest.json')
for c in m['chapters']:
    if c['chapterId'] == 'ATTT_BO':
        c['questionCount'] = sum(len(t['questions']) for t in d['topics'])
m['totalQuestions'] = sum(c['questionCount'] for c in m['chapters'])
save('manifest.json', m)
print('BO:', sum(len(t['questions']) for t in d['topics']), '| total:', m['totalQuestions'])
