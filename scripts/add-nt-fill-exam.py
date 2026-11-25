# -*- coding: utf-8 -*-
"""Thêm 5 câu điền khuyết (đề thi mẫu) vào NT_C1 – chủ đề 'Điền khuyết' và cập nhật manifest. Chạy lại an toàn."""
import json
D = 'data/Nền tảng/'
NEW = [
 ('Mô hình OSI và mô hình TCP/IP có cùng tầng (a) _______.', 'Transport',
  ['Tầng Transport', 'Transport Layer', 'Giao vận', 'Tầng giao vận', 'Application', 'Application Layer', 'Tầng Application', 'Ứng dụng', 'Tầng ứng dụng',
   'Network', 'Network Layer', 'Tầng Network', 'Tầng mạng', 'Mạng', 'Transport và Application', 'Application và Transport'],
  'Đáp án chuẩn nhất: **Transport** (giao vận: TCP, UDP) vì cả tên lẫn chức năng tương ứng một–một giữa hai mô hình. **Application** cũng trùng tên, nhưng tầng Application của TCP/IP gộp 3 tầng OSI (Application, Presentation, Session). **Network** tương ứng về chức năng, nhưng trong TCP/IP thường gọi là **Internet**.'),
 ('Khi bấm dây nối mạng LAN bằng cáp UTP, chỉ cần bấm đúng cặp màu (b) _______ (chân 1, 2) và cặp màu xanh lá (chân 3, 6).', 'Cam',
  ['Màu cam', 'Orange', 'Sọc cam', 'Cam và sọc cam', 'Sọc cam, cam', 'Cặp cam'],
  'Với Ethernet 10/100 Mbps chỉ dùng 4 dây **1, 2, 3, 6**. Theo chuẩn T568B: chân 1–2 là cặp **cam (sọc cam, cam)**, chân 3–6 là cặp **xanh lá (sọc xanh lá, xanh lá)**.'),
 ('Khi bấm dây nối mạng LAN bằng cáp UTP, chỉ cần bấm đúng cặp màu cam (chân 1, 2) và cặp màu (c) _______ (chân 3, 6).', 'Xanh lá',
  ['Xanh lá cây', 'Màu xanh lá', 'Green', 'Lá', 'Sọc xanh lá', 'Xanh lá và sọc xanh lá', 'Cặp xanh lá'],
  'Chân **3 và 6** thuộc cặp **xanh lá**; cùng với cặp cam (chân 1, 2) tạo thành 4 dây truyền/nhận dữ liệu của Ethernet 100 Mbps.'),
 ('Router cập nhật bảng định tuyến của mình thông qua địa chỉ (d) _______ của các mạng khác gửi đến.', 'Broadcast',
  ['Địa chỉ broadcast', 'Quảng bá', 'Địa chỉ quảng bá', 'Broadcast address'],
  'Mỗi mạng dùng **địa chỉ broadcast** (địa chỉ cuối của mạng, ví dụ 167.8.255.255) để quảng bá thông tin về mạng mình; router dựa vào đó cập nhật **bảng định tuyến**.'),
 ('Cơ chế (e) _______: tại một thời điểm chỉ có thể truyền hoặc nhận.', 'Half duplex',
  ['Half-duplex', 'Halfduplex', 'Bán song công', 'Half duplex mode', 'Song công một nửa'],
  '**Half duplex**: hai chiều nhưng luân phiên, mỗi thời điểm chỉ truyền **hoặc** nhận (như bộ đàm). **Full duplex** truyền và nhận đồng thời; **Simplex** chỉ một chiều.'),
]
p = D + 'NT_C1.json'
d = json.load(open(p, encoding='utf-8'))
t = [x for x in d['topics'] if x['topicId'] == 'NT_C1_T10'][0]
t['questions'] = [q for q in t['questions'] if not q['id'].startswith('NT_C1_T10_E')]
for i, (q, a, acc, e) in enumerate(NEW, 1):
    t['questions'].append({'id': f'NT_C1_T10_E{i}', 'type': 'fill', 'question': q, 'options': {}, 'correctAnswer': a, 'acceptedAnswers': acc, 'explanation': e})
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
m = json.load(open(D + 'manifest.json', encoding='utf-8'))
for c in m['chapters']:
    if c['chapterId'] == 'NT_C1':
        c['questionCount'] = sum(len(x['questions']) for x in d['topics'])
m['totalQuestions'] = sum(c['questionCount'] for c in m['chapters'])
json.dump(m, open(D + 'manifest.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(len(t['questions']), 'fill in T10;', m['totalQuestions'], 'total')
