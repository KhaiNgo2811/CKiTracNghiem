# App Ôn Tập Trắc Nghiệm DBMS (Local, kiểu Azota)

App chạy hoàn toàn offline trên trình duyệt, không cần backend, không cần đăng nhập.

## Cấu trúc thư mục

```
/data-raw/           → file .txt gốc (input cho script parse)
/data/subjects.json  → danh sách môn (id, tên, biIcon, folder)
/data/<Môn>/          → dữ liệu từng môn: C*.json, HOT/TO/Testbank.json, manifest.json
    DBMS/  Nhà kho/  PTDLNC/
/assets/img/          → ảnh công thức/đồ thị/bảng (trường `images` của câu hỏi)
/data-raw/archives/   → các file zip cập nhật đã giải nén (lưu trữ)
/vendor/              → bootstrap.min.css, bootstrap.bundle.min.js, chart.js (offline)
/assets/css/style.css → CSS tuỳ chỉnh
/assets/js/
    app.js            → điều hướng chính (SPA)
    storage.js        → quản lý localStorage
    quiz.js           → logic làm bài, chấm điểm
    dashboard.js      → render dashboard & bảng câu sai
    charts.js         → khởi tạo Chart.js
scripts/parse-data.js → script convert txt → json
index.html            → entry point
```

## Cách chạy

### 1. Parse dữ liệu (nếu bạn thêm/sửa file .txt trong `/data-raw`)

```bash
node scripts/parse-data.js
```

Script sẽ đọc toàn bộ `.txt` trong `/data-raw`, sinh ra `C*.json` + `manifest.json` trong `/data`.

Format file `.txt` chuẩn:
```
Chủ đề 1: Tên chủ đề
Câu 1: Nội dung câu hỏi?
A. Đáp án A
B. Đáp án B
C. Đáp án đúng    <- có dấu cách/khoảng trắng thừa cuối dòng để đánh dấu đáp án đúng
D. Đáp án D
```

### 2. Mở app

Vì app dùng `fetch()` để load file JSON trong `/data`, bạn **không thể mở trực tiếp `index.html` bằng cách double-click`** (một số trình duyệt sẽ chặn CORS với `file://`). Hãy chạy 1 static server đơn giản:

```bash
npx serve .
# hoặc
python -m http.server 8080
```

Sau đó mở `http://localhost:3000` (hoặc `:8080`) trên trình duyệt.

### 3. Thêm chương mới sau này

1. Thêm file `.txt` đúng format vào `/data-raw` (tên file dạng `Cx_TenChuong.txt`).
2. Chạy lại `node scripts/parse-data.js`.
3. Reload trang — chương mới sẽ tự xuất hiện trên dashboard (không cần sửa code).

## Tính năng

- **Dashboard**: danh sách chương dạng card (số câu, % đã làm, điểm cao nhất), biểu đồ đúng/sai theo chương (bar chart), tỉ lệ đúng tổng thể (donut chart), bảng câu hỏi hay sai, nút luyện tập riêng câu sai, nút reset toàn bộ tiến độ.
- **Trang chương**: chọn làm toàn bộ chương hoặc từng chủ đề, cấu hình số câu / xáo trộn câu & đáp án / kiểu hiển thị (từng câu hoặc cuộn toàn bộ).
- **Trang làm bài**: progress bar, đồng hồ đếm thời gian, xác nhận trước khi nộp nếu còn câu chưa trả lời.
- **Trang kết quả**: điểm số, thời gian, chi tiết từng câu (đúng/sai highlight màu).
- **Lưu trữ**: toàn bộ lịch sử làm bài + thống kê sai + điểm cao nhất lưu trong `localStorage`. Có nút xuất/nhập dữ liệu tiến độ ra file JSON để backup/restore.

## Lưu ý về dữ liệu hiện tại

- `C1.json`, `C2.json`, `C4.json`, `C8.json`: dữ liệu thật đã parse.
- `C3.json`, `C5.json`, `C7.json`: hiện chỉ là dữ liệu mẫu placeholder (1 câu) — cần bổ sung file `.txt` thật vào `/data-raw` rồi chạy lại script để có dữ liệu đầy đủ.
- `C6.json`: có 20 câu đầy đủ đáp án đúng + 10 câu (Q21–Q30) hiện thiếu nội dung đáp án/đáp án đúng trong file gốc (`options` rỗng) — app sẽ tự động **bỏ qua các câu không hợp lệ này** khi tạo đề (xem `Quiz.isValidQuestion` trong `quiz.js`), nên không gây lỗi, nhưng bạn nên bổ sung lại file `.txt` gốc cho đầy đủ 30 câu.
