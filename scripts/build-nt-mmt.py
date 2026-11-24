# -*- coding: utf-8 -*-
"""Sinh data/Nền tảng/NT_C5.json từ đề ôn tập Mạng máy tính (PDF, 112 câu) + cập nhật manifest."""
import json
import zlib

D = 'data/Nền tảng/'
L = 'ABCD'
CID, CNAME = 'NT_C5', 'Đề ôn tập Mạng máy tính'

T = []  # (topicName, [items]); item = (q, right, [w1,w2,w3], expl) hoặc ('fill', q, ans, [accepted], expl)

T.append(('Tầng mạng – IP, datagram, địa chỉ', [
    ('Trong datagram header, trường nào cho biết giao thức tầng giao vận (UDP, TCP) mà dữ liệu cần được chuyển tới?',
     'Upper-layer protocol', ['Type of service', 'Version', 'Identifier'],
     'Trường **Upper-layer protocol** chỉ ra giao thức tầng trên (TCP = 6, UDP = 17) sẽ nhận dữ liệu.'),
    ('Độ dài tối thiểu của header datagram IPv4 là bao nhiêu byte?', '20', ['15', '25', '30'],
     'Header IPv4 không có Options dài **20 byte**.'),
    ('Trong datagram header, trường nào bảo đảm datagram không đi vòng lặp mãi mãi?', 'Time-to-live',
     ['Header length', 'Datagram length', 'Options'],
     '**TTL** giảm 1 sau mỗi router; về 0 thì datagram bị hủy (và router gửi ICMP type 11).'),
    ('Trong datagram header, nhóm trường nào quản lý sự phân mảnh datagram?', 'Identifier, Flags, Fragmentation offset',
     ['Type of service, Datagram length, Fragmentation offset', 'Fragmentation offset, Header checksum, Upper-layer protocol',
      'Options, Type of service, Version'],
     'Phân mảnh dùng **Identifier + Flags + Fragmentation offset** để đánh dấu và ráp lại các mảnh.'),
    ('Các mảnh của datagram được ráp lại tại đâu?', 'Máy đích', ['Router nối với liên kết có khả năng vận chuyển cao hơn', 'Switch tốc độ cao', 'Repeater'],
     'Việc ráp lại (reassembly) chỉ thực hiện ở **end system đích**, không phải ở router.'),
    ('Công thức nào đúng?', 'Net ID = IP address AND Netmask', ['Netmask = IP address AND Net ID', 'IP address = Net ID AND Netmask', 'Net ID = IP address OR Netmask'],
     'Phép **AND** giữa địa chỉ IP và subnet mask cho ra địa chỉ mạng (Net ID).'),
    ('Cho hai địa chỉ IP 133.69.85.85 và 133.69.93.234. Với subnet mask nào thì hai máy cùng mạng?', 'Cả 255.255.224.0 và 255.255.240.0',
     ['Chỉ 255.255.224.0', 'Chỉ 255.255.240.0', 'Chỉ 255.255.248.0'],
     'Octet thứ 3: 85 = 01010101, 93 = 01011101, khác nhau ở bit giá trị 8. Mask 224 (/19) và 240 (/20) không xét bit này nên cùng mạng; mask 248 (/21) có xét nên khác mạng.'),
    ('Dải địa chỉ Private IPv4 là:', '10.x.x.x; 172.16–31.x.x; 192.168.x.x',
     ['100.x.x.x; 127.26–41.x.x; 162.198.x.x', '10.x.x.x; 172.26–41.x.x; 192.168.x.x', '100.x.x.x; 172.16–31.x.x; 162.198.x.x'],
     'Ba dải riêng theo RFC 1918: 10.0.0.0/8, 172.16.0.0–172.31.255.255, 192.168.0.0/16.'),
    ('Trong datagram header, trường nào cho biết phiên bản IP (IPv4, IPv6)?', 'Version', ['Type of service', 'Identifier', 'Upper-layer protocol'],
     'Trường **Version** (4 bit) xác định IPv4 hay IPv6.'),
    ('Giao thức tầng mạng nào quy định địa chỉ, định dạng gói tin và cách xử lý gói tin?', 'Internet Protocol (IP)',
     ['Internet Control Message Protocol (ICMP)', 'Routing Protocols', 'Address Resolution Protocol'],
     '**IP** định nghĩa địa chỉ, khuôn dạng datagram và quy ước xử lý.'),
    ('Giao thức tầng mạng nào dùng để xác định đường đi và xây dựng bảng định tuyến?', 'Routing Protocols',
     ['Internet Protocol (IP)', 'Internet Control Message Protocol (ICMP)', 'Address Resolution Protocol'],
     '**Routing protocols** (RIP, OSPF, BGP…) xây dựng bảng định tuyến.'),
    ('Giao thức tầng mạng nào thông báo thông tin về khả năng kết nối, lỗi và điều khiển?', 'Internet Control Message Protocol (ICMP)',
     ['Internet Protocol (IP)', 'Routing Protocols', 'Address Resolution Protocol'],
     '**ICMP** báo lỗi và thông tin điều khiển (ping, host unreachable, TTL expired…).'),
]))

