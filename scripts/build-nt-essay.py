# -*- coding: utf-8 -*-
"""Sinh data/Nền tảng/NT_C4.json: câu hỏi tự luận (essay) môn Nền tảng, kèm định hướng trả lời."""
import json

OUT = 'data/Nền tảng/'
FRAME = ('<b>Khung tư duy chung:</b> Bối cảnh &amp; yêu cầu → Kiến trúc đề xuất → Công nghệ/thiết bị chọn và <i>vì sao</i> → '
         'Rủi ro, bảo mật, chi phí → Kết luận/lộ trình.')


def g(*lines):
    return '<br>'.join(lines)


TOPICS = []

# ------------------------------------------------------------------ T1
TOPICS.append(('Thiết kế & phát triển hạ tầng cho trường (UEL)', [
    ('Với vai trò là sinh viên Trường Đại học Kinh tế – Luật (UEL), hãy vận dụng kiến thức môn Nền tảng công nghệ thông tin để '
     '<b>thiết kế và đề xuất hướng phát triển hạ tầng CNTT</b> của trường (mạng, máy chủ/trung tâm dữ liệu, dịch vụ cho giảng viên – sinh viên). '
     'Nêu rõ lý do lựa chọn.',
     g(FRAME, '<b>1. Bối cảnh &amp; nhu cầu của UEL</b> (nêu 3–4 ý): hàng chục nghìn sinh viên + giảng viên, nhiều cơ sở, dịch vụ cần chạy 24/7 '
       '(cổng đào tạo, LMS/e-learning, thư viện số, email, thi trực tuyến, quản trị nhân sự – tài chính); đỉnh tải vào đợt đăng ký học phần, thi.',
       '<b>2. Kiến trúc tổng thể</b> (nên có sơ đồ hoặc mô tả theo tầng): mạng truy cập (Wi-Fi + LAN) → mạng lõi/phân phối → '
       'trung tâm dữ liệu/Cloud → dịch vụ ứng dụng → người dùng. Kết nối giữa các cơ sở bằng WAN/VPN, ra Internet qua ISP (nên có 2 đường).',
       '<b>3. Chọn công nghệ và giải thích:</b> VLAN tách mạng sinh viên – giảng viên – quản trị; Wi-Fi 6 (WPA3) phủ giảng đường, ký túc xá; '
       'Switch lớp 2/3, Router, Firewall; DHCP/DNS; hệ thống máy chủ ảo hóa hoặc Cloud hybrid.',
       '<b>4. Bảo mật:</b> firewall, phân quyền, xác thực tập trung (SSO), mã hóa (HTTPS/VPN), sao lưu.',
       '<b>5. Tính sẵn sàng &amp; mở rộng:</b> dự phòng (redundancy), cân bằng tải, khả năng mở rộng khi tăng sinh viên.',
       '<b>6. Chi phí – lộ trình:</b> giai đoạn 1 ổn định hạ tầng hiện có, giai đoạn 2 chuyển dịch Cloud/ảo hóa, giai đoạn 3 Smart Campus (IoT, AI).',
       '<b>Điểm cộng:</b> gắn với các khái niệm đã học (mô hình OSI/TCP-IP, Client/Server, Cloud IaaS/PaaS/SaaS, Digital Infrastructure) và nêu ví dụ thực tế tại UEL.')),
    ('Thiết kế hệ thống mạng cho một cơ sở của UEL gồm: khu giảng đường, thư viện, phòng máy, ký túc xá và khu hành chính. '
     'Hãy mô tả cách <b>phân chia mạng (VLAN/mạng con)</b>, thiết bị cần dùng và cách bảo đảm kết nối ổn định.',
     g('<b>Tư duy:</b> tách theo <i>đối tượng người dùng</i> và <i>mức độ an toàn</i>, rồi mới chọn thiết bị.',
       '<b>1. Phân vùng:</b> VLAN Hành chính – VLAN Giảng viên – VLAN Sinh viên (Wi-Fi) – VLAN Phòng máy/Lab – VLAN Ký túc xá – VLAN Máy chủ/DMZ – VLAN Camera/IoT. '
       'Mỗi VLAN một mạng con IP riêng (có thể trình bày ví dụ 10.10.x.0/24), định tuyến giữa VLAN qua Switch lớp 3/Firewall với chính sách riêng.',
       '<b>2. Thiết bị theo mô hình 3 lớp:</b> Access (Switch PoE, Access Point) → Distribution (Switch L3) → Core (Switch/Router lõi) → Firewall → Internet/WAN.',
       '<b>3. Dịch vụ mạng:</b> DHCP cấp IP tự động, DNS nội bộ, NAT ra Internet, cân bằng tải/2 đường ISP.',
       '<b>4. Ổn định:</b> dự phòng đường truyền và thiết bị lõi, UPS, giám sát (SNMP), băng thông ưu tiên cho dịch vụ học tập/thi.',
       '<b>5. Liên hệ lý thuyết:</b> Switch tầng 2 – Router tầng 3 (OSI), CSMA/CA cho Wi-Fi, Network edge/access/core.')),
    ('Vì sao cần <b>Wi-Fi phủ sóng toàn trường</b> và quản lý truy cập tập trung? Hãy đề xuất giải pháp Wi-Fi cho UEL '
     '(chuẩn Wi-Fi, bảo mật, phân quyền sinh viên/khách).',
     g('<b>Tư duy:</b> nhu cầu → chuẩn kỹ thuật → bảo mật → quản lý.',
       '<b>1. Nhu cầu:</b> sinh viên học, thi, tra cứu thư viện bằng điện thoại/laptop; mật độ thiết bị cao trong giảng đường lớn.',
       '<b>2. Kỹ thuật:</b> Wi-Fi 6 (802.11ax), hai băng tần 2.4 GHz và 5 GHz, mô hình nhiều Access Point quản lý bằng bộ điều khiển (WLC); '
       'khảo sát vị trí đặt AP để tránh nhiễu, chia kênh.',
       '<b>3. Bảo mật &amp; phân quyền:</b> WPA3-Enterprise, đăng nhập bằng tài khoản trường (802.1X/SSO) thay vì một mật khẩu chung; '
       'SSID riêng cho Sinh viên – Giảng viên – Khách, giới hạn băng thông và vùng truy cập theo từng nhóm.',
       '<b>4. Vận hành:</b> giám sát số thiết bị, lưu nhật ký truy cập, hỗ trợ roaming giữa các tòa nhà.')),
]))

