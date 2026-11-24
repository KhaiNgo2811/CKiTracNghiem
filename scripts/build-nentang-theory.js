// Sinh tài liệu lý thuyết ôn tập NỀN TẢNG -> data/Nền tảng/NenTang_Ly_thuyet_on_tap.docx
// Chạy: NODE_PATH=<thư mục chứa node_modules/docx> node scripts/build-nentang-theory.js
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType,
  LevelFormat, BorderStyle, WidthType, ShadingType, PageBreak, Footer, PageNumber, ImageRun,
} = require('docx');

const FONT = 'Arial';
const W = 9638;
const C = [];

function runs(text, base = {}) {
  const out = [];
  text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g).forEach((part) => {
    if (!part) return;
    if (part.startsWith('**')) out.push(new TextRun({ text: part.slice(2, -2), bold: true, font: FONT, ...base }));
    else if (part.startsWith('__')) out.push(new TextRun({ text: part.slice(2, -2), italics: true, font: FONT, ...base }));
    else out.push(new TextRun({ text: part, font: FONT, ...base }));
  });
  return out;
}
const hd = (lvl, t) => C.push(new Paragraph({ heading: lvl, children: [new TextRun({ text: t, font: FONT })] }));
const h1 = (t) => hd(HeadingLevel.HEADING_1, t);
const h2 = (t) => hd(HeadingLevel.HEADING_2, t);
const h3 = (t) => hd(HeadingLevel.HEADING_3, t);
const p = (t) => C.push(new Paragraph({ spacing: { after: 100, line: 300 }, children: runs(t) }));
const b = (t, lvl = 0) => C.push(new Paragraph({ numbering: { reference: 'bul', level: lvl }, spacing: { after: 50, line: 290 }, children: runs(t) }));
const bl = (arr, lvl = 0) => arr.forEach((x) => b(x, lvl));
const pb = () => C.push(new Paragraph({ children: [new PageBreak()] }));

const bd = { style: BorderStyle.SINGLE, size: 4, color: 'B8BCC8' };
const borders = { top: bd, bottom: bd, left: bd, right: bd };
function cell(text, w, o = {}) {
  const lines = Array.isArray(text) ? text : [text];
  return new TableCell({
    width: { size: w, type: WidthType.DXA }, borders,
    shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: lines.map((l) => new Paragraph({ spacing: { after: 20, line: 270 }, children: runs(l, { size: 20, bold: o.bold, color: o.color }) })),
  });
}
function table(head, rows, widths) {
  const sum = widths.reduce((a, c) => a + c, 0);
  const ws = widths.map((x) => Math.round((x * W) / sum)); ws[ws.length - 1] += W - ws.reduce((a, c) => a + c, 0);
  const trs = [new TableRow({ tableHeader: true, children: head.map((h, i) => cell(h, ws[i], { fill: '1F3A5F', bold: true, color: 'FFFFFF' })) })];
  rows.forEach((r, ri) => trs.push(new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, ws[i], { fill: ri % 2 ? 'F3F6FB' : undefined })) })));
  C.push(new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: ws, rows: trs }));
  C.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
}
function box(title, lines, fill, edge) {
  const e = { style: BorderStyle.SINGLE, size: 8, color: edge };
  const kids = [new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: title, bold: true, font: FONT, size: 22 })] })];
  lines.forEach((l) => kids.push(new Paragraph({ spacing: { after: 40, line: 280 }, children: runs(l, { size: 21 }) })));
  C.push(new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [W],
    rows: [new TableRow({ children: [new TableCell({ width: { size: W, type: WidthType.DXA }, borders: { top: e, bottom: e, left: e, right: e }, shading: { fill, type: ShadingType.CLEAR, color: 'auto' }, margins: { top: 100, bottom: 100, left: 160, right: 160 }, children: kids })] })],
  }));
  C.push(new Paragraph({ spacing: { after: 140 }, children: [] }));
}

const FIGDIR = path.join(__dirname, 'nt-figs');
function fig(file, widthPx, caption) {
  const buf = fs.readFileSync(path.join(FIGDIR, file));
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 40 }, keepNext: true, children: [new ImageRun({ data: buf, transformation: { width: widthPx, height: Math.round((widthPx * h) / w) } })] }));
  C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: 'Hình: ' + caption, italics: true, size: 19, color: '555555', font: FONT })] }));
}
const tip = (lines) => box('Mẹo / Bẫy khi thi', lines, 'FFF6DD', 'E0A800');
const note = (lines) => box('Cần nhớ', lines, 'E8F3FF', '3B82F6');
const formula = (lines) => box('Công thức', lines, 'EEF8EE', '3E9B4F');

