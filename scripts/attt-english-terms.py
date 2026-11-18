"""Đổi thuật ngữ chuyên môn tiếng Việt -> tiếng Anh trong data/ATTT/*.json (idempotent).
1) Dạng "thuật ngữ VN (EN)"  -> chỉ giữ EN.
2) Đáp án nguyên là "thuật ngữ VN" trong bảng GLOSSARY -> EN.
3) Cụm từ ít nhập nhằng trong câu hỏi/giải thích -> EN.
Chạy: python scripts/attt-english-terms.py"""
import json, os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR = os.path.join(ROOT, 'data', 'ATTT')

# (VN, EN) — dùng cho cả dạng "VN (EN)", đáp án nguyên văn và thay trong câu
TERMS = [
 ('trách nhiệm giải trình', 'accountability'), ('tính chống chối bỏ', 'nonrepudiation'),
 ('tính bảo mật', 'confidentiality'), ('tính toàn vẹn', 'integrity'), ('tính sẵn sàng', 'availability'),
 ('biện pháp đối phó', 'countermeasure'), ('mối đe dọa', 'threat'), ('lỗ hổng', 'vulnerability'),
 ('điểm yếu', 'vulnerability'), ('rủi ro còn lại', 'residual risk'), ('rủi ro', 'risk'), ('tài sản', 'asset'),
 ('đặc quyền tối thiểu', 'least privilege'), ('phân tách nhiệm vụ', 'separation of duties'),
 ('cần-để-biết', 'need to know'), ('luân chuyển công việc', 'job rotation'), ('kỳ nghỉ bắt buộc', 'mandatory vacation'),
 ('kiểm soát truy cập vật lý', 'physical access control'), ('kiểm soát truy cập logic', 'logical access control'),
 ('kiểm soát truy cập', 'access control'), ('kiểm soát thay đổi', 'change control'), ('kiểm soát cấu hình', 'configuration control'),
 ('thỏa thuận mức dịch vụ', 'SLA'), ('chính sách sử dụng chấp nhận được', 'AUP'),
 ('cấu hình cơ sở', 'baseline'), ('thiết lập cơ sở', 'baseline'), ('kế hoạch hoàn tác', 'back-out plan'),
 ('đánh giá chéo', 'peer review'), ('kiểm thử xâm nhập', 'penetration testing'), ('kiểm thử hộp đen', 'black-box testing'),
 ('kiểm thử hộp trắng', 'white-box testing'), ('kiểm thử hộp xám', 'gray-box testing'), ('kiểm thử', 'testing'),
 ('kiểm toán viên', 'auditor'), ('kiểm toán', 'audit'),
 ('sao lưu toàn bộ', 'full backup'), ('sao lưu tăng dần', 'incremental backup'), ('sao lưu khác biệt', 'differential backup'),
 ('sao lưu', 'backup'), ('đám mây riêng', 'private cloud'), ('đám mây công cộng', 'public cloud'),
 ('đám mây cộng đồng', 'community cloud'), ('đám mây lai', 'hybrid cloud'), ('điện toán đám mây', 'cloud computing'),
 ('đám mây', 'cloud'), ('tường lửa', 'firewall'), ('bộ định tuyến', 'router'), ('phần mềm độc hại', 'malware'),
 ('mã độc', 'malware'), ('phần mềm gián điệp', 'spyware'), ('sâu máy tính', 'worm'), ('ngựa thành Troy', 'Trojan horse'),
 ('tấn công từ chối dịch vụ phân tán', 'DDoS attack'), ('tấn công từ chối dịch vụ', 'DoS attack'),
 ('tấn công lừa đảo', 'phishing attack'), ('lừa đảo', 'phishing'), ('kỹ thuật xã hội', 'social engineering'),
 ('hacker mũ trắng', 'white-hat hacker'), ('hacker mũ đen', 'black-hat hacker'), ('hacker mũ xám', 'gray-hat hacker'),
 ('chữ ký điện tử', 'digital signature'), ('chữ ký số', 'digital signature'), ('chứng thư số', 'digital certificate'),
 ('khóa công khai', 'public key'), ('khóa riêng', 'private key'), ('khóa riêng tư', 'private key'),
 ('mã hóa đối xứng', 'symmetric encryption'), ('mã hóa bất đối xứng', 'asymmetric encryption'),
 ('hàm băm', 'hash function'), ('văn bản mã hóa', 'ciphertext'), ('văn bản thuần', 'plaintext'),
 ('thẻ thông minh', 'smart card'), ('sinh trắc học', 'biometrics'), ('mật khẩu', 'password'),
 ('xác thực hai yếu tố', 'two-factor authentication'),
 ('quyền riêng tư', 'privacy'), ('hệ thống phát hiện xâm nhập', 'IDS'), ('phân tích tác động kinh doanh', 'BIA'),
 ('kế hoạch duy trì hoạt động kinh doanh', 'BCP'), ('kế hoạch khôi phục sau thảm họa', 'DRP'),
]
# chỉ dùng cho dạng "VN (EN)" (nghĩa nhập nhằng nếu thay thẳng trong câu)
PAREN_ONLY = [('xác thực', 'authentication'), ('nhận dạng', 'identification'), ('giám sát', 'monitor'),
              ('chuyển giao', 'transfer'), ('chấp nhận', 'accept'), ('khai thác', 'exploit'), ('tăng cường', 'enhance'),
              ('giảm thiểu', 'reduce'), ('ủy quyền', 'authorization'), ('bảo mật', 'confidentiality'),
              ('toàn vẹn', 'integrity'), ('sẵn sàng', 'availability'), ('chính sách', 'policy'),
              ('tiêu chuẩn', 'standard'), ('hướng dẫn', 'guideline'), ('quy trình', 'procedure')]