# ------------------------------------------------------------------ T2
TOPICS.append(('Trung tâm dữ liệu & điện toán đám mây', [
    ('Tại sao một trường đại học như UEL <b>cần có Trung tâm dữ liệu (Data Center)</b>? Hãy nêu vai trò/tác dụng của nó và cho ví dụ cụ thể.',
     g(FRAME.replace('Bối cảnh &amp; yêu cầu', 'Vì sao cần'),
       '<b>1. Vì sao cần:</b> dữ liệu và dịch vụ của trường (điểm, học phí, hồ sơ, bài giảng, bài thi) phải được <i>lưu trữ tập trung, an toàn, hoạt động liên tục 24/7</i>; '
       'phân tán trên máy cá nhân sẽ khó bảo mật, khó sao lưu, dễ mất.',
       '<b>2. Vai trò/tác dụng</b> (theo slide: quản lý tính toán, lưu trữ dữ liệu và dịch vụ mạng):',
       '• <b>Tính toán:</b> chạy các hệ thống ứng dụng (cổng đào tạo, LMS, email, thi online).',
       '• <b>Lưu trữ:</b> CSDL sinh viên, tài liệu, thư viện số; có sao lưu và khôi phục thảm họa.',
       '• <b>Mạng &amp; kết nối:</b> phân phối dịch vụ đến người dùng qua mạng nội bộ, Internet.',
       '• <b>Bảo mật &amp; sẵn sàng:</b> kiểm soát truy cập vật lý, firewall, nguồn điện dự phòng (UPS, máy phát), làm mát, giám sát.',
       '• <b>Tiết kiệm &amp; dễ quản trị:</b> dùng chung tài nguyên bằng ảo hóa, quản lý tập trung.',
       '<b>3. Ví dụ tại UEL:</b> đợt đăng ký học phần – hàng chục nghìn sinh viên truy cập cùng lúc; nếu máy chủ nằm rải rác, hệ thống sẽ quá tải/sập. '
       'Data Center cho phép cân bằng tải, mở rộng tài nguyên và giữ điểm số, hồ sơ an toàn khi có sự cố điện hoặc hỏng phần cứng.',
       '<b>4. Xu hướng:</b> Data Center hiện đại cần sẵn sàng cho AI và “xanh hóa” (tiết kiệm năng lượng), có thể kết hợp Cloud (hybrid).')),
    ('UEL nên <b>tự xây Data Center tại chỗ (on-premise)</b>, <b>thuê Cloud</b> hay <b>kết hợp (hybrid)</b>? Hãy phân tích ưu – nhược điểm và đưa ra lựa chọn có lập luận.',
     g('<b>Tư duy:</b> so sánh theo tiêu chí rồi <i>chốt phương án kèm điều kiện</i> (không trả lời “tùy”).',
       '<b>1. Tiêu chí so sánh:</b> chi phí đầu tư/vận hành, khả năng mở rộng, bảo mật &amp; kiểm soát dữ liệu, độ sẵn sàng, nhân lực vận hành, tuân thủ quy định.',
       '<b>2. On-premise:</b> kiểm soát tốt dữ liệu nhạy cảm, độ trễ thấp trong nội bộ; nhưng vốn đầu tư lớn, khó mở rộng nhanh, cần nhân lực.',
       '<b>3. Cloud (IaaS/PaaS/SaaS):</b> trả theo mức dùng, mở rộng linh hoạt (đỉnh tải đăng ký học phần), triển khai nhanh; nhưng phụ thuộc nhà cung cấp và Internet, lo ngại dữ liệu.',
       '<b>4. Đề xuất Hybrid:</b> dữ liệu nhạy cảm (hồ sơ, điểm, tài chính) giữ nội bộ/private; dịch vụ co giãn (LMS, website, email, lưu trữ tài liệu, SaaS như Microsoft 365) đưa lên Cloud.',
       '<b>5. Kết luận &amp; lộ trình:</b> chuyển dần từng dịch vụ, bảo đảm sao lưu và kế hoạch dự phòng.')),
    ('Hãy trình bày các mô hình dịch vụ đám mây <b>IaaS, PaaS, SaaS</b> và cho ví dụ ứng dụng trong môi trường trường đại học (UEL).',
     g('<b>Tư duy:</b> định nghĩa → ai quản lý phần nào → ví dụ → khi nào dùng.',
       '<b>• IaaS</b> (hạ tầng): thuê máy chủ ảo, lưu trữ, mạng; trường tự cài hệ điều hành và ứng dụng. Ví dụ: thuê máy chủ ảo để chạy hệ thống thi trực tuyến mùa cao điểm.',
       '<b>• PaaS</b> (nền tảng): nhà cung cấp lo hạ tầng + môi trường chạy, trường chỉ phát triển ứng dụng. Ví dụ: nhóm phát triển của trường xây ứng dụng tra cứu lịch học trên nền tảng PaaS.',
       '<b>• SaaS</b> (phần mềm): dùng phần mềm hoàn chỉnh qua Internet. Ví dụ: Microsoft 365, Google Workspace, hệ thống LMS dạng dịch vụ.',
       '<b>Gợi ý ghi điểm:</b> vẽ bảng “ai quản lý gì” (trường vs nhà cung cấp) và nêu lợi ích: giảm chi phí đầu tư, mở rộng nhanh, nhưng cần quan tâm bảo mật và phụ thuộc nhà cung cấp.')),
    ('Hệ thống đăng ký học phần của UEL thường quá tải ở giờ đầu mở cổng. Hãy đề xuất giải pháp hạ tầng để hệ thống <b>luôn sẵn sàng và chịu tải cao</b>.',
     g('<b>Tư duy:</b> nguyên nhân → giải pháp theo từng tầng → kiểm tra.',
       '<b>1. Nguyên nhân:</b> lượng truy cập tăng đột biến cùng lúc, một máy chủ/đường truyền là điểm nghẽn.',
       '<b>2. Giải pháp:</b>',
       '• <b>Cân bằng tải</b> (load balancer) chia yêu cầu cho nhiều máy chủ ứng dụng.',
       '• <b>Mở rộng theo chiều ngang</b> (thêm máy chủ ảo/ Cloud tự co giãn).',
       '• <b>Bộ nhớ đệm (cache)</b> và tối ưu CSDL; hàng đợi để xử lý tuần tự.',
       '• <b>Dự phòng:</b> máy chủ/CSDL dự phòng, 2 đường Internet, nguồn điện dự phòng.',
       '• <b>Băng thông &amp; mạng:</b> ưu tiên lưu lượng (QoS) cho hệ thống đăng ký.',
       '<b>3. Vận hành:</b> thử tải trước đợt đăng ký, giám sát thời gian thực, kế hoạch khôi phục khi sự cố.')),
]))

