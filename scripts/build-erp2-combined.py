# -*- coding: utf-8 -*-
"""Sinh data/ERP2/ERP2_C9.json từ file 'TEST ERP2 tổng hợp.pdf' (đã tách câu sẵn vào b1.json).
Chạy: python scripts/build-erp2-combined.py scripts/erp2-combined-source.json
- True/False -> viết lại thành ABCD (erp2_c9_mc.py)
- Câu nhiều đáp án -> trắc nghiệm 4 phương án tổ hợp
- Chỉ lấy câu trong phạm vi thi (danh sách PICK đã soát tay)
"""
import itertools, json, random, re, sys, zlib

SRC = json.load(open(sys.argv[1], encoding='utf-8'))
OUT = 'data/ERP2/'


def ids(s):
    return [int(x) for x in s.split()]


PICK = {
    'Introduction & enterprise structure': ids('106 214 261 262 266 259 260'),
    'Financial accounting (FI)': ids('143 148 152 163 235 236 238 239 241 248 251 252 253 254 255 257 258 263 267 268 270 271 279 283 285 287'),
    'Management accounting (CO)': ids('150 168 234 237 240 242 243 244 245 246 247 250 256'),
    'Procurement (MM)': ids('13 14 15 16 40 45 46 47 49 58 60 61 63 64 65 68 71 72 77 79 81 84 86 88 89 97 276 278 280 284'),
    'Fulfillment (SD)': ids('44 48 54 56 62 66 73 74 75 78 80 82 83 92 93 94 95 156 157 164 167 170 171 172 174 176 177 180 181 182 184 185 186 187 188 189 190 191 192 193 194 195 196 199 200 273 274 275 286'),
    'Project System & Maintenance (PS, EAM)': ids('140 151 165'),
}
# Đáp án trong file bị sai hoặc thiếu: (đáp án đúng, ghi chú)
FIX = {
    97: ('F', 'At invoice verification the GR/IR account is <b>debited</b> (cleared) and the vendor account is credited.'),
    165: ('BD', 'Maintenance orders and WBS elements are senders that can be settled; cost centers are allocated, not settled.'),
    172: ('ABE', 'Picking list, packing list and customer invoice are all fulfillment documents.'),
    177: ('ABE', 'Client, company code and shipping point are organisational data; quantity and schedule lines are not.'),
    184: ('B', 'Orders waiting to be shipped are listed in the <b>delivery due list</b>; the billing due list is for invoicing.'),
    190: ('ABCE', 'The four partner functions are sold-to, ship-to, bill-to and payer.'),
    214: ('F', 'The lowest level of testing is <b>unit testing</b>; user acceptance testing comes near go-live.'),
    236: ('F', 'Accounts receivable belongs to <b>fulfillment</b>, not procurement.'),
    240: ('F', 'Cost (management) accounting is internal and need not follow GAAP or IFRS.'),
    242: ('F', 'External settlement sends costs from CO to FI (for example to an asset), not from FI to CO.'),
    243: ('F', 'Production cost also includes indirect (overhead) cost.'),
    246: ('F', 'Overhead costs <b>cannot</b> be traced directly to products or services.'),
    247: ('F', 'Primary cost elements come from FI general ledger accounts.'),
    248: ('F', 'It is the reverse: the subledger is posted directly and the reconciliation account is updated automatically.'),
    250: ('F', 'Actual postings go to cost centers; groups are only for reporting and allocation.'),
    273: ('F', 'One shipping point can have <b>several</b> loading points.'),
    275: ('F', 'A sales organisation belongs to exactly <b>one</b> company code.'),
    283: ('F', 'The client is an organisational level, not master data; the key FI master data are the G/L accounts.'),
    284: ('F', 'This describes the <b>purchasing organisation</b>, not the plant.'),
}
STEM = {
    74: None,  # giữ nguyên
    181: 'A company does not have enough stock for a customer order, so it ships what it has now and will ship the rest later. Which term best describes the remaining quantity?',
}


def clean(s):
    s = s.replace('Question options:', '')
    s = re.sub(r'(?i)there are (two|three|2|3) correct answers for this question|\(\s*\d+ (possible|correct) answers\s*\)', '', s)
    s = re.sub(r'(?<=[a-zA-Z?])\d{1,2}$', '', s.strip())
    s = re.sub(r'\?\s*\d{1,2}$', '?', s)
    s = re.sub(r'\s+([?.,])', r'\1', re.sub(r'\s+', ' ', s)).strip(' "')
    return s.replace('&', '&amp;').replace('<', '&lt;')


def shuffled(opts, correct, key):
    rnd = random.Random(zlib.crc32(key.encode()))
    last = [o for o in opts if re.search(r'(?i)of the above', o)]
    rest = [o for o in opts if o not in last]
    rnd.shuffle(rest)
    arr = rest + last
    return {'ABCD'[i]: o for i, o in enumerate(arr)}, 'ABCD'[arr.index(correct)]