T.append(('DHCP, NAT, ICMP, PING/Traceroute', [
    ('Khi một subnet không có DHCP server, router của nó chuyển yêu cầu tới DHCP server ở subnet khác thông qua:', 'DHCP relay agent',
     ['DHCP forwarding', 'DHCP forwarding relay', 'DHCP mask agent'],
     'Router đóng vai trò **DHCP relay agent** chuyển tiếp DHCP request/offer giữa hai subnet.'),
    ('NAT hỗ trợ tối đa khoảng bao nhiêu kết nối đồng thời (với một địa chỉ IP WAN)?', '2^16', ['2^8', '2^24', '2^32'],
     'Số hiệu cổng dài 16 bit nên NAT dùng cổng để phân biệt tối đa khoảng **65 536 (2^16)** kết nối.'),
    ('Giao thức nào giúp các máy bên ngoài kết nối được tới máy nằm sau NAT?', 'Universal Plug and Play (UPnP)',
     ['Plug and Play NAT', 'NAT conversion', 'Reversion Plug and Play'],
     '**UPnP** cho phép ứng dụng tự cấu hình ánh xạ cổng trên router NAT (NAT traversal).'),
    ('Máy chạy lệnh PING gửi gói ICMP loại nào?', 'Type 8 code 0', ['Type 0 code 0', 'Type 11 code 0', 'Type 3 code 2'],
     'Echo request: **Type 8, code 0**.'),
    ('Máy phản hồi lệnh PING gửi gói ICMP loại nào?', 'Type 0 code 0', ['Type 8 code 0', 'Type 11 code 0', 'Type 3 code 2'],
     'Echo reply: **Type 0, code 0**.'),
    ('Khi TTL = 0, router gửi ICMP loại nào?', 'Type 11 code 0', ['Type 0 code 0', 'Type 8 code 0', 'Type 3 code 2'],
     'TTL hết hạn: **Time exceeded – Type 11, code 0** (nguyên lý của traceroute).'),
    ('Ứng dụng PING dùng để:', 'Kiểm tra có thể gửi gói tin tới một địa chỉ hay không',
     ['Tìm đường đi ngắn nhất từ máy gửi đến máy nhận', 'Thể hiện đường đi từ máy gửi đến máy nhận', 'Đếm số kết nối giữa hai máy'],
     'PING kiểm tra khả năng kết nối (reachability) và đo RTT.'),
    ('Ứng dụng TRACEROUTE dùng để:', 'Thể hiện đường đi (các router) từ máy gửi đến máy nhận',
     ['Kiểm tra có kết nối được tới một máy hay không', 'Tìm đường đi ngắn nhất từ máy gửi đến máy nhận', 'Đếm số kết nối giữa hai máy'],
     'Traceroute tăng dần TTL và dựa vào ICMP type 11 để liệt kê từng hop.'),
]))

T.append(('Định tuyến RIP', [
    ('Phát biểu nào SAI về Routing Information Protocol (RIP)?', 'Tập hợp thông tin của tất cả router rồi mới xây dựng bảng định tuyến',
     ['Là thuật toán định tuyến động', 'Xây dựng bảng định tuyến từ các router kế bên', 'Không được thiết kế cho mạng lớn, mạng diện rộng'],
     'RIP là distance-vector: chỉ dựa vào thông tin các router láng giềng. Việc tập hợp thông tin toàn mạng là đặc trưng của link-state (OSPF).'),
    ('RIP dùng cổng và giao thức nào của tầng giao vận?', '520, UDP', ['250, TCP', '250, UDP', '520, TCP'], 'RIP chạy trên **UDP cổng 520**.'),
    ('Ứng dụng nào chạy RIP trên Windows?', 'RIP Listener', ['RIP Routing', 'Routed', 'Routing'], 'Trên Windows dùng **RIP Listener**.'),
    ('Ứng dụng nào chạy RIP trên UNIX BSD?', 'Routed', ['RIP Routing', 'RIP Listener', 'Routing'], 'Trên UNIX/BSD dùng tiến trình **routed**.'),
]))