# ------------------------------------------------------------------ T3
TOPICS.append(('An toàn thông tin & xu hướng hạ tầng số', [
    ('Hãy đề xuất các biện pháp <b>bảo mật hệ thống mạng và dữ liệu</b> của UEL (sinh viên, giảng viên, nhân viên). Giải thích tác dụng của từng biện pháp.',
     g('<b>Tư duy:</b> bảo vệ theo <i>nhiều lớp</i> (defense in depth) và theo nguyên tắc bảo mật CIA: bí mật – toàn vẹn – sẵn sàng.',
       '<b>1. Biên mạng:</b> Firewall lọc truy cập trái phép, IDS/IPS phát hiện tấn công, chặn DoS.',
       '<b>2. Phân vùng:</b> VLAN/DMZ tách mạng sinh viên khỏi mạng quản trị và máy chủ dữ liệu.',
       '<b>3. Mã hóa:</b> HTTPS/TLS cho web, VPN cho truy cập từ xa, WPA3 cho Wi-Fi, IPsec giữa các cơ sở.',
       '<b>4. Xác thực &amp; phân quyền:</b> tài khoản trường, SSO, xác thực nhiều lớp (MFA), phân quyền tối thiểu.',
       '<b>5. Dữ liệu:</b> sao lưu định kỳ và khôi phục thảm họa; chữ ký số để bảo đảm toàn vẹn/xác thực văn bản điện tử.',
       '<b>6. Con người:</b> đào tạo nhận thức (chống phishing), chính sách mật khẩu, nhật ký và giám sát.')),
    ('Hãy phân tích <b>xu hướng hạ tầng số</b> (5G, Edge Computing, IoT, Cloud, AI, an ninh mạng) và đề xuất cách UEL có thể áp dụng để xây dựng <b>Smart Campus</b>.',
     g('<b>Tư duy:</b> mỗi xu hướng → vấn đề nó giải quyết → ví dụ ở trường.',
       '• <b>Cloud:</b> triển khai nhanh, co giãn dịch vụ học tập số.',
       '• <b>5G/Wi-Fi 6:</b> kết nối tốc độ cao, mật độ thiết bị lớn tại giảng đường, ký túc xá.',
       '• <b>IoT:</b> cảm biến điều hòa/chiếu sáng, điểm danh thông minh, camera, quản lý chỗ ngồi thư viện.',
       '• <b>Edge Computing:</b> xử lý dữ liệu camera/cảm biến ngay tại chỗ để giảm độ trễ và băng thông.',
       '• <b>AI &amp; Data:</b> phân tích dữ liệu học tập, trợ lý ảo hỗ trợ sinh viên, dự báo nguy cơ bỏ học.',
       '• <b>An ninh mạng toàn diện:</b> bảo vệ chủ động xuyên suốt các thành phần trên.',
       '<b>Kết luận:</b> hạ tầng số là nền tảng — không có hạ tầng số tốt thì các công nghệ mới không thể thành công.')),
    ('So sánh mô hình <b>Client/Server</b> và <b>Peer-to-Peer</b>; theo bạn, mô hình nào phù hợp cho hệ thống e-learning của UEL và mô hình nào phù hợp để nhóm sinh viên chia sẻ tài liệu nội bộ? Giải thích.',
     g('<b>Tư duy:</b> so sánh theo tiêu chí → gắn với từng tình huống → kết luận.',
       '<b>1. Client/Server:</b> server luôn online, quản lý dữ liệu và người dùng tập trung, dễ phân quyền/bảo mật/sao lưu; cần server mạnh, có điểm lỗi tập trung.',
       '<b>2. Peer-to-Peer:</b> các máy ngang hàng chia sẻ trực tiếp, không cần hạ tầng đáng kể, mở rộng tốt nhưng khó quản trị và bảo mật; phù hợp nhóm nhỏ.',
       '<b>3. Áp dụng:</b> e-learning UEL (nhiều người dùng, dữ liệu nhạy cảm, cần phân quyền) → <b>Client/Server</b> (kết hợp Cloud). '
       'Nhóm bạn chia sẻ tài liệu tạm thời → có thể dùng P2P/chia sẻ ngang hàng, lưu ý bản quyền và an toàn.',
       '<b>4. Liên hệ:</b> socket, tiến trình client/server, địa chỉ IP + cổng (port).')),
    ('Nêu và giải thích <b>3 lý do</b> cần thiết kế hạ tầng mạng của trường theo <b>mô hình phân tầng (OSI/TCP-IP)</b>. Cho ví dụ ở UEL.',
     g('<b>Tư duy:</b> mỗi lý do kèm một ví dụ cụ thể.',
       '<b>1. Chia nhỏ độ phức tạp:</b> mỗi tầng một nhiệm vụ (Physical – cáp/sóng, Data Link – MAC/Switch, Network – IP/Router, Transport – TCP/UDP, Application – HTTP/DNS) nên dễ thiết kế, xử lý sự cố. '
       'Ví dụ: sinh viên không vào được cổng đào tạo → kiểm tra lần lượt Wi-Fi/cáp, địa chỉ IP, DNS, dịch vụ web.',
       '<b>2. Chuẩn hóa &amp; tương thích:</b> thiết bị nhiều hãng vẫn làm việc cùng nhau nhờ giao thức chuẩn (Ethernet, IP, TCP, HTTP).',
       '<b>3. Dễ nâng cấp/thay thế:</b> đổi công nghệ ở một tầng (Wi-Fi 5 → Wi-Fi 6) mà không phải thay đổi ứng dụng trên các tầng trên.',
       '<b>Gợi ý:</b> vẽ nhanh quá trình đóng gói dữ liệu khi sinh viên mở trang web của trường (HTTP → TCP → IP → Ethernet/Wi-Fi).')),
]))

