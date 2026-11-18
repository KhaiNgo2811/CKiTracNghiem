// Sinh tài liệu lý thuyết ôn tập ATTT -> docs/ATTT_Ly_thuyet_on_tap.docx
// Chạy: NODE_PATH=<thư mục chứa node_modules/docx> node scripts/build-attt-theory.js
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType,
  LevelFormat, BorderStyle, WidthType, ShadingType, PageBreak, Footer, PageNumber,
} = require('docx');

const FONT = 'Arial';
const W = 9638; // chiều rộng nội dung A4 (margin 2cm)
const C = []; // children

// ---------- helpers ----------
function runs(text, base = {}) {
  // **đậm**  và  __nghiêng__
  const out = [];
  const re = /(\*\*[^*]+\*\*|__[^_]+__)/g;
  text.split(re).forEach((part) => {
    if (!part) return;
    if (part.startsWith('**')) out.push(new TextRun({ text: part.slice(2, -2), bold: true, font: FONT, ...base }));
    else if (part.startsWith('__')) out.push(new TextRun({ text: part.slice(2, -2), italics: true, font: FONT, ...base }));
    else out.push(new TextRun({ text: part, font: FONT, ...base }));
  });
  return out;
}
const h1 = (t) => C.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: t, font: FONT })] }));
const h2 = (t) => C.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: t, font: FONT })] }));
const h3 = (t) => C.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: t, font: FONT })] }));
const p = (t, o = {}) => C.push(new Paragraph({ spacing: { after: 100, line: 300 }, children: runs(t), ...o }));
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
  const scale = W / sum; const ws = widths.map((x) => Math.round(x * scale)); ws[ws.length - 1] += W - ws.reduce((a, c) => a + c, 0);
  const trs = [new TableRow({ tableHeader: true, children: head.map((h, i) => cell(h, ws[i], { fill: '1F3A5F', bold: true, color: 'FFFFFF' })) })];
  rows.forEach((r, ri) => trs.push(new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, ws[i], { fill: ri % 2 ? 'F3F6FB' : undefined })) })));
  C.push(new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: ws, rows: trs }));
  C.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
}
function box(title, lines, fill = 'FFF6DD', edge = 'E0A800') {
  const e = { style: BorderStyle.SINGLE, size: 8, color: edge };
  const kids = [new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: title, bold: true, font: FONT, size: 22 })] })];
  lines.forEach((l) => kids.push(new Paragraph({ spacing: { after: 40, line: 280 }, children: runs(l, { size: 21 }) })));
  C.push(new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [W],
    rows: [new TableRow({ children: [new TableCell({ width: { size: W, type: WidthType.DXA }, borders: { top: e, bottom: e, left: e, right: e }, shading: { fill, type: ShadingType.CLEAR, color: 'auto' }, margins: { top: 100, bottom: 100, left: 160, right: 160 }, children: kids })] })],
  }));
  C.push(new Paragraph({ spacing: { after: 140 }, children: [] }));
}
const tip = (lines) => box('Mẹo / Bẫy khi thi', lines, 'FFF6DD', 'E0A800');
const note = (lines) => box('Cần nhớ', lines, 'E8F3FF', '3B82F6');

