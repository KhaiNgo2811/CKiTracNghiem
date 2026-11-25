# -*- coding: utf-8 -*-
"""Sinh data/Nền tảng/NT_C4.json: câu hỏi tự luận (essay) môn Nền tảng, kèm định hướng trả lời."""
import json

OUT = 'data/Nền tảng/'
def g(flow, *paragraphs):
    """Định hướng trả lời: một dòng mạch ý + bài trả lời mẫu viết thành đoạn văn (gắn với UEL)."""
    return (f'<p class="mb-2"><b>Mạch ý:</b> {flow}</p><p class="mb-2"><b>Bài trả lời tham khảo:</b></p>'
            + ''.join(f'<p class="mb-2">{x}</p>' for x in paragraphs))


TOPICS = []
# ------------------------------------------------------------------ T1
TOPICS.append(('Thiết kế & phát triển hạ tầng cho trường (UEL)', [
    ('Với vai trò là sinh viên Trường Đại học Kinh tế – Luật (UEL), hãy vận dụng kiến thức môn Nền tảng công nghệ thông tin để '
     '<b>thiết kế và đề xuất hướng phát triển hạ tầng CNTT</b> của trường (mạng, máy chủ/trung tâm dữ liệu, dịch vụ cho giảng viên – sinh viên). '
     'Nêu rõ lý do lựa chọn.',
     g('Nhu cầu của UEL → kiến trúc đề xuất → công nghệ và lý do → bảo mật, sẵn sàng → lộ trình.',
       'Là một sinh viên UEL, em nhận thấy mọi hoạt động học tập và quản lý của trường đều dựa vào hạ tầng công nghệ thông tin: cổng đào tạo, đăng ký học phần, hệ thống học trực tuyến (LMS), thư viện số, email, thi trực tuyến và công tác tài chính, nhân sự. Các dịch vụ này phục vụ rất đông sinh viên và giảng viên, cần chạy liên tục và thường tăng tải đột biến vào đợt đăng ký học phần hay mùa thi. Vì vậy hạ tầng của trường phải đáp ứng ba yêu cầu: ổn định, an toàn và dễ mở rộng.',
       'Về kiến trúc, em đề xuất tổ chức theo từng lớp. Người dùng kết nối qua mạng truy cập gồm Wi-Fi và mạng LAN tại giảng đường, thư viện, phòng máy; lưu lượng được tập trung về mạng phân phối và mạng lõi; sau đó đến trung tâm dữ liệu hoặc Cloud, nơi chạy các ứng dụng và lưu cơ sở dữ liệu. Các cơ sở của trường được nối với nhau bằng WAN hoặc VPN, và nên có hai đường Internet từ hai nhà cung cấp để một đường gặp sự cố thì đường kia vẫn hoạt động.',
       'Về công nghệ, trường nên chia VLAN để tách mạng sinh viên, giảng viên và quản trị, vừa giảm lưu lượng quảng bá vừa hạn chế truy cập trái phép. Switch lớp 2 và lớp 3 đảm nhiệm chuyển mạch và định tuyến nội bộ, router và firewall đứng ở biên mạng, DHCP cấp địa chỉ tự động, DNS phân giải tên miền. Máy chủ nên được ảo hóa để dùng chung tài nguyên, kết hợp Cloud theo mô hình hybrid: dữ liệu nhạy cảm giữ tại trường, các dịch vụ cần co giãn đưa lên Cloud.',
       'Hạ tầng này phải đi kèm bảo mật và dự phòng: xác thực tập trung bằng tài khoản trường, phân quyền theo vai trò, mã hóa bằng HTTPS và VPN, sao lưu định kỳ, nguồn điện dự phòng và cân bằng tải cho các hệ thống quan trọng.',
       'Do chi phí có hạn, em đề xuất lộ trình ba giai đoạn: trước hết ổn định mạng và Wi-Fi hiện có, tiếp theo ảo hóa máy chủ và chuyển dần dịch vụ phù hợp lên Cloud, cuối cùng phát triển Smart Campus với IoT và AI. Cách làm này giúp UEL đầu tư đúng chỗ, không gián đoạn việc học và vẫn sẵn sàng cho chuyển đổi số.')),
    ('Thiết kế hệ thống mạng cho một cơ sở của UEL gồm: khu giảng đường, thư viện, phòng máy, ký túc xá và khu hành chính. '
     'Hãy mô tả cách <b>phân chia mạng (VLAN/mạng con)</b>, thiết bị cần dùng và cách bảo đảm kết nối ổn định.',
     g('Phân vùng theo người dùng và mức an toàn → thiết bị theo ba lớp → dịch vụ mạng → độ ổn định.',
       'Khi thiết kế mạng cho một cơ sở của UEL, em sẽ phân chia theo đối tượng sử dụng và mức độ an toàn trước, rồi mới chọn thiết bị. Cụ thể, mạng được tách thành các VLAN cho khu hành chính, giảng viên, sinh viên dùng Wi-Fi, phòng máy, ký túc xá, máy chủ và camera. Mỗi VLAN là một mạng con riêng, ví dụ 10.10.10.0/24 cho hành chính, 10.10.20.0/24 cho giảng viên. Nhờ đó sinh viên ở ký túc xá không truy cập thẳng được vào máy của phòng tài chính, và sự cố ở một khu cũng không lan sang khu khác.',
       'Thiết bị được bố trí theo mô hình ba lớp. Lớp truy cập gồm switch cấp nguồn qua dây (PoE) và các Access Point để người dùng kết nối. Lớp phân phối dùng switch lớp 3 để định tuyến giữa các VLAN và áp chính sách. Lớp lõi chuyển dữ liệu tốc độ cao, sau đó đi qua firewall ra Internet. Cách phân lớp này gắn với mô hình OSI: switch làm việc ở tầng 2 theo địa chỉ MAC, router làm việc ở tầng 3 theo địa chỉ IP.',
       'Mạng cần có DHCP để cấp IP tự động cho số lượng lớn thiết bị của sinh viên, DNS nội bộ cho các trang của trường và NAT để nhiều máy dùng chung địa chỉ công cộng.',
       'Để kết nối ổn định, em đề xuất dự phòng thiết bị lõi và đường truyền, dùng hai nhà cung cấp Internet, gắn UPS cho phòng máy chủ, giám sát mạng thường xuyên và ưu tiên băng thông cho hệ thống học tập, thi cử. Như vậy khi cả giảng đường và thư viện cùng truy cập, hoặc một đường truyền bị đứt, việc dạy và học vẫn diễn ra bình thường.')),
    ('Vì sao cần <b>Wi-Fi phủ sóng toàn trường</b> và quản lý truy cập tập trung? Hãy đề xuất giải pháp Wi-Fi cho UEL '
     '(chuẩn Wi-Fi, bảo mật, phân quyền sinh viên/khách).',
     g('Nhu cầu → chuẩn kỹ thuật → bảo mật và phân quyền → vận hành.',
       'Sinh viên UEL ngày nay học tập chủ yếu bằng laptop và điện thoại: xem tài liệu trên LMS, làm bài kiểm tra trực tuyến, tra cứu thư viện số. Vì thế Wi-Fi cần phủ khắp giảng đường, thư viện, khu tự học và ký túc xá. Nếu mỗi khu tự lắp một bộ phát riêng thì tín hiệu chồng lấn, mật khẩu bị chia sẻ rộng rãi và nhà trường không biết ai đang dùng mạng, do đó cần quản lý tập trung.',
       'Em đề xuất dùng chuẩn Wi-Fi 6 vì chịu được mật độ thiết bị cao trong giảng đường lớn, chạy trên cả băng tần 2.4 GHz và 5 GHz. Nhiều Access Point được đặt theo khảo sát thực tế và do một bộ điều khiển trung tâm quản lý, giúp phân kênh hợp lý và cho phép chuyển vùng khi sinh viên đi từ tòa nhà này sang tòa nhà khác. Về nguyên lý, mạng không dây dùng CSMA/CA để tránh đụng độ.',
       'Về bảo mật, thay vì một mật khẩu chung, mỗi người đăng nhập bằng tài khoản trường theo chuẩn WPA3-Enterprise (802.1X). Trường phát ba SSID cho giảng viên, sinh viên và khách, mỗi nhóm có giới hạn băng thông và vùng truy cập riêng; khách chỉ ra được Internet, không vào được mạng nội bộ.',
       'Cuối cùng, bộ phận kỹ thuật cần theo dõi số thiết bị kết nối, lưu nhật ký truy cập và bổ sung điểm phát ở nơi thường nghẽn. Giải pháp này vừa thuận tiện cho người học vừa giữ an toàn cho dữ liệu của trường.')),
]))

