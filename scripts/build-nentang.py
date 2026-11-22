# -*- coding: utf-8 -*-
"""Chuyển data/Nền tảng/BoCauHoi.docx thành JSON (môn Nền tảng).
Quy ước của file nguồn: đáp án đúng là lựa chọn có khoảng trắng cuối dòng; câu hỏi in đậm."""
import html
import json
import re
import sys
import zipfile
import zlib

SRC = 'data/Nền tảng/BoCauHoi.docx'
OUT = 'data/Nền tảng/'
BUL = ''

x = zipfile.ZipFile(SRC).read('word/document.xml').decode('utf-8')
paras = []
for p in re.findall(r'<w:p[ >].*?</w:p>', x, flags=re.S):
    t = html.unescape(''.join(re.findall(r'<w:t[^>]*>(.*?)</w:t>', p, flags=re.S)))
    bold = bool(re.search(r'<w:b/>|<w:b w', p))
    paras.append((bold, t))

# Phần trắc nghiệm: từ đầu đến trước "Phần 2 điền khuyết"
end = next(i for i, (_, t) in enumerate(paras) if t.strip().startswith('Phần 2'))
questions = []   # {'q','opts':[(text,correct)]}
cur = None
for bold, raw in paras[:end]:
    if not raw.strip():
        continue
    text = raw
    if BUL in text and not text.lstrip().startswith(BUL):
        head, text = text.split(BUL, 1)      # phần trước dấu bullet là lựa chọn cuối của câu trước
        if cur is not None and head.strip():
            cur['opts'].append((head.strip(), head.endswith(' ')))
        bold, cur = True, None
    text = text.replace(BUL, '')
    is_option = (not bold) or text.strip().startswith('Tuyến có mặt nạ')
    if not is_option:
        cur = {'q': text.strip(), 'opts': []}
        questions.append(cur)
    else:
        cur['opts'].append((text.strip(), text.endswith(' ')))

# Sửa riêng câu bảng định tuyến: lựa chọn cuối không có khoảng trắng đánh dấu và thiếu ngoặc đóng
for qq in questions:
    if qq['q'].startswith('Khi có nhiều tuyến đường'):
        qq['opts'][-1] = ('Tuyến có mặt nạ mạng dài nhất (most specific match)', True)

# Kiểm tra: mỗi câu 4 lựa chọn, đúng 1 đáp án
bad = [(i, q['q'][:50], len(q['opts']), sum(c for _, c in q['opts'])) for i, q in enumerate(questions, 1) if len(q['opts']) != 4 or sum(c for _, c in q['opts']) != 1]
if bad:
    print('CẦN KIỂM TRA:', bad, file=sys.stderr)

TOPICS = [  # (tên chủ đề, số thứ tự câu bắt đầu, 1-based)
    ('Thiết bị mạng & giao thức cơ bản', 'Thiết bị nào sau đây thường được sử dụng để kết nối các mạng khác nhau?'),
    ('Tầng Network (OSI)', 'Chức năng chính của tầng Network'),
    ('Tầng Transport (OSI)', 'Chức năng chính của tầng Transport'),
    ('Tầng Session & phiên làm việc', 'Phiên làm việc trong mạng máy tính là gì?'),
    ('Tầng ứng dụng (Application)', 'Giao thức nào sau đây hoạt động ở tầng ứng dụng?'),
    ('Wi-Fi', 'Chuẩn Wi-Fi nào sau đây'),
    ('Tường lửa (Firewall)', 'Chức năng chính của tường lửa'),
    ('Mã hóa & tấn công mạng', 'Mục tiêu chính của mã hóa dữ liệu'),
    ('Địa chỉ IP & định tuyến', 'Địa chỉ IP nào sau đây là địa chỉ loopback?'),
]
starts = []
for name, prefix in TOPICS:
    idx = next(i for i, q in enumerate(questions) if q['q'].startswith(prefix))
    starts.append(idx)
assert starts == sorted(starts)

LETTERS = 'ABCD'


def build(q, qid):
    opts = {LETTERS[i]: t for i, (t, _) in enumerate(q['opts'])}
    ans = LETTERS[[c for _, c in q['opts']].index(True)]
    return {'id': qid, 'question': q['q'], 'options': opts, 'correctAnswer': ans, 'explanation': ''}