T.append(('Tầng liên kết – MAC, ARP, Switch, cáp UTP', [
    ('Điều nào SAI về MAC address?', 'MAC address của card mạng thay đổi khi máy sang subnet khác',
     ['Gồm 48 bit', 'Địa chỉ broadcast là FF-FF-FF-FF-FF-FF', 'Source và destination MAC address nằm cùng một mạng (mỗi chặng)'],
     'MAC gắn với card mạng, không đổi khi chuyển subnet. Chỉ có MAC nguồn/đích trong frame thay đổi qua từng chặng.'),
    ('Giao thức dịch giữa địa chỉ tầng mạng và địa chỉ tầng liên kết là:', 'Address Resolution Protocol (ARP)',
     ['Domain Name System', 'Network Address Translation', 'Check Frame Protocol'], '**ARP** ánh xạ IP → MAC trong cùng mạng.'),
    ('Switch nhận gói tin, địa chỉ đích không có trong bảng chuyển tiếp thì sẽ:', 'Gửi gói tin ra tất cả các cổng còn lại',
     ['Hủy gói tin', 'Gửi ra một cổng ngẫu nhiên', 'Đệm gói tin và tìm cổng ra'], 'Switch **flooding** ra mọi cổng trừ cổng vào.'),
    ('Switch nhận gói tin mà bảng chuyển tiếp cho thấy cổng ra trùng cổng vào thì sẽ:', 'Hủy gói tin',
     ['Gửi ra tất cả các cổng còn lại', 'Gửi ra một cổng ngẫu nhiên', 'Đệm gói tin và tìm cổng ra'],
     'Đích nằm cùng đoạn mạng với nguồn nên switch **lọc (hủy)** gói tin.'),
    ('Phát biểu nào SAI về Switch?', 'Admin phải cấu hình bảng chuyển tiếp ban đầu khi bắt đầu hoạt động',
     ['Tự xây dựng bảng chuyển tiếp từ các gói tin đầu vào', 'Là "trong suốt" đối với end system và router', 'Hai liên kết khác loại có thể nối vào một switch'],
     'Switch tự học (self-learning) nên không cần cấu hình bảng chuyển tiếp ban đầu.'),
    ('Khi bấm dây chéo (crossover) hai đầu cáp UTP CAT5 vào đầu RJ45, cần lưu ý các cặp dây:', '(1,3) – (2,6) – (4,5) – (7,8)',
     ['(1,2) – (3,6) – (4,5) – (7,8)', '(1,2) – (4,7) – (3,5) – (6,8)', '(1,2) – (3,7) – (4,5) – (6,8)'],
     'Cáp chéo đảo cặp truyền/nhận: chân 1↔3 và 2↔6.'),
]))

