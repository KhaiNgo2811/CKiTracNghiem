"""Chuyển các file Chuong_N_Ngan_hang_cau_hoi_VN.docx (data/ATTT) -> ATTT_C<N>.json và cập nhật manifest.
Chạy: python scripts/build-attt-chapters.py"""
import zipfile, re, json, html, os, glob
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'data', 'ATTT')
NAMES = {1: 'Chương 1', 3: 'Chương 3', 5: 'Chương 5', 6: 'Chương 6', 7: 'Chương 7'}

def paras(path):
    x = zipfile.ZipFile(path).read('word/document.xml').decode('utf8')
    ps = [html.unescape(''.join(re.findall(r'<w:t[^>]*>(.*?)</w:t>', p, re.S))).strip()
          for p in re.findall(r'<w:p[ >].*?</w:p>', x, re.S)]
    return [p for p in ps if p]

def parse(path, cid):
    part, cur, qs = 1, None, {1: [], 2: []}
    for t in paras(path):
        if t.startswith('PHẦN II'): part = 2; continue
        m, o = re.match(r'Câu (\d+)\.\s*(.*)', t), re.match(r'([A-D])\.\s*(.*)', t)
        if m: cur = {'n': int(m[1]), 'question': m[2], 'options': {}}; qs[part].append(cur)
        elif t.startswith('Đáp án:'): cur['ans'] = t[7:].strip()
        elif t.startswith('Giải thích:'): cur['explanation'] = t[11:].strip()
        elif t.startswith('Tham chiếu:'): cur['ref'] = t[11:].strip()
        elif o and cur is not None and 'ans' not in cur and o[1] not in cur['options']: cur['options'][o[1]] = o[2]
    topics = []
    for part, tid, tname in ((1, 'T1', 'Phần I – Trắc nghiệm'), (2, 'T2', 'Phần II – Đúng/Sai')):
        out = []
        for q in qs[part]:
            opts = q['options']
            if part == 2:
                opts = {'A': 'Đúng', 'B': 'Sai'}
                ans = {'Đúng': 'A', 'Sai': 'B'}[q['ans']]
            else:
                ans = q['ans']
                assert len(opts) == 4 and ans in opts, (cid, q['n'])
            d = {'id': f"{cid}_{tid}_Q{q['n']}", 'question': q['question'], 'options': opts, 'correctAnswer': ans}
            if q.get('explanation'): d['explanation'] = q['explanation']
            out.append(d)
        topics.append({'topicId': f'{cid}_{tid}', 'topicName': tname, 'questions': out})
    return topics

mp = os.path.join(D, 'manifest.json')
man = json.load(open(mp, encoding='utf8'))
for f in sorted(glob.glob(os.path.join(D, 'Chuong_*_Ngan_hang_cau_hoi_VN.docx'))):
    n = int(re.search(r'Chuong_(\d+)_', f)[1]); cid = f'ATTT_C{n}'
    topics = parse(f, cid); name = NAMES[n]
    json.dump({'chapterId': cid, 'chapterName': name, 'topics': topics},
              open(os.path.join(D, cid + '.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=2)
    cnt = sum(len(t['questions']) for t in topics)
    man['chapters'] = [c for c in man['chapters'] if c['chapterId'] != cid]
    man['chapters'].append({'chapterId': cid, 'chapterName': name, 'topicCount': len(topics), 'questionCount': cnt})
    print(cid, cnt)
man['chapters'].sort(key=lambda c: (c['chapterId'].startswith('ATTT_C') is False, c['chapterId']))
man['totalQuestions'] = sum(c['questionCount'] for c in man['chapters'])
man['totalTopics'] = sum(c['topicCount'] for c in man['chapters'])
json.dump(man, open(mp, 'w', encoding='utf8'), ensure_ascii=False, indent=2)
