# -*- coding: utf-8 -*-
"""Nạp Module_Quizz.docx (NT_C2) và QuizzCuoiChuong.docx (NT_C3) vào data/Nền tảng/ (đọc kết quả của parse-nt-quiz.py)."""
import json
import re
import sys

D = 'data/Nền tảng/'
L = 'ABCD'
data = json.load(open('scripts/nt_parsed.json', encoding='utf-8'))


def clean_name(n, quiz=False):
    n = re.sub(r'\s+', ' ', n).strip()
    if quiz:
        n = re.sub(r'^QUIZ\s*MODULE\s*(\d+)\s*[:：]?\s*', r'Quiz Module \1 – ', n, flags=re.I)
    else:
        n = re.sub(r'^MODULE\s*(\d+)\s*[:：]?\s*', r'Module \1 – ', n, flags=re.I)
    return n


def check(qid, q, opts, ans):
    assert len(opts) == 4 and all(o.strip() for o in opts), (qid, opts)
    assert len(set(opts)) == 4, ('duplicate options', qid, opts)
    assert 0 <= ans < 4, (qid, ans)


# ---- Module_Quizz -> NT_C2 (đáp án đúng 3.4 không được đánh dấu trong file: tầng OSI = 7)
MANUAL = {'3.4': 2}
topics2 = []
for mi, m in enumerate(data['module'], 1):
    qs = []
    for k, q in enumerate(m['questions'], 1):
        qid = f'NT_C2_T{mi}_Q{k}'
        ans = q['correct'] if q['correct'] is not None else MANUAL[q['num']]
        check(qid, q, q['options'], ans)
        expl = q['expl'] or ''
        if q['notes']:
            note = 'Các đáp án còn lại: ' + '; '.join(q['notes'])
            expl = (expl + ' ' if expl else '') + note
        qs.append({'id': qid, 'question': q['q'], 'options': {L[i]: q['options'][i] for i in range(4)},
                   'correctAnswer': L[ans], 'explanation': expl.strip()})
    topics2.append({'topicId': f'NT_C2_T{mi}', 'topicName': clean_name(m['name']), 'questions': qs})

# ---- QuizzCuoiChuong -> NT_C3
topics3 = []
for mi, m in enumerate(data['quiz'], 1):
    qs = []
    for k, q in enumerate(m['questions'], 1):
        qid = f'NT_C3_T{mi}_Q{k}'
        ans = 'abcd'.index(q['ans'])
        check(qid, q, q['options'], ans)
        expl = q['expl'] or ''
        if q.get('lms'):
            expl = f'(Đáp án theo LMS: {q["lms"].upper()}; gợi ý của AI: {q["ai"].upper()}.) ' + expl
        qs.append({'id': qid, 'question': q['q'], 'options': {L[i]: q['options'][i] for i in range(4)},
                   'correctAnswer': L[ans], 'explanation': expl.strip()})
    topics3.append({'topicId': f'NT_C3_T{mi}', 'topicName': clean_name(m['name'], True), 'questions': qs})

c2 = {'chapterId': 'NT_C2', 'chapterName': 'Module Quiz – câu hỏi cuối bài', 'topics': topics2}
c3 = {'chapterId': 'NT_C3', 'chapterName': 'Quiz cuối chương', 'topics': topics3}
for c in (c2, c3):
    json.dump(c, open(f'{D}{c["chapterId"]}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

man = json.load(open(D + 'manifest.json', encoding='utf-8'))
man['chapters'] = [c for c in man['chapters'] if c['chapterId'] not in ('NT_C2', 'NT_C3')]
for c in (c2, c3):
    man['chapters'].append({'chapterId': c['chapterId'], 'chapterName': c['chapterName'], 'topicCount': len(c['topics']),
                            'questionCount': sum(len(t['questions']) for t in c['topics'])})
man['totalQuestions'] = sum(c['questionCount'] for c in man['chapters'])
man['totalTopics'] = sum(c['topicCount'] for c in man['chapters'])
json.dump(man, open(D + 'manifest.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print([(c['chapterId'], c['topicCount'], c['questionCount']) for c in man['chapters']], 'total', man['totalQuestions'], file=sys.stderr)