T.append(('Firewall và IDS', [
    ('Loại firewall nào xây dựng bảng trạng thái kết nối để đối chiếu với luồng gói tin?', 'Stateful Filter',
     ['Traditional Packet Filter', 'Application Gateway', 'Network Address Translation'], '**Stateful filter** theo dõi trạng thái từng kết nối.'),
    ('Loại firewall nào kiểm tra các trường trong header của gói tin?', 'Traditional Packet Filter',
     ['Stateful Filter', 'Application Gateway', 'Network Address Translation'], 'Packet filter chỉ xét header (IP, cổng, cờ TCP).'),
    ('Loại firewall nào hoạt động ở mức ứng dụng (ví dụ proxy, cache DNS)?', 'Application Gateway',
     ['Traditional Packet Filter', 'Stateful Filter', 'Network Address Translation'], '**Application gateway** xử lý theo từng ứng dụng.'),
    ('Bastion host thuộc loại firewall nào?', 'Application Gateway', ['Traditional Packet Filter', 'Stateful Filter', 'Network Address Translation'],
     'Bastion host chạy proxy/ứng dụng chịu tấn công nên thuộc application gateway.'),
    ('Bastion host thuộc mô hình firewall nào?', 'Screened Host Firewall và Screened-Subnet Firewall',
     ['Chỉ Packet filtering router', 'Chỉ Screened Host Firewall', 'Chỉ Screened-Subnet Firewall'],
     'Bastion host có mặt trong cả hai mô hình Screened Host và Screened-Subnet.'),
    ('Vùng phi quân sự (DMZ) thuộc mô hình firewall nào?', 'Screened-Subnet Firewall',
     ['Packet filtering router', 'Screened Host Firewall', 'Cả Screened Host và Screened-Subnet'], 'DMZ là mạng con đệm của **Screened-Subnet**.'),
    ('Bastion host có hai network interface thuộc mô hình nào?', 'Dual-Homed Bastion Host', ['Single-Homed Bastion Host', 'Screened Router', 'Multi-Homed Gateway'],
     'Hai card mạng (một trong, một ngoài) = **dual-homed**.'),
    ('Loại IDS nào dựa trên cơ sở dữ liệu các dạng tấn công đã biết?', 'Signature-based system', ['Anomaly-based system', 'Behavior-based system', 'Packet-based system'],
     'Signature-based so khớp "chữ ký" tấn công đã biết.'),
    ('Loại IDS nào dựa vào các luồng gói tin "bất thường", có thể phát hiện tấn công mới?', 'Anomaly-based system', ['Signature-based system', 'Behavior-based system', 'Packet-based system'],
     'Anomaly-based phát hiện lệch khỏi mẫu hoạt động bình thường.'),
    ('Trong Windows Firewall, phần nào cho phép máy bên ngoài thiết lập kết nối tới máy này?', 'Inbound Rules', ['Outbound Rules', 'Connection Rules', 'Security Rules'],
     '**Inbound** = kết nối vào.'),
    ('Trong Windows Firewall, phần nào cho phép máy này thiết lập kết nối ra máy bên ngoài?', 'Outbound Rules', ['Inbound Rules', 'Connection Rules', 'Security Rules'],
     '**Outbound** = kết nối ra.'),
]))

T.append(('Mã hóa, chữ ký số, AAA', [
    ('Văn bản đã được mã hóa (encrypted) gọi là:', 'Ciphertext', ['Plaintext', 'Code', 'Encryption'], '**Ciphertext** là bản mã; plaintext là bản rõ.'),
    ('Mã hóa và giải mã dùng cùng một khóa là loại mã hóa nào?', 'Symmetric', ['Digital Signature', 'Message Digest', 'Asymmetric'], '**Đối xứng** dùng một khóa chung.'),
    ('Mã hóa và giải mã dùng khác khóa là loại mã hóa nào?', 'Asymmetric', ['Digital Signature', 'Message Digest', 'Symmetric'], '**Bất đối xứng** dùng cặp khóa public/private.'),
    ('Loại khóa nào dùng để mã hóa (encrypting) trong mã hóa bất đối xứng?', 'Public Key', ['Private Key', 'Session Key', 'Secret Key'], 'Bên gửi mã hóa bằng khóa công khai của người nhận.'),
    ('Loại khóa nào dùng để giải mã (decrypting)?', 'Private Key', ['Public Key', 'Session Key', 'Shared Key'], 'Người nhận giải mã bằng khóa riêng của mình.'),
    ('Ứng dụng nào bảo đảm người nhận xác định được người gửi, người gửi không thể chối bỏ nội dung và người nhận không thể tự bịa thông tin?', 'Digital Signature',
     ['Message Digest', 'Symmetric', 'Asymmetric'], '**Chữ ký số** đảm bảo xác thực và chống chối bỏ (non-repudiation).'),
    ('Ứng dụng nào bảo đảm nội dung hợp đồng không bị thay đổi?', 'Message Digest', ['Digital Signature', 'Private Key & Public Key', 'Symmetric & Asymmetric'],
     '**Message digest** (hàm băm) đảm bảo toàn vẹn dữ liệu.'),
    ('Ứng dụng nào bảo đảm xác thực các bên tham gia hợp đồng?', 'Digital Signature', ['Message Digest', 'Private Key & Public Key', 'Symmetric & Asymmetric'],
     'Chữ ký số xác thực danh tính bên ký.'),
    ('Giao thức nào thường dùng cùng IMAP, SMTP, HTTP, FTP để bảo mật?', 'SSL', ['ICMP', 'IPSec', 'RIP'], '**SSL/TLS** mã hóa kết nối tầng ứng dụng (HTTPS, SMTPS, IMAPS, FTPS).'),
    ('Trong AAA, thuật ngữ nào liên quan đến xác thực người dùng?', 'Authentication', ['Authorization', 'Accounting', 'Availability'], 'Authentication = xác thực.'),
    ('Trong AAA, thuật ngữ nào liên quan đến phân quyền truy cập?', 'Authorization', ['Authentication', 'Accounting', 'Availability'], 'Authorization = cấp quyền.'),
    ('Trong AAA, log file liên quan đến thuật ngữ nào?', 'Accounting', ['Authentication', 'Authorization', 'Availability'], 'Accounting = ghi nhận, kiểm toán.'),
    ('Trong IIS, để cho phép mọi người dùng truy cập (không cần tài khoản) dùng:', 'Anonymous Authentication', ['Basic Authentication', 'Windows Authentication', 'Digest Authentication'],
     'Anonymous cho truy cập ẩn danh.'),
    ('Trong IIS, để cho phép tài khoản người dùng cụ thể truy cập dùng:', 'Basic Authentication', ['Anonymous Authentication', 'Forms Authentication', 'Certificate Mapping'],
     'Basic yêu cầu username/password của tài khoản cụ thể.'),
]))