// ================= BÌA =================
C.push(new Paragraph({ spacing: { before: 2600, after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TÀI LIỆU LÝ THUYẾT ÔN TẬP', bold: true, size: 40, font: FONT, color: '1F3A5F' })] }));
C.push(new Paragraph({ spacing: { after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'NỀN TẢNG CÔNG NGHỆ CHO HỆ THỐNG THÔNG TIN', bold: true, size: 34, font: FONT })] }));
C.push(new Paragraph({ spacing: { after: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Mạng máy tính, Internet, Bảo mật cơ bản, Data Center & Cloud)', italics: true, size: 26, font: FONT })] }));
C.push(new Paragraph({ spacing: { after: 100 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Tổng hợp theo 10 module của môn học, bộ quiz cuối chương và đề ôn tập Mạng máy tính', size: 22, font: FONT })] }));
C.push(new Paragraph({ spacing: { after: 100 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Giải thích bằng tiếng Việt – thuật ngữ giữ nguyên tiếng Anh (in đậm) để học thuộc', size: 22, font: FONT })] }));
pb();

h1('Hướng dẫn sử dụng tài liệu');
bl([
  'Thuật ngữ chuyên môn viết **tiếng Anh in đậm**, phần giải thích bằng tiếng Việt, đúng cách đề thi hay hỏi.',
  'Khung **“Cần nhớ”** = định nghĩa cốt lõi; khung **“Công thức”** = tính toán có lời giải (IP/subnet); khung **“Mẹo / Bẫy khi thi”** = chỗ dễ nhầm trong các câu đã gặp.',
  'Cuối tài liệu có **bảng cổng (port) cần thuộc**, **bảng so sánh nhanh** và **khung tư duy trả lời câu tự luận**. Học xong mỗi module, quay lại app làm đúng chương/module đó và dùng nút **Kiểm tra đáp án**.',
  'Một số đáp án tô vàng trong đề ôn gây tranh cãi; tài liệu theo đáp án đúng về kỹ thuật và ghi chú riêng ở phần Bẫy khi thi.',
]);
h2('Bản đồ nội dung');
table(['Module', 'Chủ đề', 'Từ khóa quan trọng'], [
  ['1', 'Giới thiệu – Digital Infrastructure', 'Hạ tầng số, Data Center, Edge, 5G/6G, Blockchain'],
  ['2', 'Mạng máy tính & Internet', 'LAN/WAN, P2P vs Client/Server, Network edge/access/core, Packet vs Circuit switching, ISP'],
  ['3', 'Mô hình OSI & TCP/IP', '7 tầng, đóng gói (encapsulation), PDU, thiết bị theo tầng'],
  ['4', 'Application Layer', 'HTTP, DNS, FTP, SMTP/POP3/IMAP, DHCP, Proxy, Socket, port'],
  ['5', 'Transport Layer', 'TCP vs UDP, 3-way handshake, cờ TCP, flow control, port'],
  ['6', 'Network Layer', 'IPv4 datagram, subnet, DHCP/NAT, ICMP, RIP, định tuyến'],
  ['7', 'Network Access Layer', 'MAC, ARP, Ethernet, CSMA/CD, CSMA/CA, Switch/Hub, cáp UTP, RJ45'],
  ['8', 'Bảo mật cơ bản', 'Firewall, DMZ, IDS, mã hóa, chữ ký số, AAA'],
  ['9', 'Data Center, Cloud, IoE/IoT', 'IaaS/PaaS/SaaS, làm mát, Edge/Fog, Blockchain, IoE'],
  ['10', 'Mở rộng', 'Chia subnet, tính NetID, Wi-Fi (SSID)'],
], [1, 4, 8]);
pb();

// ================= MODULE 1 =================
h1('Module 1. Giới thiệu – Hạ tầng số (Digital Infrastructure)');
note([
  '**Digital Infrastructure (DI)** = khả năng **lưu trữ và trao đổi dữ liệu** qua hệ thống truyền thông tập trung; là **dịch vụ nền tảng** cho năng lực CNTT của quốc gia, vùng, thành phố hoặc tổ chức.',
  'DI **phá vỡ ranh giới** giữa các ngành, **tích hợp** dữ liệu và quy tắc kinh doanh; kết nối các quy trình thành một tổng thể, chia sẻ dữ liệu giữa các bộ phận.',
]);
h2('1.1 Thành phần của hạ tầng số');
table(['Thành phần', 'Ý nghĩa'], [
  ['**Internet Backbone**', 'Các tuyến dữ liệu chính nối mạng giữa châu lục, quốc gia, vùng.'],
  ['**Data Centers**', 'Quản lý **tính toán, lưu trữ dữ liệu và dịch vụ mạng**.'],
  ['**IoT**', 'Robot, máy móc, cảm biến, sản phẩm, phương tiện và môi trường kết nối Internet.'],
  ['**APIs & Integration**', 'Cho phép các nền tảng, hệ thống, ứng dụng phối hợp và chia sẻ thông tin.'],
], [3.5, 9]);
h2('1.2 Xu hướng hạ tầng số');
bl([
  '**Data Center sẵn sàng cho AI và xanh hóa** (tiết kiệm năng lượng).',
  '**Edge Computing** + **5G/6G**: đưa dữ liệu và xử lý gần nguồn phát sinh.',
  '**An ninh mạng toàn diện**: bảo vệ hạ tầng một cách chủ động.',
  '**Blockchain**: nền tảng cho hạ tầng tin cậy (không chỉ gói gọn trong tiền mã hóa).',
  'Theo nghiên cứu của **IDC**: khoảng **80%** người ra quyết định thừa nhận hạ tầng số là quan trọng hoặc quyết định thành công.',
]);
tip(['Câu “xu hướng KHÔNG được liệt kê trong slide DI” thường là phương án **chỉ gói gọn blockchain trong tiền mã hóa**.']);
pb();

// ================= MODULE 2 =================
h1('Module 2. Mạng máy tính & Internet');
h2('2.1 Khái niệm và lợi ích');
note([
  '**Mạng máy tính** = tập hợp máy tính nối với nhau qua **môi trường truyền dẫn** theo một **cấu trúc định trước**.',
  'Mục đích: **dùng chung tài nguyên** và **chia sẻ thông tin** (ví dụ gửi email mất 1 phút so với thư tay 1 tháng).',
]);
h2('2.2 Phân loại theo phạm vi');
table(['Loại', 'Phạm vi', 'Ghi chú'], [
  ['**LAN**', 'Một tòa nhà, trường học', 'Băng thông rộng, nhiều truy xuất trên một đường truyền.'],
  ['**MAN**', 'Một thành phố', ''],
  ['**WAN**', 'Quốc gia, châu lục', '**Internet** là mạng WAN lớn nhất.'],
  ['**VPN**', 'Ảo trên Internet', 'Tạo **kết nối riêng ảo** thông qua Internet.'],
], [2, 4, 7]);
h2('2.3 Mô hình mạng: Peer-to-Peer và Client/Server');
table(['Tiêu chí', 'Peer-to-Peer (ngang hàng)', 'Client/Server'], [
  ['Quản lý', 'Phân tán, mỗi máy vừa là client vừa là server', 'Tập trung tại server mạnh'],
  ['Quy mô', 'Nhỏ, **khoảng 10–15 máy** (ghi chú lớp: 15–20 máy)', 'Lớn'],
  ['Bảo mật', 'Thấp', 'Cao, quản trị tập trung'],
  ['Chi phí', 'Thấp', 'Cao hơn (cần server)'],
], [2.5, 5, 5]);
fig('cs_p2p.png', 600, 'Client/Server và Peer-to-Peer');
h2('2.4 Cấu trúc Internet');
bl([
  '**Network edge**: các **end system** (máy tính, điện thoại, server) và ứng dụng phân tán.',
  '**Access network**: kết nối end system tới **router biên đầu tiên** (Ethernet, Wi-Fi, **FTTH**, DSL, cáp, 5G, vệ tinh).',
  '**Network core**: mạng các **packet switch/router** và liên kết nối chúng.',
  '**Internet** = hệ thống của **end systems, communication links, packet switches**; vận hành theo các **protocol** (quy tắc trao đổi thông tin giữa các thực thể); chuẩn do **IETF** công bố dưới dạng **RFC**.',
  '**ISP** tổ chức thành mạng lưới **phân cấp và liên kết**: **multi-homing** (nối nhiều ISP nhà cung cấp), **peering**, **IXP** (điểm trao đổi lưu lượng giữa các ISP), **PoP**.',
]);
fig('internet_structure.png', 620, 'Network edge – Access network – Network core');
h2('2.5 Chuyển mạch');
table(['Tiêu chí', 'Circuit switching', 'Packet switching'], [
  ['Thiết lập kênh', 'Phải thiết lập kênh riêng trước (như điện thoại)', 'Không cần kênh cố định'],
  ['Chia sẻ đường truyền', '**FDM** (chia theo tần số), **TDM** (chia theo thời gian)', 'Statistical multiplexing – gói tin chia sẻ liên kết'],
  ['Hiệu quả', 'Lãng phí khi kênh rỗi', 'Hiệu quả cao, nhưng có thể trễ/mất gói khi nghẽn'],
], [2.5, 5, 5]);
h2('2.6 Đo lường');
bl([
  '**Băng thông (bandwidth)**: lưu lượng dữ liệu truyền trên một đơn vị thời gian (bps). 1 Gbps ≈ 10⁹ bps.',
  '**Delay** gồm: processing, queueing, transmission, **propagation** delay.',
  '**ADSL**: chữ “A” = **Asymmetric** – tốc độ downstream khác upstream. **FTTH** dùng cáp quang (PON); **DSLAM** thuộc DSL nên không thuộc FTTH.',
]);
h2('2.7 Phân loại mạng (chi tiết)');
table(['Tiêu chí', 'Các loại'], [
  ['**Theo mục đích xử lý**', '**Tập trung** (máy khách gửi yêu cầu về server xử lý); **Phân tán** (mỗi máy có nhiệm vụ và dữ liệu xử lý riêng); **Cộng tác** (server tách yêu cầu thành nhiều nhiệm vụ nhỏ, giao các client xử lý rồi gom kết quả gửi lại cho máy yêu cầu)'],
  ['**Theo thiết kế (topology)**', 'Star, Bus, Ring, Tree, Fully connected, Mesh'],
  ['**Theo cấu hình**', '**Client/Server** (tập trung) và **Peer-to-Peer** (ngang hàng)'],
  ['**Theo vùng địa lý**', 'LAN, MAN, WAN, GAN, WLAN'],
], [4, 9]);
table(['Mạng', 'Đặc điểm'], [
  ['**LAN**', 'Giới hạn địa lý (tòa nhà, phòng); nhiều truy xuất trên một đường truyền **băng thông rộng**; quản trị riêng; kết nối liên tục tới tài nguyên nội bộ. Thiết bị: **Router, Bridge, Hub, Ethernet Switch, Repeater**.'],
  ['**WAN**', 'Vùng địa lý rộng, có thể toàn cầu; truy xuất qua **serial interface tốc độ thấp**; kết nối liên tục hay gián đoạn. Thiết bị: **Router, Communication Server, Modem, CSU/DSU, TA/NT1**.'],
  ['**MAN**', 'Mạng đô thị nối các đơn vị hành chính của một thành phố/quốc gia.'],
  ['**GAN**', 'Mạng toàn cầu.'],
  ['**WLAN**', 'Mạng không dây.'],
], [2.5, 10]);
bl([
  'Lợi ích mạng máy tính: tăng **độ tin cậy** của HTTT (bảo trì, lưu trữ, khôi phục), tạo môi trường truyền thông giữa nhiều người trên vùng rộng, nâng cao chất lượng thông tin, **tiết kiệm chi phí**.',
  '**Client/Server**: **Host-centric** (mọi chức năng ứng dụng nằm trên máy chủ) và **File server** (hệ thống file tập trung).',
  '**Peer-to-Peer**: mỗi máy vừa là client vừa là server, quyền hạn xử lý ngang nhau, **tự quản trị**; dữ liệu nằm trên từng máy nên **khó backup toàn hệ thống**. Ghi chú lớp: phù hợp **15–20 máy** (bộ quiz ghi 10–15 máy – nên nhớ cả hai, chọn theo phương án đề đưa ra).',
]);
h2('2.8 Băng thông (Bandwidth) và Throughput');
note([
  '**Băng thông** = đại lượng đo **lưu lượng dữ liệu truyền trên một đơn vị thời gian** (bit/s). **Throughput** = lượng dữ liệu **đo thực tế**, luôn **nhỏ hơn** băng thông (**Throughput < Bandwidth**).',
  'Băng thông của cả đường truyền được quyết định bởi **đoạn có băng thông thấp nhất**. Băng thông **không miễn phí**, phụ thuộc thiết bị và kỹ thuật mạng, là thước đo đánh giá hoạt động của mạng.',
]);
formula([
  '**Thời gian tải file:** download tốt nhất **T = S / BW**; download bình thường **T = S / P**.',
  'T (giây) – thời gian truyền; S (bit) – kích thước file; BW (bit/s) – băng thông lý thuyết từ nguồn đến đích; P (bit/s) – lưu lượng thực tế tại thời điểm truyền.',
  '**Đơn vị:** 1 Kbps = 1024 bps ≈ 10³ bps; 1 Mbps ≈ 10⁶ bps; 1 Gbps = 1024 Mbps ≈ 10⁹ bps; 1 Tbps = 1024 Gbps ≈ 10¹² bps. 100 Mbps = 100 Mbit/s.',
]);
bl([
  '**Yếu tố ảnh hưởng throughput:** PC (client), máy chủ (server), số người dùng trên mạng, chuyển mạng đến “cloud”, **mô hình thiết kế mạng**, kiểu dữ liệu truyền, **thời điểm trong ngày**.',
  'Đường truyền mạng dùng **ánh sáng, điện, sóng vô tuyến**.',
]);

pb();

// ================= MODULE 3 =================
h1('Module 3. Mô hình OSI và TCP/IP');
h2('3.1 Mô hình OSI – 7 tầng (từ trên xuống)');
table(['Tầng', 'Tên', 'Chức năng', 'PDU', 'Ví dụ'], [
  ['7', '**Application**', 'Giao diện cho ứng dụng', 'Data', 'HTTP, DNS, FTP, SMTP'],
  ['6', '**Presentation**', '**Mã hóa/giải mã, nén**, chuyển định dạng', 'Data', 'SSL/TLS, JPEG'],
  ['5', '**Session**', '**Thiết lập, duy trì, kết thúc phiên** làm việc', 'Data', 'NetBIOS, RPC'],
  ['4', '**Transport**', 'Truyền **tin cậy** giữa các host, port, thứ tự', 'Segment/Datagram', 'TCP, UDP'],
  ['3', '**Network**', '**Định tuyến**, địa chỉ logic (IP)', 'Packet', 'IP, ICMP, Router'],
  ['2', '**Data Link**', 'Địa chỉ **MAC**, frame, kiểm lỗi, truy cập môi trường', 'Frame', 'Ethernet, **Switch, Bridge**'],
  ['1', '**Physical**', 'Chuyển **bit thô** qua phương tiện (tín hiệu điện/quang)', 'Bit', '**Hub, Repeater**, cáp'],
], [1, 2.5, 6, 2.5, 3.5]);
fig('osi.png', 620, 'Mô hình OSI 7 tầng – chức năng, PDU, giao thức, thiết bị');
h2('3.2 Mô hình TCP/IP – 4 tầng');
table(['TCP/IP', 'Tương ứng OSI'], [
  ['**Application**', 'Application + Presentation + Session'],
  ['**Transport**', 'Transport'],
  ['**Internet (Network)**', 'Network'],
  ['**Network Access**', 'Data Link + Physical'],
], [4, 8]);
h2('3.3 Đóng gói (Encapsulation)');
bl([
  'Dữ liệu đi **xuống** các tầng, mỗi tầng thêm **header**: Transport thêm **số cổng và số thứ tự**; Network thêm **địa chỉ IP**; Data Link thêm **MAC** (và trailer **FCS**).',
  'Bên nhận **giải đóng gói (decapsulation)** theo chiều ngược lại.',
  '**UDP** không đảm bảo thứ tự gói; **TCP** đảm bảo thứ tự và tin cậy.',
]);
fig('encapsulation.png', 600, 'Đóng gói dữ liệu khi đi xuống các tầng');
h2('3.4 Chi tiết từng tầng OSI');
bl([
  '**Nhóm tầng hệ thống mạng (1–3)**: **Physical** (bit đi qua dây nào, môi trường nào, nối mạng ra sao), **Data Link** (kiểm tra, sửa lỗi tại nơi nhận; “máy tính này với máy tính kia”), **Network** (trao đổi giữa hai mạng khác nhau, đánh địa chỉ; “mạng này với mạng kia”).',
  '**Nhóm tầng ứng dụng (4–7)**: **Transport** (đảm bảo **nguyên vẹn dữ liệu** khi truyền), **Session** (điều khiển/ngắt phiên, **phân luồng** dữ liệu), **Presentation** (biểu diễn dữ liệu thống nhất, quy định kiểu dữ liệu), **Application** (ứng dụng cụ thể cho người dùng: Messenger, YouTube…).',
  '**Dữ liệu từng tầng (PDU):** Physical = **Bits**; Data Link = **Frames**; Network = **Packets**; Transport = **Segment**; Session/Presentation/Application = **Data**.',
]);
h3('Tầng 1 – Physical');
bl(['Chuyển **dòng bit thô** qua phương tiện truyền dẫn; đảm bảo bên nhận hiểu đúng; quy định đặc điểm nhận dữ liệu bằng **tín hiệu 1/0**.']);
h3('Tầng 2 – Data Link (2 tầng con: MAC và LLC)');
bl([
  '**Địa chỉ MAC (Media Access Control)**: **48 bit** = **24 bit nhà sản xuất** + **24 bit đánh số thiết bị** → khoảng **2⁴⁸** thiết bị.',
  '**LLC**: tầng con thiết lập và duy trì liên kết dữ liệu giữa các thiết bị, chịu trách nhiệm **điều khiển luồng và sửa lỗi**.',
]);
table(['Cơ chế truy cập', 'Phương pháp', 'Cách hoạt động'], [
  ['**Tranh chấp**', '**CSMA/CA** (mạng không dây)', '**Tránh** đụng độ; chỉ chiếm đường truyền khi cảm nhận đường **đang rảnh**'],
  ['**Tranh chấp**', '**CSMA/CD** (mạng có dây)', '**Chấp nhận** đụng độ: hai máy cùng thấy đường rảnh và cùng truyền thì phát hiện và xử lý'],
  ['**Có điều khiển**', '**Token passing** (thẻ bài)', 'Một **token** lưu chuyển; thiết bị muốn truyền phải **chiếm token**'],
  ['**Có điều khiển**', '**Polling** (dò tìm)', 'Thiết bị điều khiển chính **hỏi lần lượt** các thiết bị thứ cấp, chọn theo thứ tự và độ ưu tiên'],
], [3, 4.5, 6]);
h3('Tầng 3 – Network');
bl([
  'Thiết bị: **router**, (switch lớp 3); xác định **địa chỉ logic** bằng giao thức **IP**; dùng **bảng định tuyến**; điều khiển lưu lượng, kiểm soát lỗi.',
  '**Mạng vật lý**: các máy và thiết bị nối nhau bằng đường truyền vật lý. **Mạng logic**: dãy máy trong cùng mạng vật lý cho phép **truyền thông trực tiếp** theo một giao thức mạng; máy khác mạng logic **không giao tiếp trực tiếp**, phải qua **router**.',
]);
table(['Kỹ thuật chuyển dữ liệu', 'Cách làm', 'Đặc điểm'], [
  ['**Chuyển mạch (circuit switching)**', 'Thiết lập mạch trên đường cơ bản rồi mới truyền dữ liệu', 'Ổn định, chiếm kênh'],
  ['**Chuyển thông điệp (message)**', 'Tách dữ liệu thành các thông điệp, đi nhiều đường khác nhau', 'Nhanh nhưng **rủi ro cao**'],
  ['**Chuyển gói (packet)**', 'Tách thành các **gói**, tận dụng đường nào trống', 'Nhanh, tận dụng đường truyền, kết quả có thể **lộn xộn** (cần ráp lại)'],
], [4, 5, 4.5]);
bl([
  'Định tuyến: **cứng** (con người cài – **static**) và **mềm** (máy tự thiết lập – **dynamic**). Router căn cứ **bảng định tuyến** để tìm **đường ngắn nhất**.',
  'Hai phương pháp xây bảng định tuyến động: **vector cự ly (distance vector)** và **trạng thái kết nối (link-state)**.',
]);
h3('Tầng 4, 5 – Transport và Session');
bl([
  '**Transport**: kiểm soát **độ tin cậy** của một kết nối. **TCP** = hướng kết nối; **UDP** = phi kết nối (**nhanh hơn nhưng kém chính xác hơn**). Tùy ứng dụng chọn TCP hay UDP.',
  '**Session**: thiết lập, quản lý và kết thúc kết nối giữa các ứng dụng.',
]);
table(['Chế độ truyền', 'Ý nghĩa'], [
  ['**Simplex**', 'Chỉ **một chiều** A → B, không truyền ngược lại'],
  ['**Half duplex**', 'Hai chiều nhưng **không đồng thời** (lần lượt)'],
  ['**Full duplex**', 'Hai chiều **đồng thời**'],
], [4, 9]);

pb();

// ================= MODULE 4 =================
h1('Module 4. Application Layer');
h2('4.1 Kiến trúc ứng dụng và Socket');
bl([
  'Các đối tượng giao tiếp ở tầng ứng dụng là các **process** (tiến trình) trên hai host.',
  '**Socket** là **giao diện giữa tầng ứng dụng và tầng giao vận**; process được nhận diện bởi **IP + port number**.',
  'Mô hình: **Client/Server** (server luôn chạy, IP cố định) và **P2P**.',
]);
h2('4.2 HTTP');
bl([
  '**HTTP** dùng **TCP, cổng 80** (HTTPS: **443**). Mô hình request/response, **stateless**.',
  '**Non-persistent** (mỗi đối tượng một kết nối) vs **Persistent** (nhiều đối tượng trên một kết nối).',
  '**Cookie**: lưu trạng thái phía client. **Web cache/Proxy**: giảm tải và trễ.',
  '**Conditional GET** (If-Modified-Since): kiểm tra đối tượng đã đổi chưa trước khi tải về cache.',
]);
h2('4.3 DNS');
note(['**DNS** dịch **domain name → địa chỉ IP**. Chủ yếu dùng **UDP cổng 53**.']);
table(['Loại server', 'Vai trò'], [
  ['**Root DNS**', 'Đỉnh phân cấp, chỉ tới TLD.'],
  ['**TLD server**', 'Quản lý .com, .vn, .edu…'],
  ['**Authoritative DNS**', 'Lưu Resource Record chính thức của tổ chức (ví dụ www.site.vn → IP).'],
  ['**Local DNS**', 'Trung gian nhận truy vấn của host; trên Windows dịch vụ **DNS Client**.'],
], [3.5, 9]);
table(['Record', 'Name – Value'], [
  ['**A**', 'hostname → địa chỉ IP'],
  ['**NS**', 'domain → authoritative DNS server'],
  ['**CNAME**', 'alias → canonical (tên chuẩn)'],
  ['**MX**', 'domain → tên chuẩn của **mail server**'],
], [3, 9]);
bl([
  '**Iterative query**: server trả về “hỏi server khác”; **Recursive query**: server nhận truy vấn **chịu trách nhiệm hỏi tiếp** và trả kết quả cuối.',
  'Dịch vụ DNS: dịch tên, **Host aliasing**, **Mail server aliasing**, **Load distribution** (một tên trả nhiều IP của các replicated server).',
]);
h2('4.4 FTP');
table(['', 'Active FTP', 'Passive FTP'], [
  ['Control connection', 'Client → server cổng **21**', 'Client → server cổng **21**'],
  ['Data connection', 'Server (cổng **20**) → client', 'Client → server tại **cổng ngẫu nhiên >1023**'],
  ['Ai khởi tạo kết nối', 'Client mở control, **server mở data**', '**Client mở cả hai**'],
  ['Mục đích', '—', 'Tránh **firewall chặn** kết nối từ ngoài vào client'],
], [3, 5, 5]);
tip(['Server active mở cổng **20, 21**; server passive mở **21 + một cổng ngẫu nhiên >1023**.']);
h2('4.5 Email');
table(['Giao thức', 'Chức năng', 'Cổng'], [
  ['**SMTP**', '**Gửi** email (client→server, server→server); mã hóa ASCII; persistent connection', '**25**'],
  ['**POP3 / IMAP**', '**Lấy** email về (**Incoming Mail Server**)', '110 / 143'],
], [3, 8, 2]);
tip(['Câu “phát biểu SAI về SMTP”: **“SMTP là giao thức lấy email về”** là phát biểu sai (SMTP chỉ để gửi).']);
h2('4.6 DHCP, Proxy, chia sẻ tệp');
bl([
  '**DHCP**: cấp IP tự động (DORA: Discover – Offer – Request – Ack). Subnet không có DHCP server dùng **DHCP relay agent** trên router.',
  '**Forward proxy**: đại diện client trong LAN ra Internet. **Reverse proxy**: nhận kết nối từ Internet rồi chuyển tới web server nội bộ.',
  'Chức năng proxy: trung gian, **cache**, xác thực, giới hạn truy cập. **Định tuyến không phải** chức năng proxy.',
  'Shared folder trên Windows: quyền truy cập từ xa cấu hình ở **Share permissions** (qua giao thức **SMB**).',
]);
pb();

// ================= MODULE 5 =================
h1('Module 5. Transport Layer');
h2('5.1 TCP và UDP');
table(['Tiêu chí', 'TCP', 'UDP'], [
  ['Kết nối', '**Hướng kết nối** (handshake)', '**Không kết nối**'],
  ['Độ tin cậy', '**Tin cậy**, đúng thứ tự, truyền lại', 'Không tin cậy, **best-effort**'],
  ['Điều khiển', 'Flow control + Congestion control', 'Không'],
  ['Tốc độ', 'Chậm hơn', 'Nhanh, header nhỏ'],
  ['Ứng dụng', 'HTTP, FTP, SMTP, email', '**DNS**, streaming, game online, ứng dụng **thời gian thực**, chấp nhận mất một phần nhỏ dữ liệu'],
], [2.5, 5, 5]);
note(['Gói tin tầng giao vận (segment) chỉ được xử lý ở **host end system**, không phải ở switch/router.']);
h2('5.2 Port number');
bl([
  'Port dài **16 bit** (0–65535). **Well-known ports: 0–1023**; Registered: 1024–49151; Dynamic/private: 49152–65535.',
  '**Source port** = cổng của **tiến trình máy gửi**; **Destination port** = cổng của **tiến trình máy nhận**.',
  'Hai client có thể dùng cùng port nguồn khi nói chuyện với cùng server (khác IP); một ứng dụng có thể dùng ≥ 2 port; **nhưng nhiều ứng dụng trên một máy không dùng chung một port** cùng lúc.',
]);
h2('5.3 Header TCP – các trường cần nhớ');
table(['Trường', 'Vai trò'], [
  ['**Source/Destination port**', 'Xác định socket/tiến trình'],
  ['**Sequence number**', 'Số thứ tự **byte đầu tiên** của dữ liệu trong segment'],
  ['**Acknowledgement number**', 'Số thứ tự byte **kế tiếp mà bên nhận mong đợi**'],
  ['**Receive window**', '**Flow control** – bộ đệm còn trống của bên nhận'],
  ['**Internet checksum**', '**Kiểm lỗi**'],
  ['**Urgent data pointer**', 'Chỉ vị trí cuối của dữ liệu khẩn (dùng cùng cờ URG)'],
  ['**Flags**', 'URG, ACK, PSH, RST, SYN, FIN'],
], [4, 9]);
table(['Cờ', 'Ý nghĩa'], [
  ['**SYN**', 'Thiết lập kết nối (bật ở gói 1 và 2 của handshake)'],
  ['**ACK**', 'Xác nhận (bật từ gói thứ 2 trở đi)'],
  ['**FIN**', 'Kết thúc/đóng kết nối'],
  ['**RST**', 'Từ chối/đặt lại kết nối (ví dụ cổng đóng)'],
  ['**PSH**', 'Đẩy dữ liệu lên tầng trên ngay'],
  ['**URG**', 'Có dữ liệu khẩn cấp'],
], [3, 9]);
h2('5.4 Bắt tay 3 bước (3-way handshake)');
bl(['Client → Server: **SYN**', 'Server → Client: **SYN + ACK**', 'Client → Server: **ACK** (kết nối mở)']);
fig('handshake.png', 480, 'Bắt tay 3 bước và đóng kết nối TCP');
note(['**RTT** (Round-Trip Time) = thời gian một gói đi tới máy nhận và nhận phản hồi trở về. **Full duplex** = truyền hai hướng đồng thời.']);
tip(['Đề ôn có câu “máy A không chấp nhận cổng được yêu cầu, bật cờ nào?” – đáp án đúng về kỹ thuật là **RST** (đề gốc tô FIN, nên đối chiếu giảng viên).']);
pb();

// ================= MODULE 6 =================
h1('Module 6. Network Layer');
h2('6.1 Chức năng và giao thức');
table(['Giao thức', 'Vai trò'], [
  ['**IP (Internet Protocol)**', 'Quy ước **địa chỉ, định dạng gói tin, cách xử lý**.'],
  ['**Routing protocols** (RIP, OSPF, BGP)', 'Xác định đường đi, **xây bảng định tuyến**.'],
  ['**ICMP**', 'Báo lỗi và thông tin điều khiển, khả năng kết nối.'],
], [5, 8]);
h2('6.2 Datagram IPv4');
table(['Trường', 'Ý nghĩa'], [
  ['**Version**', 'Phiên bản IP (4 hoặc 6)'],
  ['**Header length**', 'Độ dài header; tối thiểu **20 byte**'],
  ['**Type of service**', 'Phân loại dịch vụ'],
  ['**Identifier, Flags, Fragmentation offset**', '**Quản lý phân mảnh** – ráp lại tại **máy đích**'],
  ['**Time-to-live (TTL)**', 'Giảm 1 mỗi router; về 0 thì hủy → **tránh vòng lặp vô hạn**'],
  ['**Upper-layer protocol**', 'Giao thức tầng trên (TCP = 6, UDP = 17)'],
  ['**Header checksum**', 'Kiểm lỗi header'],
  ['**Source/Destination IP**', 'Địa chỉ nguồn/đích'],
], [5, 8]);
h2('6.3 Địa chỉ IP và subnet');
note([
  '**Net ID = IP address AND Subnet mask.**',
  'Hai máy **cùng mạng** nếu Net ID của chúng bằng nhau (với cùng mask).',
  '**Private IPv4** (RFC 1918): **10.0.0.0/8**, **172.16.0.0 – 172.31.255.255**, **192.168.0.0/16**.',
]);
table(['Mask', 'Prefix', 'Bước nhảy', 'Số host/subnet'], [
  ['255.255.255.128', '/25', '128 (octet 4)', '126'],
  ['255.255.255.192', '/26', '64 (octet 4)', '62'],
  ['255.255.255.224', '/27', '32 (octet 4)', '30'],
  ['255.255.255.240', '/28', '16 (octet 4)', '14'],
  ['255.255.240.0', '/20', '16 (octet 3)', '4094'],
  ['255.255.192.0', '/18', '64 (octet 3)', '16382'],
], [3.5, 2, 4, 3]);
formula([
  '**Ví dụ 1 – tìm NetID:** IP 196.123.134.90, mask 255.255.255.192 (/26). Bước nhảy 64 ở octet 4: 90 nằm trong khối 64–127 → **NetID = 196.123.134.64**.',
  '**Ví dụ 2 – cùng mạng?** 133.69.73.85 và 133.69.97.123, mask 255.255.192.0 (/18). Octet 3 bước nhảy 64; 73 và 97 đều thuộc khối 64–127 → **cùng mạng**.',
  '**Ví dụ 3 – chia mạng:** 159.7.0.0 chia cho 14 phòng, mỗi phòng 255 máy → cần ≥ 14 subnet nên mượn **4 bit** (2⁴ = 16), mask **255.255.240.0 (/20)**, mỗi subnet 4094 host (đủ). Subnet thứ hai của 159.7.0.0/20 là **159.7.16.0**.',
  '**Ví dụ 4:** 189.79.0.0 chia cho 234 phòng, mỗi phòng 250 máy → 234 ≤ 2⁸ nên mượn **8 bit** (mask /24, 254 host/subnet).',
  '**Ví dụ 5 – hai IP 133.69.85.85 và 133.69.93.234:** octet 3 là 01010101 và 01011101, khác nhau ở bit giá trị 8. Mask 224 (/19) và 240 (/20) → **cùng mạng**; mask 248 (/21) → **khác mạng**.',
]);
tip(['Cách làm nhanh: xác định octet “bị cắt” của mask, lấy **256 − giá trị mask** = bước nhảy, rồi tìm khối chứa địa chỉ.']);
h2('6.4 DHCP, NAT, ICMP');
bl([
  '**NAT**: nhiều máy riêng dùng chung một IP công cộng, phân biệt bằng **port** → tối đa khoảng **2¹⁶** kết nối. Máy bên ngoài kết nối vào máy sau NAT nhờ **UPnP (Universal Plug and Play)** / port forwarding.',
  '**ICMP**: **Echo request = Type 8 code 0** (PING gửi), **Echo reply = Type 0 code 0**, **TTL hết hạn = Type 11 code 0**, Destination unreachable = Type 3.',
  '**PING**: kiểm tra có gửi được gói tới một địa chỉ không (và đo RTT). **TRACEROUTE**: hiển thị **đường đi** (các router) – tăng dần TTL và dựa vào ICMP Type 11.',
]);
h2('6.5 Định tuyến');
bl([
  '**RIP** (Routing Information Protocol): **distance-vector**, **dynamic routing**, xây bảng từ các **router láng giềng**, metric = **hop count** (tối đa 15), không thiết kế cho mạng lớn. Dùng **UDP cổng 520**. Windows: **RIP Listener**; UNIX/BSD: **routed**.',
  '**Link-state** (OSPF) mới là kiểu **tập hợp thông tin toàn mạng** rồi mới xây bảng.',
  'Router tìm đường tối ưu, nối các **mạng logic khác nhau** (điều mà bridge không làm được).',
]);
h2('6.6 Địa chỉ IP – phân lớp và NetID');
fig('ip_subnet.png', 600, 'Cấu trúc địa chỉ IP, lớp A/B/C và cách xác định mạng con');
note([
  '**IPv4**: 4 octet, **32 bit**. Mỗi địa chỉ gồm **NetID** (địa chỉ mạng) và **HostID** (địa chỉ máy trong mạng).',
  '**NetID = IP address AND Subnet mask.** Các máy **cùng mạng** có **cùng NetID, cùng subnet mask, khác HostID**; khác mạng nếu khác NetID hoặc khác subnet mask.',
]);
table(['Lớp', 'Octet đầu', 'NetID', 'Netmask mặc định', 'Số mạng', 'Số máy/mạng'], [
  ['**A**', '0 – 127', 'x.0.0.0', '255.0.0.0 (/8)', '128', '256×256×256'],
  ['**B**', '128 – 191', 'x.x.0.0', '255.255.0.0 (/16)', '64×256', '256×256'],
  ['**C**', '192 – 223', 'x.x.x.0', '255.255.255.0 (/24)', '32×256×256', '256'],
], [1.5, 2.5, 2.5, 4, 3, 3.5]);
bl([
  'Lớp **D, E** thường không dùng cho máy thông thường (multicast/dự phòng).',
  'Số máy dùng được thực tế = **tổng − 2** (bỏ địa chỉ mạng và địa chỉ broadcast).',
  '**Lưu ý:** không thể dùng netmask của lớp **nhỏ hơn**, nhưng có thể dùng netmask của lớp **lớn hơn** (để chia mạng con).',
]);
formula([
  '**Ví dụ NetID bằng AND nhị phân:** IP 156.89.123.89 (lớp B), mask 255.255.0.0 → 10011100.01011001.01111011.01011001 AND 11111111.11111111.00000000.00000000 → **NetID 156.89.0.0**.',
  '203.162.7.123 / 255.255.255.0 → **203.162.7.0**; 20.162.7.123 / 255.0.0.0 → **20.0.0.0**; 153.162.7.123 / 255.255.0.0 → **153.162.0.0**.',
  '**Hai IP cùng mạng lớp B, NetID 175.205:** 175.205.34.17 và 175.205.17.34 (HostID lần lượt 34.17 và 17.34).',
]);
h3('Địa chỉ đặc biệt và Private');
bl([
  '**Loopback 127.x.x.x**: dùng **kiểm tra card mạng**, không dùng cấu hình mạng.',
  '**Broadcast**: địa chỉ **cuối cùng** của một mạng (ví dụ mạng 167.8.0.0 → broadcast **167.8.255.255**); giúp quảng bá/cập nhật bảng định tuyến. Số mạng con thực sự dùng được = tổng − 2 (bỏ địa chỉ đầu và cuối).',
]);
table(['Lớp', 'Khoảng Private', 'Số mạng'], [
  ['A', '**10.0.0.0**', '1'],
  ['B', '**172.16.0.0 – 172.31.0.0**', '16'],
  ['C', '**192.168.x.0**', '256'],
], [2, 7, 3]);
p('Private address: dùng cho mạng cục bộ **không cần mua**, **không được cấp phát trên Internet**.');
h2('6.7 Bài tập – cùng mạng và broadcast');
formula([
  '**Đề:** IP1 = 133.69.73.85, IP2 = 133.69.97.123, subnet mask 255.255.192.0. Hai IP có cùng mạng không? Nếu cùng thì mạng nào, broadcast là gì?',
  '**Cách giải:** mask đuôi 192 → **số bù = 256 − 192 = 64**. Các khối mạng ở octet 3: 0–63, **64–127**, 128–191, 192–255.',
  '73 và 97 đều nằm trong 64–127 → cùng NetID **133.69.64.0**. Dải địa chỉ: 133.69.64.0 → 133.69.127.255 ⇒ **broadcast = 133.69.127.255**.',
  'Các mạng liền kề: 133.69.0.0 – 133.69.63.255; **133.69.64.0 – 133.69.127.255**; 133.69.128.0 – 133.69.191.255.',
]);
h2('6.8 Chia mạng con (subnetting) theo công thức của lớp');
note([
  '**Lý do chia mạng con**: một NetID thật trên Internet phải **mua**; nhu cầu tách mạng trong một đơn vị; số máy quá nhiều → chia nhỏ mạng.',
  'Gọi **m** = số bit HostID ban đầu, **n** = số bit mượn. Số mạng con = **2ⁿ** (dùng được **2ⁿ − 2** nếu bỏ mạng đầu và cuối); số máy/mạng con = **2^(m−n) − 2**.',
]);
formula([
  '**Số bù** (độ rộng mỗi khối mạng, trong octet bị cắt) = **2^(số bit host còn lại trong octet đó)**; **số trong subnet mask = 256 − số bù**.',
]);
table(['Bit mượn trong octet', 'Số mạng', 'Số bù', 'Số trong mask'], [
  ['1', '2', '128', '128'], ['2', '4', '64', '192'], ['3', '8', '32', '224'], ['4', '16', '16', '240'],
  ['5', '32', '8', '248'], ['6', '64', '4', '252'], ['7', '128', '2', '254'], ['8', '256', '1', '255'],
], [4, 3, 3, 3]);
formula([
  '**Ví dụ số bù = 32 trên mạng 172.16.0.0:** Mạng 1: 172.16.0.0 – 172.16.31.255; Mạng 2: 172.16.32.0 – 172.16.63.255; Mạng 3: 172.16.64.0 – 172.16.95.255…',
  '**Bài mẫu:** công ty có mạng 159.7.0.0 (lớp B, mask 255.255.0.0, **m = 16**), cần **14 phòng**, mỗi phòng **255 máy**, độc lập (khác mạng).',
  'Hệ bất phương trình: **2ⁿ − 2 ≥ 14** → 2ⁿ ≥ 16 → n ≥ 4; **2^(16−n) − 2 ≥ 255** → 2^(16−n) ≥ 257 > 256 → 16 − n ≥ 9 → n ≤ 7. Vậy **4 ≤ n ≤ 7**, chọn một giá trị nguyên.',
  'Chọn **n = 6** (mượn 6 bit): có **64 mạng**, **số bù = 4**, mask **255.255.252.0**: Mạng 1: 159.7.0.0 – 159.7.3.255; Mạng 2: 159.7.4.0 – 159.7.7.255; Mạng 3: 159.7.8.0 – 159.7.11.255; Mạng 4: 159.7.12.0 – 159.7.15.255; … Mạng 64: 159.7.252.0. Chọn ra 14 mạng để dùng.',
  '**Cùng mạng** = nằm trong cùng khoảng mạng. Ví dụ **159.7.8.0 cùng mạng với 159.7.10.22**.',
]);
tip([
  'Có nhiều đáp án n hợp lệ (4–7): đề trắc nghiệm hay cho sẵn mask. Ở Module 10 chọn n = 4 (mask 255.255.240.0, mỗi mạng 4094 máy) – cũng đúng vì thỏa cả hai điều kiện.',
  'Khi hỏi “số bit mượn tối thiểu” chỉ cần điều kiện **2ⁿ ≥ số phòng** (cộng 2 nếu đề yêu cầu bỏ mạng đầu/cuối).',
]);


pb();

// ================= MODULE 7 =================
h1('Module 7. Network Access Layer');
h2('7.1 Tầng Physical – tín hiệu & cáp');
bl([
  '**Tín hiệu số (digital)**: vài trạng thái rời rạc (0/1); **analog**: điện thế liên tục thay đổi theo thời gian.',
  'Hệ đếm thường dùng: **cơ số 2, 10, 16**. **Baseband**: dành toàn bộ băng thông cho một kênh; **Broadband**: chia nhiều kênh.',
  'Phương tiện truyền dẫn chia 2 loại: **hữu tuyến** và **vô tuyến**.',
  '**Crosstalk**: nhiễu do **điện từ trường** giữa các dây dẫn kế cận. **Propagation delay**: thời gian tín hiệu truyền qua hệ thống cáp.',
]);
table(['Loại cáp', 'Đặc điểm'], [
  ['**UTP Cat5**', '**RJ45**, trở kháng **100 Ω**, 100 Mbps, dài tối đa 100 m.'],
  ['**Cat6**', 'Tần số tối đa **250 MHz**, ít crosstalk và suy hao hơn Cat5.'],
  ['**Cáp đồng trục**', 'Đầu nối **BNC**; **thick** (10Base5) dài tối đa **500 m**.'],
  ['**Cáp quang**', 'Single-mode / multi-mode; đầu nối **ST**, SC…'],
  ['**10BaseT**', '**10 Mbps**, cáp xoắn đôi, topology Star.'],
], [3.5, 9]);
h2('7.2 Bấm dây RJ45');
bl([
  '**Dây thẳng**: hai đầu **cùng chuẩn** (T568A–T568A hoặc T568B–T568B). **Dây chéo**: một đầu T568A, một đầu T568B.',
  'T568B: chân 1,2 = **sọc cam, cam**. Với 100 Mbps chỉ dùng các chân **1, 2, 3, 6**.',
  'Các **cặp xoắn** cần lưu ý: **(1,2) – (3,6) – (4,5) – (7,8)**.',
  'Quy tắc: **thiết bị cùng họ** (PC–PC, Switch–Switch) dùng dây **chéo**; khác họ (PC–Switch) dùng dây thẳng.',
]);
h2('7.3 Topology');
table(['Topology', 'Ưu điểm', 'Nhược điểm'], [
  ['**Bus**', 'Rẻ, đơn giản (đầu nối BNC, cáp đồng trục)', 'Một điểm đứt **làm cả mạng ngừng**; khó quản trị, tốc độ không cao'],
  ['**Star**', 'Một máy lỗi **không ảnh hưởng toàn mạng**; dễ mở rộng', 'Phụ thuộc thiết bị trung tâm (**Hub/Switch**)'],
  ['**Ring, Mesh**', 'Dự phòng tốt (Mesh)', 'Phức tạp, tốn kém'],
], [2.5, 5, 6]);
fig('topology.png', 640, 'Các mô hình thiết kế mạng (topology)');
h2('7.4 Địa chỉ MAC và ARP');
note([
  '**MAC address**: **48 bit**, gắn với **card mạng**, không đổi khi máy sang subnet khác. **24 bit đầu = OUI** (nhà sản xuất). Broadcast: **FF-FF-FF-FF-FF-FF**.',
  '**ARP**: giao thức dịch **IP → MAC** trong cùng mạng. Lệnh: **arp -a** (bảng IP–MAC), **ipconfig /all** (xem MAC trên Windows).',
]);
h2('7.5 Ethernet, CSMA/CD, CSMA/CA');
table(['', 'CSMA/CD', 'CSMA/CA'], [
  ['Dùng cho', '**Ethernet** (có dây)', '**Wi-Fi** (không dây)'],
  ['Nguyên lý', 'Nghe trước khi nói; **phát hiện đụng độ** thì dừng và gửi tín hiệu cảnh báo (jam)', '**Tránh** đụng độ bằng cách “xin phép” (RTS/CTS) trước khi truyền'],
  ['Khi đụng độ', 'Chờ thời gian **ngẫu nhiên tăng gấp đôi** (backoff) rồi gửi lại', '—'],
], [2.5, 5.5, 5.5]);
bl([
  '**Frame Ethernet 802.3**: trường **FCS** dài **4 byte**. **Late collision**: đụng độ phát hiện sau khi đã truyền hơn 64 byte.',
  '**Collision domain**: vùng mà mọi máy chịu ảnh hưởng khi có đụng độ. **Hub** không tăng số collision domain; **Switch** (và bridge, router) **chia nhỏ** collision domain → mạng nhanh hơn.',
  '**Full duplex**: gửi và nhận cùng lúc; **Half duplex**: lần lượt.',
]);
h2('7.6 Thiết bị mạng');
table(['Thiết bị', 'Tầng OSI', 'Đặc điểm'], [
  ['**Repeater**', '1', 'Khuếch đại tín hiệu và truyền tiếp'],
  ['**Hub**', '1', 'Passive hub chỉ đấu nối cáp; active hub khuếch đại. Mọi cổng cùng collision domain'],
  ['**Bridge / Switch**', '2', 'Chuyển tiếp theo **địa chỉ MAC**, **tự học** bảng chuyển tiếp, “trong suốt” với end system'],
  ['**Router**', '3', 'Nối các mạng logic khác nhau, tìm đường tối ưu'],
], [3, 2, 8]);
note([
  '**Switch nhận gói tin:** đích **không có** trong bảng → **flooding** ra mọi cổng còn lại (trừ cổng vào); cổng ra **trùng cổng vào** → **hủy** gói; có trong bảng → gửi đúng cổng.',
  'Switch **tự xây dựng** bảng chuyển tiếp từ các gói tin đầu vào, admin **không cần** cấu hình ban đầu.',
]);
h2('7.7 Hub và Switch – so sánh chi tiết');
fig('hub_switch.png', 620, 'Hub gửi ra mọi cổng – Switch chỉ gửi đúng cổng đích');
bl([
  'Phổ biến ở Việt Nam: **Star, Bus, Tree**. **Star**: dùng một hub/switch nối các máy; **Bus**: đường truyền chính giới hạn hai đầu bằng **terminator**, mỗi trạm nối qua đầu **chữ T**. Dây nối từ máy tới thiết bị không quá **180 cm** (ghi chú lớp).',
]);
table(['', 'Hub (tầng 1)', 'Switch (tầng 2)'], [
  ['Cách chuyển dữ liệu', '**Sao chép** dữ liệu ra **tất cả cổng còn lại** → mọi máy đều nhận', 'Dựa vào **địa chỉ MAC**, chỉ gửi **đúng máy đích**'],
  ['Collision domain', 'Cả hệ thống hub + máy là **1 collision domain** → gắn càng nhiều máy càng nhiều đụng độ', '**Mỗi cổng = 1 collision domain** → khó đụng độ'],
  ['Băng thông', 'Giảm khi thêm máy; **tốn băng thông**', '**Tiết kiệm băng thông**, tăng tốc độ mạng'],
  ['Bảo mật / giá', 'Rủi ro bảo mật; rẻ', 'An toàn hơn; **giá cao hơn**'],
], [3, 5, 5]);
bl([
  'MAC chỉ có hiệu lực trong **mạng nội bộ**, nên switch chỉ chuyển dữ liệu trong nội bộ; **Router** chuyển dữ liệu **ra bên ngoài bằng địa chỉ IP**.',
  '**Số lần đợi tối đa** (retry) của collision là **16** (quy ước).',
  '**Bridge**: hỗ trợ hub – xem địa chỉ MAC để quyết định **gửi hay hủy** dữ liệu (hub thì gửi đến toàn bộ máy).',
  'Hub và Switch đều là thiết bị cho máy tính cắm vào cổng và chia sẻ dữ liệu cho nhau.',
]);
h2('7.8 Collision và Collision domain');
table(['Khái niệm', 'Ý nghĩa'], [
  ['**Collision (đụng độ)**', 'Xảy ra khi **hai hay nhiều máy cùng lúc** gửi dữ liệu → xung đột.'],
  ['**Collision domain**', 'Vùng mà nếu có hai máy gửi đồng thời thì xảy ra đụng độ. Switch **chia nhỏ** vùng này (mỗi cổng một vùng) nên khó đụng độ; hub thì **cả hệ thống là một vùng**.'],
], [4, 9]);
h2('7.9 Môi trường truyền dẫn và cách bấm dây');
bl([
  '**Thiết bị truyền dẫn**: cáp đồng, cáp quang, không dây. **Phương tiện truyền dẫn**: phương tiện vật lý cho phép truyền tin giữa các thiết bị, gồm **hữu tuyến** và **vô tuyến**.',
  '**Baseband**: một lần chỉ truyền **một loại dữ liệu**; **Broadband**: truyền được nhiều loại dữ liệu cùng lúc.',
  '**Cáp đồng trục**: gồm lõi, lớp nhựa, màng bảo vệ, vỏ bọc ngoài; **không đắt**, dài khoảng **200–500 m**.',
  '**Cáp xoắn đôi**: **8 sợi nhỏ** xoắn thành cặp, truyền độc lập; đắt hơn, dài tối đa **100 m**.',
]);
table(['Chuẩn', 'Thứ tự màu dây (chân 1 → 8)'], [
  ['**T568A**', 'sọc xanh lá – xanh lá – sọc cam – xanh dương – sọc xanh dương – cam – sọc nâu – nâu'],
  ['**T568B**', 'sọc cam – cam – sọc xanh lá – xanh dương – sọc xanh dương – xanh lá – sọc nâu – nâu'],
], [3, 10]);
bl([
  'Chỉ cần quan tâm **4 dây: 1, 2, 3, 6** (truyền/nhận dữ liệu). Mẹo nhớ T568B: “**Cam – Lá – Lơ – Nâu**, sọc trước, trơn sau”.',
  '**Dây thẳng**: hai đầu **cùng chuẩn**; **dây chéo**: một đầu T568A, một đầu T568B.',
  '**Họ thiết bị**: **Họ I** = Computer, Router; **Họ II** = Hub, Switch. **Cùng họ → dây chéo; khác họ → dây thẳng.**',
]);

pb();

// ================= MODULE 8 =================
h1('Module 8. Bảo mật cơ bản');
h2('8.1 Firewall');
table(['Loại', 'Nguyên lý', 'Điểm cần nhớ'], [
  ['**Traditional Packet Filter**', 'Xét **các trường header** (IP, port, protocol)', 'Nhanh nhưng đơn giản; ACL áp dụng **từ trên xuống**'],
  ['**Stateful Filter**', 'Dùng **bảng trạng thái kết nối** (ví dụ TCP) để đối chiếu', 'Chặn gói không thuộc kết nối nào'],
  ['**Application Gateway**', 'Xử lý theo từng ứng dụng (proxy)', 'An toàn hơn nhưng **hiệu suất thấp** (xử lý toàn bộ dữ liệu)'],
], [4, 5, 5]);
bl([
  '**Firewall**: kiểm soát luồng lưu lượng theo **chính sách**; cần “miễn dịch” (tự chống tấn công) và “thông minh”.',
  '**Bastion host**: máy chủ **chịu tấn công** và là điểm giao tiếp chính với bên ngoài (chạy application gateway). **Single-homed** (1 card) vs **Dual-homed** (**2 network interface**).',
  'Mô hình: **Packet-filtering router**, **Screened Host Firewall**, **Screened-Subnet Firewall** (có **DMZ**).',
  '**DMZ (Demilitarized Zone)**: mạng đệm đặt web/mail server công cộng giữa Internet và mạng nội bộ – thuộc mô hình **Screened-Subnet**.',
  '**Windows Firewall**: **Inbound Rules** = cho phép máy ngoài kết nối vào; **Outbound Rules** = cho phép máy này kết nối ra.',
]);
fig('firewall_dmz.png', 600, 'Mô hình Screened-Subnet có DMZ và bastion host');
h2('8.2 IDS');
table(['Loại', 'Cách phát hiện', 'Nhược điểm'], [
  ['**Signature-based**', 'So khớp **CSDL chữ ký** các tấn công đã biết', '**Không phát hiện tấn công mới**'],
  ['**Anomaly-based**', 'Dựa vào **hành vi/luồng gói tin bất thường**', 'Dễ báo động giả; nhưng phát hiện được tấn công mới'],
], [3.5, 6, 5]);
h2('8.3 Mật mã');
bl([
  '**Plaintext** (bản rõ) → mã hóa → **Ciphertext** (bản mã). **C = E_K(P)**; **Cryptanalysis** = phá mã. **Cipher** = bản mã hóa/thuật toán mã hóa.',
  '**Caesar cipher**: dịch chữ cái K vị trí (K=3: x → A).',
  '**Columnar transposition**: hoán vị cột; khóa **không có ký tự lặp**.',
]);
table(['', 'Symmetric (đối xứng)', 'Asymmetric (bất đối xứng)'], [
  ['Khóa', '**Một khóa chung** để mã hóa và giải mã', '**Cặp khóa** public/private'],
  ['Ví dụ', 'DES, AES', '**RSA**'],
  ['Cách dùng', 'Nhanh, mã hóa dữ liệu lớn', 'Public key **mã hóa**, **private key giải mã** (RSA); trao đổi khóa, chữ ký số'],
], [2.5, 5.5, 5.5]);
bl([
  '**Hàm băm (hash)**: SHA, MD5 → **message digest**, đảm bảo **toàn vẹn**; dùng để tạo chữ ký số.',
  '**Digital Signature**: **xác thực** người gửi và **chống chối bỏ (non-repudiation)**. Ký bằng **private key**, kiểm tra bằng **public key**.',
  '**SSL/TLS** bảo mật HTTP/SMTP/IMAP/FTP (HTTPS, SMTPS…).',
]);
h2('8.4 AAA');
table(['Thành phần', 'Ý nghĩa'], [
  ['**Authentication**', '**Xác thực** – bạn là ai'],
  ['**Authorization**', '**Phân quyền** – được làm gì'],
  ['**Accounting**', '**Ghi nhận/log** – đã làm gì'],
], [4, 9]);
bl(['**IIS**: **Anonymous Authentication** cho phép mọi người truy cập; **Basic Authentication** yêu cầu **tài khoản cụ thể**.']);
tip([
  'Đề ôn có vài đáp án tô vàng **tranh cãi**: câu RIP “phát biểu sai”, câu “Switch trong suốt”, bản ghi **MX** (mail server) vs CNAME, trường TCP giúp **ráp theo thứ tự** (Sequence/Ack number). Tài liệu này theo đáp án đúng về kỹ thuật; nên đối chiếu thêm với giảng viên.',
]);
pb();

// ================= MODULE 9 =================
h1('Module 9. Data Center, Cloud Computing, IoE/IoT');
h2('9.1 Dữ liệu – thông tin');
bl([
  '**Dữ liệu (data)**: bộ sưu tập **số liệu thô**, chưa có ý nghĩa; là **đầu vào**.',
  '**Thông tin (information)**: dữ liệu đã xử lý, có **ý nghĩa và giá trị**; là **đầu ra**.',
]);
h2('9.2 Data Center');
note([
  '**Data Center** = công trình tập trung các hoạt động IT và thiết bị (server, storage, network) để **lưu trữ, xử lý, phân phối** dữ liệu và ứng dụng; được xem là “**trái tim số**” của kinh doanh hiện đại.',
]);
table(['Nhóm', 'Thành phần'], [
  ['**Hạ tầng IT**', 'Server, storage, thiết bị mạng, firewall'],
  ['**Cơ sở vật chất hỗ trợ**', '**Nguồn điện** (UPS, máy phát), **làm mát (CRAC)**, chống cháy, kiểm soát ra vào, giám sát. **Trình duyệt web không thuộc** nhóm này'],
], [4, 9]);
bl([
  '**Làm mát** có thể tiêu thụ tới **~50%** tổng năng lượng; giải pháp tiên tiến cho **AI Data Center**: **làm mát bằng chất lỏng**.',
  '**AI** trong quản lý Data Center: **tối ưu phân bổ tài nguyên và dự đoán sự cố**.',
  'An toàn: nâng cấp phần cứng/phần mềm thường xuyên, dự phòng (**redundancy**), sao lưu, kiểm soát vật lý.',
  '**Lưu trữ phân tán**: dữ liệu đặt tại nhiều vị trí.',
]);
h2('9.3 Cloud Computing');
note([
  '**Cloud Computing** = mô hình cung cấp **tài nguyên CNTT qua Internet** theo nhu cầu, trả tiền theo mức dùng (**pay-as-you-go**).',
  'Mốc lịch sử: **John McCarthy** đề xuất điện toán như tiện ích công cộng; **Amazon EC2 ra mắt 2006**.',
]);
table(['Mô hình', 'Cung cấp', 'Ví dụ'], [
  ['**IaaS**', 'Hạ tầng: **máy chủ ảo, lưu trữ, mạng** cho thuê', 'AWS EC2, Azure VM'],
  ['**PaaS**', 'Nền tảng phát triển/chạy ứng dụng', 'App Engine, Heroku'],
  ['**SaaS**', 'Phần mềm hoàn chỉnh qua Internet', 'Google Docs, Microsoft 365'],
], [2.5, 6, 5]);
bl([
  '**Public / Private / Hybrid** cloud; **Multi-cloud** = dùng **nhiều nhà cung cấp** cloud khác nhau.',
  '**Serverless / FaaS**: phát triển ứng dụng không cần quản lý hạ tầng. **AWS SageMaker**: dịch vụ AI/ML chuyên biệt.',
  'Lợi ích: giảm CAPEX/độ phức tạp, co giãn, truy cập từ mọi nơi, tối ưu quy trình (ví dụ **ERP trên Cloud**). “Giảm khả năng truy cập dữ liệu” **không** phải lợi ích.',
]);
fig('cloud_stack.png', 600, 'IaaS – PaaS – SaaS: phần nào do ai quản lý');
h2('9.4 Blockchain');
bl([
  '**Blockchain** = công nghệ lưu trữ **phân tán** và bảo mật; mỗi **block** chứa **dữ liệu, mã băm (hash) và liên kết tới block trước**.',
  'Ưu điểm so với lưu trữ tập trung: **minh bạch, bảo mật cao, khó giả mạo**. Ứng dụng: tài chính, tiền mã hóa, truy xuất nguồn gốc.',
]);
h2('9.5 Edge, Fog, IoT và IoE');
bl([
  '**Edge Computing**: xử lý **gần nguồn dữ liệu** → giảm độ trễ, **tiết kiệm băng thông và chi phí**. **Fog Computing**: xử lý dữ liệu gần nguồn phát sinh (tầng trung gian).',
  '**IoT** (Internet of Things) tập trung **thiết bị**; **IoE** (Internet of Everything, Cisco) mở rộng thêm **People, Process, Data, Things**.',
  '**IPv6** cung cấp **không gian địa chỉ lớn hơn**, cần cho hàng tỉ thiết bị IoE.',
]);
table(['Thành phần IoE', 'Ý nghĩa'], [
  ['**People**', 'Con người kết nối; **Collaboration** thuộc People'],
  ['**Process**', 'Đưa **đúng thông tin đến đúng đối tượng vào đúng thời điểm**'],
  ['**Data**', '**Data at Rest** = dữ liệu lịch sử lưu trữ; **Data in Motion** = dữ liệu thời gian thực'],
  ['**Things**', 'Vật thể vật lý có cảm biến, kết nối mạng'],
], [3.5, 9]);
bl([
  'IoE có **5 ưu tiên cốt lõi**; đặc điểm: **Agile** (phản ứng nhanh trước thay đổi), **Hyper-Aware** (nhận biết trạng thái, ngữ cảnh **thời gian thực**)…; “**Scalable**” không nằm trong ba đặc điểm chính.',
]);
pb();

// ================= MODULE 10 =================
h1('Module 10. Mở rộng – chia subnet và Wi-Fi');
h2('10.1 Quy trình chia subnet');
formula([
  '**Bước 1** – Đếm số mạng con cần n → chọn số bit mượn b sao cho **2^b ≥ n**.',
  '**Bước 2** – Kiểm tra số host: **2^(host bit còn lại) − 2 ≥ số máy mỗi mạng**.',
  '**Bước 3** – Mask mới = mask cũ + b bit 1; **bước nhảy = 256 − giá trị octet mask**.',
  '**Bước 4** – Liệt kê các NetID: cách nhau đúng bước nhảy.',
  '**Ví dụ:** 159.7.0.0/20 → bước nhảy octet 3 là 16 → các mạng: 159.7.0.0, **159.7.16.0** (mạng thứ hai), 159.7.32.0…',
]);
h2('10.2 Cấu hình Wi-Fi');
bl([
  '**SSID** = **tên mạng không dây**. Muốn tạo **nhiều mạng Wi-Fi** trên cùng một router → cấu hình **nhiều SSID**.',
  'Vào trang cấu hình cần **tài khoản đăng nhập** quản trị. Khi đổi mật khẩu Wi-Fi: **ghi nhớ mật khẩu mới** để không mất kết nối.',
  'Quản trị nên **thường xuyên đổi mật khẩu Wi-Fi**, dùng mã hóa **WPA2/WPA3**, cập nhật firmware.',
]);
pb();

// ================= PHỤ LỤC =================
h1('Phụ lục');
h2('A. Cổng (port) và giao thức cần thuộc');
table(['Dịch vụ', 'Cổng', 'Giao thức vận chuyển'], [
  ['HTTP', '80', 'TCP'], ['HTTPS', '443', 'TCP'], ['FTP – control / data (active)', '21 / 20', 'TCP'],
  ['SMTP', '25', 'TCP'], ['POP3 / IMAP', '110 / 143', 'TCP'], ['DNS', '53', 'UDP (chủ yếu)'],
  ['RIP', '520', 'UDP'], ['DHCP server / client', '67 / 68', 'UDP'], ['SSH / Telnet', '22 / 23', 'TCP'],
], [6, 3, 4]);
h2('B. Bảng so sánh các cặp dễ nhầm');
table(['Dễ nhầm', 'Phân biệt'], [
  ['**TCP** vs **UDP**', 'Tin cậy, hướng kết nối vs nhanh, không kết nối, thời gian thực.'],
  ['**Hub** vs **Switch**', 'Tầng 1, mọi cổng chung collision domain vs tầng 2, theo MAC, chia collision domain.'],
  ['**Switch** vs **Router**', 'Chuyển theo MAC (cùng mạng) vs chuyển theo IP (nối các mạng).'],
  ['**CSMA/CD** vs **CSMA/CA**', 'Phát hiện đụng độ (Ethernet) vs tránh đụng độ (Wi-Fi).'],
  ['**Active** vs **Passive FTP**', 'Server mở data connection vs client mở cả hai (qua firewall).'],
  ['**Forward** vs **Reverse proxy**', 'Đại diện client ra Internet vs đại diện server nhận từ Internet.'],
  ['**Iterative** vs **Recursive** (DNS)', 'Trả về server khác để hỏi vs server tự hỏi tiếp rồi trả kết quả.'],
  ['**Signature-based** vs **Anomaly-based** IDS', 'Chữ ký tấn công đã biết vs hành vi bất thường.'],
  ['**Symmetric** vs **Asymmetric**', 'Một khóa vs cặp khóa public/private.'],
  ['**Authentication / Authorization / Accounting**', 'Xác thực / phân quyền / ghi log.'],
  ['**IaaS** vs **PaaS** vs **SaaS**', 'Hạ tầng vs nền tảng phát triển vs phần mềm hoàn chỉnh.'],
  ['**IoT** vs **IoE**', 'Thiết bị vs thiết bị + con người + quy trình + dữ liệu.'],
  ['**Edge** vs **Cloud**', 'Xử lý gần nguồn, giảm độ trễ vs xử lý tập trung, co giãn lớn.'],
  ['**Packet** vs **Circuit switching**', 'Không cần kênh cố định vs thiết lập kênh riêng.'],
], [5, 8]);
h2('C. Khung tư duy trả lời câu tự luận');
note([
  '**Bối cảnh & yêu cầu** → **Kiến trúc đề xuất** (theo tầng/mô hình) → **Công nghệ/thiết bị chọn và vì sao** → **Bảo mật, chi phí, rủi ro** → **Kết luận/lộ trình**.',
  'Luôn nối với kiến thức đã học (OSI/TCP-IP, Client/Server, Cloud IaaS/PaaS/SaaS, Data Center, firewall/DMZ) và đưa **ví dụ cụ thể** (ví dụ trường UEL).',
]);
tip([
  '**Vì sao cần Data Center?** Tập trung, bảo vệ và vận hành dữ liệu/ứng dụng **liên tục 24/7** với nguồn điện, làm mát, an ninh, dự phòng; tác dụng: sẵn sàng cao, bảo mật, dễ quản trị, mở rộng; ví dụ: hệ thống đăng ký học phần, LMS, thư viện số của trường.',
]);
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [new TextRun({ text: '— Hết — Chúc bạn ôn tập tốt!', italics: true, font: FONT, color: '555555' })] }));

// ---------- DOCUMENT ----------
const doc = new Document({
  creator: 'Nen tang study notes',
  title: 'Tài liệu lý thuyết ôn tập Nền tảng công nghệ cho Hệ thống thông tin',
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 32, bold: true, color: '1F3A5F' }, paragraph: { spacing: { before: 240, after: 160 }, keepNext: true, outlineLevel: 0, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: '1F3A5F', space: 4 } } } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 26, bold: true, color: '2B5C8F' }, paragraph: { spacing: { before: 240, after: 100 }, keepNext: true, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 23, bold: true, color: '444444' }, paragraph: { spacing: { before: 160, after: 80 }, keepNext: true, outlineLevel: 2 } },
    ],
  },
  numbering: { config: [{ reference: 'bul', levels: [
    { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } },
    { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1000, hanging: 270 } } } },
  ] }] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Nền tảng – Lý thuyết ôn tập   |   Trang ', size: 18, font: FONT, color: '777777' }), new TextRun({ children: [PageNumber.CURRENT], size: 18, font: FONT, color: '777777' })] })] }) },
    children: C,
  }],
});

const outDir = path.join(__dirname, '..', 'data', 'Nền tảng');
Packer.toBuffer(doc).then((buf) => {
  const out = path.join(outDir, 'NenTang_Ly_thuyet_on_tap.docx');
  fs.writeFileSync(out, buf);
  console.log('written', out, buf.length);
});
