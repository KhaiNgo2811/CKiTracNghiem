# -*- coding: utf-8 -*-
"""Bổ sung giải thích (kiểu Nhà kho: in đậm ý chính + lý do loại các đáp án sai) cho NT_C1 và NT_C2."""
import json

D = 'data/Nền tảng/'
E = {}

# ---------------- NT_C1 ----------------
E.update({
 'NT_C1_T1_Q1': '**Router** (bộ định tuyến) kết nối các mạng khác nhau và chuyển tiếp gói tin giữa chúng theo địa chỉ IP. Modem chỉ chuyển đổi tín hiệu, Switch/Hub nối các thiết bị trong cùng một mạng.',
 'NT_C1_T1_Q2': '**HTTP** là giao thức truyền tải web phổ biến nhất trên Internet. SMTP dùng gửi email, SNMP quản trị thiết bị mạng, FTP truyền tập tin.',
 'NT_C1_T1_Q3': 'IPv4 dùng địa chỉ **32 bit** (4 octet, khoảng 4,3 tỷ địa chỉ). 128 bit là của IPv6.',
 'NT_C1_T1_Q4': '**Switch** hoạt động ở tầng 2 (Data Link), chuyển khung (frame) theo địa chỉ MAC. Router ở tầng 3, Repeater ở tầng 1, Firewall chủ yếu tầng 3–4 trở lên.',
 'NT_C1_T1_Q5': '**DHCP** cấp phát địa chỉ IP tự động (kèm mặt nạ, gateway, DNS). DNS phân giải tên miền, TCP truyền tin cậy, IPSec bảo mật gói IP.',
 'NT_C1_T1_Q6': 'CSMA/CD được thiết kế cho **mạng có dây dùng chung đường truyền** (Ethernet cáp đồng trục) để phát hiện xung đột. Mạng không dây dùng CSMA/CA vì không phát hiện xung đột được khi đang phát.',
 'NT_C1_T1_Q7': 'Khi phát hiện xung đột, các trạm **hủy bản tin, đợi một khoảng thời gian ngẫu nhiên (backoff) rồi gửi lại**. Gửi lại ngay sẽ lại va chạm tiếp.',
 'NT_C1_T1_Q8': '**Repeater** chỉ khuếch đại/tái tạo tín hiệu ở tầng vật lý để đi xa hơn, không phân tích dữ liệu. Router và Switch phân tích địa chỉ để chuyển tiếp.',
 'NT_C1_T1_Q9': '**Access Point** cho các thiết bị không dây kết nối vào mạng có dây. Hub/Switch chỉ nối thiết bị có dây, Firewall dùng để bảo vệ.',
 'NT_C1_T1_Q10': '**Firewall** (tường lửa) lọc lưu lượng theo quy tắc để chặn truy cập trái phép từ bên ngoài.',
 'NT_C1_T2_Q1': 'Tầng Network lo **định tuyến và chuyển tiếp gói tin** giữa các mạng. Mã hóa là tầng Presentation, kiểm tra lỗi chủ yếu ở Data Link/Transport, quản lý phiên là tầng Session.',
 'NT_C1_T2_Q2': '**IP** là giao thức của tầng Network. TCP ở tầng Transport; HTTP và FTP ở tầng Application.',
 'NT_C1_T2_Q3': '**Router** làm việc chủ yếu ở tầng Network (dựa vào địa chỉ IP). Switch là tầng 2, Hub và Repeater là tầng 1.',
 'NT_C1_T2_Q4': 'Tầng Network định danh bằng **địa chỉ IP** (logic). Địa chỉ MAC/vật lý thuộc tầng Data Link, cổng (port) thuộc tầng Transport.',
 'NT_C1_T2_Q5': 'Đơn vị dữ liệu tầng Network là **Packet** (gói tin). Bit – Physical, Frame – Data Link, Segment – Transport.',
 'NT_C1_T3_Q1': 'Tầng Transport **truyền dữ liệu tin cậy end-to-end** giữa các tiến trình/thiết bị. Định tuyến thuộc Network, mã hóa thuộc Presentation, địa chỉ IP thuộc Network.',
 'NT_C1_T3_Q2': '**TCP** (và UDP) là giao thức tầng Transport. IP và ARP thuộc tầng thấp hơn, HTTP thuộc tầng Application.',
 'NT_C1_T3_Q3': 'UDP **không kiểm tra lỗi, không đảm bảo thứ tự và không bắt tay**, nên nhanh và nhẹ hơn TCP. UDP không có mã hóa, không phụ thuộc môi trường có dây và không cần người dùng xác nhận.',
 'NT_C1_T3_Q4': 'Đơn vị dữ liệu tầng Transport là **Segment** (TCP) / Datagram (UDP). Bit – Physical, Frame – Data Link, Packet – Network.',
 'NT_C1_T3_Q5': '**Số cổng (port)** xác định ứng dụng/dịch vụ đích trên thiết bị (vd HTTP:80). IP xác định thiết bị, không phải port.',
 'NT_C1_T4_Q1': 'Phiên làm việc là **kết nối tạm thời giữa hai thiết bị để trao đổi dữ liệu**, có thiết lập – duy trì – kết thúc.',
 'NT_C1_T4_Q2': '**Tầng Session** (tầng 5) quản lý thiết lập, duy trì và kết thúc phiên.',
 'NT_C1_T4_Q3': 'Một phiên bắt đầu bằng **xác thực và thiết lập kết nối** giữa hai bên rồi mới trao đổi dữ liệu.',
 'NT_C1_T4_Q4': 'Tầng Session dùng **điểm kiểm tra (checkpoint)** để khôi phục phiên từ vị trí gần nhất thay vì gửi lại toàn bộ.',
 'NT_C1_T4_Q5': '**Cuộc gọi video** duy trì kết nối liên tục có thiết lập và kết thúc, là ví dụ rõ nhất của phiên. Duyệt web, gửi email, tải file là các giao dịch rời rạc.',
 'NT_C1_T5_Q1': '**HTTP** là giao thức tầng ứng dụng. TCP – Transport, IP – Network, ARP – Data Link/Network.',
 'NT_C1_T5_Q2': 'Tầng ứng dụng **cung cấp giao diện cho người dùng và ứng dụng** truy cập dịch vụ mạng. Định tuyến, mã hóa, địa chỉ IP thuộc các tầng khác.',
 'NT_C1_T5_Q3': '**FTP** (File Transfer Protocol) dùng để truyền tập tin. Web dùng HTTP, email dùng SMTP.',
 'NT_C1_T5_Q4': '**SMTP** dùng để gửi email. DNS phân giải tên miền, DHCP cấp IP, SNMP quản trị mạng.',
 'NT_C1_T6_Q1': '**802.11ax (Wi-Fi 6)** có tốc độ cao nhất trong các chuẩn liệt kê; thứ tự: g < n < ac < ax.',
 'NT_C1_T6_Q2': 'Wi-Fi phổ biến dùng hai băng tần **2.4 GHz và 5 GHz** (Wi-Fi 6E thêm 6 GHz).',
 'NT_C1_T6_Q3': '**Router** (có chức năng phát Wi-Fi) phát tín hiệu cho thiết bị kết nối. Switch không phát sóng, Modem điều chế tín hiệu, Repeater chỉ khuếch đại.',
 'NT_C1_T6_Q4': '**WPA3** là chuẩn bảo mật mới nhất, an toàn hơn WPA2; WEP và WPA đã lỗi thời.',
 'NT_C1_T7_Q1': 'Tường lửa **bảo vệ mạng khỏi truy cập trái phép** bằng cách lọc lưu lượng theo chính sách.',
 'NT_C1_T7_Q2': 'Tường lửa truyền thống lọc ở **tầng 3 và 4** (IP, cổng). Loại thế hệ mới có thể kiểm tra đến tầng 7.',
 'NT_C1_T7_Q3': '**Application-layer firewall** kiểm tra nội dung (tầng ứng dụng) của gói tin. Packet-filtering chỉ xét IP/port, stateful theo dõi trạng thái kết nối.',
 'NT_C1_T7_Q4': 'Tường lửa có thể triển khai **trên cả phần cứng (thiết bị chuyên dụng) và phần mềm** (trên máy chủ, máy trạm).',
 'NT_C1_T7_Q5': 'Tường lửa giúp hạn chế **tấn công từ chối dịch vụ (DoS)** từ bên ngoài. Nó không ngăn được tấn công vật lý.',
 'NT_C1_T8_Q1': 'Mục tiêu chính của mã hóa là **bảo vệ tính bí mật** của thông tin. Nó không nhằm tăng tốc, giảm dung lượng hay hỗ trợ định tuyến.',
 'NT_C1_T8_Q2': '**HTTPS** (HTTP trên TLS/SSL) mã hóa đầu cuối kết nối web. HTTP, FTP, SMTP gốc truyền dữ liệu dạng rõ.',
 'NT_C1_T8_Q3': '**Tấn công thụ động** (nghe lén, theo dõi) chỉ đánh cắp thông tin mà không sửa dữ liệu. Tấn công chủ động, DoS và giả mạo đều làm thay đổi hoặc gián đoạn hệ thống.',
 'NT_C1_T8_Q4': 'Chữ ký số đảm bảo **tính toàn vẹn và xác thực** (nguồn gốc, không bị sửa). Bí mật là việc của mã hóa.',
 'NT_C1_T8_Q5': '**IPsec** mã hóa ở tầng mạng (Network). SSL/TLS làm việc ở tầng trên (giữa Transport và Application), SSH ở tầng ứng dụng.',
 'NT_C1_T9_Q1': '**127.0.0.1** là địa chỉ loopback (tự trỏ về chính máy). 192.168.1.1 và 10.0.0.1 là địa chỉ riêng, 255.255.255.0 là mặt nạ mạng.',
 'NT_C1_T9_Q2': 'Dải riêng: 10.0.0.0/8, **172.16.0.0–172.31.255.255**, 192.168.0.0/16. Các địa chỉ còn lại là địa chỉ công cộng/tài liệu.',
 'NT_C1_T9_Q3': 'Bảng định tuyến giúp router **xác định đường đi tốt nhất để chuyển tiếp gói tin** đến mạng đích.',
 'NT_C1_T9_Q4': '**Next Hop** là địa chỉ IP của router kế tiếp trên đường đi, không phải đích cuối cùng.',
 'NT_C1_T9_Q5': 'Router chọn tuyến **khớp cụ thể nhất (longest prefix match)**, tức là mặt nạ dài nhất.',
 'NT_C1_T9_Q6': '**DHCP** gán IP tự động. DNS phân giải tên, ARP ánh xạ IP–MAC, ICMP báo lỗi/ping.',
 'NT_C1_T10_Q1': '**SaaS** (Software as a Service): phần mềm được cung cấp qua Internet, người dùng không quản lý hạ tầng. Google Docs, Microsoft 365 là ví dụ điển hình.',
 'NT_C1_T10_Q2': '/26 có 64 địa chỉ mỗi mạng con (khối 192.168.10.0–.63); địa chỉ cuối của khối là **broadcast: 192.168.10.63**.',
 'NT_C1_T10_Q3': 'Tầng **Network** (tầng 3) thực hiện định tuyến gói tin giữa các mạng.',
 'NT_C1_T10_Q4': 'Tầng **Transport** (tầng 4) bảo đảm truyền tin cậy, đúng thứ tự, không trùng lặp (TCP).',
 'NT_C1_T10_Q5': 'Tầng ứng dụng là tầng **7** (trên cùng) của mô hình OSI.',
 'NT_C1_T10_Q6': '**HTTP/HTTPS** là giao thức tầng ứng dụng để truyền tải nội dung web.',
 'NT_C1_T10_Q7': 'Tầng **Application** (tầng 7) giao tiếp trực tiếp với người dùng qua trình duyệt, email...',
 'NT_C1_T10_Q8': 'Tầng **Presentation** (tầng 6) lo mã hóa, nén và chuyển đổi định dạng dữ liệu.',
 'NT_C1_T10_Q9': '**MQTT** là giao thức publish/subscribe rất nhẹ, tối ưu cho IoT có tài nguyên hạn chế.',
 'NT_C1_T10_Q10': '**IoT Gateway** đứng giữa cảm biến và Internet/đám mây, gom và chuyển dữ liệu, đôi khi xử lý biên.',
})

