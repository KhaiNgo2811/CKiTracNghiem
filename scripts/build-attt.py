"""Chuyển 3 đề ATTT (docx trong data/ATTT) -> data/ATTT/*.json + manifest.json.
Chạy: python scripts/build-attt.py
Đáp án đề 45 câu lấy từ bảng đáp án trong file; đề 40 câu & mã 357 không có đáp án nên tự giải (KEYS)."""
import zipfile, re, json, html, os, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'data', 'ATTT')

def paras(fn):
    x = zipfile.ZipFile(os.path.join(D, fn)).read('word/document.xml').decode('utf8')
    return [html.unescape(''.join(re.findall(r'<w:t[^>]*>(.*?)</w:t>', p, re.S))).strip()
            for p in re.findall(r'<w:p[ >].*?</w:p>', x, re.S)]

def parse(fn):
    qs, cur, tail = [], None, []
    for t in paras(fn):
        m = re.match(r'Câu (\d+)\.\s*(.*)', t)
        o = re.match(r'([A-D])\.\s*(.*)', t)
        if m: cur = {'n': int(m[1]), 'question': m[2], 'options': {}}; qs.append(cur); tail = []
        elif o and cur is not None and o[1] not in cur['options'] and len(cur['options']) < 4: cur['options'][o[1]] = o[2]
        elif cur is not None and t: tail.append(t)
    return qs, tail

K40 = "ADDDDCBADC" "DBDACBBDDD" "CDDCDAADDB" "ABBDBBCBBA"
K357 = "DBCAABCACD" "BBBCCDBBAD" "ABDCBDBACA" "CBABACDBCB" "BCCDCDADBB"

EXAMS = [
  ('ATTT_D45', 'De_An_toan_thong_tin_45cau_VN.docx', 'Đề An toàn thông tin – 45 câu', None),
  ('ATTT_D40', 'De_An_toan_thong_tin_40cau.docx', 'Đề An toàn thông tin – 40 câu (đáp án tự giải)', K40),
  ('ATTT_357', 'De_ATBM_TMDT_2022_ma357_VN.docx', 'Đề ATBM Thương mại điện tử 2022 – Mã 357 (đáp án tự giải)', K357),
]
chapters = []
for cid, fn, name, key in EXAMS:
    qs, tail = parse(fn)
    if key is None:  # đáp án nằm cuối file: "1-D 2-B ..."
        km = {int(a): b for a, b in re.findall(r'(\d+)-([A-D])', ' '.join(tail))}
    else:
        km = {i + 1: c for i, c in enumerate(key)}
    passage = ''
    if cid == 'ATTT_357':  # đoạn bài tập dùng chung cho câu 46-50
        i = next(i for i, t in enumerate(tail) if t.startswith('Bài tập'))
        end = next(i2 for i2, t in enumerate(tail) if t.startswith('TRƯỞNG BỘ MÔN'))
        passage = '<br>'.join(tail[i:end]) + '<br><br>'
    out = []
    for q in qs:
        assert len(q['options']) == 4 and q['n'] in km, (cid, q['n'])
        text = q['question']
        if cid == 'ATTT_357' and q['n'] >= 46:
            text = passage + text
        out.append({'id': f"{cid}_T1_Q{q['n']}", 'question': text, 'options': q['options'], 'correctAnswer': km[q['n']]})
    assert [q['n'] for q in qs] == list(range(1, len(qs) + 1)) and len(km) >= len(qs)
    data = {'chapterId': cid, 'chapterName': name,
            'topics': [{'topicId': f'{cid}_T1', 'topicName': 'Toàn bộ đề', 'questions': out}]}
    json.dump(data, open(os.path.join(D, cid + '.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=2)
    chapters.append({'chapterId': cid, 'chapterName': name, 'topicCount': 1, 'questionCount': len(out)})
    print(cid, len(out))
json.dump({'chapters': chapters, 'totalQuestions': sum(c['questionCount'] for c in chapters), 'totalTopics': len(chapters),
           'generatedAt': datetime.datetime.utcnow().isoformat() + 'Z'},
          open(os.path.join(D, 'manifest.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=2)

# đăng ký môn
sp = os.path.join(ROOT, 'data', 'subjects.json')
s = json.load(open(sp, encoding='utf8'))
if not any(x['id'] == 'ATTT' for x in s['subjects']):
    s['subjects'].append({'id': 'ATTT', 'name': 'An toàn thông tin', 'biIcon': 'shield-lock-fill', 'folder': 'ATTT',
                          'description': 'Mật mã, kiểm soát truy cập, quản lý rủi ro (ALE/SLE), ATBM TMĐT'})
    json.dump(s, open(sp, 'w', encoding='utf8'), ensure_ascii=False, indent=2)