T.append(('Tầng ứng dụng – DNS, HTTP, FTP, mail, proxy', [
    ('Khi một máy chạy nhiều ứng dụng mạng, gói tin được chuyển đúng ứng dụng nhờ phân biệt bằng:', 'Port numbers', ['Sockets', 'Domain names', 'IP addresses'],
     'IP xác định máy, **số hiệu cổng** xác định tiến trình.'),
    ('Giao thức ứng dụng nào dùng UDP của tầng giao vận?', 'DNS', ['HTTP', 'FTP', 'SMTP'], 'DNS truy vấn thường dùng UDP cổng 53.'),
    ('Loại truy vấn DNS mà một DNS server nhờ DNS server khác hỏi hộ và trả về Resource Record là:', 'Recursive', ['Iterative', 'dnsinformative', 'nsinformative'],
     '**Recursive**: server nhận truy vấn chịu trách nhiệm hỏi tiếp và trả kết quả cuối.'),
    ('Để thiết lập quyền truy cập shared folder cho tài khoản truy cập từ xa, cần cấu hình:', 'Share permissions', ['Tab Security', 'Giao thức SMB', 'Giao thức NetBIOS'],
     '**Share permissions** áp dụng cho truy cập qua mạng.'),
    ('Proxy server nhận kết nối từ Internet rồi chuyển tới web server nội bộ gọi là:', 'Reverse proxy', ['Forward proxy', 'NAT', 'Traversal'],
     '**Reverse proxy** đứng trước web server.'),
    ('Proxy server nhận kết nối từ client trong LAN rồi ra Internet tới web server gọi là:', 'Forward proxy', ['Reverse proxy', 'NAT', 'Traversal'],
     '**Forward proxy** đại diện cho client.'),
    ('Chức năng nào KHÔNG thuộc proxy server?', 'Định tuyến, chia sẻ tài nguyên',
     ['Trung gian giao tiếp giữa server và client', 'Cache dữ liệu, xác thực người dùng', 'Đặt giới hạn truy cập như kích thước file, nguồn dữ liệu'],
     'Định tuyến là nhiệm vụ của router, không phải proxy.'),
    ('Trong HTTP, Conditional GET dùng để:', 'Xác định đối tượng có bị sửa đổi hay chưa trước khi tải về cache',
     ['Giới hạn số kết nối tới server', 'Xếp hàng chờ tới lượt mới gửi tập tin', 'Giới hạn truy cập của client theo điều kiện'],
     'Conditional GET (If-Modified-Since) tránh tải lại đối tượng chưa thay đổi.'),
    ('Giao thức FTP, control connection trên server dùng cổng:', '21', ['20', '53', '80'], 'Control = 21, data (active) = 20.'),
    ('Phát biểu nào SAI về SMTP?', 'Là giao thức lấy email về', ['Là giao thức gửi email đi', 'Mã hóa nội dung theo ASCII', 'Dùng persistent connection'],
     'SMTP chỉ để **gửi**; lấy thư về dùng POP3/IMAP.'),
    ('Trong DNS, dịch vụ Alias nghĩa là:', 'Alias hostname dễ nhớ hơn canonical hostname',
     ['Phân phối tải giữa các replicated server có IP khác nhau', 'Dịch domain name sang địa chỉ IP', 'Tích hợp địa chỉ IP vào end system'],
     'Alias (CNAME) = tên dễ nhớ ánh xạ về tên chuẩn.'),
    ('Trong DNS, dịch vụ Load distribution nghĩa là:', 'Phân phối tải giữa các replicated server có IP khác nhau',
     ['Alias hostname dễ nhớ hơn canonical hostname', 'Dịch domain name sang địa chỉ IP', 'Tích hợp địa chỉ IP vào end system'],
     'Một tên miền trả về nhiều IP, luân phiên để chia tải.'),
    ('DNS record nào có Value là canonical hostname của mail server?', 'MX', ['A', 'NS', 'CNAME'], 'Record **MX** chỉ mail server của domain.'),
    ('Máy chủ nhận thư gồm các giao thức lấy email về (POP3, IMAP, HTTP) gọi là:', 'Incoming Mail Server', ['Outgoing Mail Server', 'Relay Mail Server', 'Proxy Mail Server'],
     'Incoming dùng POP3/IMAP; outgoing dùng SMTP.'),
    ('Máy chủ passive FTP mở cổng:', '21 và một cổng ngẫu nhiên > 1023', ['21 và 20', '20 và một cổng ngẫu nhiên > 1023', 'Hai cổng ngẫu nhiên > 1023'],
     'Passive: control cổng 21, data cổng ngẫu nhiên > 1023 do server chọn.'),
    ('Các đối tượng giao tiếp với nhau ở tầng ứng dụng là:', 'Process', ['Socket', 'Domain name', 'IP address'], 'Các **tiến trình (process)** trên hai host trao đổi thông điệp.'),
    ('Giao diện giữa tầng ứng dụng và tầng giao vận là:', 'Socket', ['Process', 'Domain name', 'IP address'], '**Socket** là cổng giao tiếp giữa hai tầng.'),
    ('Resource Record (www.yourwebsite.vn, 111.24.35.57, A) nằm ở loại DNS server nào?', 'Authoritative DNS Server', ['Root DNS Server', 'TLD DNS Server', 'Local DNS Server'],
     'Bản ghi tên miền cụ thể do **authoritative server** của tổ chức lưu.'),
    ('Các tên miền .com, .vn, .edu… do server nào quản lý?', 'Top-level domain (TLD) server', ['Root server', 'Authoritative server', 'Local DNS server'],
     'TLD server quản lý các miền cấp cao nhất.'),
    ('Trên Windows, dịch vụ nào thực hiện truy vấn tới DNS server?', 'DNS Client', ['DNS Server', 'DHCP Client', 'Resolver Server'], 'Dịch vụ **DNS Client** gửi truy vấn.'),
    ('Passive FTP giải quyết vấn đề gì?', 'Firewall chặn kết nối từ server về client', ['Tốc độ truyền file thấp', 'Mất dữ liệu khi truyền', 'Không có tài khoản truy cập'],
     'Trong passive, client khởi tạo cả hai kết nối nên không bị firewall phía client chặn.'),
    ('Trong Passive FTP, máy nào gửi yêu cầu kết nối?', 'Client cho cả control connection và data connection', ['Server cho data connection', 'Server cho control connection', 'Chỉ client cho control connection'],
     'Passive: client chủ động mở cả hai kết nối.'),
    ('Trong Active FTP, máy nào gửi yêu cầu kết nối?', 'Client mở control connection, server mở data connection', ['Client mở cả hai kết nối', 'Server mở cả hai kết nối', 'Server mở control, client mở data'],
     'Active: client mở control (21), server mở data từ cổng 20 về client.'),
    ('Máy chủ SMTP mở cổng nào?', '25', ['21', '80', '110'], 'SMTP dùng cổng **25**.'),
    ('Máy chủ active FTP mở các cổng nào?', '20 và 21', ['21 và 22', '20 và 80', '21 và 110'], 'Active FTP: 21 (control), 20 (data).'),
    ('Máy chủ HTTP mở cổng nào?', '80', ['21', '25', '443'], 'HTTP dùng cổng **80** (HTTPS dùng 443).'),
]))