# ------------------------------------------------------------------ T2
TOPICS.append(('Trung tâm dữ liệu & điện toán đám mây', [
    ('Tại sao một trường đại học như UEL <b>cần có Trung tâm dữ liệu (Data Center)</b>? Hãy nêu vai trò/tác dụng của nó và cho ví dụ cụ thể.',
     g('Vì sao cần → vai trò (tính toán, lưu trữ, mạng, an toàn) → ví dụ tại UEL → xu hướng.',
       'Một trường đại học như UEL tạo ra và sử dụng lượng dữ liệu rất lớn mỗi ngày: hồ sơ sinh viên, điểm số, học phí, bài giảng, bài thi. Những dữ liệu này vừa quan trọng vừa nhạy cảm, và các dịch vụ dựa trên chúng phải hoạt động liên tục. Nếu dữ liệu nằm rải rác trên máy cá nhân hay máy chủ đặt tạm ở từng phòng ban thì rất khó bảo mật, khó sao lưu và dễ mất mát. Vì vậy trường cần một Trung tâm dữ liệu, tức nơi tập trung máy chủ, thiết bị lưu trữ, thiết bị mạng cùng hệ thống điện, làm mát và an ninh để vận hành chúng.',
       'Vai trò đầu tiên của Data Center là tính toán: nó chạy các hệ thống ứng dụng như cổng đào tạo, LMS, email và thi trực tuyến. Vai trò thứ hai là lưu trữ: cơ sở dữ liệu sinh viên, tài liệu và thư viện số được quản lý tập trung, có sao lưu và phương án khôi phục khi xảy ra thảm họa. Vai trò thứ ba là cung cấp dịch vụ mạng, đưa các ứng dụng đến người dùng qua mạng nội bộ và Internet. Bên cạnh đó, Data Center còn bảo đảm an toàn và tính sẵn sàng nhờ kiểm soát ra vào, firewall, UPS, máy phát điện, hệ thống làm mát và giám sát; đồng thời tiết kiệm chi phí vì nhiều hệ thống dùng chung tài nguyên bằng ảo hóa.',
       'Ví dụ rõ nhất tại UEL là đợt đăng ký học phần. Rất nhiều sinh viên truy cập cùng một lúc; nếu chỉ có một máy chủ đơn lẻ, hệ thống dễ quá tải và sập. Với Data Center, yêu cầu được cân bằng tải sang nhiều máy chủ, tài nguyên có thể bổ sung khi cần, và nếu mất điện hay hỏng phần cứng thì điểm số, hồ sơ vẫn được giữ an toàn nhờ nguồn dự phòng và bản sao lưu.',
       'Trong tương lai, Data Center của trường nên hướng đến tiết kiệm năng lượng, sẵn sàng cho các ứng dụng AI và có thể kết hợp với Cloud. Tóm lại, Data Center là nền móng giúp hoạt động số của UEL diễn ra liên tục, an toàn và dễ phát triển.')),
    ('UEL nên <b>tự xây Data Center tại chỗ (on-premise)</b>, <b>thuê Cloud</b> hay <b>kết hợp (hybrid)</b>? Hãy phân tích ưu – nhược điểm và đưa ra lựa chọn có lập luận.',
     g('Tiêu chí so sánh → on-premise → Cloud → chọn hybrid kèm lý do → lộ trình.',
       'Để chọn phương án cho UEL, cần so sánh theo chi phí đầu tư và vận hành, khả năng mở rộng, mức độ kiểm soát dữ liệu, độ sẵn sàng và nhân lực kỹ thuật.',
       'Nếu tự xây Data Center tại chỗ, trường kiểm soát tốt dữ liệu và truy cập nội bộ nhanh, nhưng phải đầu tư lớn ngay từ đầu, cần đội ngũ vận hành và khó tăng tài nguyên trong thời gian ngắn. Ngược lại, thuê Cloud giúp triển khai nhanh, trả theo mức dùng và co giãn linh hoạt, rất hợp với những lúc tải tăng đột biến như đăng ký học phần; tuy nhiên trường phụ thuộc vào Internet, vào nhà cung cấp và phải cân nhắc việc đặt dữ liệu cá nhân bên ngoài.',
       'Em chọn mô hình hybrid. Dữ liệu nhạy cảm như hồ sơ, điểm và tài chính được giữ tại hạ tầng của trường hoặc private cloud để dễ kiểm soát. Các dịch vụ cần co giãn hoặc phổ biến như website, LMS, email và lưu trữ tài liệu được đưa lên public cloud, ví dụ dùng Microsoft 365 theo hình thức SaaS. Cách này tận dụng được ưu điểm của cả hai bên mà không phải đầu tư quá lớn.',
       'Việc chuyển đổi nên làm từng bước, bắt đầu từ dịch vụ ít rủi ro, luôn có sao lưu và phương án quay lại khi gặp sự cố. Lựa chọn hybrid chỉ hiệu quả khi trường quản lý tốt kết nối giữa hai môi trường và phân quyền rõ ràng.')),
    ('Hãy trình bày các mô hình dịch vụ đám mây <b>IaaS, PaaS, SaaS</b> và cho ví dụ ứng dụng trong môi trường trường đại học (UEL).',
     g('Khái niệm chung → ba mô hình (ai quản lý gì, ví dụ tại UEL) → khi nào chọn cái nào.',
       'Điện toán đám mây là mô hình cung cấp tài nguyên công nghệ thông tin qua Internet theo nhu cầu. Ba mô hình dịch vụ chính khác nhau ở phần việc mà nhà cung cấp làm thay cho người dùng.',
       'IaaS cung cấp hạ tầng gồm máy chủ ảo, lưu trữ và mạng; trường tự cài hệ điều hành và ứng dụng. Ví dụ, UEL có thể thuê thêm máy chủ ảo để chạy hệ thống thi trực tuyến vào mùa thi rồi trả lại khi xong. PaaS cung cấp sẵn nền tảng để phát triển và chạy ứng dụng, trường chỉ cần lo mã nguồn và dữ liệu; chẳng hạn một nhóm sinh viên viết ứng dụng tra cứu lịch học và đưa lên nền tảng PaaS mà không phải cấu hình máy chủ. SaaS cung cấp phần mềm hoàn chỉnh dùng ngay qua trình duyệt, ví dụ Microsoft 365, Google Workspace hay một hệ thống LMS dạng dịch vụ.',
       'Như vậy, từ IaaS đến SaaS, quyền kiểm soát của trường giảm dần nhưng công sức vận hành cũng nhẹ đi. UEL nên dùng SaaS cho các nhu cầu phổ thông, PaaS khi muốn tự phát triển ứng dụng riêng và IaaS khi cần tùy biến sâu. Dù chọn mô hình nào cũng phải chú ý bảo mật tài khoản, dữ liệu cá nhân và sự phụ thuộc vào nhà cung cấp.')),
    ('Hệ thống đăng ký học phần của UEL thường quá tải ở giờ đầu mở cổng. Hãy đề xuất giải pháp hạ tầng để hệ thống <b>luôn sẵn sàng và chịu tải cao</b>.',
     g('Nguyên nhân → giải pháp từng tầng → dự phòng → kiểm thử và vận hành.',
       'Giả sử hệ thống đăng ký học phần của UEL quá tải ngay khi mở cổng, nguyên nhân thường là lượng truy cập tăng đột biến trong vài phút, trong khi một máy chủ, một cơ sở dữ liệu hoặc một đường truyền trở thành điểm nghẽn.',
       'Giải pháp trước hết là đặt bộ cân bằng tải để chia yêu cầu cho nhiều máy chủ ứng dụng, và mở rộng theo chiều ngang bằng cách thêm máy chủ ảo, có thể thuê Cloud tự co giãn trong đúng đợt đăng ký. Tiếp theo là giảm việc cho cơ sở dữ liệu: dùng bộ nhớ đệm cho dữ liệu ít thay đổi như danh sách môn học, tối ưu chỉ mục, và đưa yêu cầu vào hàng đợi để xử lý lần lượt.',
       'Về độ sẵn sàng, cần máy chủ và cơ sở dữ liệu dự phòng, hai đường Internet, nguồn điện dự phòng, đồng thời ưu tiên băng thông cho hệ thống đăng ký. Ngoài hạ tầng, trường có thể chia khung giờ đăng ký theo khóa để giảm đỉnh tải.',
       'Trước mỗi đợt, bộ phận kỹ thuật nên thử tải với số người truy cập giả lập, trong khi vận hành thì giám sát liên tục và có sẵn kế hoạch khôi phục. Kết hợp các biện pháp này giúp sinh viên đăng ký được ổn định và công bằng hơn.')),
]))