chapter = {'chapterId': 'NT_C4', 'chapterName': 'Câu hỏi tự luận – tư duy thiết kế hạ tầng', 'topics': []}
for ti, (tname, items) in enumerate(TOPICS, 1):
    qs = []
    for k, (q, guide) in enumerate(items, 1):
        qs.append({'id': f'NT_C4_T{ti}_Q{k}', 'type': 'essay', 'question': q, 'options': {},
                   'explanation': guide})
    chapter['topics'].append({'topicId': f'NT_C4_T{ti}', 'topicName': tname, 'questions': qs})

json.dump(chapter, open(OUT + 'NT_C4.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

m = json.load(open(OUT + 'manifest.json', encoding='utf-8-sig'))
m['chapters'] = [c for c in m['chapters'] if c['chapterId'] != 'NT_C4']
m['chapters'].append({'chapterId': 'NT_C4', 'chapterName': chapter['chapterName'], 'topicCount': len(chapter['topics']),
                      'questionCount': sum(len(t['questions']) for t in chapter['topics'])})
m['chapters'].sort(key=lambda c: ['NT_C1', 'NT_C5', 'NT_C4', 'NT_C2', 'NT_C3'].index(c['chapterId']))  # ưu tiên: C1, C5, C4
for c in m['chapters']:
    c.pop('priority', None)
for _i, _cid in enumerate(['NT_C1', 'NT_C5', 'NT_C4'], 1):
    [c.update(priority=_i) for c in m['chapters'] if c['chapterId'] == _cid]
m['totalQuestions'] = sum(c['questionCount'] for c in m['chapters'])
m['totalTopics'] = sum(c['topicCount'] for c in m['chapters'])
json.dump(m, open(OUT + 'manifest.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(m['totalQuestions'], 'questions')