T.append(('Tầng giao vận – TCP, UDP, port number', [
    ('Gói tin (segment) tầng giao vận được xử lý tại:', 'Host end system', ['Switch', 'Router', 'Wireless Access Point'], 'Tầng giao vận chỉ chạy ở các **end system**.'),
    ('Ứng dụng thời gian thực thường dùng giao thức tầng giao vận nào?', 'UDP', ['TCP', 'ICMP', 'ARP'], 'UDP nhanh, không có thiết lập kết nối/truyền lại.'),
    ('Ứng dụng chấp nhận mất một phần nhỏ dữ liệu sử dụng giao thức tầng giao vận nào?', 'UDP', ['TCP', 'ICMP', 'ARP'], 'Ví dụ DNS, game trực tuyến, streaming.'),
    ('Giao thức tầng giao vận nào hướng kết nối và tin cậy?', 'TCP', ['UDP', 'IP', 'ICMP'], 'TCP: connection-oriented, reliable.'),
    ('Giao thức tầng giao vận nào không kết nối và không tin cậy?', 'UDP', ['TCP', 'IP', 'FTP'], 'UDP: connectionless, best-effort.'),
    ('Trường nào trong header segment xác định socket mà dữ liệu cần chuyển đến?', 'Port number', ['IP address', 'MAC address', 'Process Identifier (PID)'], 'Port number xác định tiến trình/socket.'),
    ('Source port number là gì?', 'Port number của tiến trình máy gửi', ['Port number của máy gửi', 'Port number của máy nhận', 'Port number của tiến trình máy nhận'],
     'Port gắn với tiến trình ở phía gửi.'),
    ('Destination port number là gì?', 'Port number của tiến trình máy nhận', ['Port number của máy gửi', 'Port number của máy nhận', 'Port number của tiến trình máy gửi'],
     'Port gắn với tiến trình ở phía nhận.'),
    ('Port number được mã hóa bằng bao nhiêu bit?', '16', ['8', '24', '32'], '16 bit → 0–65535.'),
    ('Well-known port numbers gồm dải:', '0 – 1023', ['1024 – 49151', '49152 – 65535', '1 – 255'], 'Cổng 0–1023 dành cho các dịch vụ phổ biến.'),
    ('Phát biểu nào SAI về port number?', 'Nhiều ứng dụng chạy cùng lúc trên một máy có thể dùng chung một port number',
     ['Hai máy khách cùng giao tiếp một máy chủ có thể có port giống nhau', 'Cùng một ứng dụng, port ở máy chủ có thể khác port ở máy khách', 'Một ứng dụng có thể dùng từ hai port trở lên'],
     'Mỗi port tại một thời điểm chỉ thuộc về một tiến trình trên một máy.'),
    ('Dữ liệu truyền đồng thời hai hướng, gửi và nhận cùng lúc gọi là:', 'Full duplex', ['Half duplex', 'Simplex mode', 'Complex mode'], '**Full duplex** hai chiều đồng thời.'),
    ('Trong TCP header, trường nào giúp phân đoạn và hợp đoạn dữ liệu theo thứ tự?', 'Sequence & Acknowledgement number',
     ['Source & Destination port number', 'Receive window & Urgent data pointer', 'Flags & Internet checksum'], 'Hai số này đánh dấu thứ tự byte.'),
    ('Trong TCP header, trường nào ghi chỉ số byte đầu tiên của đoạn dữ liệu được gửi đi?', 'Sequence number', ['Acknowledgement number', 'Receive window', 'Urgent data pointer'],
     'Sequence number = số thứ tự byte đầu của segment.'),
    ('Trong TCP header, trường nào quản lý flow control?', 'Receive Window', ['Sequence number', 'Internet Checksum', 'Urgent Data Pointer'], 'Receive window cho biết bộ đệm còn trống của bên nhận.'),
    ('Khoảng thời gian từ lúc gửi gói tin đến lúc nhận được phản hồi gọi là:', 'RTT', ['TTL', 'MTU', 'Timeout'], '**RTT** (Round-Trip Time).'),
    ('Trong TCP header, trường nào dùng để kiểm lỗi?', 'Internet Checksum', ['Receive Window', 'Urgent Data Pointer', 'Acknowledgement number'], 'Checksum phát hiện lỗi bit.'),
    ('Trong TCP header, trường nào ghi chỉ số byte cuối cùng của dữ liệu khẩn cấp?', 'Urgent Data Pointer', ['Sequence number', 'Receive Window', 'Internet Checksum'], 'Dùng cùng cờ URG.'),
    ('Trong TCP header, trường nào ghi chỉ số byte đầu tiên của đoạn dữ liệu kế tiếp mà bên nhận yêu cầu gửi?', 'Acknowledgement Number', ['Sequence number', 'Receive Window', 'Urgent Data Pointer'],
     'ACK number = byte mong đợi tiếp theo.'),
    ('Trong quá trình bắt tay TCP, cờ SYN được bật ở gói tin thứ mấy?', 'Gói 1 và 2', ['Gói 2 và 3', 'Gói 1 và 3', 'Gói 3 và 4'], 'SYN, SYN+ACK, ACK: SYN bật ở gói 1 và 2.'),
    ('Trong bắt tay TCP, cờ ACK được bật từ gói tin thứ mấy?', 'Gói thứ 2', ['Gói thứ 1', 'Gói thứ 3 trở đi', 'Gói thứ 4'], 'ACK xuất hiện từ gói SYN+ACK (gói 2) trở đi.'),
    ('Máy A nhận yêu cầu kết nối TCP nhưng không chấp nhận cổng được yêu cầu. Cờ nào bật trong gói phản hồi?', 'RST', ['URG', 'PSH', 'FIN'], 'RST từ chối/đặt lại kết nối.'),
    ('Cờ nào thông báo chuyển dữ liệu lên tầng trên ngay lập tức?', 'PSH', ['URG', 'RST', 'FIN'], 'PSH yêu cầu đẩy dữ liệu lên ứng dụng ngay.'),
    ('Cờ nào liên quan đến việc đóng kết nối?', 'FIN', ['URG', 'PSH', 'RST'], 'FIN báo hết dữ liệu và kết thúc kết nối.'),
    ('Cờ nào thông báo có dữ liệu khẩn cấp?', 'URG', ['PSH', 'RST', 'FIN'], 'URG kết hợp Urgent Data Pointer.'),
]))

