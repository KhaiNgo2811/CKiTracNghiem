# -*- coding: utf-8 -*-
"""Thêm chủ đề Cloud (Module 9, lấy từ NT_C2 và NT_C3) vào NT_C1. Chạy lại an toàn."""
import json
D = 'data/Nền tảng/'
PICK = {'NT_C2': [1, 2, 3, 4, 5, 7, 12, 21, 23, 24, 25], 'NT_C3': [1, 2, 3, 7, 8, 9, 10, 14, 16, 20]}
TID = 'NT_C1_T11'
qs = []
for ch, nums in PICK.items():
    d = json.load(open(f'{D}{ch}.json', encoding='utf-8'))
    byid = {q['id']: q for q in d['topics'][8]['questions']}
    for n in nums:
        q = dict(byid[f'{ch}_T9_Q{n}'])
        q['id'] = f'{TID}_Q{len(qs) + 1}'
        qs.append(q)
p = D + 'NT_C1.json'
c1 = json.load(open(p, encoding='utf-8'))
c1['topics'] = [t for t in c1['topics'] if t['topicId'] != TID]
topic = {'topicId': TID, 'topicName': 'Điện toán đám mây (Module 9)', 'questions': qs}
c1['topics'].insert(len(c1['topics']) - 1, topic)  # đứng trước chủ đề Điền khuyết
json.dump(c1, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
m = json.load(open(D + 'manifest.json', encoding='utf-8'))
for c in m['chapters']:
    if c['chapterId'] == 'NT_C1':
        c['topicCount'] = len(c1['topics'])
        c['questionCount'] = sum(len(t['questions']) for t in c1['topics'])
        print('NT_C1:', c['topicCount'], 'topics,', c['questionCount'], 'questions')
m['totalQuestions'] = sum(c['questionCount'] for c in m['chapters'])
m['totalTopics'] = sum(c['topicCount'] for c in m['chapters'])
json.dump(m, open(D + 'manifest.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('cloud:', len(qs), '| total', m['totalQuestions'])
