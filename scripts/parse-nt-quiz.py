# -*- coding: utf-8 -*-
"""Phân tích 2 file docx của môn Nền tảng:
  - Module_Quizz.docx   : câu hỏi cuối bài (đáp án đúng = lựa chọn in đậm; có kiểu A./B./C./D. nằm chung đoạn)
  - QuizzCuoiChuong.docx: quiz cuối chương (mỗi câu 1 đoạn + đoạn "Đáp án: x Giải thích ngắn gọn: ...")
Xuất ra scripts/nt_parsed.json để build-nentang2.py dùng; in danh sách câu bất thường để xử lý tay."""
import html
import json
import re
import sys
import zipfile

D = 'data/Nền tảng/'


def paragraphs(fname):
    x = zipfile.ZipFile(D + fname).read('word/document.xml').decode('utf-8')
    out = []
    for p in re.findall(r'<w:p[ >].*?</w:p>', x, flags=re.S):
        segs = []
        for r in re.findall(r'<w:r[ >].*?</w:r>', p, flags=re.S):
            t = html.unescape(''.join(re.findall(r'<w:t[^>]*>(.*?)</w:t>', r, flags=re.S)))
            if not t:
                continue
            bold = bool(re.search(r'<w:b/>|<w:b w:val="(1|true)"', r))
            segs.append((t, bold))
        text = ''.join(t for t, _ in segs)
        out.append({'text': text.strip(), 'segs': segs, 'num': '<w:numPr' in p})
    return out


# ------------------------------------------------------------------ Module_Quizz
def parse_module():
    ps = paragraphs('Module_Quizz.docx')
    modules = []   # {'name', 'questions': []}
    cur_mod = None
    lesson = ''
    cur = None
    anomalies = []

    def finish():
        nonlocal cur
        if cur is not None:
            cur_mod['questions'].append(cur)
        cur = None

    for p in ps:
        t = p['text']
        if not t:
            continue
        if re.match(r'^MODULE\s*\d+', t):
            finish()
            cur_mod = {'name': t, 'questions': []}
            modules.append(cur_mod)
            continue
        if re.match(r'^(BIM\d+|MV\d)', t) and not re.match(r'^Câu', t):
            finish()
            lesson = t
            continue
        if re.match(r'^Câu\s*\d', t):
            finish()
            # đánh dấu phần in đậm (không tính phần tiêu đề "Câu x.y:")
            marked = ''.join(('«' + s + '»') if b and not re.match(r'^Câu', s.strip()) else s for s, b in p['segs'])
            cur = {'lesson': lesson, 'raw': marked, 'opts': [], 'inline': False}
            continue
        if cur is None:
            continue
        m_ans = re.match(r'^Đáp\s*án(?:\s*đúng)?\s*[:：]\s*([A-Da-d])[.)]?\s*(.*)$', t, flags=re.S)
        if m_ans:
            cur['ans'] = m_ans.group(1).upper()
            rest = m_ans.group(2)
            mg = re.search(r'Giải\s*thích[^:：]*[:：]\s*(.*)$', rest, flags=re.S)
            if mg:
                cur['expl'] = mg.group(1).strip()
            continue
        m_ex = re.match(r'^Giải\s*thích[^:：]*[:：]\s*(.*)$', t, flags=re.S)
        if m_ex:
            cur['expl'] = m_ex.group(1).strip()
            continue
        bold = any(b for _, b in p['segs'])
        cur['opts'].append({'text': t, 'bold': bold})
    finish()

    # xử lý từng câu
    results = []
    for m in modules:
        qs = []
        for q in m['questions']:
            raw = q['raw']
            plain = raw.replace('«', '').replace('»', '')
            qnum = re.match(r'^Câu\s*([\d.]+)\s*[:.]?\s*', plain)
            num = qnum.group(1) if qnum else '?'
            if re.search(r'\sA\.\s', plain) and re.search(r'\sB\.\s', plain):
                # kiểu nằm chung đoạn
                stem_end = re.search(r'\sA\.\s', raw)
                stem = raw[:stem_end.start()]
                body = raw[stem_end.start():]
                parts = re.split(r'\s(?=[A-D]\.\s)', body.strip())
                opts = []
                for part in parts:
                    mm = re.match(r'^([A-D])\.\s*(.*)$', part.strip(), flags=re.S)
                    if mm:
                        opts.append((mm.group(1), mm.group(2)))
                texts = []
                correct = None
                notes = []
                for i, (lab, txt) in enumerate(opts):
                    bold = '«' in txt
                    clean = txt.replace('«', '').replace('»', '').strip()
                    note = ''
                    if '⇒' in clean:
                        clean, note = [s.strip() for s in clean.split('⇒', 1)]
                    texts.append(clean)
                    if note:
                        notes.append(f'{lab}: {note}')
                    if bold:
                        correct = i
                # trường hợp chữ cái đứng trong đoạn in đậm trước (vd " C. " nằm ở run thường, nội dung in đậm)
                stem = stem.replace('«', '').replace('»', '')
                stem = re.sub(r'^Câu\s*[\d.]+\s*[:.]?\s*', '', stem).strip()
                qq = {'num': num, 'q': stem, 'options': texts, 'correct': correct, 'notes': notes, 'lesson': q['lesson']}
            else:
                stem = re.sub(r'^Câu\s*[\d.]+\s*[:.]?\s*', '', plain).strip()
                texts, notes, correct = [], [], None
                for i, o in enumerate(q['opts']):
                    t = o['text']
                    note = ''
                    if '⇒' in t:
                        t, note = [s.strip() for s in t.split('⇒', 1)]
                    texts.append(t)
                    if note:
                        notes.append(f'{"ABCD"[i] if i < 4 else i}: {note}')
                    if o['bold']:
                        correct = i if correct is None else -1
                qq = {'num': num, 'q': stem, 'options': texts, 'correct': correct, 'notes': notes, 'lesson': q['lesson']}
            if qq['correct'] in (None, -1) and q.get('ans'):
                qq['correct'] = 'ABCD'.index(q['ans'])
            qq['expl'] = q.get('expl', '')
            if len(qq['options']) != 4 or qq['correct'] in (None, -1):
                anomalies.append((qq['num'], qq['q'][:70], len(qq['options']), qq['correct'], qq['options']))
            qs.append(qq)
        results.append({'name': m['name'], 'questions': qs})
    return results, anomalies