# Đáp án nguyên là một thuật ngữ đơn (viết hoa chữ đầu) -> EN
EXACT = {
 'thẻ thông minh và mã số định danh cá nhân (pin)': 'Smart card và PIN', 'sao lưu toàn bộ (full)': 'Full backup',
 'đạo luật bảo hiểm y tế khả chuyển và hipaa': 'HIPAA',
 'knowledge': 'Something you know', 'possession': 'Something you have', 'inherence': 'Something you are',
 'location': 'Somewhere you are', 'action': 'Something you do',
 'bảo mật': 'Confidentiality', 'toàn vẹn': 'Integrity', 'sẵn sàng': 'Availability', 'ủy quyền': 'Authorization',
 'chính sách': 'Policy', 'tiêu chuẩn': 'Standard', 'hướng dẫn': 'Guideline', 'quy trình': 'Procedure',
 'giảm thiểu': 'Reduce', 'tránh': 'Avoid', 'chặn bắt': 'Interception', 'gián đoạn': 'Interruption',
 'sửa đổi': 'Modification', 'bịa đặt': 'Fabrication', 'nghe lén': 'Eavesdropping', 'kiểm toán': 'Audit',
 'giám sát': 'Monitor', 'giải trình': 'Accountability', 'trách nhiệm giải trình': 'Accountability', 'xác thực': 'Authentication', 'nhận dạng': 'Identification', 'chuyển giao': 'Transfer', 'chấp nhận': 'Accept', 'cải thiện': 'Improve', 'tri thức': 'Something you know', 'quyền sở hữu': 'Something you have',
 'đặc điểm': 'Something you are', 'vị trí': 'Somewhere you are', 'hành động': 'Something you do',
 'hộp đen': 'Black-box', 'hộp trắng': 'White-box', 'hộp xám': 'Gray-box',
}
VI = r'[^\W\d_]'  # chữ cái unicode

def cap(src, en):
    return en if en.isupper() or not src[:1].isupper() else en[:1].upper() + en[1:]

TERMS.sort(key=lambda t: -len(t[0]))
P_PAREN = [(re.compile(r'(?<!\w)' + re.escape(vn) + r'\s*\(([A-Za-z][A-Za-z0-9 /&\-\.\'+]*)\)', re.I), vn) for vn, _ in sorted(TERMS + PAREN_ONLY, key=lambda t: -len(t[0]))]
P_PLAIN = [(re.compile(r'(?<!\w)' + re.escape(vn) + r'(?!\w)', re.I), en) for vn, en in TERMS]
OPT_PAREN = re.compile(r'^(?:Tính |Giai đoạn |Kiểm thử |Loại )?[^()]*?\s*\(([A-Za-z][A-Za-z0-9 /&\-\.\'+]*)\)\s*$')

def conv_option(s):
    key = re.sub(r'\s*\((thứ|nơi)[^)]*\)', '', re.sub(r'^Tính ', '', s.strip().rstrip('.'))).lower()
    if key in EXACT: return EXACT[key]
    pre = s.split('(')[0].strip()
    if '(' in s and re.fullmatch(r'[A-Za-z0-9 \-/]+', pre) and re.search(r'[^\x00-\x7f]', s.split('(', 1)[1]):
        return pre
    m = OPT_PAREN.match(s)
    if m:
        vn, en = s.split('(')[0].strip(), m.group(1).strip()
        if re.fullmatch(r'[A-Z][A-Z0-9+\- ]{1,12}', en) or len(vn.split()) <= 8:
            return en
    return conv_text(s)

def conv_text(s):
    for pat, _ in P_PAREN:
        s = pat.sub(lambda m: m.group(1), s)
    for pat, en in P_PLAIN:
        s = pat.sub(lambda m: cap(m.group(0), en), s)
    s = re.sub(r'(?i)\b([A-Za-z][A-Za-z\- ]{2,40}?) \(\1\)', r'\1', s)   # "Risk (Risk)" -> "Risk"
    return s

def conv_topic_name(s):
    return conv_text(s)

for f in sorted(glob.glob(os.path.join(DIR, 'ATTT_*.json'))):
    d = json.load(open(f, encoding='utf8'))
    for t in d['topics']:
        t['topicName'] = conv_topic_name(t['topicName'])
        for q in t['questions']:
            q['question'] = conv_text(q['question'])
            q['options'] = {k: conv_option(v) for k, v in q['options'].items()}
            if q.get('explanation'): q['explanation'] = conv_text(q['explanation'])
    json.dump(d, open(f, 'w', encoding='utf8'), ensure_ascii=False, indent=2)
    print('ok', os.path.basename(f))