T.append(('Internet tổng quan', [
    ('Trong sơ đồ network of networks, ISP kết nối với hai hay nhiều ISP nhà cung cấp gọi là:', 'Multi-homing', ['Point of presence (PoP)', 'Peering', 'Internet exchange point (IXP)'],
     '**Multi-homing**: nhiều nhà cung cấp để dự phòng/tối ưu.'),
    ('Tổ chức sử dụng thiết bị, công nghệ để kết nối các ISP với nhau gọi là:', 'Internet exchange point (IXP)', ['Point of presence (PoP)', 'Multi-homing', 'Peering'],
     'IXP là nơi các ISP trao đổi lưu lượng.'),
    ('Internet access ADSL (Asymmetric Digital Subscriber Line), chữ "A" (asymmetric) nghĩa là:', 'Kênh downstream và upstream có tốc độ khác nhau',
     ['Nhiều kết nối cùng lúc trên một đường truyền', 'Đường truyền được chia kênh', 'Tách tín hiệu điện thoại khỏi Internet'], 'Asymmetric = bất đối xứng tốc độ tải xuống/tải lên.'),
    ('Tài liệu về các tiêu chuẩn Internet, giao thức của IETF gọi là:', 'Requests for Comments (RFC)', ['Internet protocols in deep', 'Internet theories & protocols', 'Internet Standards Book'],
     'RFC do IETF công bố.'),
    ('Các end system được kết nối với nhau qua:', 'Communication links và packet switches', ['Cables và routers', 'Routers và radio spectrum', 'Wireless devices và routers'],
     'Hạ tầng Internet gồm liên kết truyền thông và các thiết bị chuyển mạch gói.'),
]))

