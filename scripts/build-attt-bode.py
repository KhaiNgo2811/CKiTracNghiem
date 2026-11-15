"""Bộ đề ôn tập ATBM HTTT (docx, bỏ câu đúng/sai) -> data/ATTT/ATTT_BO.json. Đáp án tự giải (file gốc không có)."""
import zipfile, re, html, json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'data', 'ATTT'); CID = 'ATTT_BO'
CYC = "ADCB" * 10
CHUNKS = [(1, 34, "ADCB"), (43, 63, "CBAD"), (70, 90, "BADC"), (97, 131, "ADCB"),
          (140, 164, "BADC"), (173, 200, "ADCB"), (209, 246, "ADCB")]
KEY = {}
for a, b, s in CHUNKS:
    for n in range(a, b + 1): KEY[n] = s[(n - a) % 4]
x = zipfile.ZipFile(os.path.join(D, 'Bo_de_on_tap_ATBM_HTTT_nhieu_cau.docx')).read('word/document.xml').decode('utf8')
ps = [html.unescape(''.join(re.findall(r'<w:t[^>]*>(.*?)</w:t>', p, re.S))).strip() for p in re.findall(r'<w:p[ >].*?</w:p>', x, re.S)]
topics, qs, sec = [], None, None
for p in filter(None, ps):
    if p.startswith('BÀI '):
        sec = {'topicId': f"{CID}_T{len(topics)+1}", 'topicName': p, 'questions': []}; topics.append(sec); continue
    m, o = re.match(r'Câu (\d+)\.\s*(.*)', p), re.match(r'([A-D])\.\s*(.*)', p)
    if m: qs = {'n': int(m[1]), 'question': m[2], 'options': {}}; sec['questions'].append(qs)
    elif o and qs: qs['options'][o[1]] = o[2]
total = 0
for t in topics:
    keep = []
    for q in t['questions']:
        if len(q['options']) != 4: continue   # bỏ câu đúng/sai
        n = q['n']; assert n in KEY, n
        if n in (239, 240, 241):  # bỏ gợi ý lộ đáp án trong ngoặc
            q['options'] = {k: re.sub(r'\s*\(.*\)$', '', v) for k, v in q['options'].items()}
        keep.append({'id': f"{t['topicId']}_Q{n}", 'question': q['question'], 'options': q['options'], 'correctAnswer': KEY[n]})
    t['questions'] = keep; total += len(keep)
topics = [t for t in topics if t['questions']]
name = 'Bộ đề ôn tập ATBM HTTT (đáp án tự giải)'
json.dump({'chapterId': CID, 'chapterName': name, 'topics': topics}, open(os.path.join(D, CID + '.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=2)
mp = os.path.join(D, 'manifest.json'); man = json.load(open(mp, encoding='utf8'))
man['chapters'] = [c for c in man['chapters'] if c['chapterId'] != CID] + [{'chapterId': CID, 'chapterName': name, 'topicCount': len(topics), 'questionCount': total}]
man['totalQuestions'] = sum(c['questionCount'] for c in man['chapters']); man['totalTopics'] = sum(c['topicCount'] for c in man['chapters'])
json.dump(man, open(mp, 'w', encoding='utf8'), ensure_ascii=False, indent=2)
print(total, [(t['topicName'][:12], len(t['questions'])) for t in topics])