# ------------------------------------------------------------------ T3
TOPICS.append(('An toàn thông tin & xu hướng hạ tầng số', [
    ('Hãy đề xuất các biện pháp <b>bảo mật hệ thống mạng và dữ liệu</b> của UEL (sinh viên, giảng viên, nhân viên). Giải thích tác dụng của từng biện pháp.',
     g('Nguyên tắc CIA và phòng thủ nhiều lớp → biên mạng, phân vùng → mã hóa, xác thực → dữ liệu → con người.',
       'Mạng của UEL lưu giữ thông tin cá nhân và kết quả học tập của nhiều người, nên việc bảo vệ cần bảo đảm ba yêu cầu: bí mật, toàn vẹn và sẵn sàng. Em đề xuất phòng thủ theo nhiều lớp để nếu một lớp bị vượt qua thì vẫn còn lớp khác.',
       'Ở biên mạng, firewall lọc truy cập trái phép và hệ thống IDS/IPS phát hiện, ngăn chặn hành vi tấn công. Bên trong, VLAN và vùng DMZ tách mạng sinh viên khỏi mạng quản trị và máy chủ dữ liệu; web công khai của trường đặt trong DMZ để kẻ tấn công chiếm được web cũng khó đi tiếp vào trong.',
       'Dữ liệu truyền đi cần được mã hóa bằng HTTPS cho website, VPN cho giảng viên làm việc từ xa và WPA3 cho Wi-Fi. Người dùng đăng nhập bằng tài khoản trường, có xác thực nhiều lớp và chỉ được cấp quyền vừa đủ; ví dụ giảng viên chỉ nhập được điểm của lớp mình dạy. Dữ liệu quan trọng phải sao lưu định kỳ, còn văn bản điện tử nên dùng chữ ký số để chống sửa đổi và chối bỏ.',
       'Cuối cùng, con người là mắt xích dễ bị khai thác nhất, vì vậy trường cần hướng dẫn sinh viên, giảng viên nhận biết thư lừa đảo, đặt mật khẩu mạnh, đồng thời ghi nhật ký và giám sát để phát hiện sớm sự cố.')),
    ('Hãy phân tích <b>xu hướng hạ tầng số</b> (5G, Edge Computing, IoT, Cloud, AI, an ninh mạng) và đề xuất cách UEL có thể áp dụng để xây dựng <b>Smart Campus</b>.',
     g('Smart Campus là gì → mỗi xu hướng giải quyết việc gì ở trường → điều kiện và kết luận.',
       'Smart Campus là khuôn viên đại học dùng hạ tầng số để việc học, quản lý và sinh hoạt thuận tiện, tiết kiệm và an toàn hơn. Với UEL, các xu hướng công nghệ có thể bổ sung cho nhau để đạt mục tiêu đó.',
       'Cloud giúp trường triển khai nhanh và co giãn các dịch vụ học tập số. 5G và Wi-Fi 6 bảo đảm kết nối tốc độ cao cho rất nhiều thiết bị cùng lúc. IoT cho phép lắp cảm biến để tự điều chỉnh điều hòa, đèn chiếu sáng, điểm danh thông minh hay theo dõi chỗ trống ở thư viện. Edge Computing xử lý dữ liệu camera và cảm biến ngay tại chỗ, nhờ đó giảm độ trễ và đỡ tốn băng thông. AI có thể làm trợ lý ảo trả lời thắc mắc của sinh viên hoặc phân tích dữ liệu học tập để phát hiện sớm người học gặp khó khăn.',
       'Càng nhiều thiết bị kết nối thì rủi ro càng lớn, nên an ninh mạng phải được tính ngay từ đầu, cùng với việc bảo vệ dữ liệu cá nhân. Em đề xuất UEL thí điểm ở một khu, ví dụ thư viện, đánh giá hiệu quả rồi mới nhân rộng. Hạ tầng số tốt chính là nền tảng để các công nghệ mới phát huy tác dụng.')),
    ('So sánh mô hình <b>Client/Server</b> và <b>Peer-to-Peer</b>; theo bạn, mô hình nào phù hợp cho hệ thống e-learning của UEL và mô hình nào phù hợp để nhóm sinh viên chia sẻ tài liệu nội bộ? Giải thích.',
     g('So sánh hai mô hình → áp vào hai tình huống ở UEL → liên hệ lý thuyết.',
       'Trong mô hình Client/Server, máy chủ luôn hoạt động và nắm giữ dữ liệu, các máy khách gửi yêu cầu đến để được phục vụ. Cách này dễ quản lý người dùng, phân quyền và sao lưu, nhưng cần máy chủ đủ mạnh và nếu máy chủ hỏng thì dịch vụ bị gián đoạn. Trong mô hình Peer-to-Peer, các máy ngang hàng, mỗi máy vừa xin vừa cung cấp tài nguyên; chi phí thấp, dễ thiết lập nhưng khó quản trị, khó bảo mật và chỉ hợp với nhóm nhỏ.',
       'Với hệ thống e-learning của UEL, em chọn Client/Server vì có nhiều người dùng, dữ liệu điểm và bài thi nhạy cảm, cần phân quyền rõ giữa sinh viên và giảng viên; có thể đặt máy chủ trên Cloud để chịu tải tốt hơn. Còn khi một nhóm vài sinh viên cần chia sẻ tạm tài liệu làm đồ án trong cùng mạng, Peer-to-Peer là đủ và tiện, miễn là chú ý bản quyền và phòng mã độc.',
       'Về kỹ thuật, ở cả hai mô hình các tiến trình đều trao đổi qua socket, được xác định bằng địa chỉ IP và số cổng. Khác biệt nằm ở vai trò của từng máy, do đó chọn mô hình nào phải dựa vào quy mô và yêu cầu an toàn của công việc.')),
    ('Nêu và giải thích <b>3 lý do</b> cần thiết kế hạ tầng mạng của trường theo <b>mô hình phân tầng (OSI/TCP-IP)</b>. Cho ví dụ ở UEL.',
     g('Giới thiệu mô hình → ba lý do, mỗi lý do một ví dụ ở UEL → kết luận.',
       'Mô hình phân tầng chia việc truyền thông thành nhiều tầng, mỗi tầng một nhiệm vụ và cung cấp dịch vụ cho tầng trên. OSI có bảy tầng, còn TCP/IP gộp lại thành bốn tầng.',
       'Lý do thứ nhất là giảm độ phức tạp và dễ xử lý sự cố. Khi sinh viên UEL không vào được cổng đào tạo, kỹ thuật viên có thể kiểm tra lần lượt từ sóng Wi-Fi hoặc dây cáp, đến địa chỉ MAC và switch, địa chỉ IP và router, rồi DNS và dịch vụ web để khoanh đúng chỗ lỗi.',
       'Lý do thứ hai là chuẩn hóa và tương thích. Laptop, điện thoại của sinh viên và thiết bị mạng của nhiều hãng khác nhau vẫn làm việc được với nhau vì cùng tuân theo các giao thức chuẩn như Ethernet, IP, TCP và HTTP.',
       'Lý do thứ ba là dễ nâng cấp. Trường có thể đổi từ Wi-Fi 5 sang Wi-Fi 6 ở tầng dưới mà không phải viết lại cổng đào tạo hay hệ thống LMS ở tầng ứng dụng.',
       'Tóm lại, thiết kế phân tầng giúp mạng của UEL dễ xây dựng, dễ bảo trì và phát triển lâu dài. Khi một sinh viên mở trang web của trường, dữ liệu được đóng gói lần lượt qua HTTP, TCP, IP rồi Ethernet hoặc Wi-Fi, và được mở gói theo thứ tự ngược lại ở phía nhận.')),
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
