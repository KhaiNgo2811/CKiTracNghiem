// Sinh tài liệu lý thuyết ôn tập NHÀ KHO DỮ LIỆU VÀ TÍCH HỢP -> data/Nhà kho/NhaKho_Ly_thuyet_on_tap.docx
// Chạy: NODE_PATH=<thư mục chứa node_modules/docx> node scripts/build-nhakho-theory.js
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType,
  LevelFormat, BorderStyle, WidthType, ShadingType, PageBreak, Footer, PageNumber,
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
const tip = (lines) => box('Mẹo / Bẫy khi thi', lines, 'FFF6DD', 'E0A800');
const note = (lines) => box('Cần nhớ', lines, 'E8F3FF', '3B82F6');
const formula = (lines) => box('Công thức', lines, 'EEF8EE', '3E9B4F');

// ================= BÌA =================
C.push(new Paragraph({ spacing: { before: 2600, after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TÀI LIỆU LÝ THUYẾT ÔN TẬP', bold: true, size: 40, font: FONT, color: '1F3A5F' })] }));
C.push(new Paragraph({ spacing: { after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'NHÀ KHO DỮ LIỆU VÀ TÍCH HỢP', bold: true, size: 36, font: FONT })] }));
C.push(new Paragraph({ spacing: { after: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Data Warehouse & Integration – 3 tín chỉ)', italics: true, size: 26, font: FONT })] }));
C.push(new Paragraph({ spacing: { after: 100 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Tổng hợp từ 9 bộ slide (Chương 1 – 9) và ngân hàng câu hỏi (kể cả câu hỏi tủ năm ngoái)', size: 22, font: FONT })] }));
C.push(new Paragraph({ spacing: { after: 100 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Giải thích bằng tiếng Việt – thuật ngữ giữ nguyên tiếng Anh (in đậm) để học thuộc', size: 22, font: FONT })] }));
pb();

h1('Hướng dẫn sử dụng tài liệu');
bl([
  'Thuật ngữ chuyên môn viết **tiếng Anh in đậm**, phần giải thích bằng tiếng Việt, đúng cách đề thi hay hỏi.',
  'Khung **“Cần nhớ”** = định nghĩa cốt lõi; khung **“Công thức”** = công thức/ví dụ tính toán (có lời giải); khung **“Mẹo / Bẫy khi thi”** = chỗ dễ nhầm trong các câu đã gặp.',
  'Các công thức trong slide ở dạng hình ảnh (Z-score, Entropy, Min-Max, PageRank…) đã được viết lại dưới dạng chữ và kiểm tra bằng đúng ví dụ trong slide/đề.',
  'Cuối tài liệu có phần **Câu hỏi tủ** (đề năm ngoái) và bảng so sánh nhanh. Học xong mỗi chương, quay lại app làm đúng chương đó và dùng nút **Kiểm tra đáp án**.',
]);
h2('Bản đồ nội dung');
table(['Chương', 'Chủ đề', 'Từ khóa quan trọng'], [
  ['1', 'Chiến lược & kiến trúc dữ liệu hiện đại', 'Lakehouse, Data Fabric, Data Mesh, Medallion, Object Storage, Decoupling Compute/Storage'],
  ['2', 'Mô hình hóa dữ liệu cho Cloud Warehousing', 'Kimball, Micro-partitioning, Fact/Dimension, SCD, Semantic Layer, VARIANT'],
  ['3', 'Tích hợp dữ liệu & Pipeline tự động', 'ELT, CDC, Zero-ETL, DAG, Snowpipe, Kappa, dbt, Schema Evolution, Observability'],
  ['4', 'Tiền xử lý dữ liệu', 'Data quality, Z-score/IQR, Jaccard, SMA, PCA, Binning, Min-Max, Entropy'],
  ['5', 'Thuật toán khai thác dữ liệu', 'Support/Confidence/Lift, Apriori, FP-Growth, ID3/C4.5, Naive Bayes, K-Means, DBSCAN'],
  ['6', 'In-Database ML & MLOps', 'BigQuery ML, Snowpark, PageRank, CPT+, Feature Store, Drift, UDF'],
  ['7', 'Quản trị, bảo mật & đạo đức dữ liệu', 'AI Act, Lineage, RLS/CLM, Zero-copy sharing, Differential Privacy, Bias'],
  ['8', 'Generative BI & AI-Driven Insights', 'RAG, Vector Search, Chat-with-your-data, Real-time, Agentic BI'],
  ['9', 'Tích hợp đa mô hình & CSDL hiện đại', 'Polyglot, Knowledge Graph, BFS/DFS, Vector Index, Blockchain, Federated Query, HA/DR'],
], [1, 4, 8]);
pb();

// ================= CHƯƠNG 1 =================
h1('Chương 1. Chiến lược & kiến trúc dữ liệu hiện đại');
h2('1.1 Từ RDBMS truyền thống đến AI-Native Lakehouse');
table(['Thời kỳ', 'Đặc điểm'], [
  ['**1980s – RDBMS**', 'Tập trung cho giao dịch đơn lẻ (**OLTP**).'],
  ['**1990s – Data Warehouse**', 'Phục vụ báo cáo quản trị và phân tích (**OLAP**).'],
  ['**2010s – Data Lake**', 'Lưu dữ liệu thô quy mô lớn trên nền tảng **Hadoop/S3**.'],
  ['**2020s – Lakehouse**', 'Hợp nhất độ tin cậy của SQL và tính linh hoạt của Lake.'],
  ['**Xu hướng – AI-Native**', 'Hỗ trợ AI ngay từ tầng lưu trữ; **Open Table Formats** (Iceberg, Delta Lake) thành chuẩn kết nối.'],
], [3.5, 9]);
p('Thay đổi tư duy: từ “lưu trữ để **báo cáo**” sang “lưu trữ để **dự báo và hành động**”.');
h3('Hạn chế của RDBMS trong kỷ nguyên Big Data');
bl([
  '**Nghẽn cổ chai** khi mở rộng: khó **scale-out** theo chiều ngang.',
  '**Schema-on-write** cứng nhắc: phải định nghĩa cấu trúc nghiêm ngặt trước khi nạp.',
  'Không tối ưu cho dữ liệu **phi cấu trúc** (video, văn bản, âm thanh).',
  'Chi phí bản quyền cao; tương tác kém với AI/ML; rủi ro **data silo**.',
  'Tính toán và lưu trữ **ràng buộc** với nhau: muốn thêm CPU phải tăng cả dung lượng đĩa.',
]);
h3('Đặc điểm của AI-Native Lakehouse');
bl([
  '**Native Vector**: lưu và truy vấn **Vector Embeddings** trực tiếp cho LLMs.',
  '**Quản trị Metadata tự động**: AI tự gán nhãn, phân loại, bảo mật dữ liệu thô.',
  '**Compute đa năng**: một nền tảng chạy cả SQL Warehouse và ML clusters.',
  '**ACID trên Object Storage**: đảm bảo tính toàn vẹn ngay cả trên đám mây.',
  'Tích hợp **Feature Store**; **Streaming** thời gian thực; kiến trúc **Serverless**.',
]);
p('Lý do doanh nghiệp cần chuyển đổi: tăng tốc **Time-to-Insight**, tối ưu chi phí (bỏ duy trì song song Lake + Warehouse), sẵn sàng cho **Generative AI**, tuân thủ pháp lý (dự kiểm toán, truy vết dòng dữ liệu), hợp nhất đội ngũ Data Engineer và Data Scientist.');

h2('1.2 Modern Data Warehouse trên Cloud');
table(['Khái niệm', 'Ý nghĩa'], [
  ['**SaaS**', 'Toàn bộ hệ thống cung cấp dưới dạng dịch vụ phần mềm.'],
  ['**Zero Management**', 'Giảm tối đa cấu hình, cài đặt, bảo trì hạ tầng.'],
  ['**Elasticity**', 'Co giãn tài nguyên tính toán nhanh chóng.'],
  ['**Pay-as-you-go**', 'Chỉ trả tiền cho phần thực sự sử dụng.'],
  ['**High Concurrency**', 'Hàng nghìn người dùng truy vấn đồng thời không suy giảm hiệu năng.'],
  ['**Bảo mật đa lớp**', 'Mã hóa tự động ở trạng thái tĩnh (**at-rest**) và khi di chuyển (**in-transit**).'],
], [3, 9]);
bl([
  'Lợi thế so với **On-Premise**: loại bỏ **CAPEX**; triển khai trong vài phút; **DR** đa vùng (Multi-region) tự động; cập nhật liên tục không **downtime**; tối ưu truy vấn tự động; đơn giản hóa quản trị.',
]);
table(['Nền tảng', 'Đặc điểm nổi bật'], [
  ['**Snowflake**', 'Tiên phong **tách rời Compute/Storage**, chia sẻ dữ liệu an toàn.'],
  ['**Google BigQuery**', 'Kiến trúc **Serverless** mạnh, tích hợp sẵn mô hình AI/ML của Google.'],
  ['**Amazon Redshift Serverless**', 'Giải pháp mạnh trong hệ sinh thái AWS.'],
  ['**Azure Synapse Analytics**', 'Hợp nhất SQL, Spark và tích hợp dữ liệu trong một môi trường.'],
  ['**Databricks SQL**', 'Mang trải nghiệm Warehouse vào nền tảng **Lakehouse**.'],
  ['**Firebolt**', 'Tập trung vào **tốc độ truy vấn cực nhanh** cho ứng dụng phân tích thời gian thực.'],
  ['**MotherDuck**', 'Lakehouse “nhẹ” dựa trên **DuckDB**.'],
], [3.5, 9]);
h3('Chiến lược quản lý chi phí');
bl([
  '**Auto-suspend**: tắt cụm tính toán khi không có truy vấn.',
  'Chọn **kích cỡ cluster** phù hợp độ phức tạp tác vụ; phân tầng lưu trữ (Archive tier).',
  '**Caching**: tránh tính toán lại kết quả cũ (câu hỏi tủ).',
  '**Budget Alerts**; nén dữ liệu bằng **Parquet/ORC**; theo dõi **cost lineage**.',
]);

h2('1.3 Kiến trúc Data Fabric');
bl([
  '**Triết lý**: “tấm vải dữ liệu” kết nối mọi nguồn rời rạc thành một thể thống nhất; mục tiêu xóa bỏ **Data Silos**.',
  '**Virtualization** (zero-copy): truy cập dữ liệu tại nguồn, không sao chép; **Abstraction Layer** che giấu độ phức tạp hạ tầng; hỗ trợ **Hybrid-Cloud**.',
  '**Active Metadata**: metadata không còn tĩnh mà có khả năng hành động — AI phân tích để tối ưu luồng dữ liệu, tự khám phá (**auto-discovery**) bảng mới, áp chính sách bảo mật tự động, xây **Knowledge Graph**, vẽ **Lineage**, gắn nhãn PII.',
]);
table(['Thành phần kỹ thuật', 'Vai trò'], [
  ['**Data Catalog**', 'Thư viện chứa thông tin và vị trí của mọi nguồn dữ liệu trong công ty.'],
  ['**Augmented Data Integration**', 'Dùng AI hỗ trợ ánh xạ và tích hợp dữ liệu.'],
  ['**Massive Metadata Lake**', 'Nơi lưu trữ và phân tích toàn bộ Metadata của hệ thống.'],
  ['**Data API Layer**', 'Cung cấp dữ liệu qua API chuẩn hóa.'],
  ['**Security & Compliance**', 'Lớp quản trị bảo mật tập trung cho toàn hệ sinh thái.'],
  ['**AI Engine**', 'Bộ não điều khiển tự động hóa và đưa ra khuyến nghị tối ưu.'],
  ['**Data Virtualization Engine**', 'Chạy truy vấn liên kết (**Federated Query**).'],
], [4, 8.5]);
table(['Ưu điểm', 'Thách thức'], [
  ['Linh hoạt: thêm nguồn mới không phá cấu trúc cũ; truy cập nhanh không cần ETL; quản trị tập trung', 'Phức tạp (cần chuyên môn lớp Metadata); hiệu năng ảo hóa chậm hơn dữ liệu đã nạp; chi phí công cụ cao; phụ thuộc chất lượng Metadata'],
], [6, 6]);

h2('1.4 Data Mesh');
bl([
  'Chuyển sang mô hình **phi tập trung**: dữ liệu tập trung gây nút cổ chai; áp dụng **Domain-driven Design** — chuyển quyền quyết định từ IT sang các đơn vị kinh doanh; mỗi domain chịu trách nhiệm chất lượng dữ liệu của mình.',
]);
table(['Nguyên tắc cốt lõi', 'Nội dung'], [
  ['**Domain Ownership**', 'Đơn vị nghiệp vụ sở hữu và vận hành dữ liệu của chính mình.'],
  ['**Data as a Product**', 'Dữ liệu được cung cấp cho người dùng khác như một sản phẩm thương mại.'],
  ['**Self-serve Platform**', 'IT xây nền tảng chung để các miền tự chạy.'],
  ['**Federated Governance**', 'Quản trị chung thông qua tiêu chuẩn kết nối và bảo mật thống nhất.'],
], [4, 8.5]);
p('Slide còn liệt kê các thuộc tính sản phẩm dữ liệu: **Interoperability** (kết nối được giữa các miền), **Discoverability** (dễ tìm qua Catalog chung), **Trustworthiness** (có cam kết chất lượng/SLA).');
h3('“Dữ liệu như một sản phẩm” – 7 thuộc tính');
p('**Discoverable, Addressable, Trustworthy, Self-contained, Interoperable, Secure, Evolvable** (có thể đổi phiên bản mà không làm hỏng hệ thống cũ).');
p('Thách thức: thay đổi tư duy, thiếu năng lực **Data Engineering** ở đơn vị kinh doanh, **trùng lặp nỗ lực**, quản trị phức tạp, chi phí hạ tầng tăng, **xung đột định nghĩa** chỉ số giữa các miền, cần đội Platform mạnh.');

h2('1.5 Unified Lakehouse');
bl([
  '**Vì sao là tương lai**: xóa rào cản dữ liệu có cấu trúc/phi cấu trúc; tiết kiệm chi phí (Object Storage rẻ); một hệ thống cho BI, Data Science, ML; bảo đảm **ACID**; engine hiện đại (**Spark, Photon**) tốc độ tương đương SQL; hệ sinh thái mở; quản trị thống nhất.',
]);
table(['Open Table Format', 'Điểm mạnh'], [
  ['**Delta Lake**', '**Time Travel** và ACID cho dữ liệu trên Lake.'],
  ['**Apache Iceberg**', 'Định dạng bảng hiện đại, hiệu năng cao, thay đổi **schema linh hoạt**.'],
  ['**Apache Hudi**', 'Tối ưu cho **Streaming** và **Upsert** liên tục.'],
], [4, 8.5]);
bl([
  '**Time Travel**: truy vấn lại dữ liệu ở bất kỳ thời điểm nào trong quá khứ. **Schema Evolution**: tự điều chỉnh cấu trúc bảng không cần nạp lại. **Concurrent Writes**: nhiều ứng dụng ghi đồng thời. **Smart Partitioning**: tối ưu tổ chức file.',
]);
h3('Medallion Architecture (Bronze – Silver – Gold)');
table(['Tầng', 'Nội dung'], [
  ['**Bronze**', 'Lưu dữ liệu **thô**, giữ nguyên định dạng gốc.'],
  ['**Silver**', 'Dữ liệu đã **làm sạch, hợp nhất, chuẩn hóa** cấu trúc.'],
  ['**Gold**', 'Dữ liệu **tổng hợp (aggregated)**, sẵn sàng cho báo cáo kinh doanh và AI.'],
], [3, 9.5]);
p('Lợi ích: luồng dữ liệu một chiều (dễ truy vết sai sót), kiểm soát chất lượng (**Quality Checks**) từng tầng, Silver phục vụ Data Science – Gold phục vụ BI, dễ chạy lại toàn bộ quy trình nếu tầng cuối lỗi. Lợi ích hội tụ: **Single Source of Truth**, giảm chi phí vận hành, tương thích SQL (PowerBI, Tableau), xử lý hàng Petabyte.');

h2('1.6 So sánh Mesh, Fabric và Lakehouse');
table(['Kiến trúc', 'Tập trung vào', 'Hướng tiếp cận'], [
  ['**Data Lakehouse**', '**Hiệu năng & hợp nhất** hạ tầng kỹ thuật', 'Hạ tầng – giải bài toán lưu trữ và tính toán hiệu quả nhất'],
  ['**Data Fabric**', '**Kết nối & ảo hóa** các nguồn rời rạc', 'IT – đội kỹ thuật dẫn dắt qua công nghệ ảo hóa'],
  ['**Data Mesh**', '**Con người & tổ chức** (quy trình vận hành)', 'Kinh doanh – các phòng ban tự chủ'],
], [3.2, 5, 5]);
table(['Nên chọn', 'Khi nào'], [
  ['**Data Lakehouse**', 'Doanh nghiệp quy mô trung bình; ưu tiên AI/ML; dữ liệu chưa phân tán quá nặng; cần hiệu năng SQL cao; đội IT tập trung; cần ACID; dự án xây từ đầu (**Greenfield**).'],
  ['**Data Fabric**', 'Dữ liệu phân tán rộng và **không thể di chuyển** (pháp lý); cần tích hợp nhanh hệ thống **Legacy** và Cloud; ưu tiên thống nhất quản trị qua lớp Metadata ảo.'],
  ['**Data Mesh**', 'Tổ chức quá lớn, IT không hiểu hết nhu cầu phòng ban; thúc đẩy văn hóa tự chủ; ưu tiên tốc độ ra mắt sản phẩm dữ liệu.'],
], [3.2, 9.5]);
tip(['Một doanh nghiệp có thể dùng **Lakehouse làm nền tảng cho Data Mesh**. Cả Fabric và Mesh đều mạnh trong môi trường **Multi-cloud**. Fabric mạnh nhất về gắn kết hệ thống rời rạc; Mesh dẫn đầu về đổi mới giải pháp dữ liệu cụ thể.']);

h2('1.7 Cloud Object Storage (S3, ADLS)');
bl([
  '**Flat namespace** (không phân cấp thư mục); mỗi **Object** định danh bằng **Key** duy nhất, truy cập qua URL/**API**; metadata Key-Value phong phú; mở rộng không giới hạn; chi phí rất thấp; độ bền cực cao.',
  '**Amazon S3**: tiêu chuẩn ngành; có **S3 Select** (lọc dữ liệu ngay tại tầng lưu trữ). **ADLS Gen2**: kết hợp Object Storage với cấu trúc thư mục (phân cấp thông minh), tích hợp sâu **Azure Active Directory**.',
]);
table(['Storage Tier', 'Mô tả'], [
  ['**Hot**', 'Truy cập hằng ngày, phí lưu trữ cao.'],
  ['**Cool**', 'Ít dùng, phí thấp hơn.'],
  ['**Archive / Glacier**', 'Lưu trữ lâu dài (pháp lý), phí cực rẻ nhưng lấy ra lâu.'],
  ['**Lifecycle Policies / Intelligent Tiering**', 'Tự động chuyển dữ liệu sang tầng rẻ hơn theo thời gian / theo thói quen truy cập.'],
], [4.5, 8]);
table(['Cơ chế bảo mật', 'Chức năng'], [
  ['**Encryption At-Rest**', 'Mã hóa dữ liệu ngay khi ghi xuống đĩa.'],
  ['**Encryption In-Transit (TLS)**', 'Bảo vệ dữ liệu khi di chuyển qua mạng.'],
  ['**IAM Policies**', 'Kiểm soát quyền truy cập chi tiết dựa trên **danh tính người dùng**.'],
  ['**Bucket Policies**', 'Quy định quyền truy cập cho **toàn bộ Data Container** (bucket) từ bên ngoài.'],
  ['**Versioning**', 'Lưu lại các bản sao của file để khôi phục.'],
  ['**Object Lock**', 'Ngăn xóa/sửa dữ liệu trong khoảng thời gian quy định.'],
  ['**Logging & Monitoring**', 'Ghi lại mọi yêu cầu truy cập.'],
], [4, 8.5]);

h2('1.8 Tách rời Compute và Storage (Decoupling)');
bl([
  '**Mô hình cũ (Coupled)**: CPU và ổ cứng gắn chặt → lãng phí khi nâng cấp. **Mô hình mới (Decoupled)**: lưu trữ và tính toán ở nơi khác nhau, **mở rộng độc lập** (tăng 1000 CPU mà không phải mua thêm 1GB đĩa).',
  'Tối ưu chi phí: chỉ trả tiền CPU khi thực hiện truy vấn; cụm tính toán lỗi thì dữ liệu vẫn an toàn.',
  'Vận hành: tầng lưu trữ trung tâm (S3/ADLS/GCS, định dạng **Parquet/Iceberg**); cụm tính toán **tạm thời (Ephemeral)**; **Caching** vào bộ nhớ CPU; mạng tốc độ cao (100Gbps+); **Predicate Pushdown** (chỉ đọc cột/dòng cần thiết); **tự tắt Compute** khi không có việc; tính **đa nhiệm** (nhiều cụm Compute trên cùng dữ liệu).',
]);
h3('Snowflake – hình mẫu của sự tách rời');
bl([
  '**Centralized Storage** + **Multi-cluster Compute** (Virtual Warehouses độc lập cho từng phòng ban) → không tranh chấp tài nguyên (truy vấn của kế toán không làm chậm báo cáo của CEO).',
  'Scaling tức thì: nâng cỡ từ **Small lên 4XL chỉ trong khoảng 1 giây**; **Global Services Layer** điều phối; **Zero-copy Cloning** (tạo bản sao cho thử nghiệm không tốn thêm dung lượng); **Data Sharing** (chia sẻ bằng cấp quyền truy cập vào Storage của mình).',
  'Lợi ích kinh tế: chuyển CAPEX → OPEX linh hoạt, đáp ứng tác vụ đột biến, thử nghiệm Sandbox không ảnh hưởng hệ thống chính, thuê GPU riêng rồi trả lại cho tác vụ huấn luyện mô hình, kiểm soát chi phí từng dự án.',
]);
pb();

// ================= CHƯƠNG 2 =================
h1('Chương 2. Mô hình hóa dữ liệu cho Cloud Warehousing');
h2('2.1 Phương pháp luận Kimball trong kỷ nguyên Cloud');
bl([
  'Duy trì triết lý **User-centric**; thích nghi với lưu trữ vô hạn và tính toán linh hoạt; chuyển từ **tối ưu không gian lưu trữ** sang **tối ưu hiệu suất truy vấn**; giảm phụ thuộc kỹ thuật **Indexing** vật lý phức tạp; hỗ trợ dữ liệu bán cấu trúc trực tiếp trong Schema; phù hợp chu kỳ **Agile/DevOps**.',
]);
h3('Quy trình Dimensional Design 4 bước');
p('**(1) Chọn Business Process → (2) Xác định Grain → (3) Xác định Dimensions → (4) Xác định Facts.** Đảm bảo **Conformed Dimensions** nhất quán để có **Single Version of Truth**.');
bl([
  'Tách rời Compute/Storage ⇒ không cần chuẩn hóa quá mức để tiết kiệm dung lượng; khuyến khích **Flat tables** (giảm Join); lưu dữ liệu thô không làm chậm báo cáo; tăng tốc **Ingestion** nhờ kiến trúc song song.',
  '**Denormalization** trong Cloud DWH: tận dụng **Columnar scanning**, giảm độ phức tạp SQL, tăng tốc hiển thị cho BI và Data Mining; lưu ý phải quản lý nhất quán dữ liệu khi phải chuẩn hóa.',
  'Trong **Data Mesh**: quyền thiết kế mô hình chuyển từ IT sang **Domain**; dùng **Federated Conformed Dimensions** kết nối các miền; Kimball trở thành “ngôn ngữ chung” giữa các đơn vị kinh doanh.',
]);

h2('2.2 Micro-partitioning và Clustering');
bl([
  '**Micro-partitioning**: hệ thống tự động chia bảng thành các tệp nhỏ, mỗi phân vùng thường **50MB đến 500MB dữ liệu nén**, tổ chức theo **Columnar**; Metadata lưu **Min/Max** của mỗi cột cho từng phân vùng; **không cần phân vùng thủ công**.',
  '**Data Pruning**: bỏ qua các phân vùng không chứa dữ liệu cần thiết dựa trên điều kiện lọc trong SQL → đọc ít dữ liệu hơn, giảm **Compute credit**, hiệu quả nhất khi dữ liệu được sắp xếp tốt theo cột thường xuyên lọc.',
  '**Clustering**: sắp xếp dữ liệu trong micro-partitions dựa trên một hay nhiều **cột** (Clustering Key — chọn theo **cột**, nên chọn cột có tính chọn lọc cao); làm phạm vi giá trị hẹp, không chồng lấn; tối ưu **Range queries**; giảm **Data Skew**.',
  '**Clustering Depth**: chỉ số đo mức chồng lấn giữa các micro-partitions — **càng thấp hiệu suất càng cao**; giúp quyết định khi nào cần **Re-clustering**. **Auto Re-clustering**: hệ thống tự sắp xếp lại ngầm mà không gián đoạn truy vấn (dùng tài nguyên riêng, có thể bật/tắt để kiểm soát chi phí).',
]);

h2('2.3 Thiết kế Fact Tables');
table(['Loại Fact Table', 'Đặc điểm', 'Ví dụ / Dùng cho'], [
  ['**Transaction Fact**', 'Lưu dữ liệu **Atomic level**, ghi từng sự kiện riêng lẻ khi xảy ra; nhiều chiều; thường có **nhiều dòng nhất**; là nguồn gốc xây các loại fact khác.', 'Drill-down chi tiết'],
  ['**Periodic Snapshot**', 'Lưu **trạng thái** của quy trình tại **thời điểm cố định** (cuối ngày/tháng); không thay đổi dữ liệu đã ghi.', 'Số dư tài khoản cuối ngày, tồn kho cuối tuần; **Trend analysis**'],
  ['**Accumulating Snapshot**', 'Theo dõi **tiến độ quy trình có nhiều giai đoạn**; mỗi dòng là một thực thể, được **cập nhật** các mốc thời gian; có nhiều cột ngày tháng; tính **Lead time** giữa các bước.', 'Xử lý đơn hàng từ lúc đặt đến lúc giao; **tối ưu chuỗi cung ứng và vận hành**'],
  ['**Factless Fact**', 'Lưu **sự kiện không có số liệu**; phân tích những gì **không** diễn ra.', 'Sinh viên có/không đăng ký môn học'],
  ['**Bridge Table**', 'Giải quyết quan hệ **nhiều-nhiều (M-M)**; ánh xạ giữa các nhóm thực thể không liên kết trực tiếp; thận trọng vì có thể gây **bùng nổ dữ liệu**.', ''],
], [3, 6.5, 3.5]);
bl([
  '**Grain** là bước quan trọng nhất; quy tắc: **“Tất cả Fact trong bảng phải cùng một mức chi tiết”**; Grain càng thấp (chi tiết) thì khả năng phân tích càng rộng nhưng bảng càng lớn.',
  '**Fact table** kết hợp với **Dimension table** bằng phép **Join** (câu hỏi tủ).',
]);

h2('2.4 Dimension Tables và Slowly Changing Dimensions (SCD)');
bl([
  'Dimension cung cấp **Context** cho sự kiện định lượng (“điểm lọc” và “điểm nhóm”); ưu tiên **Denormalization**; dùng **Surrogate Keys** thay Natural Keys (độc lập với hệ thống nguồn); thuộc tính **Verbose** dễ hiểu; xây **Conformed Dimensions**.',
]);
table(['Loại SCD', 'Cách xử lý'], [
  ['**Type 1**', 'Cập nhật trực tiếp, **ghi đè** dữ liệu cũ; dùng cho thuộc tính không cần lưu vết.'],
  ['**Type 2**', 'Thêm dòng mới, dùng cột **Start_Date, End_Date, Is_Current**; phục vụ báo cáo **Point-in-time**, ánh xạ đúng bối cảnh lịch sử.'],
  ['**Type 3**', 'Lưu giá trị **cũ/mới** trong các **cột riêng**.'],
  ['**Type 4**', 'Tách **Current Table** và **History Table** → bảng chính luôn gọn nhẹ.'],
  ['**Type 5**', 'Kết hợp **Mini-dimension** và logic Type 1, quản lý thuộc tính **Rapidly Changing**.'],
  ['**Type 6**', 'Kết hợp 1 + 2 + 3 để tối ưu truy vấn.'],
], [2.5, 10]);
p('Tự động hóa SCD bằng **dbt** để đảm bảo nhất quán logic và giảm rủi ro sai sót.');
table(['Kỹ thuật Dimension nâng cao', 'Ý nghĩa'], [
  ['**Junk Dimension**', 'Gom các thuộc tính flag, mã trạng thái rời rạc vào **một bảng** → giảm số lượng Join.'],
  ['**Degenerate Dimension**', 'Lưu khóa nghiệp vụ **trực tiếp trong bảng Fact**, không cần bảng chiều riêng (ví dụ số hóa đơn).'],
  ['**Mini-dimension**', 'Tách thuộc tính **Rapidly Changing** sang bảng phụ, tránh Dimension phình to.'],
  ['**Role-Playing Dimension**', '**Một** Dimension (ví dụ Date) dùng cho nhiều vai trò (order date, ship date…) trong cùng một Fact.'],
  ['**Khóa Integer / Column Ordering**', 'Tối ưu hiệu năng tính toán, nén cột và Data Pruning.'],
], [4, 8.5]);

h2('2.5 Medallion Architecture (chi tiết)');
table(['Tầng', 'Đặc điểm chi tiết'], [
  ['**Bronze – Raw Layer**', 'Tiếp nhận dữ liệu gốc (Hugging Face, API, ERP) **không biến đổi**; lưu JSON/Parquet; **Schema-on-read**; giữ **Immutability** để **Reprocess** khi logic nghiệp vụ thay đổi; kèm metadata như **Ingestion_Timestamp** và mã hệ thống nguồn; dùng **Incremental Load**.'],
  ['**Silver – Curated Layer**', 'Làm sạch, xử lý **Imputation**, chuẩn hóa kiểu; áp **Data Quality Gate** loại bản ghi không hợp lệ; **Join** các nguồn tạo bảng thực thể; vẫn ở mức **Atomic**; nguồn chính cho **Feature Extraction**; dùng Delta Lake/Iceberg đảm bảo **ACID**.'],
  ['**Gold – Consumption Layer**', 'Tổ chức theo **Star Schema** hoặc **Wide Tables**; chứa **Metrics/KPIs** đã tổng hợp; chỉ lưu dữ liệu đã qua phê duyệt nghiệp vụ; thiết kế riêng cho **Data Marts**; tích hợp kết quả dự báo AI (ví dụ điểm rủi ro bỏ đi của khách hàng); tiếp xúc trực tiếp với BI.'],
], [3.5, 9.5]);

h2('2.6 Semantic Layer và Metric Catalog');
bl([
  '**Semantic Layer**: lớp trung gian trừu tượng hóa cấu trúc vật lý; chuyển tên bảng/cột kỹ thuật thành **thuật ngữ nghiệp vụ**; định nghĩa **quan hệ giữa các bảng tập trung** (tránh người dùng Join sai); cung cấp **Context** để GenAI truy vấn chính xác bằng ngôn ngữ tự nhiên; giảm **Silo logic**; quản trị **Row-level / Column-level security** thống nhất.',
  '**Metric Catalog (Headless BI)**: định nghĩa công thức chỉ số **ở một nơi duy nhất** — số liệu nhất quán dù dùng PowerBI, Tableau hay Streamlit; quản lý vòng đời chỉ số; hỗ trợ **Lineage** ngược về bảng gốc; tái sử dụng định nghĩa, giảm tải cho Data Engineer.',
  'Với **AI Agents**: Semantic Layer là “bản tri thức” giúp AI hiểu ngữ nghĩa dữ liệu; hỗ trợ **RAG** (trả lời không “ảo tưởng” – hallucination); chuyển câu hỏi ngôn ngữ tự nhiên thành SQL chính xác; đảm bảo AI tuân thủ quy tắc quản trị; tạo trải nghiệm **Chat-with-your-data**.',
]);

h2('2.7 Dữ liệu bán cấu trúc với VARIANT');
bl([
  'Web logs, IoT thường là **JSON/Parquet** có cấu trúc không cố định; **Schema Drift** gây khó khăn cho bảng quan hệ; **Nested Arrays** cần kỹ thuật xử lý riêng; ép cấu trúc ngay khi nạp (**Schema-on-write**) tốn kém và dễ gián đoạn luồng.',
  'Kiểu **VARIANT** lưu toàn bộ tài liệu bán cấu trúc trong **một cột** với hiệu năng cao; tối ưu bộ nhớ cột nên truy vấn dữ liệu bên trong nhanh tương đương dữ liệu có cấu trúc; nén vượt trội với trường lặp.',
  '**Flattening**: chuyển các mảng thành các dòng riêng biệt để phân tích; có thể **Join** trực tiếp dữ liệu bán cấu trúc với dữ liệu quan hệ trong cùng một câu SQL.',
  '**Materialization**: khi một trường trong VARIANT được truy vấn thường xuyên, nên **trích xuất thành cột vật lý riêng** (tận dụng index, tăng tốc phản hồi); dùng **Virtual Views** cung cấp giao diện bảng quan hệ; cân nhắc linh hoạt của VARIANT với hiệu năng của cột cố định ở tầng Silver.',
]);

h2('2.8 Tối ưu Schema cho Data Mining và AI');
bl([
  'BI tập trung vào **tóm tắt xu hướng**; AI cần dữ liệu **mức chi tiết nhất (Granularity)** hoặc đặc trưng → chuyển từ **Star Schema** sang **Wide Tables** (giảm chi phí Join khi huấn luyện); ưu tiên lưu **Time-series**; đảm bảo **cân bằng dữ liệu** (mẫu tích cực và tiêu cực cho mô hình phân loại); Schema linh hoạt để bổ sung đặc trưng; thiết kế hỗ trợ chia ngẫu nhiên **Train/Validation/Test**.',
  '**Feature Engineering trực tiếp tại Lakehouse**: tận dụng tính toán song song; thực hiện **Normalization, Encoding, Discretization** bằng SQL; lưu đặc trưng tổng hợp (ví dụ tần suất mua hàng 90 ngày) vào tầng Gold; đảm bảo logic tạo đặc trưng **đồng nhất giữa lúc học và lúc dự báo**; dùng **Window Functions** tính đặc trưng động theo cửa sổ thời gian.',
  '**Point-in-time Correctness**: AI chỉ dùng dữ liệu đã “biết” tại thời điểm dự báo trong quá khứ → tránh **Data Leakage**; dùng **Time Travel** hoặc **SCD Type 2** để tái hiện trạng thái lịch sử; **Feature Store** quản lý phiên bản và chia sẻ đặc trưng; theo dõi **Data Drift** để huấn luyện lại khi hiệu năng giảm.',
]);
pb();

// ================= CHƯƠNG 3 =================
h1('Chương 3. Tích hợp dữ liệu và Pipeline tự động');
h2('3.1 Từ ETL truyền thống sang Cloud-Native ELT');
table(['Tiêu chí', '**ETL truyền thống**', '**Cloud-Native ELT**'], [
  ['Thứ tự', 'Transform **trước** khi nạp vào kho', 'Nạp **dữ liệu thô** vào Lake/Warehouse **rồi** mới xử lý'],
  ['Cấu trúc', 'Cứng nhắc: phải định nghĩa toàn bộ luồng biến đổi trước', '**Schema-on-read**: định nghĩa cấu trúc tại thời điểm truy vấn'],
  ['Hạ tầng', 'Phụ thuộc máy chủ trung gian → nút thắt cổ chai, trễ cao', '**In-place Transform** trên Cloud; tách hoàn toàn Storage và Compute'],
  ['Bảo trì', 'Tốn kém, phải viết lại logic trung gian khi nguồn đổi', 'Dùng hệ sinh thái **SQL** phổ biến; ít phụ thuộc công cụ kéo thả độc quyền'],
  ['Chi phí / bảo mật', 'Khó mở rộng', '**Pay-as-you-go**, **Auto-scaling**; dữ liệu không phải đi qua máy chủ ETL trung gian'],
], [2.5, 5, 5.5]);

h2('3.2 Change Data Capture (CDC)');
bl([
  '**CDC**: nhóm kỹ thuật nhận diện và nắm bắt thay đổi (**INSERT, UPDATE, DELETE**) từ CSDL nguồn. **Log-based**: đọc trực tiếp từ **Redo logs** thay vì quét truy vấn → gần như không ảnh hưởng hiệu năng nguồn, độ trễ tính bằng **mili giây**.',
]);
table(['Tiêu chí', '**Log-based CDC**', '**Query-based CDC**'], [
  ['Tải hệ thống', 'Cực kỳ nhẹ', 'Gây nặng vì liên tục chạy truy vấn (quét bảng)'],
  ['Bản ghi bị xóa', 'Ghi nhận việc xóa tức thì, chính xác', 'Rất khó phát hiện **Hard Delete**'],
  ['Độ chính xác', 'Đảm bảo tuyệt đối, không sót dữ liệu', 'Dễ sai lệch/sót nếu dữ liệu đổi quá nhanh giữa các chu kỳ quét'],
  ['Độ trễ', '**Real-time**, tính bằng mili giây', 'Theo lô (**Batch**), phụ thuộc chu kỳ quét (5 phút, 1 giờ…)'],
  ['Triển khai', 'Khó thiết lập ban đầu, nhưng ổn định dài hạn', 'Dễ thiết lập (chỉ cần viết SQL) nhưng kém ổn định khi dữ liệu lớn'],
], [2.5, 5, 5.5]);
table(['Nền tảng CDC', 'Đặc điểm'], [
  ['**Debezium**', 'Mã nguồn mở, chạy trên **Apache Kafka Connect**.'],
  ['**Fivetran**', 'Giải pháp SaaS thương mại tự động hóa luồng CDC.'],
  ['**AWS DMS**', 'Dịch vụ Cloud của Amazon di chuyển & đồng bộ dữ liệu liên tục.'],
  ['**Snowflake Streams**', 'Theo dõi thay đổi bên trong kho dữ liệu.'],
  ['**Qlik Replicate**', 'Quy mô doanh nghiệp, hỗ trợ dữ liệu **Legacy**.'],
], [3.5, 9]);
p('Ứng dụng CDC: **Microservices** đồng bộ trạng thái; **Live Dashboards**; **Cloud Migration** không gián đoạn (Zero-downtime); **Audit Trails**; **Fraud Detection** thời gian thực.');

h2('3.3 Zero-ETL Integration');
bl([
  '**Định nghĩa**: tích hợp dữ liệu trực tiếp **không cần xây code pipeline trung gian**; hệ thống tự mapping và đồng bộ cấu trúc từ nguồn đến đích; dữ liệu xuất hiện ở kho phân tích gần như ngay lập tức; giảm tối đa **failure point**.',
  'Công nghệ cốt lõi: **Proprietary Connectors**, **Metadata Sharing**, **Storage Mirroring** (nhận bản sao dữ liệu từ nguồn và liên tục cập nhật theo sự thay đổi), **Serverless Scaling**, **Unified Control Plane**.',
  'Lợi ích: rút ngắn **Time-to-Insight**; tối ưu **TCO**; Data Engineer tập trung logic phân tích; độ tin cậy cao (SLA do nhà cung cấp Cloud đảm bảo); tự chủ hóa dữ liệu.',
  'Hạn chế: **không phù hợp dữ liệu nguồn “bẩn”** cần làm sạch/biến đổi phức tạp; **Vendor Lock-in**; chi phí truyền tải khi đồng bộ khối lượng lớn; khó triển khai cho **On-premise** (hoạt động tốt giữa các Cloud); thách thức khi cần tự động gắn nhãn dữ liệu bằng AI.',
]);

h2('3.4 Orchestration & Scheduling');
bl([
  '**Orchestration**: “nhạc trưởng” điều khiển các tác vụ — thực thi đúng thứ tự và điều kiện; tự động **Retry** và cảnh báo khi lỗi; cái nhìn trực quan về toàn bộ data flow; ghi nhận lịch sử thực thi phục vụ kiểm toán.',
  '**DAG (Directed Acyclic Graph)**: **Directed** — luồng công việc theo một chiều xác định; **Acyclic** — loại bỏ vòng lặp vô hạn gây treo hệ thống. Quản lý phụ thuộc (tầng Gold chỉ chạy sau khi Silver hoàn tất), xử lý song song các tác vụ độc lập, tính module hóa.',
]);
table(['Tư duy', 'Trọng tâm', 'Ví dụ'], [
  ['**Task-centric**', 'Giám sát **tác vụ đang chạy**', '**Apache Airflow** (tiêu chuẩn công nghiệp, hàng nghìn thư viện kết nối)'],
  ['**Asset-centric**', 'Quản lý **tài sản dữ liệu** nào được tạo ra; ưu tiên lineage, local testing, CI/CD', '**Dagster**, Prefect'],
], [3, 5.5, 4.5]);
p('Công cụ khác: **Mage.ai** (tích hợp AI hỗ trợ sinh mã), **AWS Step Functions / Google Workflows** (Cloud Native, Serverless), giải pháp **Hybrid** cho Cloud + máy chủ nội bộ.');

h2('3.5 Batch Ingestion vs Continuous Streaming');
table(['Tiêu chí', '**Batch**', '**Streaming**'], [
  ['Định nghĩa', 'Gom khối lượng lớn xử lý đồng loạt theo chu kỳ (hằng đêm, hằng tuần)', 'Tiếp nhận và xử lý liên tục từng sự kiện ngay khi phát sinh'],
  ['Chi phí', 'Tiết kiệm (tận dụng hiệu suất tính toán quy mô lớn trong thời gian ngắn)', 'Tốn kém hơn vì duy trì tài nguyên chạy 24/7'],
  ['Độ phức tạp', 'Thấp hơn, dễ triển khai/khắc phục', 'Rất cao: cần hạ tầng mạng mạnh, cơ chế **fault tolerance**'],
  ['Phù hợp', 'Chấp nhận độ trễ dữ liệu cao (báo cáo cuối ngày)', 'SLA độ trễ cực thấp / thời gian thực (chống gian lận, giá động)'],
], [2.5, 5, 5.5]);
bl([
  '**Snowpipe**: tự động nạp dữ liệu khi file vừa xuất hiện trên Cloud Storage; **Serverless**; **Micro-batch** (chia nhỏ thành các lô liên tục); tích hợp hàng đợi (AWS SQS, Azure Event Grid); chỉ tính phí trên lượng dữ liệu nạp thực tế.',
  '**Spark Structured Streaming**: **Exactly-once** (không lặp/thất thoát), **Windowing** (tổng hợp theo khung thời gian), **Watermarks** (xử lý bản ghi đến trễ), **Fault Tolerance** qua **Checkpointing**, **Unified API** cho cả batch lẫn stream.',
]);
table(['Tiêu chí', '**Lambda**', '**Kappa**'], [
  ['Bản chất', 'Duy trì **hai luồng song song**: Batch (chính xác) + Speed/Streaming (nhanh)', 'Chỉ **một luồng Streaming** xử lý cả dữ liệu thực lẫn lịch sử'],
  ['Bảo trì', 'Gánh nặng lớn: phải viết/kiểm thử/duy trì **hai bộ mã nguồn**', 'Dễ hơn: **một luồng, một codebase**'],
  ['Nhất quán dữ liệu', 'Có rủi ro sai lệch giữa luồng Batch và Speed', 'Nhất quán cao, báo cáo real-time và lịch sử luôn khớp'],
  ['Xu hướng', 'Chỉ còn cho kiến trúc cũ', 'Đang trở thành xu hướng chủ đạo'],
], [2.5, 5.5, 5]);

h2('3.6 dbt, Jinja và Data Testing');
bl([
  '**dbt (Data Build Tool)**: “tứ phủ” trong ELT, giúp Data Engineer làm việc như Software Engineer; triết lý **SQL-first**; tích hợp **Git**; **Module hóa** model (chuẩn **DRY**).',
  '**Jinja + Dynamic SQL**: **Templating Engine** thêm cấu trúc điều khiển vào SQL tĩnh; **Macros** (đóng gói đoạn SQL lặp thành hàm); tự thay tên bảng/schema theo môi trường **Dev/Test/Prod**; có thể **giảm hơn 50% số dòng code dư thừa** so với cách viết truyền thống.',
]);
table(['Loại kiểm thử dbt', 'Mô tả'], [
  ['**Schema Tests**', 'Kiểm tra khai báo sẵn: cột rỗng (not null), trùng lặp (unique)…'],
  ['**Singular Tests**', 'Viết **câu lệnh SQL riêng biệt** để kiểm tra quy tắc nghiệp vụ cụ thể.'],
  ['**Data Contracts**', 'Ràng buộc giữa đội cung cấp và đội phân tích.'],
], [3.5, 9]);
p('**CI/CD** tự động: pipeline chỉ đưa code vào vận hành nếu mọi bài test đều pass. **Auto-Docs** tự trích comment trong mã nguồn tạo trang tài liệu; **Visual Lineage** vẽ quan hệ đầu vào/đầu ra; phân tích tác động khi cập nhật bảng gốc.');

h2('3.7 Schema Evolution');
bl([
  '**Schema Drift**: sự thay đổi cấu trúc đột ngột của dữ liệu nguồn (thêm/xóa cột, đổi kiểu). Hậu quả: gián đoạn downstream pipeline, dashboard ngừng hoạt động; **Silent Loss** (dữ liệu mới xuất hiện nhưng bị loại bỏ ngầm vì kho không nhận diện cột mới); làm hỏng mô hình ML.',
  'Cơ chế tự thích ứng: dùng **JSON/VARIANT** bao bọc thay đổi; **Auto-column addition**; **Type Coercion** (tự nâng cấp kiểu dữ liệu); triển khai an toàn; cảnh báo sớm.',
]);
table(['Quy tắc tương thích', 'Ý nghĩa'], [
  ['**Backward Compatibility**', 'Code xử lý cũ vẫn đọc được cấu trúc dữ liệu **mới**.'],
  ['**Forward Compatibility**', 'Cấu trúc dữ liệu **cũ** hoạt động trơn tru với các phiên bản code **mới**.'],
  ['**Full Compatibility**', 'Chuẩn cao nhất: kết hợp cả hai.'],
  ['**Schema Versioning**', 'Lưu lịch sử các phiên bản để **Rollback** khi cần.'],
], [3.5, 9]);
bl([
  'Công cụ: **Apache Iceberg / Delta Lake** (đổi cấu trúc không ghi lại bảng), **Schema Registry** (Kafka Streaming), **Fivetran Auto-sync**, **Snowflake Schema Evolution** (tự điều chỉnh bảng trong lúc chạy **COPY**), **AWS Glue Crawler**.',
]);

h2('3.8 Data Observability');
bl([
  '**Observability** là khả năng theo dõi và hiểu “sức khỏe” của hệ sinh thái dữ liệu từ đầu nguồn đến đích. Vượt xa **Monitoring**: Monitoring **báo động** hệ thống lỗi; Observability **giải thích vì sao lỗi và lỗi ở đâu**; chủ động ngăn chặn, giảm **Data Downtime**, xây dựng niềm tin (**Trust**).',
]);
table(['5 trụ cột', 'Câu hỏi kiểm tra'], [
  ['**Freshness**', 'Dữ liệu có được cập nhật đúng hạn theo SLA không?'],
  ['**Volume**', 'Số lượng bản ghi nạp vào có tăng/giảm đột ngột so với trung bình lịch sử không?'],
  ['**Distribution**', 'Tham số thống kê của tập dữ liệu có nằm trong ngưỡng an toàn không?'],
  ['**Schema**', 'Cấu trúc bảng có bị thay đổi trái phép không?'],
  ['**Lineage**', 'Khi phát hiện bản ghi lỗi, truy vết chính xác nguồn phát sinh ở đâu?'],
], [3, 9.5]);
pb();

// ================= CHƯƠNG 4 =================
h1('Chương 4. Tiền xử lý dữ liệu');
h2('4.1 Các chiều chất lượng dữ liệu');
table(['Chiều', 'Ý nghĩa'], [
  ['**Accuracy** (chính xác)', 'Mức dữ liệu mô tả đúng thực thể; sai lệch thường do lỗi hệ thống hoặc con người.'],
  ['**Completeness** (đầy đủ)', 'Tỷ lệ dữ liệu không bị khuyết (Null/Missing); quan trọng cho mô hình định lượng.'],
  ['**Consistency** (nhất quán)', 'Đồng bộ về logic và định dạng giữa các nguồn; tránh xung đột đơn vị.'],
  ['**Timeliness** (kịp thời)', 'Độ trễ của dữ liệu; dữ liệu trễ làm mất tính thời sự của tín hiệu thị trường.'],
], [3.5, 9]);
bl([
  'Nguyên lý: chất lượng dữ liệu là nền tảng của tri thức; dữ liệu sai lệch tạo ra tri thức sai lệch.',
  'Công cụ: kiểm tra **Schema** bằng Metadata; **Cross-field Validation** (quy tắc logic liên thuộc tính).',
  'Ví dụ chấm điểm tín dụng: hồ sơ thiếu thông tin (**Completeness**) và ngày tất toán sai định dạng (**Consistency**) → mô hình sai; giải pháp: dùng **dbt** chuẩn hóa ngày ở tầng Silver, dùng ML/DL ước lượng giá trị thiếu.',
]);

h2('4.2 Làm sạch dữ liệu: Noise và Outliers');
bl([
  '**Noise**: sai số ngẫu nhiên làm lu mờ tín hiệu thực. Xử lý: **Binning** (chia dữ liệu thành khoảng, thay bằng trung bình bin để làm mượt); **Regression** (dùng hàm toán học “khớp” dữ liệu loại bỏ nhiễu); **Moving Average**.',
]);
formula([
  '**Z-Score**: z = (x − μ) / σ — điểm có |z| > 3 được coi là **Outlier** tiềm năng.',
  '**IQR** (khoảng tứ phân vị): IQR = Q3 − Q1; ngưỡng ngoại lai: nằm ngoài khoảng **[Q1 − 1,5·IQR ; Q3 + 1,5·IQR]**.',
  'Ví dụ slide: giao dịch thẻ ở nước ngoài gấp 50 lần mức bình thường (**Z-score > 5**) → tạm khóa thẻ xác minh.',
]);

h2('4.3 Data Integration: Entity Resolution và Deduplication');
bl([
  '**Entity Resolution**: xác định các bản ghi từ nhiều nguồn (SQL, API, Web) cùng mô tả một thực thể. **Metadata Resolution**: đối chiếu thuộc tính khác tên nhưng cùng ý nghĩa.',
  '**Deduplication**: loại bỏ bản ghi trùng lặp để tạo **Golden Record** duy nhất. **Conflict Handling**: khi hai nguồn cho giá trị khác nhau → ưu tiên theo **Source Authority** (độ tin cậy) hoặc lấy giá trị **mới nhất (Latest timestamp)**. Có thể dùng **Clustering** nhóm các bản ghi tương đồng trước khi hợp nhất, và **Fuzzy Matching** (ví dụ sáp nhập dữ liệu khách hàng sau M&A).',
]);
formula([
  '**Độ đo Jaccard**: J(A,B) = |A ∩ B| / |A ∪ B| (càng gần 1 càng giống nhau).',
  'Ví dụ slide: A = {Python, SQL, Tableau, Power BI}; B = {Python, SQL, Excel, R}. Giao = {Python, SQL} → 2; Hợp = 6 phần tử → **J(A,B) = 2/6 ≈ 0,33** (năng lực chỉ tương đồng ở mức thấp).',
]);

h2('4.4 Transformation: Smoothing và Aggregation');
formula([
  '**SMA (Simple Moving Average)** với cửa sổ k: SMA tại ngày n = (p(n−k+1) + … + p(n)) / k.',
  'Ví dụ slide (giá vàng 5 ngày: 80, 86, 82, 84, 88; k = 3): SMA ngày 3 = (80+86+82)/3 = **82,7**; ngày 4 = (86+82+84)/3 = **84,0**; ngày 5 = (82+84+88)/3 = **84,7**.',
  'Câu hỏi tủ: giá 75, 79, 38, 80, 82, 85; k = 3 → SMA ngày 4 = (79+38+80)/3 ≈ **66**.',
]);
bl([
  '**Data Aggregation**: kết hợp bản ghi chi tiết thành bản tóm tắt cấp cao (doanh thu ngày → tháng). **OLAP/Data Cubes** với các phép **Roll-up** và **Drill-down**. Chọn **Granularity** cân bằng giữa hiệu suất và chi tiết; biến đổi tại tầng Gold.',
  'Ví dụ chứng khoán: **MA-50/MA-200** xác định **Golden Cross**; tổng hợp hàng triệu lệnh khớp thành **Candlesticks** theo khung 1 giờ.',
]);

h2('4.5 Data Reduction: PCA và Numerosity');
bl([
  '**Dimensionality Reduction**: loại bỏ thuộc tính dư thừa/không tương quan. **PCA (Principal Component Analysis)**: phép biến đổi tuyến tính giữ lại tối đa **phương sai** của dữ liệu; **thành phần chính** là vector riêng ứng với trị riêng lớn nhất của **Covariance Matrix**; giải quyết **Curse of Dimensionality**.',
  '**Numerosity Reduction**: **Regression models** (thay tập dữ liệu bằng tham số mô hình), **Sampling** (chọn tập con đại diện – **Stratified Sampling**), **Histograms** (phân phối tần suất), **Clustering** (thay nhóm điểm bằng **Centroid**).',
  'Ví dụ: danh mục 1.000 mã cổ phiếu — PCA rút còn 10 thành phần chính; lấy mẫu phân tầng → mô hình **Value-at-Risk (VaR)** chạy nhanh hơn 100 lần.',
]);

h2('4.6 Discretization và Concept Hierarchy');
formula([
  '**Equal-width Binning**: chia dải giá trị thành N khoảng **rộng bằng nhau**: Width = (max − min) / N.',
  'Ví dụ slide: hạn mức thẻ min 10 triệu, max 70 triệu, N = 3 → Width = 20 → nhóm [10–30], [30–50], [50–70] (triệu).',
  'Câu hỏi tủ: thu nhập 100–700 triệu, N = 3 → Width = 200 → nhóm thấp nhất **từ 100 đến 300 triệu**.',
  '**Equal-frequency Binning**: mỗi bin chứa **số lượng bản ghi bằng nhau**; **tốt cho dữ liệu lệch (skewed)**.',
]);
bl([
  '**Mục đích Discretization**: **giảm số lượng giá trị** và hỗ trợ các thuật toán. **Concept Hierarchy**: tổ chức thuộc tính theo từng bậc từ cụ thể đến tổng quát (chi nhánh → khu vực); hỗ trợ **Multi-level Mining** và **drill-down** tìm nguyên nhân gốc rễ.',
]);

h2('4.7 Normalization: Min-Max, Z-score, Decimal Scaling');
formula([
  '**Min-Max**: v′ = (v − min) / (max − min) × (new_max − new_min) + new_min (thường ánh xạ về [0, 1]).',
  'Ví dụ slide: thu nhập min 10, max 110 (triệu) → 60 triệu chuẩn hóa = (60−10)/(110−10) = **0,5**. Câu hỏi tủ: min 5, max 10, v = 8 → (8−5)/(10−5) = **0,6**.',
  '**Decimal Scaling**: v′ = v / 10^j, với j là số nguyên nhỏ nhất sao cho **giá trị tuyệt đối lớn nhất** của thuộc tính sau chuẩn hóa < 1 (xác định dựa trên **giá trị tuyệt đối lớn nhất**).',
  '**Z-Score Normalization**: v′ = (v − μ) / σ → dữ liệu sau chuẩn hóa có **trung bình = 0 và độ lệch chuẩn = 1**. Hữu ích khi **có nhiều ngoại lai hoặc khi không biết trước Min-Max**.',
]);
p('Tầm quan trọng: giúp các thuật toán dựa trên **khoảng cách** hoạt động không thiên lệch giữa các biến (ví dụ dự báo tỷ giá USD/VND: dự trữ ngoại hối có giá trị tuyệt đối lớn hơn lãi suất hàng triệu lần → dùng Z-Score đưa hai biến về cùng thang đo).');

h2('4.8 Feature Engineering và Entropy');
bl([
  '**Feature Construction**: tạo thuộc tính mới từ thuộc tính cũ làm nổi bật tín hiệu nghiệp vụ (ví dụ **BMI, LTV, DTI** = nợ/thu nhập, **Utilization Rate**). **Feature Selection**: dùng độ đo như **Information Gain** để giữ thuộc tính có sức mạnh phân loại tốt nhất. **Domain Knowledge** quyết định thành công.',
  '**AI-based Extraction**: dùng mô hình ngôn ngữ (như Gemini) trích đặc trưng từ dữ liệu phi cấu trúc: **Sentiment & Topic**, **Embeddings** (vector đa chiều). Quá trình Bronze → Gold chính là quá trình chiết xuất tri thức (**Knowledge Discovery**).',
]);
formula([
  '**Entropy**: Info(D) = − Σ p_i · log2(p_i), với **m = số lượng lớp** (i = 1..m), p_i = tỷ lệ mẫu thuộc lớp i.',
  '**Info_A(D)** = Σ_{j=1..v} (|D_j| / |D|) × Info(D_j), với **v = số giá trị khác nhau của thuộc tính A**. **Gain(A) = Info(D) − Info_A(D)**.',
  'Câu hỏi tủ: D có 10 mẫu: 6 Good, 4 Bad → Info(D) = −(0,6·log2 0,6 + 0,4·log2 0,4) ≈ **0,971 bit**.',
]);
tip(['Z-Score hiệu quả khi “nhiều ngoại lai **hoặc** không biết trước Min-Max”. Equal-frequency tốt cho **dữ liệu lệch**. PCA giữ lại **phương sai**. Decimal Scaling dựa trên **giá trị tuyệt đối lớn nhất**.']);
pb();

// ================= CHƯƠNG 5 =================
h1('Chương 5. Thuật toán khai thác dữ liệu cốt lõi');
h2('5.1 Luật kết hợp: Support, Confidence, Lift');
p('Luật kết hợp có dạng **X ⇒ Y**: **X = Antecedent (tiền đề)**, **Y = Consequent (hậu đề)**; ý nghĩa: nếu X xảy ra thì Y cũng có khả năng xảy ra.');
formula([
  '**Support** Sup(X⇒Y) = P(X∪Y) = (số giao dịch chứa cả X và Y) / (tổng số giao dịch).',
  '**Confidence** Conf(X⇒Y) = Sup(X∪Y) / Sup(X).',
  '**Lift** Lift(X⇒Y) = Conf(X⇒Y) / P(Y) = P(X∪Y) / (P(X)·P(Y)).',
  '**Leverage** (Lift mở rộng) = Sup(X∪Y) − Sup(X) × Sup(Y).',
]);
table(['Giá trị', 'Ý nghĩa'], [
  ['**Conf = 1** (100%)', 'Luật tuyệt đối đúng.'],
  ['**0,9 – 1**', 'Luật rất mạnh, đáng tin cậy.'],
  ['**0,5 – 0,9**', 'Trung bình, tin cậy vừa phải.'],
  ['**< 0,5**', 'Luật yếu.'],
  ['**Lift > 1**', 'Tiền đề **làm tăng** khả năng xảy ra hậu đề (quan hệ tích cực).'],
  ['**Lift = 1**', 'Tiền đề và hậu đề **độc lập**.'],
  ['**Lift < 1**', 'Tiền đề **làm giảm** khả năng xảy ra hậu đề (quan hệ tiêu cực).'],
], [3.5, 9]);
p('Ngưỡng thông thường: **minsup = 0,01 (1%)** và **minconf = 0,8 (80%)**; loại mọi luật dưới ngưỡng.');
h3('Ví dụ có lời giải');
table(['Đề bài', 'Kết quả'], [
  ['1000 giao dịch; 262 giao dịch chứa đủ tiền đề + hậu đề', 'Sup = 262/1000 = **0,262**'],
  ['283 giao dịch có tiền đề; 262 có cả hai', 'Conf = 262/283 ≈ **0,926** (luật rất mạnh)'],
  ['Conf = 0,926; P(Y) = 610/1000 = 0,61', 'Lift = 0,926/0,61 ≈ **1,52**'],
  ['8 giao dịch T1{a,b,c}, T2{a,b,c,d,e}, T3{b}, T4{c,d,e}, T5{c}, T6{b,c,d}, T7{c,d,e}, T8{c,e}; luật {c} ⇒ {d,e}', 'Sup({c,d,e}) = 3/8 = **0,375**; count({c}) = 7 → Conf = 3/7 ≈ **0,429**; P({d,e}) = 3/8 → Lift = 0,429/0,375 ≈ **1,143**; Leverage = 0,375 − (7/8)(3/8) ≈ **0,047**'],
  ['Sup({c,d,b}) trong CSDL trên', 'Xuất hiện ở T2, T6 → 2/8 = **0,25**'],
  ['Luật cd ⇒ e: count({c,d,e}) = 3, count({c,d}) = 4', 'Conf = 3/4 = **0,75**'],
], [6.5, 6.5]);

h2('5.2 Thuật toán Apriori');
bl([
  '**Frequent Itemset**: itemset có support ≥ **minsup**. Ví dụ 10.000 hợp đồng, 2.000 hợp đồng có cả bảo hiểm xe máy và y tế → Support = 20% ≥ minsup 15% → là tập phổ biến.',
  'Đề xuất bởi **Agrawal (1993)**. Với tập I có k item, số tập con khác rỗng = **2^k − 1** (5 item → **31**).',
]);
note([
  '**Tính chất 1**: nếu X ⊆ Y thì **Sup(Y) ≤ Sup(X)** (Sup({pasta}) = 4 ≥ Sup({pasta, lemon}) = 3 ≥ Sup({pasta, lemon, orange}) = 2).',
  '**Tính chất 2 (Anti-monotone)**: nếu một **tập con** của Y **không phổ biến** thì Y cũng không phổ biến (ví dụ {bread} không phổ biến ⇒ {bread, lemon} không phổ biến).',
]);
p('**Các bước (minsup = 2)**: (1) Duyệt CSDL, tính support itemset kích thước 1 → (2) loại itemset không phổ biến → (3) sinh ứng viên kích thước 2 bằng cách kết hợp các item phổ biến → (4) cắt tỉa ứng viên có tập con không phổ biến (theo tính chất 2) → (5) duyệt CSDL tính support → (6) loại không phổ biến → lặp lại với kích thước 3, 4… cho đến khi **không còn ứng viên** thì dừng.');
bl([
  '**Hạn chế**: **quét CSDL nhiều lần**; **sinh số lượng ứng viên khổng lồ** (nếu có n item đơn phổ biến thì số itemset 2 phần tử sinh ra xấp xỉ **n²/2**; với n = 6 theo slide là **18**, tổ hợp chính xác C(6,2) = 15).',
  'Ví dụ slide (pasta, lemon, orange, cake; minsup = 2): tập phổ biến gồm {pasta}, {lemon}, {orange}, {cake}, {pasta,lemon}, {pasta,orange}, {pasta,cake}, {lemon,orange}, {orange,cake}, {pasta,lemon,orange}, {pasta,orange,cake}; Sup({pasta, orange}) = 3 (75% trong 4 giao dịch).',
]);

h2('5.3 Thuật toán FP-Growth');
bl([
  '**Khắc phục Apriori**: xây **FP-Tree** (cấu trúc nén của tập mục, lưu vết quan hệ giữa các item) nên **chỉ duyệt CSDL 2 lần**, **không sinh tập ứng viên**, tiết kiệm bộ nhớ và nhanh hơn.',
  '**Condition Pattern Base**: CSDL phụ gồm các **đường dẫn tiền tố (prefix paths)** trong FP-tree xuất hiện cùng nút thấp nhất (suffix).',
]);
p('**4 bước**: (1) Xây FP-tree → (2) Tạo Condition Pattern Base → (3) Tính số lần xuất hiện các phần tử trong Condition Pattern Base → (4) Tìm các item thỏa ngưỡng hỗ trợ tối thiểu.');
h3('Ví dụ slide (minsupportcount = 3)');
table(['Bước', 'Nội dung'], [
  ['CSDL', '1: F,A,C,D,G,I,M,P | 2: A,B,C,F,L,M,O | 3: B,F,H,J,O | 4: B,C,K,S,P | 5: A,F,C,E,L,P,M,N'],
  ['Lần duyệt 1', 'Đếm: F, C = 4; A, M, P, B = 3; L, O = 2; còn lại = 1 → item phổ biến theo **thứ tự giảm dần**: **F, C, A, B, M, P**'],
  ['Lần duyệt 2', 'Loại item không phổ biến và sắp xếp theo thứ tự trên: T1: F,C,A,M,P | T2: F,C,A,B,M | T3: F,B | T4: C,B,P | T5: F,C,A,M,P'],
  ['Kết quả', 'Size 1: {B},{F},{C},{A},{M},{P}; Size 2: {F,C},{F,A},{C,A},{F,M},{C,M},{A,M},{C,P}; Size 3: {F,C,A},{F,C,M},{F,A,M},{C,A,M}; Size 4: {F,C,A,M}'],
], [2.5, 10.5]);
tip(['Thứ tự item trong FP-Growth: **giảm dần theo số giao dịch mà item xuất hiện** (trong ví dụ 8 giao dịch minsup 4 thì thứ tự có thể là **c, e, d, b**). Cùng một thứ tự cố định cho mọi giao dịch — {M, C, A} là không hợp lệ.',
  'Với Conditional Pattern Base X:{Y:4,Z:3}; Y:{X:4,Z:4,T:4}; Z:{X:3,Y:4,T:3}; T:{Y:4,Z:3} và Minsup = 4: tập 2 item chứa X là **{X,Y}**; tập 2 item không chứa X là **{Y,Z}, {T,Y}**.']);

h2('5.4 Cây quyết định: ID3 và C4.5');
table(['Tiêu chí', '**ID3**', '**C4.5**'], [
  ['Tiêu chí chọn thuộc tính', '**Information Gain**', '**Gain Ratio**'],
  ['Loại dữ liệu', 'Chỉ dữ liệu **rời rạc (Categorical)**', 'Cả rời rạc và **liên tục (Numerical)**'],
  ['Giá trị Null', 'Không hỗ trợ (báo lỗi)', 'Hỗ trợ bằng **trọng số xác suất**'],
  ['Cắt tỉa cây', 'Không có cơ chế', 'Có **Post-pruning** (cắt sau)'],
  ['Overfitting', 'Kém (dễ quá khớp, cây sâu)', 'Tốt (cây gọn, tổng quát cao)'],
], [3, 5, 5]);

h2('5.5 Phân loại Bayes');
bl([
  '**Naive Bayes**: dựa trên **Định lý Bayes**; dự đoán đối tượng thuộc nhóm nào bằng cách tính xác suất đối tượng rơi vào từng nhóm dựa trên đặc trưng; xếp vào **nhóm có xác suất cao nhất**. Giả định “Naive”: các thuộc tính **độc lập hoàn toàn với nhau khi biết nhãn lớp**.',
  '**Bayesian Network**: cấu trúc đồ thị kết hợp lý thuyết xác suất, mô hình hóa các biến **phụ thuộc lẫn nhau** → khắc phục nhược điểm “Naive”.',
]);

h2('5.6 Phân cụm (Clustering)');
table(['Thuật toán', 'Tâm cụm', 'Dữ liệu', 'Ưu điểm', 'Nhược điểm'], [
  ['**K-Means**', '**Mean** (trọng tâm ảo)', 'Numerical', 'Chạy rất nhanh với dữ liệu lớn', '**Nhạy cảm với nhiễu (Outliers)**'],
  ['**K-Medoids**', '**Medoid** (điểm thật)', 'Mọi loại dữ liệu', '**Chống nhiễu tốt**', 'Chạy rất chậm khi dữ liệu lớn'],
], [2.2, 2.5, 2.2, 3.3, 3.3]);
bl([
  '**Biến thể**: **Mini-Batch K-Means** (cho Big Data, chạy trên các nhóm mẫu nhỏ ngẫu nhiên), **K-Modes** (thay Mean bằng **Mode**, cho dữ liệu phân loại), **K-Prototypes** (K-Means + K-Modes, cho dữ liệu **hỗn hợp**), **CLARA / CLARANS** (biến thể **K-Medoids**, phân tích mẫu để chạy trên dữ liệu lớn).',
]);
h3('DBSCAN (Density-based)');
bl([
  'Cụm là vùng có mật độ điểm dày, ngăn cách bởi vùng mật độ thấp. **Không cần biết trước số cụm k**; cụm có **hình dạng bất kỳ**.',
  '**2 tham số**: **Eps** (bán kính lân cận) và **MinPts** (số điểm tối thiểu trong bán kính Eps để thành cụm).',
  '**3 loại điểm**: **Core** (có ≥ MinPts điểm trong bán kính Eps – nguồn phát triển cụm); **Border** (nằm trong vùng Eps của điểm lõi nhưng bản thân có < MinPts điểm lân cận); **Noise** (không thuộc hai loại trên – bị loại bỏ).',
  'Cơ chế: bắt đầu từ điểm Core, lan truyền (loang) kết nối các điểm có thể tiếp cận về mật độ cho đến khi không còn điểm Core mới.',
]);
table(['Tiêu chí', '**Hierarchical**', '**Grid-based**'], [
  ['Nguyên lý', 'Xây **Dendrogram** bằng cách gộp dần các cụm nhỏ hoặc chia nhỏ cụm lớn', 'Chia không gian dữ liệu thành các **ô lưới**; tính toán và gom cụm dựa trên ô lưới'],
  ['Ưu điểm', 'Trực quan, cấu trúc đa tầng; linh hoạt nhiều cấp chi tiết', '**Tốc độ xử lý siêu nhanh**, chuyên trị dữ liệu lớn'],
  ['Nhược điểm', 'Chi phí tính toán cao; bước gộp/chia sai **không thể đảo ngược**', 'Độ chính xác biên cụm phụ thuộc cách chia kích thước ô lưới'],
  ['Mở rộng với dữ liệu lớn', 'Rất kém', 'Tốt'],
  ['Thuật toán', '**AGNES, DIANA, BIRCH, CURE**', '**STING, CLIQUE, WaveCluster**'],
], [2.6, 5.2, 5.2]);

h2('5.7 Phát hiện ngoại lai (Outlier Detection)');
bl([
  '**Statistical-based**: giả định dữ liệu theo một phân phối xác suất nhất định (thường **Gaussian**); điểm có xác suất cực thấp (hai đầu phân phối) là ngoại lai; nhanh, phù hợp dữ liệu đơn giản.',
  '**Distance-based**: đối tượng là ngoại lai nếu nằm **cách xa hầu hết** các điểm dữ liệu khác; không quan tâm phân phối xác suất, tập trung vào không gian hình học; tổng quát, phù hợp dữ liệu đa chiều nhưng tốn tài nguyên.',
]);
pb();

// ================= CHƯƠNG 6 =================
h1('Chương 6. In-Database Machine Learning và MLOps');
h2('6.1 Kiến trúc In-Database ML');
table(['Cách tiếp cận', 'Đặc điểm'], [
  ['**Truyền thống**', 'Trích xuất lượng lớn dữ liệu ra máy chủ ML riêng để huấn luyện → **tốn băng thông, trễ thời gian, nguy cơ về bảo mật**.'],
  ['**In-Database (hiện đại)**', 'Giữ nguyên dữ liệu **tại chỗ**; đóng gói thuật toán ML đưa vào chạy trực tiếp trên hạ tầng của Data Warehouse → **loại bỏ độ trễ và chi phí dịch chuyển dữ liệu**, đảm bảo bảo mật và **Data Governance**.'],
], [3.5, 9.5]);
bl([
  '**Scalability**: tận dụng tính toán song song quy mô lớn và tự động mở rộng của DWH (hàng Terabyte) mà không cần cấu hình cụm Spark/Hadoop phức tạp.',
  '**Governance**: kiểm soát quyền theo vai trò (**RBAC**) thống nhất — phân quyền ai được dùng mô hình ML giống như phân quyền truy cập bảng dữ liệu.',
  '**Simplicity**: tích hợp mô hình trực tiếp vào luồng dữ liệu tự động (**ELT pipelines**) sẵn có.',
]);
h3('Nhóm thuật toán ML trong kho dữ liệu');
table(['Nhóm', 'Đặc điểm', 'Bài toán'], [
  ['**Supervised Learning**', 'Huấn luyện trên **Labeled Data**', '**Classification** (dự đoán nhãn danh mục), **Regression** (dự đoán giá trị số liên tục)'],
  ['**Unsupervised Learning**', 'Khám phá cấu trúc ẩn từ **Unlabeled Data**', '**Clustering** (phân cụm theo sự tương tự), **Anomaly Detection** (tìm bản ghi dị biệt)'],
], [3.5, 4.5, 5]);

h2('6.2 PageRank');
formula([
  '**PR(p) = (1 − d) + d × Σ PR(q) / C(q)** — tổng lấy trên các trang q trỏ tới p; **C(q)** là số liên kết đi ra (**out-degree**) của q (số trang mà q liên kết đến).',
  '**Damping factor d = 0,85** (giá trị thường dùng); khởi tạo mọi PR = 1; lặp đến khi chênh lệch giữa hai vòng liên tiếp < **ε = 0,0001**.',
  'Ví dụ slide: Node F chỉ nhận link từ E; E có 3 link ra (B, D, F) → C(E) = 3 → PR(F) = 0,15 + 0,85 × (1/3) ≈ **0,43** ở vòng đầu; hội tụ về ≈ 3,9 sau khoảng 50 vòng.',
  'Câu hỏi tủ (đồ thị: 1→2; 2→5; 3→1,2,4,5; 4→3,5; 5→4): PR(Page 2) vòng 1 = 0,15 + 0,85 × (1/1 + 1/4) = **1,2125** (nhận từ Page 1 có C=1 và Page 3 có C=4); PR(Page 1) = 0,15 + 0,85 × (1/4) = **0,3625**.',
]);

h2('6.3 Compact Prediction Tree (CPT / CPT+)');
bl([
  '**CPT** dự đoán phần tử kế tiếp của chuỗi (**Sequence Prediction**). Gồm 3 thành phần: **Prediction Tree** (cây lưu các chuỗi), **Inverted Index** (ma trận item × sequence: mỗi item xuất hiện trong những chuỗi nào), **Lookup Table** (trỏ tới **nút cuối** của mỗi chuỗi trong cây).',
  'Ví dụ câu hỏi tủ: s1 = ⟨A,B,C,D,F⟩, s2 = ⟨D,C,B,E⟩, s3 = ⟨E,A,D,C,B⟩, s4 = ⟨E,G,A,D,B,C⟩; dự đoán chuỗi ⟨D, C⟩ → phần tử có điểm cao nhất là **B**.',
  '**CPT+** thêm các chiến lược nén/tối ưu: **FSC (Frequent Subsequence Compression)** — thay chuỗi con xuất hiện thường xuyên (ví dụ AB) bằng một ký hiệu mới (x = AB); **SBC (Simple Branches Compression)** — gộp các nhánh đơn (chuỗi nút không rẽ nhánh) thành một nút; **PNR (Prediction with improved Noise Reduction)** — thuộc **giai đoạn dự đoán**, cải tiến cách tính điểm để giảm ảnh hưởng nhiễu.',
]);

h2('6.4 Huấn luyện mô hình bằng SQL và tích hợp Python');
table(['Công nghệ', 'Câu lệnh / tính năng'], [
  ['**BigQuery ML – CREATE MODEL**', 'Khởi tạo và huấn luyện mô hình (ví dụ LOGISTIC_REG, LINEAR_REG).'],
  ['**BigQuery ML – ML.EVALUATE**', 'Trích xuất chỉ số đánh giá (**ROC-AUC, F1-Score**) bằng câu SELECT.'],
  ['**BigQuery ML – ML.PREDICT**', 'Gọi mô hình dự báo trên các bảng dữ liệu mới.'],
  ['**Snowflake Cortex ML Functions**', 'Hàm ML đóng gói sẵn: **Forecasting** (chuỗi thời gian), **Anomaly Detection**.'],
  ['**Cortex AI & LLM**', 'Gọi trực tiếp LLM (Llama, Mistral…) bằng SQL để tóm tắt văn bản, phân tích cảm xúc.'],
  ['**Snowpark**', 'API dạng **DataFrame** để viết Python/R/Scala nhưng thực thi **bên trong** Snowflake.'],
  ['**Push-down**', 'Mã Python được Snowpark tự biên dịch thành câu lệnh **SQL** tối ưu chạy song song trên cụm kho dữ liệu (**Zero Data Movement**).'],
  ['**Anaconda integration**', 'Gọi trực tiếp hàng nghìn thư viện (scikit-learn, numpy, pandas, scipy) không cần cài thủ công.'],
  ['**Sandboxing**', 'Chạy mã Python/R trong không gian **cô lập an toàn**, ngăn mã độc xâm nhập hạ tầng dữ liệu.'],
  ['**Python Worksheets**', 'Viết, chạy thử nghiệm Python trực tiếp trên giao diện Web UI.'],
], [4.5, 8.5]);

h2('6.5 Feature Store, MLOps, AutoML và UDF');
bl([
  '**Feature Store**: kho lưu trữ **tập trung** quản lý, lưu và phân phối các đặc trưng đã tính sẵn cho nhiều mô hình tái sử dụng. **3 lợi ích**: **Discovery** (tái sử dụng), **Consistency** (nhất quán), **Lineage** (truy vết nguồn gốc).',
  '**MLOps**: áp dụng tư duy **DevOps** vào Machine Learning. **Model Registry**: danh mục tập trung các mô hình đã huấn luyện; quản lý trạng thái (đang phát triển, đã phê duyệt, đã hạ tải). **Model Versioning**: ràng buộc phiên bản mô hình với **đúng phiên bản dữ liệu (Data Version)** và **mã nguồn** tạo ra nó để tái lập kiểm thử.',
  '**Model Drift**: mô hình giảm chính xác theo thời gian do **Data Drift** (phân phối dữ liệu đầu vào thực tế thay đổi so với lúc huấn luyện) và **Concept Drift** (mối quan hệ giữa thuộc tính đầu vào và nhãn mục tiêu thay đổi). Giải pháp: giám sát tự động và **Auto-retraining** khi độ chính xác tụt dưới ngưỡng.',
  '**AutoML**: tự động hóa chuỗi quy trình xây dựng mô hình: **Automated Feature Engineering**, tự huấn luyện thử nhiều thuật toán và chọn tốt nhất, **Hyperparameter Tuning**.',
  '**UDF (User-Defined Function)**: mô hình sau khi phê duyệt được đóng gói thành hàm ngay trong DWH → **Scoring on-the-fly**: dự báo tức thời chỉ bằng câu lệnh **SELECT** bình thường, không cần viết API phức tạp.',
]);
pb();

// ================= CHƯƠNG 7 =================
h1('Chương 7. Quản trị, bảo mật và đạo đức dữ liệu');
h2('7.1 Data Governance theo AI Act');
bl([
  '**AI Act** áp dụng toàn diện từ năm 2026, phân cấp các hệ thống AI thành **4 mức rủi ro**. Doanh nghiệp (MIS & Fintech) phải thiết lập quản trị dữ liệu nghiêm ngặt từ khâu **Ingestion** đến vận hành.',
  '**3 trụ cột bắt buộc**: **Transparency** (minh bạch), **Human Oversight** (giám sát của con người), **Data Quality** (chất lượng dữ liệu huấn luyện).',
]);
table(['Mức rủi ro', 'Quy định', 'Ví dụ'], [
  ['**Unacceptable Risk**', '**Cấm hoàn toàn**', 'Chấm điểm công dân xã hội; AI thao túng hành vi dưới ngưỡng nhận thức'],
  ['**High Risk**', 'Kiểm soát nghiêm ngặt', 'AI Fintech chấm điểm tín dụng, tuyển dụng nhân sự, quản trị cơ sở hạ tầng thiết yếu'],
  ['**Transparent / Limited Risk**', 'Yêu cầu dán nhãn rõ ràng', 'Chatbots, hệ thống tạo ảnh Deepfake'],
  ['**Minimal Risk**', 'Tự do vận hành', 'Bộ lọc Spam, AI trong trò chơi điện tử'],
], [3.5, 3.5, 6]);
p('Nghĩa vụ với AI rủi ro cao: **Data Quality** (bộ dữ liệu huấn luyện/kiểm thử đại diện, không sai sót hệ thống, kiểm soát thiên kiến **Bias**); **Technical Documentation** (lưu toàn bộ kiến trúc, luồng dữ liệu phục vụ thanh tra); **Traceability** (hệ thống tự động ghi nhật ký để theo dõi, kiểm toán toàn bộ vòng đời).');

h2('7.2 Automated Data Lineage');
bl([
  '**Data Lineage**: khả năng quan sát và ghi nhận toàn diện dòng chảy dữ liệu từ nguồn gốc, qua các bước biến đổi, đến mô hình AI cuối cùng; theo dõi qua **Medallion** (Bronze → Silver → Gold). Giá trị: kiểm toán viên hiểu “mô hình AI lấy dữ liệu từ đâu, bị biến đổi bởi câu lệnh SQL nào”.',
  'Luồng quan sát 360 trong pipeline: **Data Source** (metadata từ CRM, ERP, Web Logs) → **Transformation** (trích mã SQL từ dbt/Spark) → **Data Quality Check** (ghi nhận bài test) → **AI Consumption** (nối đặc trưng với kết quả dự báo).',
  '**Impact Analysis**: khi bảng Bronze đổi cấu trúc, tự động cảnh báo các mô hình AI tầng Gold bị ảnh hưởng. **Root-Cause Analysis** nhanh (giảm khoảng 90% thời gian rà soát thủ công). **Data Trust**: chứng minh tính nguyên bản và sạch của dữ liệu trước khi đưa vào mô hình.',
]);

h2('7.3 Fine-grained Security: RLS và CLM');
table(['Kỹ thuật', 'Cơ chế', 'Ví dụ'], [
  ['**Row-level Security (RLS)**', 'Bộ lọc **động** theo danh tính người truy cập (**User Context**) – bảo mật **cấp dòng**', 'Nhân viên vùng A chỉ xem khách hàng vùng A; cấp quản lý xem toàn quốc'],
  ['**Column-level Masking (CLM)**', 'Ẩn/mã hóa một phần dữ liệu nhạy cảm (**PII**) mà không đổi cấu trúc bảng – bảo mật **cột**', 'Số điện thoại hiển thị 091xxxx888'],
], [3.5, 5, 5]);
p('**Trade-off bảo mật và hiệu năng**: mã hóa bảng dữ liệu lớn thường làm hệ thống chậm (độ trễ truy vấn cao); bài học cho MIS: **không được đánh đổi bảo mật bằng hiệu năng vận hành thời gian thực**, cần tối ưu thời gian mã hóa/giải mã.');

h2('7.4 Secure Data Sharing (Zero-copy)');
table(['Tiêu chí', '**ETL truyền thống (FTP)**', '**Secure Data Sharing (Zero-copy)**'], [
  ['Độ trễ', 'Theo lô (Batch/Schedule)', '**Thời gian thực (Live)**'],
  ['Bảo mật', 'Rủi ro rò rỉ cao từ các file sao chép; khó quản trị bản sao', 'Kiểm soát quyền **tập trung** bằng chính sách **IAM** trên Cloud'],
  ['Chi phí', 'Tốn gấp đôi tài nguyên (nhân bản lưu trữ và tính toán)', 'Tối ưu: dùng chung không gian lưu trữ gốc, **không sinh bản sao**'],
], [2.5, 5, 5.5]);
p('Cơ chế: tổ chức chỉ cần cấp quyền truy cập trực tiếp vào vùng dữ liệu chỉ định qua **metadata**; đối tác xem dữ liệu tại chỗ, **không sao chép byte nào**. Khi kết thúc hợp tác chỉ cần **Revoke access** trên Cloud → đối tác không còn nhìn thấy dữ liệu, giải quyết triệt để bài toán mất kiểm soát dữ liệu sau chia sẻ.');

h2('7.5 Anonymization và Differential Privacy');
bl([
  '**Differential Privacy**: kết quả phân tích của AI gần như **không đổi dù có hay không có dữ liệu** của một cá nhân → hacker không thể “dịch ngược” báo cáo để nhận diện cá nhân. Cơ chế: thuật toán chủ động **trộn thêm nhiễu ngẫu nhiên** thay vì trả kết quả thô.',
  '**Epsilon (ε) – ngân sách quyền riêng tư**: kiểm soát sự đánh đổi giữa an toàn thông tin và giá trị phân tích. **ε thấp** → bảo mật tối đa nhưng **giảm chính xác**; **ε cao** → báo cáo tốt nhưng rủi ro danh tính.',
  '**K-Anonymity**: tập dữ liệu thỏa k-anonymity nếu mỗi cá nhân **không thể phân biệt với ít nhất k−1 cá nhân khác**. **Quasi-identifiers**: các cột không nhạy cảm đơn lẻ (tuổi, giới tính…) nhưng khi kết hợp có thể giúp **Re-identification**. Hai kỹ thuật: **Generalization** (biến số cụ thể thành khoảng, ví dụ 23 tuổi → 20–30) và **Suppression** (xóa hẳn dòng quá dị biệt).',
  '**Privacy Loss vs Utility**: siết bảo mật quá mức (ε → 0) khiến tính hữu dụng của dữ liệu giảm mạnh; nhiệm vụ của nhà quản trị là tìm **Optimal Balance**.',
]);

h2('7.6 Metadata và Data Cataloging dựa trên AI');
bl([
  'Dữ liệu mở rộng quá nhanh tạo thành **Data Swamps**; **AI-driven Data Catalog** tự động thu thập và phân loại Metadata, nhận diện cột chứa email/số thẻ tín dụng (**PII**) để tự gắn nhãn và phân quyền.',
  'Thành phần: **Semantic Search** (tìm bảng bằng ngôn ngữ tự nhiên), **Data Lineage Integration**, **Trust Score** (đánh giá chất lượng bảng dựa trên tần suất sử dụng và lịch sử kiểm định tự động).',
]);
table(['Loại', 'Do ai quản lý', 'Nội dung'], [
  ['**Business Glossary**', '**Governance Layer**', 'Định nghĩa thống nhất khái niệm kinh doanh (ví dụ Churn = khách hàng không phát sinh giao dịch trên 90 ngày)'],
  ['**Technical Metadata**', '**Data Engineer Layer**', 'Kiểu dữ liệu (INT64, FLOAT64…), schema, tần suất cập nhật (Freshness), chủ sở hữu kỹ thuật (Owner)'],
], [3, 3.5, 6.5]);

h2('7.7 Đạo đức dữ liệu: Bias và Human-in-the-loop');
bl([
  '**Bias**: AI không tự sinh định kiến — định kiến nằm trong dữ liệu lịch sử của con người; AI học và khuếch đại ở quy mô lớn (ví dụ AI duyệt vay từ chối nhóm khách hàng một vùng địa lý vì dữ liệu quá khứ của nhóm này quá ít).',
]);
table(['Giai đoạn khử Bias', 'Kỹ thuật'], [
  ['**Pre-processing**', 'Tác động vào tập dữ liệu Gold trước khi học: **Resampling** (lấy mẫu lại) hoặc gán **trọng số** cân bằng.'],
  ['**In-processing**', 'Thay đổi thuật toán huấn luyện: thêm **Fairness Constraints** vào **Loss Function**.'],
  ['**Post-processing**', 'Điều chỉnh kết quả đầu ra: đặt lại **Classification Threshold** tối ưu riêng cho từng nhóm thiểu số.'],
], [3.5, 9]);
bl([
  '**Human-in-the-loop**: AI chỉ là **hỗ trợ ra quyết định**; quyết định cuối cùng ảnh hưởng quyền lợi công dân (bác đơn vay, từ chối hồ sơ) **bắt buộc có con người phê duyệt**. **Explainable AI**: mô hình không được là “hộp đen” (Black-box), phải giải trình được lý do.',
]);

h2('7.8 Tự động Auditing và báo cáo tuân thủ');
bl([
  '**Audit truyền thống**: kiểm toán định kỳ bằng con người, chậm, tốn kém. **Continuous Auditing**: AI theo dõi tự động toàn bộ hạ tầng dữ liệu 24/7, phát hiện và ngăn chặn vi phạm ngay khi xảy ra.',
  'Quy trình: **Monitor** (theo dõi từng câu lệnh truy vấn dữ liệu nhạy cảm) → **Detect** (Anomaly Detection phát hiện truy cập bất thường, ví dụ tải hàng loạt dữ liệu khách hàng lúc 2 giờ sáng) → **Alert** (báo động, tự khóa quyền tài khoản nghi vấn) → **Report** (tự xuất **Compliance Report** theo khung AI Act).',
  'Thành phần kỹ thuật: **Data Audit Trail** (sổ cái **bất biến – Immutable log** ghi ai tạo/sửa/xóa/xem dữ liệu), **Bias Reporting Dashboard** (đo **Fairness Metrics**), **Privacy Audit Trail** (theo dõi hao hụt **Epsilon privacy budget**).',
]);
pb();

// ================= CHƯƠNG 8 =================
h1('Chương 8. Generative BI và AI-Driven Insights');
h2('8.1 Từ phân tích mô tả sang phân tích hành động');
table(['Loại', 'Đặc điểm'], [
  ['**Descriptive** (truyền thống)', 'Báo cáo quá khứ, trả lời “**điều gì đã xảy ra?**”; dữ liệu tĩnh, độ trễ cao, phụ thuộc con người ra quyết định.'],
  ['**Actionable** (hiện đại)', 'Ứng dụng AI (ví dụ **BigQuery ML**) để **Predict** (dự báo) và **Prescribe** (đề xuất hành động) ngay tại kho dữ liệu; biến insights thành giá trị kinh doanh.'],
], [3.5, 9.5]);
bl([
  '**BigQuery Object Tables**: phân tích trực tiếp **hình ảnh, PDF, audio, video** bằng SQL, tích hợp **Vertex AI**; lợi ích: bảo mật tập trung, khai thác trọn vẹn **~80% dữ liệu tiềm ẩn (phi cấu trúc)** của doanh nghiệp.',
]);

h2('8.2 Semantic Search, Vector Search và RAG');
bl([
  '**Embeddings**: chuyển văn bản, hình ảnh thành các chuỗi số (**Vectors**) mang ý nghĩa ngữ nghĩa để máy tính so sánh. **Vector Index** (ví dụ **IVFFLAT**): tìm hàng triệu bản ghi tương đồng trong vài mili giây. **Semantic Match**: tìm theo **ý nghĩa** thay vì từ khóa chính xác (hệ thống gợi ý sản phẩm, tra cứu tài liệu pháp lý).',
]);
table(['Bước RAG', 'Nội dung'], [
  ['1. **Ingestion**', 'Chuyển tài liệu vào **Object Tables**.'],
  ['2. **Embedding**', 'Băm nhỏ tài liệu (**Chunks**) và tạo Vector.'],
  ['3. **Retrieval**', 'Tìm ngữ cảnh liên quan nhất qua **Vector Search** khi có câu hỏi.'],
  ['4. **Generation**', '**LLM** tổng hợp và trả lời dựa trên đúng ngữ cảnh vừa tìm được.'],
], [3.5, 9]);
p('**RAG (Retrieval-Augmented Generation)** giúp AI sinh văn bản trả lời dựa trên kho dữ liệu tin cậy của doanh nghiệp, **loại bỏ hiện tượng ảo giác (Hallucination)** bằng cách chỉ cho phép dùng dữ liệu nội bộ đã kiểm chứng. Ứng dụng: Chatbot nội bộ phòng HR, tra cứu quy trình vận hành, hỗ trợ khách hàng đa kênh.');

h2('8.3 Generative BI: Chat-with-your-data');
bl([
  'Giảm hầu hết thời gian tạo báo cáo; người dùng kinh doanh đặt câu hỏi bằng **ngôn ngữ tự nhiên** (ví dụ “Hiển thị top 5 sản phẩm có doanh thu cao nhất quý 3”) mà không cần SQL.',
  'Công nghệ: kết hợp **BI Tools** (**Looker**, Tableau) với **LLM** (Gemini/ChatGPT). Lưu ý: Gemini, ChatGPT, DeepSeek là mô hình LLM, **không phải BI Tool**.',
]);
p('**Workflow Conversational BI**: **Natural Query** (câu hỏi tiếng Việt/Anh) → **Auto-SQL** (LLM biên dịch thành SQL chuẩn xác, tối ưu, an toàn) → **Instant Insight** (tự động truy xuất và chọn loại biểu đồ phù hợp: Bar chart, Line chart).');

h2('8.4 Real-time Insights');
bl([
  'Tích hợp **Streaming API** với Dataflow/**Kafka** xử lý hàng triệu sự kiện mỗi giây; ứng dụng: phát hiện gian lận thẻ tín dụng, định giá động theo thời gian thực, quản trị chuỗi cung ứng và giao vận.',
  '**Zero Latency**: kết hợp **Pub/Sub** và **Continuous Queries** để hành động tự động ngay khi dữ liệu vừa phát sinh. Ví dụ: tự gửi thông báo khuyến mãi cá nhân hóa ngay lúc khách vừa rời giỏ hàng chưa thanh toán.',
]);

h2('8.5 Data Storytelling và Agentic BI');
bl([
  '**Data Storytelling** có cấu trúc: **Bối cảnh (Context) → Vấn đề (Problem) → Giải pháp (Solution) → Hành động (Action)**; trực quan hóa thông minh (màu sắc, vị trí dẫn dắt vào **Key Metrics**); dùng **Gen AI** tự viết đoạn giải thích cho dashboard; **Alerting & Actions** (dashboard có nút kích hoạt quy trình nghiệp vụ, **Write-back to CRM**).',
  'Theo nghiên cứu hành vi, dữ liệu trình bày dưới dạng câu chuyện có khả năng ghi nhớ và thuyết phục cao hơn khoảng **65%** so với con số khô khan; là cầu nối giữa bộ phận kỹ thuật (IT/Data) và chiến lược (Business).',
  '**Agentic BI**: tầm nhìn 2025–2030, **AI Agents** trở thành “chuyên viên phân tích tự hành”: tự theo dõi mục tiêu kinh doanh, lập kế hoạch phân tích, truy vấn kho dữ liệu, phát hiện xu hướng ẩn và chủ động gửi báo cáo đề xuất chiến lược mà không cần con người ra lệnh liên tục.',
]);
pb();

// ================= CHƯƠNG 9 =================
h1('Chương 9. Tích hợp dữ liệu đa mô hình và CSDL hiện đại');
h2('9.1 Polyglot Persistence');
bl([
  '**Polyglot Persistence**: áp dụng đồng thời nhiều công nghệ lưu trữ (SQL, NoSQL) trong cùng một kiến trúc để xử lý các dạng dữ liệu khác nhau. Triết lý: **“One size does not fit all”** — không có CSDL duy nhất tối ưu cho mọi tác vụ.',
]);
table(['Thành phần', 'Vai trò'], [
  ['**RDBMS (SQL)**', 'Dữ liệu giao dịch cốt lõi, đòi hỏi tính toàn vẹn tuyệt đối (**ACID**).'],
  ['**Document Store (NoSQL)**', 'Hồ sơ thực thể có cấu trúc thay đổi liên tục (**Schema-less**).'],
  ['**Key-Value Store**', 'Truy xuất tốc độ cao cho tầng bộ nhớ đệm (**Caching**) và phiên làm việc (**Session**).'],
], [4, 8.5]);
bl([
  '**Microservices Storage**: các tầng lưu trữ độc lập đứng sau từng dịch vụ, giao tiếp qua **API** tránh phụ thuộc lẫn nhau.',
  '**CAP Theorem**: chấp nhận **Eventual Consistency** ở các tầng NoSQL để ưu tiên tốc độ và tính sẵn sàng, nhưng đảm bảo **Strong Consistency** tại kho trung tâm.',
  '**Hybrid Schema Mapping**: dùng Data Pipelines trích xuất, “làm phẳng” các trường dữ liệu động từ NoSQL thành dạng **Tables** phục vụ **OLAP**.',
]);

h2('9.2 Knowledge Graphs, BFS và DFS');
bl([
  '**Knowledge Graph**: cấu trúc đồ thị gồm **Nodes (thực thể)** và **Edges (mối quan hệ)** biểu diễn và liên kết các thực thể rời rạc. Tư duy **Relationship-First**: quan hệ được lưu trực tiếp như một thực thể hạng nhất thay vì tính toán online qua lệnh **JOIN**; giúp máy tính hiểu ngữ cảnh (**Contextual Logic**).',
  '**Entity Disambiguation**: nhận diện và hợp nhất thực thể bị trùng lặp/viết sai định dạng giữa các hệ thống. **Semantic Labeling**: áp dụng mô hình **Ontology** định nghĩa mối quan hệ (ví dụ Customer [WORKS_AT] Organization). **Graph Traversal**: truy vấn sâu **N-degree** tìm liên kết ngầm (phát hiện gian lận tài chính, truy vết chuỗi cung ứng).',
]);
table(['Tiêu chí', '**BFS (Breadth-First Search)**', '**DFS (Depth-First Search)**'], [
  ['Cách duyệt', 'Duyệt **theo từng cấp** (level by level), mở rộng theo chiều **ngang**', 'Duyệt **sâu** đi theo một nhánh đến khi cụt đường rồi **quay lui**'],
  ['Cấu trúc dữ liệu', '**Queue – FIFO**', '**Stack – LIFO** hoặc đệ quy'],
  ['Ứng dụng trong Knowledge Graph', 'Tìm thực thể liên quan gần nhất; hệ thống gợi ý sản phẩm theo sản phẩm đã mua; **tìm đường đi ngắn nhất** giữa hai thực thể; đề xuất kết nối mới trong mạng xã hội; mở rộng truy vấn theo từng cấp', 'Khám phá quan hệ **sâu, nhiều tầng**; duyệt **ontology** tìm khái niệm con; xây cây phân cấp (**taxonomy**) từ dữ liệu thô; tìm chuỗi liên kết dài; thu thập toàn bộ thông tin trong một nhánh trước khi chuyển nhánh khác'],
], [2.5, 5.5, 5.5]);
formula([
  'Ví dụ slide (đồ thị A–G, xuất phát từ A): **BFS** → **A, B, D, G, E, F, C**; **DFS** (chọn theo bảng chữ cái) → **A, B, E, G, F, C, D**.',
]);

h2('9.3 Vector Indexing');
bl([
  '**Vector Embeddings**: chuỗi số thực biểu diễn dữ liệu phi cấu trúc (qua Deep Learning); thường có **768 đến 1536 chiều**; thực thể ngữ nghĩa tương đồng nằm gần nhau trong không gian; thay thế **Keyword Matching** bằng **Semantic Search**.',
  'Thách thức: quét khoảng cách trên hàng triệu vector nhiều chiều gây quá tải CPU (**Curse of Dimensionality**). Giải pháp **ANN (Approximate Nearest Neighbor)**: **HNSW** (đồ thị phân cấp mạng lưới “small world”, tốc độ mili-giây); **IVF (Inverted File Index)** (phân cụm không gian vector thành các **Voronoi cells** để thu hẹp phạm vi tìm kiếm — IVFFLAT thuộc nhóm này, là một **Vector Index**); **Quantization** (nén kích thước vector, ví dụ **Product Quantization – PQ**, đưa toàn bộ index vào RAM).',
  'Hệ thống truy vấn đa phương thức (**multimodal**) thường xử lý Text, Table, Image và dạng dữ liệu cần truy vấn theo quan hệ giữa các thực thể (**GraphRAG**) là **Graph**.',
]);

h2('9.4 Blockchain: dữ liệu On-Chain');
bl([
  '**On-chain data**: toàn bộ thông tin lịch sử giao dịch, số dư tài khoản và mã trạng thái thực thi của **Smart Contracts** ghi nhận vĩnh viễn trên mạng Blockchain. Dữ liệu thô minh bạch tuyệt đối nhưng tồn tại ở dạng **byte/hex (phi cấu trúc)** và phân tán trên hàng nghìn **Nodes**. Mục tiêu: chuyển sang **Relational Tables** để chạy thuật toán BI/Fintech.',
]);
table(['Bước Blockchain ETL', 'Nội dung'], [
  ['**Node Ingestion**', 'Kết nối liên tục với các node mạng (Ethereum/Bitcoin) qua giao thức **RPC** bắt các khối (Blocks) mới sinh.'],
  ['**Event Decoding**', 'Dùng tệp giao diện ứng dụng **ABI (Application Binary Interface)** dịch chuỗi **Hex** trong phần Logs thành tên hàm và tham số cụ thể (người gửi, người nhận, số tiền).'],
  ['**Data Normalization**', 'Chuyển đơn vị số nguyên lớn (18 chữ số thập phân của **Wei → Ether**) và đồng bộ **Timestamp** về chuẩn **UTC** của kho dữ liệu.'],
], [3.5, 9.5]);

h2('9.5 Immutable Audit Logs bằng Blockchain');
bl([
  'Bài toán: **DBA** có quyền tối cao có thể sửa/xóa **Audit Logs** để xóa dấu vết gian lận. Giải pháp: dùng sổ cái **Blockchain** như một bên thứ ba độc lập, không thể bị thao túng; đảm bảo tính **không thể phủ nhận (Non-repudiation)** và minh bạch tuyệt đối cho Metadata.',
  '**Cryptographic Hashing** (**SHA-256**): không lưu toàn bộ dữ liệu thô lên Blockchain mà băm thành chuỗi ký tự duy nhất đại diện. **Merkle Tree**: gom hàng nghìn mã băm nhật ký trong ngày thành **một mã băm gốc (Merkle Root Hash)**. **Anchoring**: ghi Root Hash lên mạng Blockchain qua **Smart Contract**; khi có tranh chấp chỉ cần băm lại dữ liệu hiện tại để đối chiếu.',
]);

h2('9.6 Federated Querying');
bl([
  '**Federated Querying**: viết **một** câu lệnh SQL nhưng đồng thời lấy và liên kết dữ liệu từ nhiều nền tảng (SQL, Graph, Blockchain) **không di chuyển dữ liệu thô**. Dữ liệu giữ tại nguồn, chỉ lấy kết quả khi cần (**Query Virtualization**) — tiết kiệm chi phí lưu trữ và đảm bảo truy cập real-time.',
  '**Connector/Wrapper Engines**: **Presto, Trino, BigQuery Omni** làm trung gian, tự dịch SQL sang ngôn ngữ nguồn (ví dụ **Cypher** cho Graph, **RPC** cho Blockchain). **Global Catalog**: từ điển dữ liệu chung biết cột nào nằm ở cơ sở dữ liệu nào. **Predicate Pushdown**: đẩy điều kiện lọc **WHERE** xuống thẳng cơ sở dữ liệu nguồn, chỉ trả về tập kết quả nhỏ qua đường truyền mạng.',
]);
h3('Tối ưu truy vấn đa mô hình');
bl([
  'Thách thức: **Optimizer** dễ quyết định sai do thiếu số liệu thống kê (**Statistics**) về kích thước và chỉ mục của hệ thống đối tác → nghẽn băng thông mạng (**Network Bottleneck**) hoặc tràn RAM máy chủ trung tâm. Mục tiêu: xây **Execution Plan** thông minh, điều phối thứ tự lấy dữ liệu.',
  '**Cost-Based Optimizer**: phân tích chi phí dựa trên hai tham số: chi phí tính toán tại chỗ (**CPU/I-O**) và chi phí vận chuyển dữ liệu qua mạng. **Hybrid Join Strategies**: quyết định kéo bảng nhỏ sang máy chứa bảng lớn (**Broadcast Join**) hay băm cả hai bảng (**Hash Join**) dựa trên dung lượng thực tế. **Query Hints**: chủ động viết chỉ thị điều hướng, ép hệ thống thực thi theo ý đồ khi thiếu thống kê.',
]);

h2('9.7 High Availability & Disaster Recovery (HA/DR)');
bl([
  'Tích hợp quá nhiều mô hình (SQL + NoSQL + Graph + Blockchain) làm xác suất lỗi phần cứng/sập một mắt xích tăng lên; một thành phần sập có thể làm tê liệt cả chuỗi cung ứng dữ liệu.',
]);
table(['Chỉ số SLA', 'Ý nghĩa'], [
  ['**RTO** (Recovery Time Objective)', 'Thời gian **tối đa chấp nhận** để khôi phục hệ thống hoạt động trở lại sau sự cố.'],
  ['**RPO** (Recovery Point Objective)', 'Lượng dữ liệu **tối đa chấp nhận bị mất** (tính bằng phút/giờ) khi xảy ra sự cố.'],
], [4.5, 8.5]);
bl([
  '**Multi-Region Replication**: sao chép liên tục từ **Primary Region** sang **Secondary/DR Region**. **Automated Failover**: bộ giám sát sức khỏe (**Health Check**) — nếu vùng chính mất tín hiệu quá **30 giây**, hệ thống tự động bẻ hướng truy cập của người dùng sang vùng dự phòng. **Asynchronous Sync**: các CSDL NoSQL/Graph thường dùng nhân bản **bất đồng bộ** xuyên quốc gia để không làm giảm tốc độ ghi dữ liệu.',
]);
pb();

// ================= CÂU HỎI TỦ & TỔNG HỢP =================
h1('Tổng hợp: câu hỏi tủ (đề năm ngoái) và bảng so sánh nhanh');
h2('A. Các “đáp án một dòng” hay ra trong đề');
table(['Hỏi', 'Đáp'], [
  ['**Firebolt**', 'Tập trung vào **tốc độ truy vấn cực nhanh** cho ứng dụng phân tích thời gian thực.'],
  ['Cơ chế tránh tính toán lại kết quả cũ (chi phí MDW)', '**Caching**.'],
  ['**Data Catalog**', 'Thư viện chứa thông tin và vị trí của mọi nguồn dữ liệu trong công ty.'],
  ['Mục tiêu **Data Fabric**', 'Kết nối & ảo hóa các nguồn dữ liệu rời rạc.'],
  ['**Bucket Policies**', 'Quy định quyền truy cập cho toàn bộ Data Container từ bên ngoài.'],
  ['Kích thước **Micro-partition**', '**50MB – 500MB** dữ liệu nén.'],
  ['**Clustering Key** chọn dựa trên', '**Column (cột)**.'],
  ['**Accumulating Snapshot** phù hợp cho', 'Tối ưu hóa chuỗi cung ứng và vận hành.'],
  ['**Bridge Table**', 'Giải quyết quan hệ **nhiều-nhiều (M-M)**.'],
  ['Fact ↔ Dimension kết hợp bằng', '**Join**.'],
  ['**Singular Test** (dbt)', 'Viết câu SQL riêng biệt kiểm tra tình huống nghiệp vụ đặc thù.'],
  ['Jinja + Dynamic SQL giảm code', '**hơn 50%** số dòng code dư thừa.'],
  ['**Apache Airflow**', 'Giám sát **tác vụ đang chạy** (Task-centric).'],
  ['**Storage Mirroring**', 'Nhận bản sao dữ liệu từ hệ thống nguồn và liên tục cập nhật theo sự thay đổi.'],
  ['**Entropy** 6 Good / 4 Bad', '≈ **0,971 bit**.'],
  ['Min-Max: 5–10, v = 8', '**0,6**.'],
  ['Equal-width 3 nhóm, 100–700 triệu', 'Nhóm thấp nhất **100 – 300 triệu**.'],
  ['Trong Info_A(D): v là', 'Số giá trị khác nhau của **thuộc tính**; còn **m** (trong Info(D)) là số **lớp**.'],
  ['**Z-Score** hữu ích khi', 'Nhiều ngoại lai **hoặc** không biết trước Min-Max.'],
  ['**Decimal Scaling** dựa trên', '**Giá trị tuyệt đối lớn nhất** của thuộc tính.'],
  ['**Equal-frequency Binning** tốt cho', 'Dữ liệu **bị lệch**.'],
  ['Mục đích **Discretization**', 'Giảm số lượng giá trị và hỗ trợ các thuật toán.'],
  ['**PCA** giữ lại tối đa', '**Phương sai** của dữ liệu.'],
  ['SMA k=3: 75,79,38,80,82,85 ngày 4', '**66** USD.'],
  ['Apriori, n = 6 item đơn phổ biến → itemset 2 phần tử', 'Xấp xỉ n²/2 = **18** (theo slide).'],
  ['Leverage / Sup / Conf của {c}⇒{d,e}', '**0,047 / 0,375 / 0,429**.'],
  ['Thứ tự FP-Tree (8 giao dịch, minsup 4)', '**c, e, d, b**.'],
  ['Ngưỡng **minsup** thông thường', '**1%** (minconf 80%).'],
  ['PageRank: Page 2 / Page 1 vòng đầu', '**1,2125 / 0,3625**; ε = **0,0001**; d = **0,85**; số trang p trỏ tới = **C(p)**.'],
  ['CPT dự đoán ⟨D, C⟩', 'Phần tử **B**.'],
  ['CPT+ (x = AB)', '**FSC** (Frequent Subsequence Compression).'],
  ['**BFS** dùng cho', 'Tìm **đường đi ngắn nhất** giữa hai thực thể.'],
  ['**DFS** dùng cho', 'Duyệt **ontology** tìm khái niệm con.'],
  ['Dữ liệu thô trên Blockchain', '**byte/hex (phi cấu trúc)**.'],
  ['**Looker**', 'Một ví dụ của **BI Tool**.'],
  ['**IVFFLAT**', 'Liên quan đến **Vector Index**.'],
  ['**CLM**', 'Bảo mật **cột** dữ liệu.'],
  ['**AI Act**', '**4 mức** rủi ro.'],
  ['Hệ thống truy vấn multimodal cần quan hệ giữa thực thể (GraphRAG)', '**Graph**.'],
], [5, 8]);

h2('B. Bảng so sánh các cặp dễ nhầm');
table(['Dễ nhầm', 'Phân biệt'], [
  ['**ETL** vs **ELT**', 'Transform trước khi nạp vs nạp thô rồi transform ngay trong kho (Cloud).'],
  ['**Log-based** vs **Query-based CDC**', 'Đọc Redo log (nhẹ, real-time, bắt được xóa) vs quét bảng (nặng, trễ, khó thấy Hard Delete).'],
  ['**Lambda** vs **Kappa**', '2 luồng/2 codebase vs 1 luồng Streaming/1 codebase.'],
  ['**Airflow** vs **Dagster**', 'Task-centric vs Asset-centric.'],
  ['**Monitoring** vs **Observability**', 'Báo lỗi vs giải thích vì sao và ở đâu.'],
  ['**Data Fabric** vs **Data Mesh** vs **Lakehouse**', 'Kết nối/ảo hóa (IT) vs tự chủ theo domain (con người) vs hợp nhất hạ tầng (hiệu năng).'],
  ['**Transaction** vs **Periodic** vs **Accumulating** Fact', 'Từng sự kiện vs ảnh chụp định kỳ vs theo dõi tiến độ nhiều giai đoạn.'],
  ['**SCD Type 1** vs **Type 2**', 'Ghi đè vs thêm dòng mới (Start/End/Is_Current).'],
  ['**Junk** vs **Degenerate** vs **Mini** vs **Role-Playing**', 'Gom flag vào 1 bảng | khóa nghiệp vụ nằm trong Fact | tách thuộc tính đổi nhanh | 1 Dimension nhiều vai trò.'],
  ['**ID3** vs **C4.5**', 'Information Gain, chỉ rời rạc, không Null/pruning vs Gain Ratio, cả liên tục, có Post-pruning.'],
  ['**K-Means** vs **K-Medoids**', 'Mean, nhanh, nhạy nhiễu vs Medoid (điểm thật), chống nhiễu, chậm.'],
  ['**Hierarchical** vs **Grid-based**', 'Dendrogram, chậm vs lưới ô, siêu nhanh.'],
  ['**Data Drift** vs **Concept Drift**', 'Phân phối đầu vào đổi vs quan hệ đầu vào-nhãn đổi.'],
  ['**RLS** vs **CLM**', 'Bảo mật dòng vs bảo mật cột (che dữ liệu PII).'],
  ['**Pre-/In-/Post-processing** (Bias)', 'Resampling/trọng số vs Fairness constraint trong Loss vs chỉnh Threshold.'],
  ['**RTO** vs **RPO**', 'Thời gian khôi phục tối đa vs lượng dữ liệu mất tối đa.'],
  ['**Business Glossary** vs **Technical Metadata**', 'Do Governance Layer định nghĩa khái niệm kinh doanh vs do Data Engineer quản lý kiểu dữ liệu/schema/Freshness/Owner.'],
  ['**Epsilon thấp** vs **cao**', 'Bảo mật tối đa nhưng kém chính xác vs báo cáo tốt nhưng rủi ro danh tính.'],
], [4.5, 8.5]);
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [new TextRun({ text: '— Hết — Chúc bạn ôn tập tốt!', italics: true, font: FONT, color: '555555' })] }));

// ---------- DOCUMENT ----------
const doc = new Document({
  creator: 'Nha kho du lieu study notes',
  title: 'Tài liệu lý thuyết ôn tập Nhà kho dữ liệu và tích hợp',
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
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Nhà kho dữ liệu – Lý thuyết ôn tập   |   Trang ', size: 18, font: FONT, color: '777777' }), new TextRun({ children: [PageNumber.CURRENT], size: 18, font: FONT, color: '777777' })] })] }) },
    children: C,
  }],
});

const outDir = path.join(__dirname, '..', 'data', 'Nhà kho');
Packer.toBuffer(doc).then((buf) => {
  const out = path.join(outDir, 'NhaKho_Ly_thuyet_on_tap.docx');
  fs.writeFileSync(out, buf);
  console.log('written', out, buf.length);
});