// ---------- BÌA ----------
C.push(new Paragraph({ spacing: { before: 2600, after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TÀI LIỆU LÝ THUYẾT ÔN TẬP', bold: true, size: 40, font: FONT, color: '1F3A5F' })] }));
C.push(new Paragraph({ spacing: { after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'AN TOÀN VÀ BẢO MẬT HỆ THỐNG THÔNG TIN', bold: true, size: 34, font: FONT })] }));
C.push(new Paragraph({ spacing: { after: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Information Systems Security – ATTT / ATBM)', italics: true, size: 26, font: FONT })] }));
C.push(new Paragraph({ spacing: { after: 100 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Tổng hợp từ ngân hàng câu hỏi Chương 1, 3, 5, 6, 7, bộ đề ôn tập Bài 1 – 8 và 3 đề thi mẫu', size: 22, font: FONT })] }));
C.push(new Paragraph({ spacing: { after: 100 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Nội dung giải thích bằng tiếng Việt – thuật ngữ giữ nguyên tiếng Anh (in đậm) để học thuộc', size: 22, font: FONT })] }));
pb();

// ---------- HƯỚNG DẪN ----------
h1('Hướng dẫn sử dụng tài liệu');
bl([
  'Thuật ngữ chuyên môn viết bằng **tiếng Anh in đậm**, phần giải thích bằng tiếng Việt. Khi đề thi hỏi, các đáp án cũng thường là thuật ngữ tiếng Anh.',
  'Mỗi phần có khung **“Cần nhớ”** (định nghĩa / công thức cốt lõi) và khung **“Mẹo / Bẫy khi thi”** (những chỗ hay bị đánh lừa trong các câu hỏi đã gặp).',
  'Tài liệu được dựng từ nội dung các câu hỏi và đáp án trong bộ đề của app ôn tập, nên phủ đúng những gì đề hay hỏi. Nội dung nào chưa chắc chắn sẽ được đánh dấu “nên đối chiếu slide”.',
  'Học xong mỗi phần, quay lại app làm đúng chương/bài tương ứng và dùng nút **Kiểm tra đáp án** để tự kiểm tra.',
]);
h2('Bản đồ nội dung');
table(['Phần', 'Nội dung chính', 'Từ khóa quan trọng'], [
  ['1', 'Hệ thống thông tin, rủi ro và hạ tầng CNTT', 'Threat, Vulnerability, Risk, CIA, MTTF/MTTR, 7 domains, Policy framework, Data classification'],
  ['2', 'Tấn công độc hại, mối đe dọa và lỗ hổng', 'Interruption, Interception, Modification, Fabrication, DoS/DDoS, malware, phishing, hacker types'],
  ['3', 'BIA, BCP, DRP, khôi phục, sao lưu, cloud', 'Hot/Warm/Cold site, RTO, Full/Incremental/Differential, BYOD, cloud models'],
  ['4', 'Kiểm soát truy cập', 'Identification, Authentication, Authorization, Accountability, MFA, biometrics, AAA, RBAC/MAC/DAC'],
  ['5', 'Vận hành và quản trị an ninh', 'Separation of duties, Least privilege, Outsourcing, Change control, Certification vs Accreditation'],
  ['6', 'Kiểm toán, kiểm thử, giám sát', 'Audit, SOC 1/2/3, Black/Gray/White-box, IDS, DLP, false positive'],
  ['7', 'Quản lý rủi ro định lượng', 'SLE, ALE, ARO, EF, Reduce/Transfer/Accept/Avoid, Residual risk'],
  ['8', 'Mật mã học và an toàn giao dịch', 'Symmetric vs Asymmetric, Digital signature, Hash, Public/Private key'],
  ['9', 'An toàn web và thương mại điện tử', 'Cookies, ActiveX, Trojan, Sniffer, Digital wallet, Phishing'],
  ['10', 'Bài toán mẫu & bảng so sánh nhanh', 'Uptime, ALE, số bản backup cần restore, bài toán mã hóa laptop'],
], [1, 4, 6]);
pb();

// ================= PHẦN 1 =================
h1('Phần 1. Hệ thống thông tin, rủi ro và hạ tầng CNTT');
h2('1.1 Các khái niệm nền tảng');
table(['Thuật ngữ', 'Định nghĩa', 'Ví dụ'], [
  ['**Asset** (tài sản)', 'Bất cứ thứ gì có giá trị cần bảo vệ: dữ liệu, phần cứng, phần mềm, con người, uy tín.', 'Cơ sở dữ liệu khách hàng, máy chủ web'],
  ['**Threat** (mối đe dọa)', 'Bất kỳ **hành động** nào có thể gây thiệt hại cho một asset. Có thể do thiên nhiên hoặc con người.', 'Cơn bão làm ngập data center; hacker tấn công'],
  ['**Vulnerability** (lỗ hổng/điểm yếu)', 'Điểm yếu cho phép một threat được hiện thực hóa hoặc tác động tới asset.', 'Quên đổi mật khẩu mặc định của router; lỗi code cho phép SQL injection'],
  ['**Risk** (rủi ro)', 'Khả năng một điều xấu xảy ra đối với asset; phát sinh khi threat gặp vulnerability. Ba yếu tố của risk: **asset – threat – vulnerability**.', 'Server có lỗi chưa vá và bị scan từ Internet'],
  ['**Countermeasure / Control** (biện pháp đối phó)', 'Biện pháp giảm thiểu risk: kỹ thuật, quản trị hoặc vật lý.', 'Firewall, antivirus, policy, khóa cửa'],
  ['**Impact** (tác động)', 'Mức thiệt hại khi sự cố xảy ra.', 'Mất doanh thu, mất uy tín'],
], [3, 6, 4]);
note([
  '**Threat** = hành động gây hại (bên ngoài); **Vulnerability** = điểm yếu (bên trong hệ thống). Đề hay hỏi: “bão lớn” = Threat; “mật khẩu mặc định chưa đổi” = Vulnerability; “lỗi mã cho phép SQL injection” = Vulnerability (không phải Threat, không phải Risk).',
  '**Computer security** là việc bảo vệ tài sản máy tính khỏi truy cập, sử dụng, thay đổi hoặc phá hủy **trái phép**.',
  '**Logical security** (an ninh logic) bảo vệ tài sản bằng phương tiện **phi vật lý** (password, ACL, firewall); đối lập là an ninh vật lý (hàng rào, khóa, thẻ từ).',
  '**Eavesdropper** (kẻ nghe lén) là người/thiết bị có khả năng nghe trộm và sao chép các đường truyền Internet.',
]);

h2('1.2 Bộ ba CIA và các mục tiêu mở rộng');
table(['Nguyên tắc', 'Ý nghĩa', 'Ví dụ trong đề'], [
  ['**Confidentiality** (bảo mật)', 'Ngăn tiết lộ thông tin cho người không được phép.', 'Mã hóa file bảng lương trước khi lưu lên file server'],
  ['**Integrity** (toàn vẹn)', 'Bảo đảm dữ liệu không bị **sửa đổi trái phép**.', 'Học sinh đột nhập sửa điểm; hacker sửa số tiền giao dịch'],
  ['**Availability** (sẵn sàng)', 'Hệ thống/dữ liệu truy cập được khi cần.', 'DDoS làm website bán hàng không truy cập được'],
  ['**Authentication** (xác thực)', 'Chứng minh nguồn gốc/danh tính thật của người gửi hoặc người dùng.', 'Muốn chứng minh tin nhắn thực sự đến từ người gửi'],
  ['**Nonrepudiation** (chống chối bỏ)', 'Người gửi không thể phủ nhận đã gửi; người nhận có thể chứng minh với bên thứ ba.', 'Patricia chứng minh với Sue rằng thông điệp đến từ Gary → dùng digital signature'],
  ['**Accountability** (trách nhiệm giải trình)', 'Truy vết hành động đến từng cá nhân.', 'Xem log để biết ai xóa file'],
  ['**Privacy** (quyền riêng tư)', 'Bảo vệ quyền của cá nhân không bị tiết lộ thông tin.', ''],
  ['**Secrecy**', 'Bảo vệ chống tiết lộ dữ liệu trái phép **và** bảo đảm tính xác thực của nguồn dữ liệu (theo cách dùng trong đề thương mại điện tử).', ''],
], [3.2, 5, 4.5]);
tip([
  'Thay đổi điểm/số liệu = vi phạm **Integrity**. DDoS = vi phạm **Availability**. Mã hóa = bảo vệ **Confidentiality**. Chữ ký số = **Authentication + Integrity + Nonrepudiation**.',
  'Đề dùng nhiều cách gọi cho cùng một ý: “Bảo mật/Secrecy/Confidentiality”, “Chống chối bỏ/Nonrepudiation/Không thoái thác”.',
]);

h2('1.3 Đo lường tính sẵn sàng (Availability)');
note([
  '**Availability = Uptime ÷ (Uptime + Downtime)** — tính theo cùng một đơn vị thời gian (giờ hoặc ngày).',
  '**MTTF** (Mean Time To Failure): thời gian trung bình một thành phần chạy đến lần hỏng **đầu tiên**.',
  '**MTTR** (Mean Time To Repair): thời gian trung bình để **sửa chữa** thành phần hỏng.',
  '**MTBF** (Mean Time Between Failures) = **MTTF + MTTR**: thời gian trung bình giữa hai lần hỏng liên tiếp.',
  '**RTO** (Recovery Time Objective): thời gian **tối đa chấp nhận được** để khôi phục hệ thống sau sự cố.',
  '**MTD** (Maximum Tolerable Downtime): khoảng thời gian **dài nhất** doanh nghiệp tồn tại được khi thiếu hệ thống quan trọng (lớn hơn hoặc bằng RTO).',
  '**RPO** (Recovery Point Objective): lượng dữ liệu tối đa chấp nhận mất (tính bằng thời gian), quyết định tần suất backup.',
]);
h3('Ví dụ tính toán');
table(['Đề bài', 'Cách giải', 'Kết quả'], [
  ['Máy chủ chạy 700 giờ, ngừng 20 giờ trong tháng 720 giờ', '700 ÷ 720', '**97,2%**'],
  ['Hệ thống ngừng tổng cộng 7,2 giờ trong tháng 30 ngày (720 giờ)', '(720 − 7,2) ÷ 720', '**99%**'],
  ['Web server của Juan ngừng đúng 1 ngày trong tháng 30 ngày', 'Uptime = 30 − 1', '**29 ngày** (availability = 29/30 = **96,67%**)'],
  ['MTTF = 400 giờ, MTTR = 8 giờ', 'MTBF = 400 + 8', '**408 giờ**'],
], [6, 3.5, 3.5]);
p('**Opportunity cost** (chi phí cơ hội): doanh thu bị mất trong thời gian hệ thống ngừng hoạt động (ví dụ trang bán hàng không ghi nhận đơn nào). Downtime có thể do kế hoạch (bảo trì) hoặc ngoài ý muốn, cả hai đều ảnh hưởng availability.');

h2('1.4 Bảy miền của hạ tầng CNTT (7 domains of IT infrastructure)');
table(['Domain', 'Gồm những gì', 'Rủi ro & biện pháp tiêu biểu'], [
  ['**User Domain**', 'Con người truy cập hệ thống, ứng dụng, dữ liệu. **Mắt xích yếu nhất** của an ninh CNTT.', 'AUP, awareness training, background check (do **HR** chịu trách nhiệm), luân chuyển quyền, kiểm toán hằng năm. Cho phép giữ vĩnh viễn quyền vào mọi hệ thống nhạy cảm là **sai**.'],
  ['**Workstation Domain**', 'Máy trạm, laptop của người dùng. Giám đốc an ninh CNTT thường chịu trách nhiệm đảm bảo tuân thủ policy.', 'Antivirus, patching, password protection, vô hiệu hóa cổng USB, khóa màn hình.'],
  ['**LAN Domain**', 'Mạng cục bộ, switch, server nội bộ.', 'Phân đoạn mạng, kiểm soát truy cập mạng.'],
  ['**LAN-to-WAN Domain**', 'Điểm nối mạng nội bộ ra Internet.', '**Firewall**, **DMZ**, IDS/IPS. Tường lửa và DMZ thuộc miền này.'],
  ['**WAN Domain**', 'Mạng diện rộng do nhà cung cấp dịch vụ vận hành.', 'SLA, giám sát bằng **SNMP**; DDoS được giảm thiểu tốt nhất bởi **ISP ở thượng nguồn**.'],
  ['**Remote Access Domain**', 'Nhân viên kết nối từ xa (VPN, mobile).', 'VPN, mã hóa, xác thực mạnh, **remote wipe**. Nếu dữ liệu private/confidential bị lộ từ xa: **mã hóa toàn bộ** dữ liệu trong database/ổ cứng.'],
  ['**System/Application Domain**', 'Chứa **mọi hệ thống, ứng dụng và dữ liệu trọng yếu (mission-critical)**.', 'Hardening, mã hóa dữ liệu trong database và thiết bị lưu trữ (thêm một lớp bảo mật), kiểm soát truy cập chặt.'],
], [2.6, 4.2, 6]);
p('Nhân viên dùng **VPN** từ nhà kết nối vào mạng công ty thuộc **Remote Access Domain**. Mạng, router và thiết bị cần được **monitor & manage liên tục** để duy trì WAN service luôn sẵn sàng; khía cạnh quan trọng nhất của hợp đồng dịch vụ WAN là cách nhà cung cấp xử lý **troubleshooting, network management và security management**.');

h2('1.5 Khung chính sách an ninh CNTT (IT security policy framework)');
table(['Thành phần', 'Đặc điểm', 'Bắt buộc?'], [
  ['**Policy**', 'Văn bản **ngắn gọn**, nêu đường lối của tổ chức; cần **senior management phê duyệt**; áp dụng cho **toàn tổ chức**. Mô tả mục tiêu và mục đích của ban quản lý.', 'Có'],
  ['**Standard**', 'Định nghĩa **chi tiết** bằng văn bản về phần cứng/phần mềm và cách sử dụng chúng; dùng khi tổ chức đã chọn giải pháp để đạt mục tiêu của policy.', 'Có'],
  ['**Procedure**', 'Chỉ dẫn **từng bước** cách thực hiện policy và standard. Giảm sai sót trong khủng hoảng, bảo đảm không bỏ sót bước quan trọng.', 'Có'],
  ['**Baseline**', 'Mức cấu hình an ninh **tối thiểu** cần có cho một hệ thống.', 'Có (mức tối thiểu)'],
  ['**Guideline**', 'Chỉ đưa ra **gợi ý**, khuyến nghị.', '**Không**'],
], [2.2, 8, 2]);
bl([
  'Framework giống như **blueprint** (bản phác thảo) xác định nơi nên đặt các security controls.',
  '**Functional policy**: nêu định hướng của management về an ninh trong các lĩnh vực chức năng cụ thể như email, remote access, Internet browsing.',
  'Thứ tự xây dựng: bắt đầu bằng **Asset classification policy** (định nghĩa data classification standard). **Asset protection policy** giúp xác định mức ưu tiên cho các hệ thống/dữ liệu trọng yếu (không phải policy định nghĩa tiêu chuẩn phân loại).',
  'Năm thành phần của hạ tầng policy: **Policy, Standards, Procedures, Baselines, Guidelines**.',
  '**AUP** (Acceptable Use Policy): quy định nhân viên được/không được làm gì khi dùng tài nguyên CNTT. **SLA** (Service Level Agreement): mức dịch vụ nhà cung cấp cam kết.',
  'Các yêu cầu tài liệu an ninh phổ biến: **danh sách tài sản nhạy cảm** và **thẩm quyền của những người chịu trách nhiệm về an ninh**.',
]);
tip([
  'Câu “văn bản chi tiết cho phần cứng/phần mềm và cách dùng” = **Standard**. Câu “hướng dẫn từng bước bắt buộc cập nhật phần mềm” = **Procedure**. Câu “chỉ gợi ý” = **Guideline**. Câu “phê duyệt của lãnh đạo cấp cao, toàn tổ chức” = **Policy**.',
]);

h2('1.6 Phân loại dữ liệu (Data classification)');
table(['Loại', 'Mô tả'], [
  ['**Private data**', 'Dữ liệu về **con người** cần được giữ riêng tư (thông tin cá nhân, hồ sơ y tế).'],
  ['**Confidential data**', 'Thông tin/dữ liệu **thuộc sở hữu của tổ chức** (proprietary); cần mức bảo mật cao nhất.'],
  ['**Internal use only**', 'Dữ liệu chia sẻ nội bộ trong tổ chức.'],
  ['**Public domain data**', 'Dữ liệu đã công bố rộng rãi (ví dụ thông cáo báo chí).'],
], [3, 9]);
p('Cách phân loại giữa các công ty **không được chuẩn hóa**, nên “private” và “confidential” có thể khác nhau giữa các tổ chức. **Classification scope** xác định dữ liệu nào cần phân loại; **classification process** xác định cách xử lý dữ liệu đã được phân loại.');

h2('1.7 Tuân thủ và các đạo luật (Compliance)');
table(['Đạo luật / chuẩn', 'Áp dụng'], [
  ['**SOX** (Sarbanes-Oxley Act)', 'Công ty niêm yết: tính trung thực của báo cáo tài chính.'],
  ['**GLBA** (Gramm-Leach-Bliley Act)', '**Mọi loại financial institution** phải bảo vệ thông tin tài chính cá nhân của khách hàng.'],
  ['**HIPAA**', 'Thông tin y tế — áp dụng trực tiếp cho phòng khám.'],
  ['**FISMA**', 'Cơ quan liên bang Mỹ.'],
  ['**CIPA**', 'Trường học/thư viện: lọc nội dung Internet cho trẻ em.'],
  ['**FERPA**', 'Hồ sơ học sinh/sinh viên.'],
  ['**PCI DSS**', 'Dữ liệu thẻ thanh toán.'],
], [4.5, 8]);
bl([
  '**Regulatory compliance**: tuân thủ luật/quy định do cơ quan nhà nước ban hành (bắt buộc).',
  '**Organizational compliance**: tuân thủ chính sách nội bộ do chính công ty đặt ra. Tổ chức phải tuân thủ **cả hai cấp**.',
]);

h2('1.8 Công nghệ mạng thường gặp');
table(['Thuật ngữ', 'Giải thích'], [
  ['**HTTP**', 'Giao thức giữa browser và web site, dữ liệu ở dạng **plaintext** (không mã hóa).'],
  ['**HTTPS**', 'HTTP bảo mật — **mã hóa** dữ liệu giữa secure browser và secure web site.'],
  ['**ACL** (Access Control List)', 'Danh sách dùng để **allow/deny traffic** trong IP router.'],
  ['**Stateful IP firewall**', 'Lọc IP packet, chặn các gói IP/TCP/UDP không mong muốn đi vào hoặc ra khỏi mạng.'],
  ['**VPN router**', 'Thiết lập kết nối an toàn (tunnel) — không phải thiết bị lọc gói IP.'],
  ['**SNMP**', 'Giao thức quản lý mạng đơn giản: monitor, alert và đo hiệu năng thiết bị mạng.'],
  ['**Nationwide optical backbones**', 'Các đường trục quang dùng cho mạng trục quang riêng (không phải SLA).'],
  ['**Encryption vs Cryptography**', '**Cryptography** là thực hành che giấu dữ liệu khỏi người không được phép; **Encryption** là quá trình biến **cleartext → ciphertext**.'],
], [3.5, 9]);
pb();

// ================= PHẦN 2 =================
h1('Phần 2. Tấn công độc hại, mối đe dọa và lỗ hổng');
h2('2.1 Phân loại hacker');
table(['Loại', 'Đặc điểm'], [
  ['**White-hat hacker**', '**Được ủy quyền** tìm lỗ hổng để giúp tổ chức khắc phục (ví dụ chuyên gia pen test có hợp đồng).'],
  ['**Black-hat hacker**', 'Xâm nhập trái phép để gây hại hoặc trục lợi.'],
  ['**Gray-hat hacker**', 'Nằm **giữa** white-hat và black-hat.'],
  ['**Cracker**', 'Kẻ phá mã/bẻ khóa phần mềm hoặc hệ thống với mục đích xấu.'],
], [3, 9]);
tip(['Yuri được khách hàng cho phép kiểm thử theo hợp đồng có trả phí → **white-hat hacker**, không phải cracker.']);

h2('2.2 Bốn loại tấn công cơ bản');
table(['Loại', 'Ý nghĩa', 'Ảnh hưởng chính', 'Ví dụ'], [
  ['**Interruption** (gián đoạn)', 'Làm tài sản không còn sẵn sàng/không dùng được.', 'Availability', 'Cắt đường truyền; DoS'],
  ['**Interception** (chặn bắt)', 'Đọc lén dữ liệu đang truyền, không làm thay đổi nội dung.', 'Confidentiality', 'Wiretapping, nghe lén email'],
  ['**Modification** (sửa đổi)', 'Thay đổi nội dung thông tin/tệp trái phép.', 'Integrity', 'Sửa file cấu hình, sửa số liệu'],
  ['**Fabrication** (bịa đặt)', 'Tạo ra thông tin/đối tượng **giả** để đánh lừa hệ thống hay người dùng.', 'Authenticity', 'Tạo bản ghi giao dịch giả'],
], [2.6, 4.5, 2.4, 3.5]);
bl([
  '**Wiretapping** (cài thiết bị nghe trộm vào đường cáp) thuộc nhóm **Interception**, không phải Interruption.',
  '**Backdoor**: lối vào bí mật do lập trình viên để lại để truy cập không cần xác thực.',
  '**Accidental data modification** (nhân viên vô tình sửa nhầm dữ liệu) **vẫn là** một vi phạm an ninh.',
  'Duyệt web không phù hợp (**unacceptable web-browsing**) có thể dẫn tới vi phạm an ninh như nhiễm malware.',
  'Hoạt động **KHÔNG** phải vi phạm an ninh: sao lưu dữ liệu theo lịch.',
  'Theo slide, các tấn công còn được chia theo đối tượng: **tấn công vào con người** (phishing, social engineering), **tấn công vào availability** (DoS làm cạn tài nguyên), **tấn công vào IT assets** (malware đánh cắp dữ liệu trên máy chủ).',
]);

h2('2.3 Từ chối dịch vụ (DoS, DDoS)');
bl([
  '**DoS** (Denial of Service): nỗ lực **có phối hợp** nhằm từ chối dịch vụ bằng cách bắt một máy tính thực hiện **lượng lớn tác vụ không cần thiết**, làm quá tải tài nguyên để người dùng hợp lệ không dùng được dịch vụ.',
  '**DDoS** (Distributed DoS): attacker chiếm quyền **hàng trăm, hàng nghìn máy** trên Internet (botnet), cài agent và dùng chúng tấn công **đồng thời** → phạm vi **lớn hơn DoS**.',
  '**Smurf attack**: dùng **directed broadcast** để tạo luồng network traffic làm tràn ngập máy nạn nhân (không phải rootkit).',
  'Rủi ro DDoS được giảm thiểu hiệu quả nhất bởi **ISP ở thượng nguồn** (upstream).',
]);

h2('2.4 Malware (phần mềm độc hại)');
table(['Loại', 'Đặc điểm nhận biết'], [
  ['**Virus**', '**Cần host program** (chương trình chủ) để lây nhiễm.'],
  ['**Worm** (sâu)', 'Chương trình **độc lập**, **không cần host program**, tự lây lan qua mạng. Đây là khác biệt chính giữa virus và worm.'],
  ['**Trojan horse**', 'Chương trình **ẩn bên trong** chương trình khác/trang web, che giấu mục đích thật.'],
  ['**Rootkit**', 'Malware được thiết kế **ẩn khỏi các phương pháp detection** thông thường.'],
  ['**Spyware**', 'Thu thập thông tin người dùng qua Internet mà họ **không hay biết**.'],
  ['**Backdoor tool**', 'Công cụ cửa hậu phổ biến nhất hiện nay là **netcat** (không phải anti-malware utility).'],
], [3, 9]);
p('Biện pháp phòng chống: antivirus/anti-malware, patching, **secure login & authentication**, giáo dục người dùng, firewall… (đề nêu “sáu bước phòng chống malware”, trong đó có dùng quy trình đăng nhập và xác thực an toàn). **Firewall** không được thiết kế riêng để chống malware.');
tip(['Khi cần nâng cấp/vá OS, admin chủ động đưa server **offline** để làm việc mà không bị tấn công. Việc không ngăn chặn một cuộc tấn công gần như **mời gọi** thêm tấn công.']);

h2('2.5 Tấn công vào con người và vào giao thức');
table(['Tấn công', 'Mô tả'], [
  ['**Phishing**', 'Email giả/không có thật lừa người nhận **click URL nhúng sẵn** hoặc mở attachment, thường để lấy mật khẩu. Cố lừa **từng người một** bằng email/tin nhắn.'],
  ['**Pharming**', '“Đầu độc” (poison) một **domain name trên name server (DNS)**, chuyển hướng người dùng đến site giả.'],
  ['**Vishing**', 'Loại **social engineering** qua **điện thoại** (voice phishing) để moi thông tin cá nhân — không phải tấn công wireless.'],
  ['**Spoofing**', 'Người/chương trình/máy giả dạng đối tượng khác để có quyền truy cập tài nguyên.'],
  ['**Man-in-the-middle**', 'Tận dụng quá trình **multihop** mà nhiều loại mạng sử dụng để chen vào giữa hai bên.'],
  ['**Birthday attack**', 'Tấn công mật mã làm cho **brute-force** lên **one-way hash values** dễ dàng hơn.'],
  ['**Dictionary attack**', 'Hash tất cả từ trong từ điển rồi so sánh với giá trị hash trong **password file** để tìm trùng khớp.'],
  ['**Hoax**', 'Hành vi nhằm **lừa dối/đánh lừa** người nhận (thường lan truyền qua email). **Spam** là thư rác, không phải hoax.'],
  ['**Social engineering**', 'Lừa dối hoặc lợi dụng **con người** để vượt qua security controls.'],
], [3, 9]);
h3('Dò quét và kiểm thử xâm nhập');
bl([
  '**Wardialing / wardialer**: quay số hàng loạt để tìm modem. Ngày càng **lỗi thời**, ít dùng; **không** dùng exploit software.',
  '**Exploit software** được dùng trong **intrusive vulnerability assessment** và **penetration testing**.',
  '**Wardriving/wardriver**: dò tìm mạng wireless khi di chuyển. **Evil twin**: điểm truy cập không dây giả mạo trông như hợp lệ. **Bluesnarfing**: lấy dữ liệu qua Bluetooth.',
  '**Alteration threat** (thay đổi thông tin) vi phạm **Integrity**.',
]);
pb();

// ================= PHẦN 3 =================
h1('Phần 3. BIA, BCP, DRP, khôi phục, sao lưu và điện toán đám mây');
h2('3.1 Ba kế hoạch nền tảng');
table(['Kế hoạch', 'Mục đích'], [
  ['**BIA** (Business Impact Analysis)', 'Xác định các **chức năng kinh doanh trọng yếu** và tác động khi chúng bị gián đoạn. Là **bước đầu tiên** để xây dựng BCP/DRP.'],
  ['**BCP** (Business Continuity Plan)', 'Duy trì hoạt động của các chức năng kinh doanh trọng yếu **trong và sau** sự cố.'],
  ['**DRP** (Disaster Recovery Plan)', 'Tập trung **khôi phục hạ tầng CNTT** sau thảm họa.'],
  ['**COOP** (Continuity of Operations Plan)', 'Kế hoạch duy trì hoạt động; cùng BCP, DRP là các kế hoạch contingency cần được audit.'],
], [4, 9]);
p('Cả BIA, BCP và DRP cùng nhằm giúp một sự kiện **không làm gián đoạn hoạt động kinh doanh bình thường**. Khi đánh giá tác động của downtime, bộ đề nêu bốn khía cạnh: con người, hệ thống, dữ liệu, tài sản (nên đối chiếu slide).');

h2('3.2 Các phương án trung tâm khôi phục (Recovery sites)');
table(['Loại', 'Trang bị', 'Thời gian sẵn sàng', 'Chi phí'], [
  ['**Hot site**', 'Giống data center gốc: tiện ích môi trường, phần cứng, phần mềm, **dữ liệu** và **nhân sự trực**.', '**Vài phút đến vài giờ** (tức thời đến vài phút)', '**Cao nhất**'],
  ['**Warm site**', 'Tiện ích môi trường + phần cứng + kết nối, **chưa có dữ liệu và nhân sự**.', '**Vài giờ đến vài ngày**', 'Trung bình'],
  ['**Cold site**', 'Chỉ có **tiện ích môi trường cơ bản**, không có hạ tầng CNTT/máy tính.', '**Vài ngày đến vài tuần**', 'Thấp nhất'],
  ['**Mobile site**', 'Một **trailer** (xe kéo) có tiện ích cần thiết, hoạt động như warm hoặc cold site.', 'Tùy cấu hình', ''],
  ['**Multiple sites**', 'Hoạt động phân tán nhiều địa điểm.', '', ''],
], [2.3, 5.5, 3.3, 1.9]);
tip([
  'Ngân hàng cần khôi phục trong vài phút–vài giờ → **Hot site**. Cửa hàng nhỏ, ngân sách hạn chế, chấp nhận mất vài tuần → **Cold site**.',
  'Hot site thời gian sẵn sàng **ngắn hơn** cold site (không phải dài hơn).',
]);

h2('3.3 Các loại sao lưu (Backup)');
table(['Loại', 'Sao chép gì', 'Khi restore cần'], [
  ['**Full backup**', 'Toàn bộ dữ liệu đã chọn.', 'Chỉ bản full'],
  ['**Incremental backup**', 'Dữ liệu thay đổi từ lần backup **gần nhất (bất kể loại nào)**.', 'Bản full + **tất cả** bản incremental từ sau full đến thời điểm hỏng'],
  ['**Differential backup**', 'Dữ liệu thay đổi từ lần **full backup gần nhất**.', 'Bản full + **bản differential gần nhất** (chỉ 2 bản)'],
], [3, 5, 5]);
h3('Ví dụ đếm số bản cần khôi phục');
table(['Tình huống', 'Cần restore', 'Số bản'], [
  ['Full Chủ nhật 1h sáng; Differential Thứ Hai→Thứ Sáu; máy hỏng 9h sáng **Thứ Tư**', 'Full + Differential sáng Thứ Tư', '**2**'],
  ['Full Chủ nhật; Differential hằng ngày; hỏng sáng Thứ Tư (bản differential Thứ Ba)', 'Full + Differential Thứ Ba', '**2**'],
  ['Full Chủ nhật; Incremental Thứ Hai→Thứ Sáu; hỏng sáng **Thứ Năm**', 'Full + Inc Thứ Hai, Ba, Tư', '**4**'],
  ['Full Chủ nhật; Incremental hằng ngày; hỏng sáng **Thứ Sáu**', 'Full + Inc Thứ Hai, Ba, Tư, Năm', '**5**'],
], [7, 4.5, 1.5]);
note(['Differential: khôi phục **nhanh** (chỉ cần full + differential gần nhất), nhưng dung lượng mỗi ngày tăng dần. Incremental: dung lượng mỗi ngày nhỏ nhưng restore cần chuỗi dài.']);

h2('3.4 Mobility và BYOD');
bl([
  '**Mobility**: khả năng nhân viên làm việc từ xa và kết nối vào hạ tầng CNTT gần như theo thời gian thực.',
  '**BYOD** (Bring Your Own Device): nhân viên dùng **thiết bị cá nhân** cho công việc. Rủi ro nổi bật: dữ liệu công ty **lẫn** với dữ liệu cá nhân, khó kiểm soát.',
  'Biện pháp: mã hóa, **remote wipe**, MDM, kiểm soát truy cập.',
]);

h2('3.5 Điện toán đám mây (Cloud computing)');
table(['Mô hình', 'Đặc điểm', 'Ví dụ'], [
  ['**Private cloud**', 'Dành cho **một tổ chức duy nhất**, do tổ chức hoặc bên thứ ba quản lý.', 'Hạ tầng cloud nội bộ doanh nghiệp'],
  ['**Community cloud**', 'Chia sẻ giữa **vài tổ chức** có mối quan tâm chung, do một trong số đó hoặc bên thứ ba quản lý.', '3 trường đại học dùng chung hạ tầng'],
  ['**Public cloud**', 'Mở cho **công chúng**, do nhà cung cấp bên thứ ba quản lý.', 'Dịch vụ cloud công cộng'],
  ['**Hybrid cloud**', 'Kết hợp thành phần của **nhiều hơn một** loại cloud.', 'Private cho dữ liệu nhạy cảm + public cho website'],
], [3, 6, 4]);
table(['Ưu điểm', 'Nhược điểm'], [
  ['Không cần duy trì data center riêng và disaster recovery site', 'Cần **kết nối mạng liên tục**'],
  ['Cung cấp tài nguyên **theo yêu cầu** (on-demand)', 'Phải **tin tưởng** nhà cung cấp bên ngoài'],
  ['Cải thiện khả năng phục hồi sau thảm họa', '**Giao trách nhiệm** về hiệu năng và kết nối cho bên ngoài; phụ thuộc nhà cung cấp'],
], [6, 6]);
tip(['“KHÔNG phải lợi ích của cloud”: **giảm phụ thuộc vào nhà cung cấp bên ngoài** (thực tế là tăng phụ thuộc). Dữ liệu riêng tư **không** mặc định an toàn hơn.']);
pb();

// ================= PHẦN 4 =================
h1('Phần 4. Kiểm soát truy cập (Access control)');
h2('4.1 Hai loại kiểm soát truy cập');
table(['Loại', 'Mô tả', 'Ví dụ'], [
  ['**Physical access control**', 'Kiểm soát ra vào tòa nhà, bãi đỗ xe, khu vực được bảo vệ.', 'Hàng rào, ổ khóa, thẻ từ/badge, camera'],
  ['**Logical access control**', 'Hạn chế truy cập vào **hệ thống máy tính và mạng**.', 'Password, ACL, firewall'],
], [3.2, 5.5, 4.5]);

h2('4.2 Bốn giai đoạn của kiểm soát truy cập (đúng thứ tự)');
table(['Giai đoạn', 'Câu hỏi trả lời', 'Ví dụ'], [
  ['1. **Identification** (nhận dạng)', '“**Ai** đang yêu cầu truy cập?”', 'Nhập username; smart card; biometrics'],
  ['2. **Authentication** (xác thực)', '“Danh tính đó có **xác minh** được không?”', 'Nhập password, OTP, quét vân tay'],
  ['3. **Authorization** (ủy quyền)', '“Được truy cập **vào đâu** và được **làm gì**?”', 'Gán quyền cho nhân viên mới'],
  ['4. **Accountability** (giải trình)', 'Truy vết hành động về từng **cá nhân**.', 'Xem log để biết ai xóa file'],
], [3.5, 4.5, 5]);
tip(['Thứ tự: **Identification → Authentication → Authorization → Accountability**. Janet gán tập quyền cho nhân viên mới = **Authorization**. “Người yêu cầu có thể truy cập những gì?” = **Authorization**.']);

h2('4.3 Bốn thành phần trung tâm của chính sách access control');
table(['Thành phần', 'Ý nghĩa'], [
  ['**Users**', 'Người hoặc tiến trình sử dụng hệ thống (**subject**).'],
  ['**Resources**', 'Các đối tượng được bảo vệ trong hệ thống (**object**).'],
  ['**Actions**', 'Hoạt động mà user được ủy quyền có thể thực hiện trên resource.'],
  ['**Relationships**', 'Các điều kiện tùy chọn tồn tại giữa user và resource.'],
], [3, 9]);
p('Lưu ý: thành phần thứ tư là **Relationships**, không phải “features”.');

h2('4.4 Các loại yếu tố xác thực (Authentication factors)');
table(['Loại', 'Nghĩa', 'Ví dụ'], [
  ['**Something you know**', 'Tri thức', 'Password, PIN, câu hỏi bảo mật'],
  ['**Something you have**', 'Quyền sở hữu', 'Smart card, token, điện thoại nhận OTP'],
  ['**Something you are**', 'Đặc điểm sinh học', 'Fingerprint, palm print, retina scan, voice'],
  ['**Something you do**', 'Hành động/cách làm', 'Cách gõ phím, chữ ký tay'],
  ['**Somewhere you are**', 'Vị trí', 'Chỉ cho đăng nhập khi đang ở mạng văn phòng'],
], [3.5, 3, 6]);
bl([
  '**Multifactor authentication**: kết hợp **từ hai loại trở lên** (khác loại). **Two-factor** ví dụ: smart card + PIN (have + know); password + OTP gửi về điện thoại.',
  'Hai yếu tố **cùng loại** không phải 2FA: PIN + password (đều know); token + smart card (đều have); password + câu hỏi bảo mật (đều know).',
  'Lợi ích của xác thực 2 bước: **ngăn chặn truy cập trái phép**; không cho phép dùng password đơn giản hay chia sẻ tài khoản.',
  'Phương pháp **KHÔNG** tốt để authentication: **Identification number** (chỉ để nhận dạng).',
]);

h2('4.5 Mật khẩu và các kiểu tấn công');
bl([
  '**Passphrase** (cụm mật khẩu) dài hơn, khó đoán hơn → **an toàn hơn** password.',
  'Không dùng employee ID, SSN, ngày sinh, số điện thoại hay thông tin cá nhân dễ đoán.',
  'Thực hành tốt: không chứa username; trộn chữ hoa, chữ thường, số; có ký tự đặc biệt; **độ dài đủ lớn** (chỉ “ít nhất sáu ký tự” là **chưa đủ** theo đề).',
  '**Threshold**: số lần login thất bại kích hoạt một hành động đối với account (khóa tài khoản). **Audit logon event** là việc ghi nhật ký sự kiện đăng nhập (khác khái niệm).',
  '**Dictionary attack**: hash từ điển và so sánh với password file. **Brute force**: thử mọi tổ hợp.',
  '**SSO** (Single Sign-On): chỉ nhớ một password nên người dùng sẵn sàng dùng password **mạnh hơn**; nhược điểm: lộ một password là lộ mọi hệ thống.',
]);

h2('4.6 Smart card, token và biometrics');
bl([
  '**Smart card**: token hình dạng như credit card, chứa một hoặc nhiều **microprocessor chip** để nhận, lưu trữ và gửi thông tin qua reader. Thuộc loại **something you have**.',
  '**Biometrics**: fingerprint, palm print, retina scan, iris, voice, face.',
  '**Voice pattern** **không** chính xác để authentication vì giọng nói có thể bị phần mềm **sao chép quá dễ**.',
]);
table(['Ưu điểm biometrics', 'Nhược điểm'], [
  ['Người dùng không cần nhớ gì; rất khó làm giả; yêu cầu **sự hiện diện vật lý**', 'Đặc điểm vật lý **có thể thay đổi** (chấn thương, tuổi tác); lo ngại quyền riêng tư'],
], [6, 6]);
p('Các tiêu chí đánh giá hệ thống biometrics: **accuracy** (độ chính xác), **acceptability** (khả năng chấp nhận — người dùng ngại quét võng mạc vì quyền riêng tư), **reaction time** (thời gian phản ứng).');

h2('4.7 Máy chủ AAA và dự án liên quan');
table(['Tên', 'Đặc điểm'], [
  ['**RADIUS**', 'Authentication server dùng **client và user configuration files** (tách riêng).'],
  ['**TACACS+**', 'Chuẩn IETF, dùng **một tệp cấu hình duy nhất**.'],
  ['**DIAMETER**', 'Một loại AAA server (kế nhiệm RADIUS).'],
  ['**SESAME**', 'Dự án **R&D do Ủy ban châu Âu tài trợ** (không phải loại AAA server).'],
], [3, 9]);

h2('4.8 Các mô hình và nguyên tắc kiểm soát truy cập');
table(['Mô hình', 'Cách hoạt động'], [
  ['**DAC** (Discretionary)', 'Chủ sở hữu tài nguyên tự quyết định cấp quyền.'],
  ['**MAC** (Mandatory)', 'Hệ thống quyết định dựa trên nhãn bảo mật (classification).'],
  ['**RBAC** (Role-based)', 'Quyền cấp theo **vai trò**. **Temporal isolation** (hạn chế truy cập vào thời điểm cụ thể) thường dùng kết hợp với **role-based**.'],
  ['**Rule-based**', 'Quyết định theo các quy tắc đặt sẵn (ví dụ ACL trên router).'],
  ['**Content-dependent**', 'Cơ chế phải **xem xét dữ liệu** để quyết định ai được xem nó.'],
  ['**Chinese wall**', 'Định nghĩa một **barrier** và tập quy tắc bảo đảm không subject nào truy cập được object ở phía bên kia (chống xung đột lợi ích).'],
  ['**User-based permission levels**', 'Quyền cấp **riêng cho từng người dùng cụ thể**.'],
], [3.5, 9]);
bl([
  '**Trusted operating system (TOS)**: OS cung cấp tính năng đáp ứng yêu cầu an ninh cụ thể của **chính phủ**.',
  '**Log files**: bản ghi chi tiết ai đã logon, khi nào và dùng thông tin/tài nguyên nào.',
  '**Degausser** (thiết bị khử từ): tạo từ trường để **xóa dữ liệu** trên magnetic storage media.',
  'Ví dụ threat đối với access control: mô hình **P2P** nơi người dùng vô tình **share thư mục My Documents**.',
]);

h2('4.9 Quyền trên Windows');
table(['Loại quyền', 'Các mức'], [
  ['**Share permissions**', '**Full Control, Change, Read** (và Deny)'],
  ['**Security (NTFS) permissions**', '**Full control, Modify, Read & execute, List folder contents, Read, Write, Special**'],
], [4, 8]);
tip(['“Change” là mức của **share permissions**, **không** có trong security permissions → câu hỏi “KHÔNG bao gồm” chọn **Change**.']);
pb();

// ================= PHẦN 5 =================
h1('Phần 5. Vận hành và quản trị an ninh');
h2('5.1 Các nguyên tắc nhân sự và đặc quyền');
table(['Nguyên tắc', 'Nội dung', 'Giảm rủi ro gì'], [
  ['**Least privilege**', 'Chỉ cấp mức quyền **đủ để hoàn thành nhiệm vụ**.', 'Lạm dụng quyền, lây lan sự cố'],
  ['**Need to know**', 'Chỉ truy cập thông tin **cần thiết cho công việc** của mình.', 'Lộ thông tin'],
  ['**Separation of duties**', 'Không một người nào hoàn tất một quy trình nhạy cảm từ đầu đến cuối (ví dụ nhóm A tạo người thụ hưởng, nhóm B phát hành séc).', 'Gian lận'],
  ['**Job rotation**', 'Luân chuyển nhân viên giữa các hệ thống/nhiệm vụ.', 'Gian lận bị che giấu lâu dài'],
  ['**Mandatory vacation**', 'Bắt buộc nghỉ phép để người khác thay vị trí, phát hiện bất thường.', 'Gian lận/hành vi sai trái'],
], [3, 6.5, 3.5]);
tip(['Phân biệt: “luân chuyển giữa các hệ thống/nhiệm vụ” = **Job rotation** (không phải mandatory vacation). “Chia nhỏ quy trình cho nhiều người” = **Separation of duties**.']);

h2('5.2 Vai trò và trách nhiệm');
table(['Vai trò', 'Trách nhiệm'], [
  ['**System owner**', 'Người/nhóm **quản lý một IT infrastructure** (hạ tầng).'],
  ['**Data owner**', 'Người sở hữu dữ liệu, quyết định phân loại và quyền truy cập dữ liệu.'],
  ['**Compliance liaison**', 'Bảo đảm mọi nhân sự **biết và tuân thủ policies** của tổ chức.'],
  ['**Remediation liaison**', 'Phối hợp **khắc phục** các vấn đề phát hiện được.'],
  ['**Authorizing official**', 'Quan chức ra quyết định chấp nhận risk khi triển khai hệ thống.'],
], [3.5, 9]);

h2('5.3 Thuê ngoài (Outsourcing) và các thỏa thuận');
table(['Ưu điểm', 'Nhược điểm'], [
  ['**Trình độ chuyên môn cao**', 'Bên thuê ngoài **không có kiến thức nội bộ** về tổ chức'],
  ['Giảm chi phí đào tạo nhân sự', 'Phải **trả phí liên tục**'],
  ['', 'Không phát triển được năng lực nội bộ'],
], [6, 6]);
bl([
  'Các mối quan ngại chính khi thuê ngoài: **privacy** (quyền riêng tư), **ownership** (ai sở hữu dữ liệu và kết quả công việc), **risk**, **tuân thủ policy**. “Màu logo nhà cung cấp” **không** phải mối quan ngại.',
  '**SLA**: mức dịch vụ nhà cung cấp cam kết. **MOU** (Memorandum of Understanding): biên bản ghi nhớ. **BPA** (Blanket Purchase Agreement): thỏa thuận mua hàng tổng thể. **ISA** (Interconnection Security Agreement): thỏa thuận ghi nhận **yêu cầu kỹ thuật của các tài sản kết nối liên thông**, thường là phần mở rộng của MOU.',
]);

h2('5.4 Quản lý thay đổi và cấu hình (Change & Configuration management)');
bl([
  '**Configuration control**: quản lý các **thiết lập baseline** của thiết bị hệ thống. **Change control**: quản lý các **thay đổi** đối với cấu hình.',
  'Mọi thay đổi cấu hình chỉ nên diễn ra trong một **controlled process**; thay đổi **luôn tạo ra risk** (có thể bypass tính năng bảo mật và gây downtime).',
  '**Proactive change management**: ban quản lý khởi xướng thay đổi để đạt mục tiêu mong muốn (ngược lại là reactive – thay đổi do sự cố).',
  'Hardware configuration table nên gồm **bản sao tất cả cấu hình software**.',
]);
table(['Yếu tố của change control thành công', 'Ý nghĩa'], [
  ['**Peer review**', 'Đồng nghiệp/chuyên gia khác **kiểm tra lại** thay đổi trước khi đưa vào hoạt động.'],
  ['**Documentation**', 'Luôn cập nhật tài liệu khớp với thiết kế thực tế.'],
  ['**Back-out plan**', 'Kế hoạch **hoàn tác**, đưa hệ thống về **known good state** nếu thay đổi thất bại.'],
], [4, 8]);
tip(['Triển khai update mà không có cách quay về phiên bản cũ → thiếu **back-out plan**.']);

h2('5.5 Quản lý dữ liệu, Certification & Accreditation');
bl([
  'Data management policies nên bao quát các chuyển giao trong **suốt vòng đời của dữ liệu** (data life cycle).',
  '**Certification**: quá trình xem xét hệ thống trong suốt vòng đời để bảo đảm nó đáp ứng các yêu cầu an ninh đã chỉ định.',
  '**Accreditation**: thỏa thuận **chính thức** của quan chức ủy quyền (authorizing official) **chấp nhận risk** khi triển khai hệ thống.',
]);
pb();

// ================= PHẦN 6 =================
h1('Phần 6. Kiểm toán, kiểm thử và giám sát các biện pháp kiểm soát');
h2('6.1 Chu trình rà soát bảo mật (Security review)');
p('Bốn giai đoạn: **Secure** (bảo vệ) → **Monitor** (giám sát) → **Audit** (kiểm toán) → **Improve** (cải thiện).');
table(['Giai đoạn', 'Nội dung'], [
  ['**Secure**', 'Triển khai các biện pháp kiểm soát bảo vệ hệ thống.'],
  ['**Monitor**', 'Xem xét và **đo lường mọi controls** để ghi nhận các hành động và thay đổi trên hệ thống — liên tục, thời gian thực.'],
  ['**Audit**', 'Đánh giá **độc lập** về mức độ hiệu quả của policy và controls (xem log, toàn bộ môi trường).'],
  ['**Improve**', 'Cải thiện dựa trên kết quả audit.'],
], [3, 9]);
tip(['Ricky xem nhật ký bảo mật để đánh giá độc lập các controls = **Audit**. Khác Monitor ở chỗ Audit là **đánh giá độc lập mức hiệu quả**, còn Monitor là theo dõi liên tục.']);

h2('6.2 Lập kế hoạch kiểm toán (Audit plan)');
bl([
  'Nhiều **jurisdictions** yêu cầu audit theo quy định của pháp luật; audit cũng có thể do tổ chức tự thực hiện.',
  'Ba bước đầu: **xác định mục tiêu**, **các lĩnh vực cần bảo đảm** (scope), **nhân sự tham gia**.',
  'Xác định **scope**: khảo sát địa điểm, xem xét tài liệu, xem xét log máy chủ/ứng dụng, **xem xét kết quả penetration testing**. “Phát hành báo cáo cuối cùng” **không** thuộc việc xác định phạm vi.',
  'Trong giai đoạn lập kế hoạch/thực hiện, auditor nhiều khả năng xem xét **kết quả risk analysis**.',
  'Sau khi audit activities hoàn tất, auditor thực hiện **data analysis**.',
]);
h3('Phương pháp thu thập dữ liệu');
bl([
  '**Interviews** (phỏng vấn), **questionnaires** (bảng câu hỏi), **observation** (quan sát), **checklists**.',
  '**Observation** giúp phân biệt **quy trình trên giấy** với **cách công việc thực sự được thực hiện**.',
  '**Auditing benchmark**: tiêu chuẩn dùng để so sánh hệ thống nhằm xác định cấu hình có an toàn hay không. Auditor so sánh **current settings** với benchmark để thấy các điểm khác biệt.',
  'Báo cáo cho biết ổ đĩa đầy **80%** **không nhất thiết** là dấu hiệu hệ thống có vấn đề — cần biết trạng thái bình thường.',
]);

h2('6.3 Mục tiêu audit theo từng lĩnh vực');
table(['Lĩnh vực', 'Mục tiêu audit'], [
  ['**Antivirus**', 'Luôn được **cập nhật** và áp dụng trên **toàn bộ** hệ thống.'],
  ['**IDS & event monitoring**', '**Xem xét nhật ký** (logs).'],
  ['**System hardening**', 'Kiểm tra **ports và services** đang chạy (dùng port/service scanning).'],
  ['**Cryptography**', '**Quản lý khóa** và việc sử dụng.'],
  ['**Contingency planning**', 'Các kế hoạch **BCP, DRP và COOP**.'],
  ['**Access control**', '**Need to know** và **least privilege**.'],
  ['**Physical security**', 'Cửa được khóa và nguồn điện được giám sát.'],
  ['**Change control**', 'Có **tài liệu** và **không có thay đổi trái phép**.'],
  ['**Media protection**', 'Tuổi thọ, dán nhãn, lưu trữ và vận chuyển phương tiện.'],
  ['**Hardware/software maintenance**', 'Thỏa thuận bảo trì, bảo dưỡng và dự báo nhu cầu tương lai.'],
  ['**Identity management**', 'Tài khoản người nghỉ việc bị **vô hiệu hóa kịp thời**, quyền được rà soát định kỳ, đăng nhập được ghi log. Hợp đồng quảng cáo là **ngoài phạm vi**.'],
], [4, 8]);

h2('6.4 Báo cáo SOC và COSO');
table(['Chuẩn', 'Nội dung'], [
  ['**SOC 1**', 'Tập trung vào **internal controls đối với financial reporting**; thường cho tổ chức phải tuân thủ **SOX** hoặc **GLBA**. (**Không** tập trung vào security.)'],
  ['**SOC 2**', 'Tập trung vào security, availability, confidentiality, privacy…; cho stakeholder nội bộ và bên được ủy quyền; thường cho **service providers, colocated data centers, managed cloud providers**.'],
  ['**COSO**', 'Tổ chức do **tình nguyện viên điều hành**, đưa **guidance** cho executive management về internal control, enterprise risk management và fraud deterrence. (Bộ best practices cho quản lý CNTT là **COBIT**, không phải COSO.)'],
], [2.5, 10]);

h2('6.5 Mức quyền (Permission levels) của security controls');
p('Bốn mức phổ biến nhất, từ lỏng đến chặt: **Promiscuous → Permissive → Prudent → Paranoid**. “Poor” **không** nằm trong bốn mức này. Cách tiếp cận **cho phép một danh sách hợp lý các hoạt động nhưng cấm các hoạt động khác** tương ứng với mức **Prudent**.');

h2('6.6 Kiểm thử bảo mật (Security testing)');
table(['Loại', 'Kiến thức của tester'], [
  ['**Black-box testing**', 'Chỉ biết **địa chỉ mục tiêu**, không có thông tin nội bộ; **không dựa** vào kiến thức thiết kế/kiến trúc.'],
  ['**Gray-box testing**', 'Nằm **giữa** hộp đen và hộp trắng.'],
  ['**White-box testing**', 'Có **source code, tài liệu thiết kế** của ứng dụng.'],
], [3.5, 9]);
bl([
  'Security testing gồm **vulnerability testing** và **penetration testing**.',
  '**Reconnaissance** (trinh sát): xem xét hệ thống để tìm hiểu **càng nhiều càng tốt** về tổ chức, hệ thống và mạng.',
  'Công cụ kiểm thử **cũng có thể sai** → cần **kiểm chứng** kết quả. Kiểm thử nên **càng giống thực tế càng tốt**, và vẫn phải **bảo vệ chính hệ thống đang test**.',
]);

h2('6.7 Giám sát: log, IDS, DLP');
bl([
  'Bốn loại log chính cần lưu giữ: **event, access, security, audit**.',
  '**False positive**: cảnh báo có vẻ độc hại nhưng **không phải** security event thật. **False negative**: hoạt động thật sự độc hại nhưng **không bị phát hiện**.',
  '**Anomaly-based IDS**: so sánh hoạt động hiện tại với **profile đã lưu của hoạt động bình thường**. (Signature-based so với cơ sở dữ liệu dấu hiệu tấn công.)',
  '**Stateful matching** (IDS): tìm chuỗi cụ thể xuất hiện trên **nhiều packet** trong một traffic stream thay vì chỉ trong từng packet.',
  '**DLP** (Data Loss Prevention): dùng business rules phân loại thông tin nhạy cảm để ngăn **end user chia sẻ trái phép**.',
]);
pb();

// ================= PHẦN 7 =================
h1('Phần 7. Quản lý rủi ro (Risk management)');
h2('7.1 Nguyên tắc và loại đánh giá');
bl([
  'Nguyên tắc then chốt: **không chi cho bảo vệ một asset nhiều hơn giá trị của asset đó**. Mục tiêu là **cân bằng chi phí và mức risk chấp nhận được**, không phải loại bỏ hoàn toàn mọi risk.',
  '**Countermeasure không gắn với risk tương ứng** là “một giải pháp đi tìm vấn đề” — khó biện minh chi phí.',
  '**Quantitative** (định lượng): dùng số tiền (SLE, ALE…). **Qualitative** (định tính): dựa nhận định chuyên gia, ví dụ đánh giá tác động lên **danh tiếng** công ty.',
  '**Residual risk** (rủi ro còn lại): risk còn tồn tại **sau khi** đã thực hiện mọi biện pháp đối phó.',
]);

h2('7.2 Các đại lượng và công thức');
table(['Ký hiệu', 'Ý nghĩa', 'Công thức'], [
  ['**AV** (Asset Value)', 'Giá trị tài sản', ''],
  ['**EF** (Exposure Factor)', '% giá trị tài sản bị mất khi sự cố xảy ra', 'EF = thiệt hại ÷ AV'],
  ['**SLE** (Single Loss Expectancy)', 'Tổn thất kỳ vọng **một lần** sự cố', '**SLE = AV × EF**'],
  ['**ARO** (Annualized Rate of Occurrence)', 'Số sự cố xảy ra **trong một năm**', 'Sự cố 10 năm/lần → ARO = 0,1; 6 lần trong 2 năm → ARO = 3'],
  ['**ALE** (Annualized Loss Expectancy)', 'Tổn thất kỳ vọng **hằng năm**', '**ALE = SLE × ARO**'],
], [4, 4.5, 4.5]);
note([
  '**Lợi ích ròng hằng năm** của biện pháp = (ALE trước − ALE sau) − chi phí biện pháp mỗi năm.',
  'Nếu chi phí biện pháp **> ALE** (hoặc > giá trị tài sản) thì **không nên** triển khai.',
]);
h3('Ví dụ có lời giải');
table(['Đề bài', 'Giải', 'Đáp số'], [
  ['Hỏa hoạn: 1%/năm; thiệt hại 2 triệu USD trên cơ sở trị giá 10 triệu USD', 'EF = 2/10 = 20%; SLE = 10M × 20% = 2M; ALE = 2M × 0,01', 'EF = **20%**; SLE = **$2.000.000**; ALE = **$20.000**'],
  ['Tài sản 800.000 USD, EF 25%', 'SLE = 800.000 × 0,25', '**200.000 USD**'],
  ['SLE 200.000 USD, ARO = 3', 'ALE = 200.000 × 3', '**600.000 USD**'],
  ['Tài sản 1,2 triệu USD, EF 50%, ARO 0,25', 'SLE = 600.000; ALE = 600.000 × 0,25', '**150.000 USD**'],
  ['Tài sản 2 triệu USD, EF 25%, ARO 2', 'SLE = 500.000; ALE = 500.000 × 2', '**1.000.000 USD**'],
  ['Tài sản 300.000 USD mất hoàn toàn, sự cố 10 năm/lần', 'SLE = 300.000; ARO = 0,1', 'ALE = **30.000 USD**'],
  ['ALE trước 400.000, sau 100.000, chi phí biện pháp 120.000/năm', '(400.000 − 100.000) − 120.000', 'Lợi ích ròng **180.000 USD**'],
  ['ALE = 150.000 USD, biện pháp tốn 200.000 USD/năm', 'Chi phí > ALE', '**Không nên** triển khai'],
], [5, 5, 3.5]);

h2('7.3 Chiến lược ứng phó rủi ro');
table(['Rủi ro tiêu cực (threats)', 'Ý nghĩa', 'Ví dụ'], [
  ['**Reduce / Mitigate** (giảm thiểu)', 'Giảm xác suất hoặc tác động.', 'Lắp firewall, đào tạo nhân viên; mã hóa toàn bộ ổ đĩa laptop'],
  ['**Transfer** (chuyển giao)', 'Chuyển hậu quả cho bên khác.', 'Mua **bảo hiểm** an ninh mạng'],
  ['**Accept** (chấp nhận)', 'Không làm gì vì chi phí xử lý lớn hơn thiệt hại.', 'Rủi ro nhỏ'],
  ['**Avoid** (tránh)', 'Loại bỏ hoạt động gây ra rủi ro.', 'Không bán hàng ở thị trường rủi ro pháp lý cao'],
], [4, 4.5, 4.5]);
table(['Rủi ro tích cực (opportunities)', 'Ý nghĩa'], [
  ['**Exploit** (khai thác)', 'Chủ động tạo điều kiện để cơ hội **chắc chắn xảy ra**.'],
  ['**Share** (chia sẻ)', 'Chia sẻ cơ hội với bên có năng lực tốt hơn.'],
  ['**Enhance** (tăng cường)', 'Tăng khả năng/tác động tích cực.'],
  ['**Accept** (chấp nhận)', 'Sẵn sàng đón nhận nếu xảy ra.'],
], [4.5, 8.5]);
tip(['**Accept** áp dụng cho **cả** rủi ro tiêu cực và tích cực. **Exploit** chỉ áp dụng cho rủi ro **tích cực**. Hợp đồng bảo hiểm = **Transfer**.']);
pb();

// ================= PHẦN 8 =================
h1('Phần 8. Mật mã học (Cryptography)');
h2('8.1 Khái niệm và mục tiêu');
bl([
  '**Plaintext** (văn bản gốc) → **Encryption** → **Ciphertext** (văn bản mã hóa) → **Decryption** → plaintext. Nhận được ciphertext, muốn đọc cần **decryption**.',
  'Bốn mục tiêu của mật mã: **Confidentiality, Integrity, Authentication, Nonrepudiation**.',
  'Muốn đảm bảo không ai can thiệp thay đổi tin nhắn khi đang truyền → **Integrity**. Muốn chứng minh tin nhắn thực sự đến từ người gửi → **Authentication**. Muốn người gửi không thể chối → **Nonrepudiation**.',
  '**Hash function**: dùng để bảo đảm **tính toàn vẹn** (phát hiện thay đổi), không dùng để giữ bí mật.',
  '**Cipher dịch chuyển ký tự** (shift/Caesar cipher) là kiểu mã hóa **đối xứng**.',
]);

h2('8.2 Mã hóa đối xứng và bất đối xứng');
table(['Tiêu chí', '**Symmetric** (đối xứng)', '**Asymmetric** (bất đối xứng)'], [
  ['Khóa', '**Một khóa chung** dùng cho cả mã hóa và giải mã', '**Cặp khóa**: public key + private key'],
  ['Tốc độ', '**Nhanh**', '**Chậm**'],
  ['Độ bảo mật / quản lý khóa', 'Khó phân phối khóa an toàn', '**Độ bảo mật cao**, phân phối khóa dễ hơn'],
  ['Số khóa cho n người', 'n(n−1)/2 khóa (mỗi cặp một khóa)', '2n khóa (n cặp) — mỗi người một cặp'],
  ['Dùng cho', 'Mã hóa khối lượng dữ liệu lớn', 'Trao đổi khóa, chữ ký số'],
], [3, 5, 5]);
note([
  'Với 10 người: đối xứng cần 10×9/2 = **45** khóa theo công thức chuẩn; bất đối xứng cần 10 cặp khóa (**20** khóa). Các đáp án trong đề 40 câu là 10/50/90/100 nên chưa có đáp án chính thức — bộ dữ liệu trong app đang chọn **10** (số cặp khóa) cho bất đối xứng và **90** cho đối xứng. Hãy đối chiếu với slide/giảng viên.',
]);

h2('8.3 Dùng khóa nào trong từng tình huống (Alice gửi cho Bob)');
table(['Mục đích', 'Người gửi dùng', 'Người nhận dùng'], [
  ['**Mã hóa** để chỉ Bob đọc được (Confidentiality)', '**Public key của Bob**', '**Private key của Bob** để giải mã'],
  ['Tạo **digital signature**', '**Private key của Alice**', 'Bob dùng **public key của Alice** để **xác minh** chữ ký'],
  ['Mã hóa bằng private key của A', 'Private key của A', 'Giải mã bằng **public key của A** (chứng minh nguồn gốc)'],
], [5, 4, 4.5]);
tip([
  '“A dùng public key của B mã hóa văn bản” → mục đích **gửi tài liệu cho B** (không phải cho nhiều người).',
  'Muốn an toàn tốt nhất khi gửi tin cho B: dùng **public key của B** để mã hóa; để chứng minh nguồn gốc: ký bằng **private key của A**.',
]);

h2('8.4 Kết hợp hai kiểu mã hóa (Hybrid) và chữ ký số');
bl([
  '**Hybrid**: dùng mã hóa **đối xứng** cho nội dung (nhanh) và mã hóa **bất đối xứng** để bảo vệ khóa đối xứng. Trong công đoạn mã hóa kiểu này, mã hóa đối xứng được dùng **1 lần**, bất đối xứng 1 lần → tổng cộng **2 lần mã hóa**.',
  '**Digital signature** = băm (hash) thông điệp rồi mã hóa giá trị băm bằng **private key** của người gửi → đạt **Integrity, Authentication, Nonrepudiation**.',
  '**Digital certificate** (chứng thư số) gắn public key với danh tính, do **CA** (Certificate Authority) cấp.',
]);

h2('8.5 Một số câu hỏi về an toàn giao dịch (theo bộ đề)');
bl([
  '**OTP**: nên dùng điện thoại **cơ bản** để nhận OTP (ít nguy cơ phần mềm độc hại hơn smartphone).',
  'Mua bán online: cách thanh toán an toàn cho cả hai bên là **dịch vụ thanh toán trung gian (escrow)**.',
  'Mất tiền do **ATM giả**: trách nhiệm thuộc về **ngân hàng**.',
  'Smart card thuộc loại xác thực **quyền sở hữu** (something you have). Thông tin về **vị trí** là một loại xác thực riêng.',
]);
pb();

// ================= PHẦN 9 =================
h1('Phần 9. An toàn web và thương mại điện tử');
h2('9.1 Cookie và công nghệ phía client');
table(['Thuật ngữ', 'Giải thích'], [
  ['**Session cookies**', 'Tồn tại cho đến khi web client **kết thúc kết nối** (đóng trình duyệt).'],
  ['**Persistent cookies**', 'Lưu lâu dài trên máy, tồn tại qua nhiều phiên.'],
  ['**First-party cookies**', 'Do chính trang web đang truy cập đặt.'],
  ['**Third-party cookies**', 'Do bên thứ ba (quảng cáo…) đặt.'],
  ['**Scripting languages**', 'JavaScript và VBScript: cung cấp các lệnh được **thực thi trên máy khách**.'],
  ['**ActiveX control**', 'Đối tượng chứa chương trình và thuộc tính mà web designer đặt trên trang để thực hiện tác vụ cụ thể.'],
  ['**Plug-in**', 'Phần mở rộng cho trình duyệt.'],
  ['**Web bug**', 'Ảnh/phần tử ẩn dùng để theo dõi người dùng.'],
  ['**Dead link**', 'Liên kết hỏng.'],
], [3.5, 9]);

h2('9.2 Các mối đe dọa và công cụ khác');
table(['Thuật ngữ', 'Giải thích'], [
  ['**Trojan horse**', 'Chương trình **giấu bên trong** chương trình khác hoặc trang web, che giấu mục đích thật.'],
  ['**Sniffer program**', 'Phần mềm ghi lại thông tin đi qua máy tính hoặc router đang xử lý lưu lượng Internet.'],
  ['**Buffer**', 'Vùng bộ nhớ dành riêng để chứa dữ liệu đọc từ file hoặc database (nguồn gốc của buffer overflow).'],
  ['**Phishing attack**', 'Cấu trúc cơ bản: kẻ tấn công gửi email đến **số lượng lớn** người nhận, những người có thể có tài khoản tại một trang web mục tiêu.'],
  ['**Remote wipe**', 'Xóa dữ liệu từ xa khi thiết bị bị mất.'],
  ['**Digital certificate**', 'Chứng thư số, xác nhận danh tính của website/chủ thể.'],
  ['**Hardware-based digital wallet**', 'Có thể là **smartphone**; ví điện tử dựa trên phần cứng.'],
  ['**Due diligence / Money laundering / Chargeback scheme**', 'Thẩm định; rửa tiền; kế hoạch hoàn tiền gian lận — **không phải** phishing.'],
], [4, 8.5]);
pb();

// ================= PHẦN 10 =================
h1('Phần 10. Bài toán mẫu và bảng so sánh nhanh');
h2('10.1 Bài toán chọn phương án mã hóa laptop (đề mã 357, câu 46–50)');
p('Đề: công ty có **500 laptop**; cài mã hóa gồm phí phần mềm theo laptop, phí hỗ trợ hằng năm, và chi phí **triển khai**: 5 giờ × 100.000 VNĐ/giờ × 500 laptop = **250 triệu VNĐ** (giống nhau cho mọi phương án). Phương án B, C, D chỉ áp dụng cho vòng đời **từ 4 năm trở lên**.');
table(['Phương án', 'Phần mềm (500 máy)', 'Hỗ trợ/năm', 'Tổng chi phí theo vòng đời L năm (triệu VNĐ)'], [
  ['**A**', '1.000.000 × 500 = 500 tr', '10% × 500 = 50 tr', '500 + 250 + 50L = **750 + 50L**'],
  ['**B**', '800.000 × 500 = 400 tr', '15% × 400 = 60 tr', '400 + 250 + 60L = **650 + 60L**'],
  ['**C**', '750.000 × 500 = 375 tr', '20% × 375 = 75 tr', '375 + 250 + 75L = **625 + 75L**'],
  ['**D**', '0', '300.000 × 500 = 150 tr', '250 + 150L = **250 + 150L**'],
], [1.5, 3.3, 3, 5]);
table(['Vòng đời', 'A', 'B', 'C', 'D', 'Chọn'], [
  ['4 năm', '950', '890', '925', '**850**', '**D**'],
  ['5 năm', '1.000', '**950**', '1.000', '1.000', '**B**'],
  ['6 năm', '1.050', '**1.010**', '1.075', '1.150', '**B**'],
], [2, 1.7, 1.7, 1.7, 1.7, 1.5]);
p('Với vòng đời dưới 4 năm chỉ có phương án A khả dụng nên nên dùng A (đáp án trong app: câu 46 “không có đáp án nào ở trên”, câu 47 “1 năm”). Các giả định tính toán nằm ở trên — nên đối chiếu lại với lời giải của giảng viên.');

h2('10.2 Bảng so sánh nhanh các cặp dễ nhầm');
table(['Dễ nhầm', 'Phân biệt'], [
  ['**Threat** vs **Vulnerability** vs **Risk**', 'Threat = hành động gây hại; Vulnerability = điểm yếu; Risk = khả năng thiệt hại khi hai thứ gặp nhau.'],
  ['**Policy** vs **Standard** vs **Procedure** vs **Guideline**', 'Policy (toàn tổ chức, lãnh đạo duyệt) – Standard (chi tiết HW/SW) – Procedure (từng bước, bắt buộc) – Guideline (gợi ý).'],
  ['**Identification** vs **Authentication**', 'Khai báo “tôi là ai” vs chứng minh danh tính đó.'],
  ['**Authorization** vs **Accountability**', 'Cấp quyền vs truy vết hành động về cá nhân.'],
  ['**Virus** vs **Worm**', 'Virus cần host program; worm độc lập.'],
  ['**Phishing** vs **Pharming** vs **Vishing**', 'Email/tin nhắn lừa từng người; đầu độc DNS; lừa qua điện thoại.'],
  ['**DoS** vs **DDoS**', 'DDoS dùng hàng trăm/nghìn máy → phạm vi lớn hơn.'],
  ['**Interruption** vs **Interception**', 'Làm mất availability vs đọc lén (confidentiality).'],
  ['**Hot / Warm / Cold site**', 'Phút–giờ, có dữ liệu & nhân sự | giờ–ngày, có máy chưa có dữ liệu | ngày–tuần, chỉ có tiện ích.'],
  ['**Incremental** vs **Differential**', 'Từ backup gần nhất vs từ full backup gần nhất.'],
  ['**Monitor** vs **Audit**', 'Theo dõi liên tục vs đánh giá độc lập hiệu quả controls.'],
  ['**MTTF** vs **MTTR** vs **MTBF**', 'Đến lần hỏng đầu | thời gian sửa | giữa hai lần hỏng = MTTF + MTTR.'],
  ['**Job rotation** vs **Separation of duties** vs **Mandatory vacation**', 'Luân chuyển nhiệm vụ | chia nhỏ quy trình | bắt buộc nghỉ phép.'],
  ['**Certification** vs **Accreditation**', 'Xem xét đáp ứng yêu cầu | chính thức chấp nhận risk.'],
  ['**RADIUS** vs **TACACS+**', 'RADIUS: client & user config files; TACACS+: một file cấu hình.'],
  ['**SOC 1** vs **SOC 2**', 'Financial reporting vs security/availability/…'],
  ['**Black / Gray / White-box**', 'Không biết gì | biết một phần | biết mã nguồn và thiết kế.'],
  ['**Symmetric** vs **Asymmetric**', 'Một khóa, nhanh | cặp khóa, chậm, bảo mật cao.'],
], [4.2, 8.5]);

h2('10.3 Danh sách “KHÔNG phải” hay gặp');
bl([
  'KHÔNG phải kỹ thuật tốt để authentication → **Identification number**.',
  'KHÔNG phải lợi ích của cloud → **giảm phụ thuộc nhà cung cấp bên ngoài**.',
  'KHÔNG phải lợi thế của biometrics → **đặc điểm vật lý có thể thay đổi**.',
  'KHÔNG phải mối quan ngại khi thuê ngoài → **chọn màu logo của nhà cung cấp**.',
  'KHÔNG phải mức permission → **Poor**.',
  'KHÔNG phải thành phần của Windows security permissions → **Change**.',
  'KHÔNG nằm trong phạm vi audit identity management → **hợp đồng quảng cáo**.',
  'KHÔNG phải hoạt động vi phạm an ninh → **sao lưu dữ liệu theo lịch**.',
  'KHÔNG phải hoạt động xác định scope audit → **phát hành báo cáo cuối cùng**.',
  'KHÔNG thuộc bốn mô hình cloud → các loại ngoài Private, Community, Public, Hybrid.',
]);
p(' ');
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [new TextRun({ text: '— Hết — Chúc bạn ôn tập tốt!', italics: true, font: FONT, color: '555555' })] }));

// ---------- DOCUMENT ----------
const doc = new Document({
  creator: 'ATTT study notes',
  title: 'Tài liệu lý thuyết ôn tập An toàn và bảo mật hệ thống thông tin',
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
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ATTT – Lý thuyết ôn tập   |   Trang ', size: 18, font: FONT, color: '777777' }), new TextRun({ children: [PageNumber.CURRENT], size: 18, font: FONT, color: '777777' })] })] }) },
    children: C,
  }],
});

const outDir = path.join(__dirname, '..', 'data', 'ATTT');
fs.mkdirSync(outDir, { recursive: true });
Packer.toBuffer(doc).then((buf) => {
  const out = path.join(outDir, 'ATTT_Ly_thuyet_on_tap.docx');
  fs.writeFileSync(out, buf);
  console.log('written', out, buf.length);
});