# ---------------- NT_C2 (câu chưa có hoặc giải thích chung chung) ----------------
E.update({
 'NT_C2_T1_Q1': '**DI phá vỡ ranh giới giữa các ngành và tích hợp dữ liệu, quy tắc kinh doanh**, nên mọi công nghệ phi số mới đều cần nền tảng này để hoạt động. Các phương án còn lại thu hẹp vai trò của DI một cách sai lệch.',
 'NT_C2_T1_Q2': 'DI giúp **theo dõi nhà cung cấp, nhận phản hồi khách hàng và tham gia chia sẻ tri thức**, tức duy trì quan hệ ra bên ngoài; không giới hạn trong nội bộ.',
 'NT_C2_T1_Q3': 'Slide liệt kê 5G, Cloud, Edge... nhưng **không nhắc Blockchain cho tiền mã hóa** (Blockchain chỉ được nói tới như nền tảng hạ tầng tin cậy).',
 'NT_C2_T1_Q4': 'DI **kết nối các quy trình thành một tổng thể và chia sẻ dữ liệu giữa các phần**, chứ không chỉ phục vụ truyền thông nội bộ hay thay thế con người.',
 'NT_C2_T1_Q5': '**Hạ tầng số** là khả năng lưu trữ và trao đổi dữ liệu qua hệ thống truyền thông tập trung; không phải một phần mềm cá nhân, phương pháp quản lý hay thiết bị đơn lẻ.',
 'NT_C2_T1_Q6': 'Theo IDC, **80%** người ra quyết định cho hạ tầng số là quan trọng hoặc mang tính quyết định.',
 'NT_C2_T1_Q7': 'Trung tâm dữ liệu mới cần **sẵn sàng cho AI và xanh hóa** (tiết kiệm năng lượng), chứ không loại bỏ cloud hay chỉ lưu trữ truyền thống.',
 'NT_C2_T1_Q8': '**An ninh mạng toàn diện** nhấn mạnh bảo vệ hệ thống một cách đầy đủ và chủ động.',
 'NT_C2_T1_Q9': '**Edge Computing + 5G/6G** đưa dữ liệu và xử lý gần nơi phát sinh, giảm độ trễ.',
 'NT_C2_T1_Q10': '**Blockchain** được xem là nền tảng cho hạ tầng tin cậy (dữ liệu bất biến, minh bạch).',
 'NT_C2_T1_Q11': '**Internet Backbone** là các tuyến dữ liệu chính nối mạng giữa châu lục, quốc gia và vùng, chứ không phải Wi-Fi gia đình, app hay máy cá nhân.',
 'NT_C2_T1_Q12': '**IoT** gồm robot, máy móc, cảm biến, sản phẩm, phương tiện và môi trường kết nối Internet.',
 'NT_C2_T1_Q13': '**API & Integration** cho phép các nền tảng, hệ thống, ứng dụng phối hợp và chia sẻ thông tin.',
 'NT_C2_T1_Q14': 'Hạ tầng số là **dịch vụ nền tảng cần thiết cho năng lực CNTT** của quốc gia, vùng, thành phố hoặc tổ chức.',
 'NT_C2_T1_Q15': '**Trung tâm dữ liệu** quản lý tính toán, lưu trữ dữ liệu và dịch vụ mạng; không thay thế hoàn toàn cloud.',
 'NT_C2_T2_Q1': 'Mạng máy tính **tăng** khả năng chia sẻ thông tin; vì vậy "giảm khả năng chia sẻ" là phát biểu sai (không phải lợi ích). Ba phương án còn lại đều là lợi ích thật của mạng.',
 'NT_C2_T2_Q2': '**LAN** (Local Area Network) giới hạn trong một tòa nhà, trường học. MAN là phạm vi thành phố, WAN/Internet là diện rộng.',
 'NT_C2_T2_Q3': '**Email 1 phút so với thư 1 tháng** là ví dụ rõ về lợi ích truyền thông (nhanh, tức thì). Các phương án còn lại nói ngược lợi ích.',
 'NT_C2_T2_Q4': 'Mạng máy tính là **tập hợp máy tính nối với nhau qua môi trường truyền dẫn theo cấu trúc định trước** để trao đổi dữ liệu.',
 'NT_C2_T2_Q5': 'Mục đích chính là **dùng chung tài nguyên và chia sẻ thông tin**, không phải tăng tốc CPU hay giảm bộ nhớ.',
 'NT_C2_T2_Q6': 'LAN **cho phép nhiều truy xuất trên đường truyền băng thông rộng trong phạm vi địa lý giới hạn**, có kết nối liên tục cho tài nguyên nội bộ. Phạm vi toàn cầu là đặc điểm của WAN, và LAN có thể hoạt động độc lập khỏi Internet.',
 'NT_C2_T2_Q7': '**Băng thông** là lượng dữ liệu truyền trên một đơn vị thời gian (vd Mbps). Số người dùng, tốc độ CPU và dung lượng bộ nhớ là các khái niệm khác.',
 'NT_C2_T2_Q8': 'Mạng ngang hàng (peer-to-peer) phù hợp **tối đa khoảng 10–15 máy**; nhiều hơn khó quản lý và cần mô hình Client/Server hoặc Domain.',
 'NT_C2_T2_Q9': '**VPN** tạo kết nối riêng ảo, an toàn, đi qua Internet. Nó không liên quan tăng tốc CPU, thay hệ điều hành hay sao lưu.',
 'NT_C2_T2_Q10': 'Client/Server dùng **server mạnh quản lý dữ liệu và quản trị tập trung**; mạng ngang hàng thì phân tán, không có CSDL tập trung.',
 'NT_C2_T2_Q11': 'Các ISP **kết nối với nhau thành mạng lưới phân cấp (tier) và liên kết** tạo nên Internet toàn cầu.',
 'NT_C2_T2_Q12': '**Packet switch** (router, switch) **định tuyến và chuyển tiếp gói tin**, không lưu trữ lâu dài hay mã hóa dữ liệu người dùng.',
 'NT_C2_T2_Q13': 'Ứng dụng phân tán chạy trên end system để **xử lý dữ liệu người dùng**; packet switch chỉ chuyển tiếp dữ liệu.',
 'NT_C2_T2_Q14': '**Protocol** định nghĩa quy tắc trao đổi thông tin (định dạng, thứ tự, hành động) giữa các thực thể giao tiếp.',
 'NT_C2_T2_Q15': 'Internet gồm **end systems, communication links và packet switches** phối hợp truyền dữ liệu.',
 'NT_C2_T2_Q16': 'Điểm khác biệt chính: **Wi-Fi dùng môi trường không dây**, còn Ethernet dùng cáp (có dây).',
 'NT_C2_T2_Q17': '**DSLAM** thuộc công nghệ DSL trên cáp đồng, không thuộc FTTH. Hệ FTTH/PON gồm OLT, splitter thụ động và ONT.',
 'NT_C2_T2_Q18': 'Truy cập không dây diện rộng gồm **5G và vệ tinh**. Bluetooth là tầm ngắn, Ethernet có dây, USB là cổng kết nối.',
 'NT_C2_T2_Q19': '**Network edge** gồm các end systems và ứng dụng phân tán. Packet switch/router lõi thuộc network core.',
 'NT_C2_T2_Q20': '**Access network** nối end system tới router biên đầu tiên (edge router).',
 'NT_C2_T2_Q21': '**TDM** (Time Division Multiplexing) chia tài nguyên theo **thời gian**. Chia theo tần số là FDM.',
 'NT_C2_T2_Q22': '**Network core** gồm packet switches và các liên kết nối chúng. End systems và ứng dụng thuộc network edge.',
 'NT_C2_T2_Q23': '**Packet switching không cần thiết lập kênh cố định trước**, dữ liệu chia thành gói. Circuit switching phải thiết lập mạch riêng trước khi truyền.',
 'NT_C2_T2_Q24': '**FDM** chia băng thông theo **tần số**; chia theo thời gian là TDM.',
 'NT_C2_T2_Q25': '**Multiplexing** cho phép nhiều tín hiệu chia sẻ cùng một đường truyền (bằng thời gian hoặc tần số).',
 'NT_C2_T3_Q1': 'Tầng **Network** chịu trách nhiệm định tuyến dữ liệu giữa các mạng bằng địa chỉ IP.',
 'NT_C2_T3_Q2': 'Tầng **Transport** (TCP) đảm bảo truyền tin cậy giữa các host.',
 'NT_C2_T3_Q3': 'Chuyển bit thành tín hiệu điện/quang là chức năng của tầng **Physical**.',
 'NT_C2_T3_Q4': 'Mô hình OSI có **7 tầng**: Physical, Data Link, Network, Transport, Session, Presentation, Application.',
 'NT_C2_T3_Q5': '**HTTP** thuộc tầng Application. IP – Network, Ethernet – Data Link, TCP – Transport.',
 'NT_C2_T3_Q6': '**Địa chỉ MAC** dùng ở tầng Data Link. Địa chỉ IP thuộc Network, HTTP/FTP/DNS thuộc Application, port thuộc Transport.',
 'NT_C2_T3_Q7': '**Presentation Layer** lo mã hóa, giải mã và nén dữ liệu. TCP/UDP thuộc Transport, IP thuộc Network.',
 'NT_C2_T3_Q8': '**Hub** hoạt động ở tầng Physical (chỉ lặp tín hiệu). Switch – Data Link, Router – Network, Firewall – Network/Transport.',
 'NT_C2_T3_Q9': '**TCP và UDP** thuộc tầng Transport. Tầng Session quản lý phiên, Network là IP, Application là HTTP/FTP/DNS.',
 'NT_C2_T3_Q10': '**Session Layer** thiết lập, duy trì và kết thúc phiên giữa các ứng dụng.',
 'NT_C2_T3_Q11': 'TCP thêm **số cổng và số thứ tự** vào segment. Địa chỉ IP do tầng Network thêm, địa chỉ MAC do tầng Data Link thêm.',
 'NT_C2_T3_Q12': '**Địa chỉ IP** được xử lý ở Network Layer (Internet layer). MAC thuộc Data Link, port thuộc Transport.',
 'NT_C2_T3_Q13': '**Transport Layer** đảm bảo thứ tự và độ tin cậy của gói tin (TCP).',
 'NT_C2_T3_Q14': '**UDP không đảm bảo thứ tự gói tin**, không bắt tay, không kiểm soát lỗi chặt chẽ. Ba phương án còn lại là đặc điểm của TCP.',
 'NT_C2_T3_Q15': '**HTTP** hoạt động ở tầng Application của TCP/IP. IP – Internet, TCP – Transport, Ethernet – Network Access.',
 'NT_C2_T4_Q1': 'P2P **không cần hạ tầng server đáng kể**, các peer tự trao đổi trực tiếp và mở rộng tốt. Phụ thuộc server trung tâm là đặc điểm của Client/Server.',
 'NT_C2_T4_Q2': '**Client process** là bên gửi request. Server process nhận và trả lời; router, switch không phải tiến trình ứng dụng.',
 'NT_C2_T4_Q3': 'Trong Client/Server, **server luôn online và phục vụ yêu cầu** (thường có địa chỉ cố định); client có thể kết nối gián đoạn.',
 'NT_C2_T4_Q4': '**Socket** là giao diện phần mềm giữa tiến trình ứng dụng và tầng giao vận, không phải thiết bị hay giao thức.',
 'NT_C2_T4_Q5': 'Ứng dụng phân tán chạy trên **end systems** (máy tính, điện thoại); router, switch, gateway chỉ chuyển tiếp dữ liệu.',
 'NT_C2_T4_Q6': '**Routing** là chức năng của tầng Network. Reliable data transfer, throughput, timing (và bảo mật) là các dịch vụ của tầng Transport.',
 'NT_C2_T4_Q7': 'UDP "nhẹ" vì **không có các dịch vụ phức tạp của TCP** (bắt tay, tin cậy, kiểm soát tắc nghẽn).',
 'NT_C2_T4_Q8': '**Port** xác định tiến trình/ứng dụng trên host; IP/MAC xác định thiết bị.',
 'NT_C2_T4_Q9': '**TCP là connection-oriented**, vì vậy "không thiết lập kết nối" không thuộc TCP (mà là UDP). Congestion control và reliable transfer đều là của TCP.',
 'NT_C2_T4_Q10': '**HTTP dùng port 80**. FTP dùng 20/21, SMTP dùng 25, DNS dùng 53.',
})


def load(path):
    return json.load(open(path, encoding='utf-8-sig'))


tot = 0
for ch in ('NT_C1', 'NT_C2'):
    path = D + ch + '.json'
    j = load(path)
    for t in j['topics']:
        for q in t['questions']:
            if q['id'] in E:
                q['explanation'] = E[q['id']]
                tot += 1
    json.dump(j, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('updated', tot, 'of', len(E))