if __name__ == '__main__':
    res, an = parse_module()
    total = sum(len(m['questions']) for m in res)
    print('Module_Quizz:', len(res), 'modules,', total, 'questions,', len(an), 'anomalies', file=sys.stderr)
    for a in an:
        print(a, file=sys.stderr)
    json.dump({'module': res}, open('scripts/nt_parsed.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


# ------------------------------------------------------------------ QuizzCuoiChuong
def parse_quiz():
    ps = paragraphs('QuizzCuoiChuong.docx')
    modules, cur_mod, cur = [], None, None
    anomalies = []
    for p in ps:
        t = p['text'].replace('🟥', '').strip()
        flagged = '🟥' in p['text']
        if not t:
            continue
        if re.match(r'^QUIZ\s*MODULE', t, flags=re.I):
            cur_mod = {'name': t, 'questions': []}
            modules.append(cur_mod)
            cur = None
            continue
        if re.match(r'^Câu\s*\d', t):
            m = re.match(r'^Câu\s*([\d.]+)\s*[:.]?\s*(.*)$', t, flags=re.S)
            num, body = m.group(1), m.group(2)
            inline_ans = inline_expl = None
            m_in = re.search(r'\s*Đáp\s*án\s*[:：]\s*([a-dA-D])(?![A-Za-zÀ-ỹ])(.*)$', body, flags=re.S)
            if m_in:
                inline_ans = m_in.group(1).lower()
                mg = re.search(r'Giải\s*thích[^:：]*[:：]\s*(.*)$', m_in.group(2), flags=re.S)
                inline_expl = mg.group(1).strip() if mg else ''
                body = body[:m_in.start()]
            # tìm nhãn a./b./c./d. theo thứ tự
            pos, idxs = 0, []
            for L in 'abcd':
                mm = re.search(r'(?:^|\s)' + L + r'[.)]\s', body[pos:], flags=re.I)
                if not mm:
                    break
                idxs.append((pos + mm.start(), pos + mm.end()))
                pos = pos + mm.end()
            if len(idxs) < 2:
                anomalies.append((num, 'no options', body[:80]))
                continue
            stem = body[:idxs[0][0]].strip()
            opts = []
            for k, (st, en) in enumerate(idxs):
                end = idxs[k + 1][0] if k + 1 < len(idxs) else len(body)
                opts.append(body[en:end].strip())
            cur = {'num': num, 'q': stem, 'options': opts, 'ans': inline_ans, 'expl': inline_expl or '', 'flag': flagged, 'lms': None, 'ai': None, 'module': cur_mod['name'] if cur_mod else ''}
            if cur_mod is None:
                cur_mod = {'name': '(không rõ)', 'questions': []}
                modules.append(cur_mod)
            cur_mod['questions'].append(cur)
            continue
        if cur is None:
            continue
        ma = re.match(r'^Đáp\s*án\s*[:：]\s*([a-dA-D])\s*(.*)$', t, flags=re.S)
        if ma:
            cur['ans'] = ma.group(1).lower()
            rest = ma.group(2)
            mlms = re.search(r'\(LMS\)\s*AI\s*[:：]\s*([a-dA-D])', rest)
            if mlms:
                cur['lms'] = cur['ans']
                cur['ai'] = mlms.group(1).lower()
            mg = re.search(r'Giải\s*thích[^:：]*[:：]\s*(.*)$', rest, flags=re.S)
            if mg:
                cur['expl'] = mg.group(1).strip()
            continue
        mg = re.match(r'^Giải\s*thích[^:：]*[:：]\s*(.*)$', t, flags=re.S)
        if mg:
            cur['expl'] = mg.group(1).strip()
            continue
    for m in modules:
        for q in m['questions']:
            if len(q['options']) != 4 or q['ans'] not in list('abcd'):
                anomalies.append((q['num'], q['q'][:60], len(q['options']), q['ans']))
    return modules, anomalies


if __name__ == '__main__':
    qm, qan = parse_quiz()
    print('Quizz cuối chương:', len(qm), 'modules,', sum(len(m['questions']) for m in qm), 'questions,', len(qan), 'anomalies', file=sys.stderr)
    for a in qan:
        print(a, file=sys.stderr)
    flagged = [(q['num'], q['lms'], q['ai'], q['flag']) for m in qm for q in m['questions'] if q['flag'] or q['lms']]
    print('flagged/LMS-AI:', flagged, file=sys.stderr)
    data = json.load(open('scripts/nt_parsed.json', encoding='utf-8'))
    data['quiz'] = qm
    json.dump(data, open('scripts/nt_parsed.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