CHAPTER = 'NT_C1'
topics = []
n = 0
for ti, (name, _) in enumerate(TOPICS):
    a = starts[ti]
    b = starts[ti + 1] if ti + 1 < len(starts) else len(questions)
    qs = []
    for k, q in enumerate(questions[a:b], 1):
        qs.append(build(q, f'{CHAPTER}_T{ti + 1}_Q{k}'))
    topics.append({'topicId': f'{CHAPTER}_T{ti + 1}', 'topicName': name, 'questions': qs})
    n += len(qs)

# Phần 2 (điền khuyết): giữ nguyên dạng điền khuyết; "accepted" là các cách viết khác được chấp nhận
CLOZE = [
    ('Dịch vụ như Google Docs hay Microsoft 365 là ví dụ điển hình của mô hình _______ trong điện toán đám mây.', 'SaaS', ['Software as a Service', 'Software-as-a-Service']),
    ('Trong mạng con 192.168.10.0/26, địa chỉ broadcast là ________.', '192.168.10.63', []),
    ('Tầng _______ trong mô hình OSI chịu trách nhiệm định tuyến gói tin giữa các mạng.', 'Network', ['Tầng Network', 'Network Layer', 'Mạng', 'Tầng mạng', 'Layer 3', 'Tầng 3']),
    ('Tầng _______ đảm bảo dữ liệu được truyền tin cậy, có thứ tự và không bị trùng lặp.', 'Transport', ['Tầng Transport', 'Transport Layer', 'Giao vận', 'Vận chuyển', 'Layer 4', 'Tầng 4']),
    ('Tầng ứng dụng là tầng thứ _______ trong mô hình OSI, nơi người dùng tương tác trực tiếp với các dịch vụ mạng.', '7', ['bảy', 'tầng 7', 'layer 7', '7th']),
    ('Giao thức _______ hoạt động ở tầng ứng dụng và được sử dụng để truyền tải nội dung web qua Internet.', 'HTTP', ['HTTPS', 'HTTP/HTTPS']),
    ('Tầng _______ cung cấp giao diện trực tiếp giữa người dùng và mạng, ví dụ như trình duyệt web hoặc ứng dụng email.', 'Application', ['Tầng Application', 'Application Layer', 'Ứng dụng', 'Tầng ứng dụng', 'Layer 7', 'Tầng 7']),
    ('Tầng _______ xử lý việc mã hóa, nén và chuyển đổi định dạng dữ liệu giữa các hệ thống.', 'Presentation', ['Tầng Presentation', 'Presentation Layer', 'Trình bày', 'Tầng trình bày', 'Layer 6', 'Tầng 6']),
    ('Giao thức ________ được thiết kế nhẹ, phù hợp với thiết bị IoT có tài nguyên hạn chế và cần truyền dữ liệu hiệu quả.', 'MQTT', []),
    ('Trong hệ thống IoT, thiết bị ________ đóng vai trò trung gian, kết nối các cảm biến với Internet hoặc nền tảng đám mây.', 'Gateway', ['IoT Gateway', 'Cổng kết nối', 'Cổng IoT']),
]
ti = len(TOPICS) + 1
qs = []
for k, (text, right, accepted) in enumerate(CLOZE, 1):
    qs.append({'id': f'{CHAPTER}_T{ti}_Q{k}', 'type': 'fill', 'question': text, 'options': {}, 'correctAnswer': right,
               'acceptedAnswers': accepted, 'explanation': ''})
topics.append({'topicId': f'{CHAPTER}_T{ti}', 'topicName': 'Điền khuyết (gõ đáp án)', 'questions': qs})
n += len(qs)

data = {'chapterId': CHAPTER, 'chapterName': 'Bộ câu hỏi 1 – Mạng máy tính', 'topics': topics}
json.dump(data, open(OUT + 'NT_C1.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
manifest = {'chapters': [{'chapterId': CHAPTER, 'chapterName': data['chapterName'], 'topicCount': len(topics), 'questionCount': n}],
            'totalQuestions': n, 'totalTopics': len(topics)}
json.dump(manifest, open(OUT + 'manifest.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(len(questions), 'trắc nghiệm +', len(CLOZE), 'điền khuyết =', n, '| chủ đề:', [(t['topicName'], len(t['questions'])) for t in topics], file=sys.stderr)