# ------------------------------------------------------------------ build
topics = []
nq = 0
for ti, (tname, items) in enumerate(T, 1):
    qs = []
    for k, (q, right, wrongs, expl) in enumerate(items, 1):
        assert len(wrongs) == 3 and len({right, *wrongs}) == 4, q
        qid = f'{CID}_T{ti}_Q{k}'
        pos = zlib.crc32(qid.encode()) % 4
        opts = list(wrongs)
        opts.insert(pos, right)
        qs.append({'id': qid, 'question': q, 'options': {L[i]: opts[i] for i in range(4)}, 'correctAnswer': L[pos], 'explanation': expl})
    nq += len(qs)
    topics.append({'topicId': f'{CID}_T{ti}', 'topicName': tname, 'questions': qs})

json.dump({'chapterId': CID, 'chapterName': CNAME, 'topics': topics}, open(D + CID + '.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

m = json.load(open(D + 'manifest.json', encoding='utf-8'))
m['chapters'] = [c for c in m['chapters'] if c['chapterId'] != CID]
m['chapters'].append({'chapterId': CID, 'chapterName': CNAME, 'topicCount': len(topics), 'questionCount': nq})
m['totalQuestions'] = sum(c['questionCount'] for c in m['chapters'])
m['totalTopics'] = sum(c['topicCount'] for c in m['chapters'])
json.dump(m, open(D + 'manifest.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(nq, 'questions;', m['totalQuestions'], 'total')