def join(nums):
    nums = [str(n) for n in sorted(nums)]
    return nums[0] if len(nums) == 1 else ', '.join(nums[:-1]) + ' and ' + nums[-1]


def combos(n, right, key):
    """3 tổ hợp nhiễu, mỗi tổ hợp khác đáp án đúng ít nhất một phần tử, cùng độ dài khi có thể."""
    rnd = random.Random(zlib.crc32(key.encode()))
    pool = [set(c) for c in itertools.combinations(range(1, n + 1), len(right)) if set(c) != right]
    rnd.shuffle(pool)
    pool.sort(key=lambda c: len(c ^ right))
    picks = pool[:3]
    size = len(right) - 1
    while len(picks) < 3 and size > 0:
        extra = [set(c) for c in itertools.combinations(range(1, n + 1), size)]
        rnd.shuffle(extra)
        picks += [c for c in extra if c not in picks][:3 - len(picks)]
        size -= 1
    return picks


def convert(x, qid):
    it = SRC[x]
    stem = clean(STEM.get(x) or it['q'])
    fix = FIX.get(x)
    note = f' <i>Note: {fix[1]} (corrected from the source file)</i>' if fix else ''
    if it['kind'] == 'tf':
        truth = fix[0] == 'T' if fix else (it['key'] == [0] if it['opts'] else it['ans'].lower().startswith('t'))
        return {'id': qid, 'question': f'Is this statement correct? <br><i>{stem}</i>', 'options': {'A': 'Yes', 'B': 'No'},
                'correctAnswer': 'A' if truth else 'B',
                'explanation': f'<b>{"Yes" if truth else "No"}</b> – the statement is {"true" if truth else "false"}.' + note}
    opts = [clean(re.sub(r'^[.)]\s*', '', o)) for o in it['opts']]
    key = ['ABCDEFGH'.index(c) for c in fix[0]] if fix else it['key']
    if x == 151:  # chuỗi bước: thêm mũi tên cho dễ đọc
        opts = [re.sub(r' (?=(Create|Release|Execute|Complete|Billing|Schedule|Plan Complete|Plan Release))', ' → ', o) for o in opts]
    right = [opts[k] for k in key]
    if len(key) == 1:
        wrong = [o for i, o in enumerate(opts) if i != key[0] and o]
        above = [o for o in wrong if re.search(r'(?i)of the above', o)]
        random.Random(zlib.crc32(qid.encode())).shuffle(wrong)
        wrong = (above + [o for o in wrong if o not in above])[:3]
        options, ans = shuffled(wrong + right, right[0], qid)
        return {'id': qid, 'question': stem, 'options': options, 'correctAnswer': ans,
                'explanation': f'Correct answer: <b>{right[0]}</b>.' + note}
    listing = ''.join(f'<br>({i + 1}) {o}' for i, o in enumerate(opts))
    good = {k + 1 for k in key}
    choices = [join(c) for c in combos(len(opts), good, qid)] + [join(good)]
    options, ans = shuffled(choices, join(good), qid)
    return {'id': qid, 'question': f'{stem}{listing}<br><b>Choose the correct combination:</b>', 'options': options,
            'correctAnswer': ans,
            'explanation': f'Correct items: <b>{join(good)}</b> – ' + '; '.join(right) + '.' + note}


chapter = {'chapterId': 'ERP2_C9', 'chapterName': 'Combined test bank (from review file)', 'topics': []}
for ti, (name, picks) in enumerate(PICK.items(), 1):
    qs = [convert(x, f'ERP2_C9_T{ti}_Q{k}') for k, x in enumerate(picks, 1)]
    chapter['topics'].append({'topicId': f'ERP2_C9_T{ti}', 'topicName': name, 'questions': qs})

import erp2_c9_mc
erp2_c9_mc.apply(chapter)  # Yes/No -> ABCD

with open(OUT + 'ERP2_C9.json', 'w', encoding='utf-8') as f:
    json.dump(chapter, f, ensure_ascii=False, indent=1)
with open(OUT + 'manifest.json', encoding='utf-8-sig') as f:
    m = json.load(f)
m['chapters'] = [c for c in m['chapters'] if c['chapterId'] != 'ERP2_C9']
m['chapters'].append({'chapterId': 'ERP2_C9', 'chapterName': chapter['chapterName'], 'topicCount': len(chapter['topics']),
                      'questionCount': sum(len(t['questions']) for t in chapter['topics'])})
m['totalQuestions'] = sum(c['questionCount'] for c in m['chapters'])
m['totalTopics'] = sum(c['topicCount'] for c in m['chapters'])
with open(OUT + 'manifest.json', 'w', encoding='utf-8') as f:
    json.dump(m, f, ensure_ascii=False, indent=2)
print(m['chapters'][-1]['questionCount'], 'in C9;', m['totalQuestions'], 'total')
