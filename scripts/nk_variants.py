# -*- coding: utf-8 -*-
"""Biến thể (đổi số / đổi cách hỏi) của câu hỏi tủ Nhà kho. Mỗi item: (câu hỏi, đáp án đúng, [3 đáp án sai], giải thích)."""
import math


def fmt(x, d=3):
    return f'{x:.{d}f}'.replace('.', ',')


def nums(c, d=3, extra=()):
    """đáp án số: trả về (đúng, [3 sai khác nhau])"""
    cands = list(extra) + [c * 2, c / 2, c + 0.1, c - 0.1, c + 0.25, c * 1.5, c + 1, abs(c - 0.5)]
    out, seen = [], {fmt(c, d)}
    for v in cands:
        s = fmt(v, d)
        if s not in seen and v >= 0:
            seen.add(s)
            out.append(s)
        if len(out) == 3:
            break
    return fmt(c, d), out


def H(*p):
    return -sum(x * math.log2(x) for x in p if x > 0)


T = []  # (tên topic, [items])

# ---------- 1. Entropy / Info ----------
it = []


def ent(good, bad):
    n = good + bad
    e = H(good / n, bad / n)
    c, w = nums(e, 3, extra=[good / n, 1.0, 0.5])
    it.append((f'Dataset D có {n} mẫu thuộc 2 lớp: {good} mẫu Good và {bad} mẫu Bad. Entropy Info(D) xấp xỉ bao nhiêu bit?',
               c + ' bit', [x + ' bit' for x in w],
               f'Info(D) = −({good}/{n}·log2({good}/{n}) + {bad}/{n}·log2({bad}/{n})) ≈ **{c} bit**.'))


for g, b in [(5, 5), (8, 2), (7, 3), (9, 1), (12, 8), (3, 9)]:
    ent(g, b)
it.append(('Dataset D có 10 mẫu, cả 10 đều thuộc lớp Good. Info(D) bằng bao nhiêu?', '0 bit', ['1 bit', '0,5 bit', '10 bit'],
           'Tập thuần nhất (một lớp p = 1) → Info(D) = −1·log2(1) = **0** (không còn bất định).'))
e3 = H(.4, .4, .2)
c, w = nums(e3, 3, extra=[1.0, 0.971, 2.0])
it.append(('Dataset D có 10 mẫu thuộc 3 lớp với số mẫu lần lượt 4, 4 và 2. Info(D) xấp xỉ bao nhiêu bit?', c + ' bit', [x + ' bit' for x in w],
           f'Info(D) = −(0,4·log2 0,4 + 0,4·log2 0,4 + 0,2·log2 0,2) ≈ **{c} bit** (m = 3 lớp).'))
d1 = 0.6 * H(2 / 6, 4 / 6)
c, w = nums(d1, 3, extra=[0.971, 0.918, 0.4])
it.append(('D có 10 mẫu (6 Good, 4 Bad). Chia theo thuộc tính A thành 2 phân vùng: D1 gồm 4 mẫu toàn Good; D2 gồm 6 mẫu (2 Good, 4 Bad). Info_A(D) xấp xỉ bao nhiêu?', c, w,
           f'Info_A(D) = (4/10)·Info(D1) + (6/10)·Info(D2) = 0,4·0 + 0,6·0,918 ≈ **{c}** (v = 2 phân vùng).'))
gain = H(.6, .4) - d1
c, w = nums(gain, 3, extra=[0.971, d1, 0.5])
it.append(('Với D (6 Good, 4 Bad; Info(D) ≈ 0,971) và Info_A(D) ≈ 0,551 ở câu trên, Information Gain của thuộc tính A xấp xỉ bao nhiêu?', c, w,
           f'Gain(A) = Info(D) − Info_A(D) = 0,971 − 0,551 ≈ **{c}**.'))
it.append(('Thuộc tính A có Gain = 0,42; thuộc tính B có Gain = 0,15; thuộc tính C có Gain = 0,30. ID3 sẽ chọn thuộc tính nào để chia nút?',
           'A (Gain lớn nhất)', ['B (Gain nhỏ nhất)', 'C (Gain ở mức trung bình)', 'Không chọn thuộc tính nào'],
           'ID3 chọn thuộc tính có **Information Gain lớn nhất**.'))
it.append(('Với 2 lớp, Entropy đạt GIÁ TRỊ LỚN NHẤT khi tỉ lệ hai lớp là:', '50% – 50%', ['90% – 10%', '100% – 0%', '70% – 30%'],
           'Hai lớp cân bằng (p = 0,5) → Info(D) = 1 bit (lớn nhất). Một lớp chiếm 100% → 0 bit.'))
it.append(('Trong Info_A(D), nếu thuộc tính A có 5 giá trị khác nhau thì v bằng bao nhiêu?', '5', ['2', '1', 'Bằng số lớp m'],
           '**v** = số giá trị khác nhau của A = số phân vùng D1…Dv. Số lớp là **m** (trong Info(D)).'))
it.append(('Trong Info(D), nếu biến mục tiêu có 3 nhãn (Low, Medium, High) thì m bằng bao nhiêu?', '3', ['2', 'Bằng số giá trị của thuộc tính A', 'Bằng số bản ghi'],
           '**m** = số lượng lớp = 3.'))
T.append(('Biến thể: Entropy, Info_A(D) & Information Gain (câu 16, 19, 20)', it))

# ---------- 2. Chuẩn hóa & Binning ----------
it = []


def mm(lo, hi, v, a=0, b=1):
    r = (v - lo) / (hi - lo) * (b - a) + a
    c, w = nums(r, 2, extra=[v / hi, (v - lo) / hi, (hi - v) / (hi - lo)])
    rng = '[0, 1]' if (a, b) == (0, 1) else f'[{a}, {b}]'
    tail = f'×{b - a} + {a}' if (a, b) != (0, 1) else ''
    it.append((f'Thu nhập thấp nhất là {lo} triệu, cao nhất là {hi} triệu. Thu nhập {v} triệu sau khi chuẩn hóa Min-Max về {rng} có giá trị là bao nhiêu?', c, w,
               f"v' = (v − min)/(max − min){'×(new_max − new_min) + new_min' if tail else ''} = ({v} − {lo})/({hi} − {lo}){tail} = **{c}**."))


mm(5, 10, 6.5)
mm(5, 10, 9)
mm(20, 100, 60)
mm(0, 50, 10)
mm(5, 10, 8, 0, 10)


def zs(mu, sd, v):
    z = (v - mu) / sd
    c, w = nums(abs(z), 2, extra=[(v - mu) * sd, v / sd, abs(z) + 1])
    if z < 0:
        c = '-' + c
        w = ['-' + x for x in w]
    it.append((f'Điểm trung bình của lớp là μ = {mu}, độ lệch chuẩn σ = {sd}. Với điểm v = {v}, giá trị Z-Score là bao nhiêu?', c, w,
               f'Z = (v − μ)/σ = ({v} − {mu})/{sd} = **{c}**.'))


zs(50, 10, 65)
zs(70, 5, 60)
zs(100, 20, 100)


def ds(vmax, v):
    j = len(str(abs(vmax)))
    c = str(v / 10 ** j).replace('.', ',')
    wr = [str(v / 10 ** (j - 1)).replace('.', ','), str(v / 10 ** (j + 1)).replace('.', ','), str(v / 10 ** (j + 2)).replace('.', ',')]
    wr = [x for x in dict.fromkeys(wr) if x != c][:3]
    it.append((f'Giá trị tuyệt đối lớn nhất của thuộc tính là {abs(vmax)}. Dùng Decimal Scaling, giá trị {v} được chuẩn hóa thành:', c, wr,
               f'Chọn j nhỏ nhất sao cho max|v′| < 1 → j = {j} (vì 10^{j} > {abs(vmax)}). v′ = {v}/10^{j} = **{c}**.'))


ds(986, -345)
ds(4521, 1234)
ds(75, 30)
it.append(('Cột lương có vài giá trị ngoại lai rất lớn (outliers). Phương pháp chuẩn hóa nào phù hợp hơn Min-Max?', 'Z-Score Normalization',
           ['Decimal Scaling', 'Equal-width Binning', 'PCA'],
           'Min-Max bị outlier kéo lệch toàn bộ thang. **Z-Score** (dựa trên mean/std) phù hợp khi có ngoại lai hoặc không biết trước min-max.'))
it.append(('Phương pháp chuẩn hóa nào dựa trên giá trị tuyệt đối lớn nhất của thuộc tính (chia cho 10^j)?', 'Decimal Scaling',
           ['Min-Max', 'Z-Score', 'Equal-frequency Binning'], '**Decimal Scaling**: v′ = v / 10^j với j nhỏ nhất để max|v′| < 1.'))


def ew(lo, hi, k, which):
    wd = (hi - lo) / k
    a, b = lo + (which - 1) * wd, lo + which * wd
    pos = {1: 'thấp nhất', k: 'cao nhất'}.get(which, f'thứ {which}')
    ans = f'Từ {int(a)} đến {int(b)}'
    cands = [f'Từ {int(lo)} đến {int(lo + wd * 2)}', f'Từ {int(a + wd / 2)} đến {int(b + wd / 2)}', f'Từ {int(a - wd)} đến {int(a)}',
             f'Từ {int(b)} đến {int(b + wd)}', f'Từ {int(lo)} đến {int(hi)}', f'Từ {int(lo)} đến {int(lo + wd)}']
    wrongs = [x for x in dict.fromkeys(cands) if x != ans][:3]
    it.append((f'Chia hạn mức từ {int(lo)} đến {int(hi)} triệu thành {k} nhóm theo Equal-width Binning. Nhóm {pos} nằm trong khoảng nào?', ans, wrongs,
               f'Width = ({int(hi)} − {int(lo)})/{k} = {int(wd)}. Nhóm {pos}: **{int(a)}–{int(b)}**.'))


ew(100, 700, 3, 3)
ew(0, 100, 4, 2)
ew(100, 500, 4, 4)
ew(200, 800, 3, 2)
it.append(('Có 12 giá trị đã sắp xếp, chia thành 3 bin theo Equal-frequency Binning. Mỗi bin có bao nhiêu giá trị?', '4 giá trị',
           ['3 giá trị', '12 giá trị', 'Tùy khoảng giá trị của từng bin'],
           'Equal-frequency: mỗi bin chứa **số lượng bằng nhau** = 12/3 = 4 (độ rộng khoảng có thể khác nhau).'))
it.append(('Dữ liệu bị lệch (skewed) nặng. Binning nào cho các bin cân bằng hơn về số lượng phần tử?', 'Equal-frequency Binning',
           ['Equal-width Binning', 'Min-Max', 'Decimal Scaling'],
           'Equal-width trên dữ liệu lệch dễ dồn hầu hết giá trị vào 1–2 bin; **Equal-frequency** chia theo số lượng nên cân bằng.'))
it.append(('Mục đích chính của Discretization (rời rạc hóa) là:', 'Giảm số lượng giá trị liên tục thành vài khoảng/nhãn để dễ phân tích và hỗ trợ các thuật toán',
           ['Tăng số chiều của dữ liệu', 'Đưa dữ liệu về phân phối chuẩn', 'Loại bỏ toàn bộ giá trị Null'],
           'Discretization biến thuộc tính liên tục → các khoảng rời rạc, giảm số lượng giá trị.'))
it.append(('PCA giữ lại tối đa đại lượng nào của dữ liệu khi giảm chiều?', 'Phương sai (variance)',
           ['Số lượng bản ghi', 'Số lượng lớp', 'Giá trị trung bình'], '**PCA** tìm các thành phần chính giữ **phương sai lớn nhất**.'))
T.append(('Biến thể: Chuẩn hóa & Binning (câu 17, 18, 21–25)', it))

# ---------- 3. SMA ----------
it = []
P = [75, 79, 38, 80, 82, 85]


def usd(x):
    return f'{x:.2f}'.replace('.', ',') + ' USD'


def sma(day, k):
    v = P[day - k:day]
    r = sum(v) / k
    c = usd(r)
    w = [usd(sum(P[day - k + 1:day + 1]) / k) if day < 6 else usd(r + 3), usd(sum(P[:k]) / k), usd(sum(P[day - k:day + 1]) / (k + 1)),
         usd(r + 5), usd(r - 7)]
    w = [x for x in dict.fromkeys(w) if x != c][:3]
    it.append((f'Giá đóng cửa cổ phiếu X trong 6 ngày: 75, 79, 38, 80, 82, 85 (USD). Với cửa sổ k = {k}, SMA ngày {day} là bao nhiêu?', c, w,
               f'SMA ngày {day} = trung bình {k} giá gần nhất ({", ".join(map(str, v))}) = {sum(v)}/{k} = **{c}**.'))


sma(4, 3)
sma(5, 3)
sma(6, 3)
sma(3, 3)
sma(4, 2)
it.append(('Tăng cửa sổ k của SMA (ví dụ từ 3 lên 10) thì đường SMA sẽ:', 'Mượt hơn nhưng phản ứng chậm (trễ) hơn với biến động giá',
           ['Nhạy hơn và bám sát từng biến động giá', 'Luôn cho giá trị bằng giá hiện tại', 'Không thay đổi'],
           'k lớn → lấy trung bình nhiều điểm → **mượt hơn nhưng trễ**; k nhỏ → bám sát nhưng nhiễu.'))
it.append(('SMA ngày thứ t với cửa sổ k = 3 (theo cách tính trong đề) được tính từ những giá trị nào?', 'Giá của 3 ngày gần nhất tính cả ngày t (t−2, t−1, t)',
           ['Giá của toàn bộ các ngày đã có', 'Chỉ giá ngày t', 'Giá của 3 ngày liền sau ngày t'],
           'SMA ngày 4 (k = 3) = trung bình giá ngày 2, 3, 4 = (79 + 38 + 80)/3 ≈ 65,67.'))
T.append(('Biến thể: Simple Moving Average – SMA (câu 26)', it))

# ---------- 4. Association Rules ----------
it = []
DB = [{'a', 'b', 'c'}, {'a', 'b', 'c', 'd', 'e'}, {'b'}, {'c', 'd', 'e'}, {'c'}, {'b', 'c', 'd'}, {'c', 'd', 'e'}, {'c', 'e'}]
N = len(DB)


def cnt(s):
    return sum(1 for t in DB if set(s) <= t)


def sup(s):
    return cnt(s) / N


DBTXT = 'CSDL 8 giao dịch: T1 {a,b,c}; T2 {a,b,c,d,e}; T3 {b}; T4 {c,d,e}; T5 {c}; T6 {b,c,d}; T7 {c,d,e}; T8 {c,e}. '


def rule(X, Y, what):
    lbl = '{' + ','.join(X) + '} → {' + ','.join(Y) + '}'
    U = list(X) + list(Y)
    s, conf = sup(U), cnt(U) / cnt(X)
    lift = conf / sup(Y)
    lev = s - sup(X) * sup(Y)
    val = {'Support': s, 'Confidence': conf, 'Lift': lift, 'Leverage': lev}[what]
    c, w = nums(abs(val), 3, extra=[s, conf, lift, abs(lev), sup(X), sup(Y)])
    if val < 0:
        c = '-' + c
        w = ['-' + x for x in w]
    w = [x for x in w if x != c]
    expl = {'Support': f'Sup = count({{{",".join(U)}}})/8 = {cnt(U)}/8 = **{c}**.',
            'Confidence': f'Conf = count(X∪Y)/count(X) = {cnt(U)}/{cnt(X)} = **{c}**.',
            'Lift': f'Lift = Conf/Sup(Y) = {fmt(conf)}/{fmt(sup(Y))} = **{c}**.',
            'Leverage': f'Leverage = Sup(X∪Y) − Sup(X)·Sup(Y) = {fmt(s)} − {fmt(sup(X))}×{fmt(sup(Y))} = **{c}**.'}[what]
    it.append((DBTXT + f'Với luật L: {lbl}, {what}(L) bằng bao nhiêu?', c, w[:3], expl))


rule(['d'], ['e'], 'Support')
rule(['d'], ['e'], 'Confidence')
rule(['e'], ['c'], 'Confidence')
rule(['b'], ['c'], 'Confidence')
rule(['d'], ['e'], 'Lift')
rule(['c', 'd'], ['e'], 'Confidence')
rule(['e'], ['c'], 'Lift')
rule(['d'], ['e'], 'Leverage')
rule(['b'], ['c'], 'Support')
for s_, nm in [(('c', 'd', 'b'), '{c,d,b}'), (('d', 'e'), '{d,e}'), (('c', 'e'), '{c,e}'), (('b', 'c'), '{b,c}')]:
    c, w = nums(sup(s_), 3, extra=[cnt(s_) / 7, 0.5])
    it.append((DBTXT + f'Độ hỗ trợ (Support) của itemset {nm} là bao nhiêu?', c, w,
               f'Số giao dịch chứa {nm} = {cnt(s_)} → Sup = {cnt(s_)}/8 = **{c}**.'))
it.append((DBTXT + 'Với minsup = 4 (số giao dịch), item nào bị loại khỏi danh sách 1-itemset phổ biến?', 'a (xuất hiện 2 lần)',
           ['b (xuất hiện 4 lần)', 'd (xuất hiện 4 lần)', 'c (xuất hiện 7 lần)'],
           'Đếm: c = 7; b = 4; d = 4; e = 4; a = 2 < 4 → **a** bị loại.'))
it.append((DBTXT + 'Với minsup = 4, FP-Growth sắp xếp các item phổ biến theo thứ tự giảm dần của số đếm. Item đứng ĐẦU TIÊN là:', 'c (7 giao dịch)',
           ['b (4 giao dịch)', 'e (4 giao dịch)', 'a (2 giao dịch)'],
           'c xuất hiện nhiều nhất (7) nên đứng đầu; b, d, e cùng 4 (hoán đổi được).'))
it.append((DBTXT + 'Nếu minsup tăng từ 4 lên 5 thì tập 1-itemset phổ biến còn lại là:', '{c}', ['{c, b, d, e}', '{b, d, e}', '{a, c}'],
           'Chỉ c (7) ≥ 5; b, d, e chỉ 4 < 5.'))
it.append(('Lift(X → Y) = 1,52 có ý nghĩa gì?', 'Có X thì khả năng xuất hiện Y cao gấp 1,52 lần so với bình thường (quan hệ tích cực)',
           ['X và Y độc lập', 'X làm giảm khả năng xuất hiện Y', 'Luật có Confidence bằng 1,52'],
           'Lift > 1: tích cực; = 1: độc lập; < 1: tiêu cực.'))
it.append(('Lift(X → Y) = 0,8 cho biết điều gì?', 'X làm giảm khả năng xuất hiện Y (quan hệ tiêu cực)',
           ['X làm tăng khả năng xuất hiện Y', 'X và Y độc lập hoàn toàn', 'Luật rất đáng tin cậy'],
           'Lift < 1: tiền đề làm **giảm** khả năng hậu đề.'))
it.append(('Công thức nào sau đây là Confidence của luật X → Y?', 'Sup(X ∪ Y) / Sup(X)',
           ['Sup(X ∪ Y) / Sup(Y)', 'Sup(X) / Sup(X ∪ Y)', 'Sup(X ∪ Y) − Sup(X)·Sup(Y)'],
           'Confidence = Sup(X∪Y)/Sup(X). Công thức cuối là Leverage.'))
it.append(('Công thức nào sau đây là Leverage của luật X → Y?', 'Sup(X ∪ Y) − Sup(X)·Sup(Y)',
           ['Sup(X ∪ Y) / Sup(X)', 'Conf(X → Y) / Sup(Y)', 'Sup(X ∪ Y) / Sup(Y)'],
           '**Leverage** = Sup(X∪Y) − Sup(X)×Sup(Y) (chênh lệch giữa tần suất thực và kỳ vọng nếu độc lập).'))
it.append(('Có 10 item đơn lẻ phổ biến. Theo xấp xỉ n²/2 trong slide Apriori, số itemset 2 phần tử cần kiểm tra là khoảng:', '50',
           ['20', '100', '10'], 'n²/2 = 10²/2 = **50** (chính xác C(10,2) = 45).'))
it.append(('Có 5 item. Số tập con khác rỗng (có thể sinh ra) là:', '31', ['25', '32', '10'], '2⁵ − 1 = **31**.'))
it.append(('Tính chất Apriori (anti-monotone) phát biểu rằng:', 'Nếu một tập con của itemset không phổ biến thì itemset đó cũng không phổ biến',
           ['Nếu itemset phổ biến thì mọi tập cha của nó cũng phổ biến', 'Support của tập cha luôn lớn hơn tập con', 'Mọi itemset đều phổ biến nếu Confidence cao'],
           'Dùng để **cắt tỉa** ứng viên: tập con không phổ biến ⇒ loại tập cha.'))
it.append(('Hạn chế chính của Apriori so với FP-Growth là:', 'Quét CSDL nhiều lần và sinh số lượng ứng viên rất lớn',
           ['Chỉ duyệt CSDL 2 lần', 'Không sinh ứng viên', 'Chỉ chạy được trên dữ liệu số'],
           'FP-Growth: 2 lần quét, không sinh ứng viên (dùng FP-Tree).'))
T.append(('Biến thể: Association Rules & Apriori (câu 27–30, 34)', it))

# ---------- 5. FP-Growth / Conditional Pattern Base ----------
it = []
CPB = 'Bảng Conditional Pattern Base: X:{Y:4, Z:3}; Y:{X:4, Z:4, T:4}; Z:{X:3, Y:4, T:3}; T:{Y:4, Z:3}. '
it.append((CPB + 'Với Minsup = 4, những tập phổ biến có 2 item là:', '{X,Y}, {Y,Z}, {Y,T}',
           ['{X,Y}, {X,Z}, {Z,T}', '{X,Z}, {Y,T}', '{Y,Z}, {Z,T}'],
           'Các cặp đạt ≥ 4: X–Y (4), Y–Z (4), Y–T (4). X–Z (3), Z–T (3) bị loại.'))
it.append((CPB + 'Với Minsup = 3, số tập phổ biến có 2 item là:', '5', ['3', '4', '6'],
           'Các cặp: X–Y 4, X–Z 3, Y–Z 4, Y–T 4, Z–T 3 → đều ≥ 3 → **5** cặp.'))
it.append((CPB + 'Với Minsup = 4, những tập phổ biến 2 item có chứa item Z là:', '{Y,Z}', ['{X,Z}', '{Z,T}', '{X,Z}, {Z,T}'],
           'Z đi cùng X (3), Y (4), T (3) → chỉ **{Y,Z}** đạt 4.'))
it.append((CPB + 'Với Minsup = 4, những tập phổ biến 2 item có chứa item T là:', '{Y,T}', ['{Z,T}', '{Y,T}, {Z,T}', '{X,T}'],
           'T đi cùng Y (4), Z (3) → chỉ **{Y,T}**.'))
it.append((CPB + 'Với Minsup = 4, item nào xuất hiện trong NHIỀU tập phổ biến 2 item nhất?', 'Y (3 tập)',
           ['X (1 tập)', 'Z (1 tập)', 'T (2 tập)'], 'Các tập {X,Y}, {Y,Z}, {Y,T} đều chứa **Y**.'))
it.append((CPB + 'Với Minsup = 4, những tập phổ biến có 2 item KHÔNG chứa Y là:', 'Không có tập nào', ['{X,Z}', '{Z,T}', '{X,Z}, {Z,T}'],
           'Cặp không chứa Y: X–Z (3), Z–T (3) đều < 4 → **không có**.'))
it.append(('Condition Pattern Base của một item là:', 'Tập các đường dẫn tiền tố (prefix path) trong FP-Tree đi cùng item đó, kèm số đếm',
           ['Danh sách toàn bộ giao dịch của CSDL', 'Bảng Header Table của FP-Tree', 'Tập các luật kết hợp có Confidence cao'],
           'Là CSDL phụ gồm các prefix path đi cùng nút suffix.'))
it.append(('Thứ tự sắp xếp các item trong giao dịch khi xây FP-Tree là:', 'Giảm dần theo số giao dịch (support) mà item xuất hiện',
           ['Theo bảng chữ cái', 'Tăng dần theo support', 'Ngẫu nhiên'], 'Item phổ biến nhất ở gần gốc để cây nén tốt nhất.'))
it.append(('FP-Growth duyệt CSDL bao nhiêu lần để xây FP-Tree?', '2 lần',
           ['1 lần', 'Số lần bằng kích thước itemset lớn nhất', 'Nhiều lần, mỗi lần một item'],
           'Lần 1: đếm support từng item; lần 2: xây cây. Không sinh ứng viên.'))
T.append(('Biến thể: FP-Growth & Conditional Pattern Base (câu 31–33)', it))

# ---------- 6. PageRank ----------
it = []
EDGES = {1: [2], 2: [5], 3: [1, 2, 4, 5], 4: [3, 5], 5: [4]}


def pr(d=0.85, iters=1):
    r = {p: 1.0 for p in EDGES}
    for _ in range(iters):
        r = {p: (1 - d) + d * sum(r[q] / len(EDGES[q]) for q in EDGES if p in EDGES[q]) for p in EDGES}
    return r


GR = 'Đồ thị liên kết: 1→2; 2→5; 3→1, 3→2, 3→4, 3→5; 4→3, 4→5; 5→4. PageRank khởi tạo bằng 1, d = 0,85. '
r1 = pr()
for p in (3, 4, 5):
    c, w = nums(r1[p], 4, extra=[0.15, 1.0, r1[p] + 0.85])
    inl = [q for q in EDGES if p in EDGES[q]]
    expr = ' + '.join(f'1/{len(EDGES[q])}' for q in inl)
    it.append((GR + f'Giá trị PageRank của Page {p} ở vòng lặp đầu tiên là bao nhiêu?', c, w,
               f'Page {p} nhận từ {", ".join("Page " + str(q) for q in inl)} → PR = 0,15 + 0,85×({expr}) = **{c}**.'))
r_d5 = pr(0.5)
c, w = nums(r_d5[2], 3, extra=[1.2125, 1.0, 1.25])
it.append((GR.replace('d = 0,85', 'd = 0,5') + 'Giá trị PageRank của Page 2 ở vòng lặp đầu tiên là bao nhiêu?', c, w,
           f'PR(2) = (1 − 0,5) + 0,5×(1/1 + 1/4) = 0,5 + 0,625 = **{c}**.'))
it.append((GR + 'Sau vòng lặp đầu tiên, trang nào có PageRank CAO NHẤT?', 'Page 5 (≈ 1,6375)',
           ['Page 2 (≈ 1,2125)', 'Page 4 (≈ 1,2125)', 'Page 1 (≈ 0,3625)'],
           'PR(5) = 0,15 + 0,85×(1 + 1/4 + 1/2) = 1,6375 là lớn nhất (Page 5 nhận từ 3 trang).'))
it.append((GR + 'Tổng PageRank của 5 trang sau vòng lặp đầu tiên bằng:', '5', ['1', '0,85', '4,25'],
           'Tổng PR bảo toàn bằng số trang (N = 5): 0,3625 + 1,2125 + 0,575 + 1,2125 + 1,6375 = 5.'))
it.append(('Ký hiệu C(p) trong công thức PageRank là gì?', 'Số lượng liên kết đi ra (out-degree) của trang p',
           ['Số lượng liên kết đi vào trang p', 'Giá trị PageRank của trang p', 'Tổng số trang trong đồ thị'], 'C(p) = số trang mà p liên kết đến.'))
it.append(('Hệ số damping factor d trong PageRank thường được chọn bằng:', '0,85', ['0,15', '0,5', '1,0'],
           'd = 0,85 (xác suất người dùng tiếp tục bấm link); 1 − d = 0,15 là xác suất nhảy ngẫu nhiên.'))
it.append(('Thuật toán PageRank dừng lặp khi độ chênh lệch PR giữa hai vòng liên tiếp nhỏ hơn ngưỡng ε. Giá trị ε thường chọn là:', '0,0001',
           ['0,85', '0,15', '0,5'], 'ε thường = 0,0001.'))
it.append(('Một trang không có liên kết nào trỏ đến nó (in-degree = 0) thì PageRank sau vòng lặp đầu (d = 0,85) bằng:', '0,15',
           ['0', '0,85', '1'], 'PR = (1 − d) + d×0 = **0,15**.'))
T.append(('Biến thể: PageRank (câu 36, 37, 48–50)', it))

# ---------- 7. CPT / CPT+ ----------
it = []
it.append(('Trong CPT+, chiến lược thay thế chuỗi con xuất hiện thường xuyên (ví dụ x = AB) bằng một ký hiệu duy nhất trên cây dự đoán gọi là gì?',
           'FSC (Frequent Subsequence Compression)',
           ['SBC (Simple Branches Compression)', 'PNR (Prediction with improved Noise Reduction)', 'Inverted Index'],
           '**FSC** thay chuỗi con thường gặp (AB) bằng ký hiệu mới x → cây gọn hơn.'))
it.append(('Chiến lược gộp các nhánh đơn (mỗi nút chỉ có một con, không rẽ nhánh) thành một nút duy nhất trong Prediction Tree là:',
           'SBC (Simple Branches Compression)',
           ['FSC (Frequent Subsequence Compression)', 'PNR (Prediction with improved Noise Reduction)', 'Lookup Table'],
           '**SBC** nén các nhánh đơn (ví dụ C→D không rẽ nhánh gộp thành nút "CD").'))
it.append(('Chiến lược nào trong CPT+ cải tiến GIAI ĐOẠN DỰ ĐOÁN bằng cách giảm ảnh hưởng của dữ liệu nhiễu khi tính điểm?',
           'PNR (Prediction with improved Noise Reduction)',
           ['FSC (Frequent Subsequence Compression)', 'SBC (Simple Branches Compression)', 'Prediction Tree'],
           '**PNR** thuộc giai đoạn dự đoán; FSC và SBC là hai kỹ thuật nén cây ở giai đoạn xây dựng (huấn luyện).'))
it.append(('Trong Prediction Tree có đường đi C → D, hai nút này không có nhánh rẽ nào khác. Nếu gộp chúng thành một nút "CD" thì đã áp dụng chiến lược nào?',
           'SBC (Simple Branches Compression)',
           ['FSC (Frequent Subsequence Compression)', 'PNR (Prediction with improved Noise Reduction)', 'Không áp dụng chiến lược nào'],
           'Gộp **nhánh đơn** → SBC. Thay chuỗi con lặp nhiều lần ở nhiều nhánh bằng một ký hiệu → FSC.'))
it.append(('Trong hình CPT+ có nút x được ghi (A, B → x) trên Prediction Tree và bên dưới ghi x = AB. Chú thích này cho biết điều gì?',
           'Chuỗi con AB được thay bằng ký hiệu mới x (đã áp dụng FSC)',
           ['Hai nhánh đơn A và B đã được gộp (SBC)', 'Điểm dự đoán của AB bằng x', 'x là một item mới trong dữ liệu gốc'],
           'x = AB nghĩa là chuỗi con thường xuyên AB được nén thành ký hiệu x → **FSC**.'))
it.append(('FSC và SBC thuộc giai đoạn nào của CPT+?', 'Giai đoạn xây dựng (huấn luyện) cây: nén Prediction Tree',
           ['Giai đoạn dự đoán', 'Cả hai thuộc giai đoạn kiểm thử độc lập', 'Giai đoạn tiền xử lý dữ liệu đầu ra'],
           'FSC, SBC nén **cây** (training); PNR cải tiến **dự đoán**.'))
it.append(('Ba thành phần cấu trúc của CPT gồm:', 'Prediction Tree, Inverted Index, Lookup Table',
           ['FP-Tree, Header Table, Conditional Pattern Base', 'Decision Tree, Support Table, Rule Set', 'Dendrogram, Hash Table, Lookup Table'],
           'FP-Tree/Header Table thuộc FP-Growth.'))
it.append(('Lookup Table trong CPT dùng để làm gì?', 'Trỏ từ mỗi chuỗi (s1, s2…) tới nút cuối của nó trong Prediction Tree',
           ['Cho biết mỗi item nằm trong những chuỗi nào', 'Lưu số lần xuất hiện của từng item', 'Lưu các luật kết hợp đã tìm được'],
           'Cho biết mỗi item nằm trong những chuỗi nào là việc của **Inverted Index**.'))
it.append(('Inverted Index trong CPT dùng để làm gì?', 'Cho biết mỗi item xuất hiện trong những chuỗi (sequence) nào',
           ['Trỏ tới nút cuối của mỗi chuỗi', 'Lưu cây dự đoán đã nén', 'Tính PageRank cho các item'],
           'Inverted Index: item → tập các chuỗi chứa nó (tìm nhanh các chuỗi chứa mọi item của truy vấn).'))
it.append(('Inverted Index (A: s1,s2,s3,s5; B: s1–s5; C: s1,s3,s4; D: s3; E: s5). Item D xuất hiện trong những chuỗi nào?', 'Chỉ s3',
           ['s1 và s3', 's3 và s5', 'Tất cả các chuỗi'], 'Hàng D chỉ có giá trị 1 ở cột **s3**.'))
it.append(('Cùng Inverted Index (A: s1,s2,s3,s5; B: s1–s5; C: s1,s3,s4; D: s3; E: s5). Các chuỗi nào chứa CẢ A và C?', 's1 và s3',
           ['s1, s2 và s3', 's3 và s4', 's1 và s4'], 'A: {s1,s2,s3,s5} ∩ C: {s1,s3,s4} = **{s1, s3}**.'))
it.append(('Dùng CPT dự đoán với chuỗi truy vấn ⟨D, C⟩: bước đầu tiên là gì?', 'Tìm các chuỗi huấn luyện chứa cả D và C (dùng Inverted Index)',
           ['Tính PageRank của D và C', 'Xóa mọi chuỗi chứa D hoặc C', 'Sắp xếp item theo bảng chữ cái'],
           'Sau đó lấy phần đuôi (consequent) của các chuỗi đó và cộng điểm từng item.'))

# ---- Bổ sung: bộ CPT+ theo hình trong đề (x = AB) ----
FIG = ('Tập huấn luyện: s1 = ⟨A,B,C⟩; s2 = ⟨A,B⟩; s3 = ⟨A,B,C,D⟩; s4 = ⟨B,C⟩; s5 = ⟨A,B,E⟩. '
       'Prediction Tree (đã áp dụng x = AB): root → x → C → D; x → E; root → B → C. '
       'Inverted Index: A: s1,s2,s3,s5; B: s1–s5; C: s1,s3,s4; D: s3; E: s5. ')
it.append((FIG + 'Chuỗi con AB xuất hiện trong bao nhiêu chuỗi huấn luyện (nên được thay bằng ký hiệu x)?', '4 chuỗi (s1, s2, s3, s5)',
           ['5 chuỗi (s1 đến s5)', '3 chuỗi (s1, s3, s5)', '2 chuỗi (s3, s5)'],
           'AB có trong s1, s2, s3, s5. s4 = ⟨B,C⟩ không có A nên không chứa AB.'))
it.append((FIG + 'Chưa nén, Prediction Tree có bao nhiêu nút (không tính root)?', '7 nút',
           ['5 nút', '6 nút', '9 nút'],
           'Nhánh trái: A, B, C, D, E (5 nút) + nhánh phải: B, C (2 nút) = **7**.'))
it.append((FIG + 'Sau khi áp dụng FSC với x = AB, Prediction Tree có bao nhiêu nút (không tính root)?', '6 nút',
           ['7 nút', '5 nút', '4 nút'],
           'x, C, D, E (nhánh trái) + B, C (nhánh phải, không chứa AB nên giữ nguyên) = **6**.'))
it.append((FIG + 'Nếu áp dụng thêm SBC để gộp nhánh đơn root → B → C thành một nút "BC", cây còn bao nhiêu nút (không tính root)?', '5 nút',
           ['6 nút', '4 nút', '3 nút'],
           'x, C, D, E và BC = **5**. Nhánh x → C → D không gộp được vì x rẽ thành 2 nhánh (C và E).'))
it.append((FIG + 'Nhánh nào trong cây có thể gộp bằng SBC (Simple Branches Compression)?', 'Nhánh root → B → C (mỗi nút chỉ có một con, không rẽ nhánh)',
           ['Nút x vì x có hai nhánh con C và E', 'Nhánh x → E vì E là lá', 'Không có nhánh nào gộp được'],
           '**SBC** gộp chuỗi các nút chỉ có một con thành một nút. x có 2 con nên không gộp.'))
it.append((FIG + 'Lookup Table trỏ chuỗi s3 tới nút nào của Prediction Tree?', 'Nút D (nút cuối của đường x → C → D)',
           ['Nút x', 'Nút C dưới nhánh B', 'Nút root'],
           'Lookup Table trỏ mỗi chuỗi tới **nút cuối** của nó. s3 = ⟨A,B,C,D⟩ ↔ x → C → D.'))
it.append((FIG + 'Lookup Table trỏ chuỗi s2 = ⟨A,B⟩ tới nút nào (sau khi nén x = AB)?', 'Nút x',
           ['Nút B bên nhánh phải', 'Nút C', 'Nút E'],
           's2 = ⟨A,B⟩ chính là x nên nút cuối là **x**. (Trước khi nén là nút B dưới A.)'))
it.append((FIG + 'Các chuỗi nào chứa CẢ A và C?', 's1 và s3',
           ['s1, s2 và s3', 's3 và s4', 's1, s3 và s4'],
           'A: {s1,s2,s3,s5} ∩ C: {s1,s3,s4} = **{s1, s3}**.'))
it.append((FIG + 'Các chuỗi nào chứa CẢ B và C?', 's1, s3 và s4',
           ['s1 và s3', 's3 và s4', 's1, s2 và s3'],
           'B có trong mọi chuỗi; C: {s1,s3,s4} → giao = **{s1, s3, s4}**.'))
it.append((FIG + 'Dự đoán với truy vấn ⟨A,B⟩ (đếm số chuỗi có item đó trong phần đuôi). Item nào có điểm cao nhất?', 'C',
           ['D', 'E', 'A'],
           'Chuỗi chứa A và B: s1 (đuôi: C), s2 (đuôi rỗng), s3 (đuôi: C, D), s5 (đuôi: E). C:2, D:1, E:1 → **C**.'))
it.append((FIG + 'Dự đoán với truy vấn ⟨A⟩. Item nào có điểm cao nhất?', 'B',
           ['C', 'D', 'E'],
           'Đuôi sau A: s1: B,C; s2: B; s3: B,C,D; s5: B,E. B xuất hiện 4 lần → **B** cao nhất.'))
it.append((FIG + 'Dự đoán với truy vấn ⟨B⟩. Item nào có điểm cao nhất?', 'C',
           ['D', 'E', 'A'],
           'Đuôi sau B: s1: C; s2: rỗng; s3: C,D; s4: C; s5: E. C xuất hiện 3 lần → **C**.'))
it.append((FIG + 'Dự đoán với truy vấn ⟨B,C⟩. Item nào xuất hiện trong phần đuôi của các chuỗi khớp?', 'Chỉ D (từ s3)',
           ['E (từ s5)', 'C và D', 'Không có item nào'],
           'Chuỗi chứa B và C: s1, s3, s4. Đuôi: s1 rỗng, s3: D, s4 rỗng → chỉ **D**.'))
it.append((FIG + 'Chuỗi huấn luyện nào KHÔNG chứa item A?', 's4 = ⟨B,C⟩',
           ['s2 = ⟨A,B⟩', 's5 = ⟨A,B,E⟩', 's1 = ⟨A,B,C⟩'],
           'Hàng A của Inverted Index có 0 ở cột s4.'))
it.append(('Khi dự đoán với CPT, khi nút x = AB xuất hiện trong cây thì nó được hiểu thế nào?', 'Nút x đại diện cho chuỗi con A rồi B (được giải nén lại thành A, B khi dùng)',
           ['x là một item mới hoàn toàn trong dữ liệu gốc', 'x có nghĩa là A hoặc B', 'x bị bỏ qua khi dự đoán'],
           'FSC chỉ là nén **biểu diễn** cây; ý nghĩa vẫn là chuỗi con AB.'))
it.append(('Chuỗi con thường xuyên là CD, ta đặt y = CD rồi thay vào Prediction Tree. Đây là chiến lược nào?', 'FSC (Frequent Subsequence Compression)',
           ['SBC (Simple Branches Compression)', 'PNR (Prediction with improved Noise Reduction)', 'Inverted Index'],
           'Thay chuỗi con xuất hiện thường xuyên bằng ký hiệu mới → **FSC** (giống x = AB).'))
it.append(('Mục đích chung của FSC và SBC trong CPT+ là gì?', 'Giảm kích thước (số nút) của Prediction Tree để tiết kiệm bộ nhớ và dự đoán nhanh hơn',
           ['Tăng số chiều của dữ liệu đầu vào', 'Tạo thêm chuỗi huấn luyện mới', 'Thay thế hoàn toàn Inverted Index'],
           'Hai chiến lược **nén cây**; PNR mới cải thiện chất lượng dự đoán.'))
it.append(('PNR (Prediction with improved Noise Reduction) giúp gì cho dự đoán?', 'Bỏ qua các item nhiễu/hiếm trong chuỗi truy vấn để vẫn tìm được chuỗi khớp và dự đoán chính xác hơn',
           ['Nén các nhánh đơn của Prediction Tree', 'Thay chuỗi con thường xuyên bằng ký hiệu mới', 'Tăng thêm số lượng nút của cây'],
           '**PNR** thuộc giai đoạn dự đoán, giảm ảnh hưởng nhiễu; FSC/SBC thuộc giai đoạn xây cây.'))
it.append(('Khi dùng CPT, thứ tự các item trong truy vấn ⟨D, C⟩ có bắt buộc phải khớp đúng thứ tự trong chuỗi huấn luyện không?', 'Không, chỉ cần chuỗi huấn luyện chứa đủ các item D và C (dùng Inverted Index)',
           ['Có, phải đúng thứ tự D rồi C', 'Có, phải liền kề nhau', 'Không cần chứa cả hai item'],
           'CPT lấy giao các tập chuỗi từ Inverted Index nên **không quan tâm thứ tự** trong truy vấn.'))
HOT_SEQ = 'Tập huấn luyện: s1 = ⟨A,B,C,D,F⟩; s2 = ⟨D,C,B,E⟩; s3 = ⟨E,A,D,C,B⟩; s4 = ⟨E,G,A,D,B,C⟩. '
it.append((HOT_SEQ + 'Với truy vấn ⟨D, C⟩, phần đuôi (consequent) của s2 là gì?', '⟨B, E⟩',
           ['⟨E⟩', '⟨C, B, E⟩', '⟨D, C⟩'],
           's2 = ⟨D,C,B,E⟩: D, C đã xuất hiện ở vị trí 1, 2 → phần sau là **⟨B, E⟩**.'))
it.append((HOT_SEQ + 'Với truy vấn ⟨D, C⟩, phần đuôi của s3 là gì?', '⟨B⟩',
           ['⟨B, E⟩', '⟨A, D⟩', 'Rỗng'],
           's3 = ⟨E,A,D,C,B⟩: sau C (vị trí 4) chỉ còn **B**.'))
it.append((HOT_SEQ + 'Với truy vấn ⟨D, C⟩, những chuỗi nào khớp (chứa cả D và C)?', 'Cả s1, s2, s3 và s4',
           ['Chỉ s2 và s3', 'Chỉ s1 và s2', 'Chỉ s3 và s4'],
           'Cả bốn chuỗi đều chứa D và C (thứ tự không quan trọng).'))
it.append((HOT_SEQ + 'Với truy vấn ⟨D, C⟩, item B xuất hiện trong phần đuôi của bao nhiêu chuỗi?', '2 chuỗi (s2 và s3)',
           ['1 chuỗi', '3 chuỗi', '4 chuỗi'],
           'Đuôi: s1 = ⟨F⟩; s2 = ⟨B,E⟩; s3 = ⟨B⟩; s4 = rỗng → B có trong **2** chuỗi, nhiều nhất.'))
it.append((HOT_SEQ + 'Với truy vấn ⟨D, C⟩, item nào KHÔNG có điểm (không xuất hiện trong phần đuôi nào)?', 'G',
           ['B', 'E', 'F'],
           'Đuôi: ⟨F⟩, ⟨B,E⟩, ⟨B⟩, rỗng → B, E, F có điểm; **G** thì không.'))
it.append((HOT_SEQ + 'Với truy vấn ⟨E, A⟩, những chuỗi nào khớp?', 's3 và s4',
           ['s1 và s3', 's2 và s3', 's1, s3 và s4'],
           'Chứa cả E và A: s3 và s4. (s1 không có E; s2 không có A.)'))

T.append(('Biến thể: CPT / CPT+ (FSC, SBC, PNR) (câu 38, 39)', it))

# ---------- 8. Kiến trúc, mô hình hóa, ELT ----------
it = []
it.append(('Nền tảng Cloud Data Warehouse nào được xem là tiên phong trong việc tách rời Compute và Storage cùng chia sẻ dữ liệu an toàn?', 'Snowflake',
           ['Firebolt', 'Google BigQuery', 'Databricks SQL'], '**Snowflake** tiên phong tách Compute/Storage.'))
it.append(('Nền tảng nào có kiến trúc Serverless và tích hợp sẵn các mô hình AI/ML của Google?', 'Google BigQuery',
           ['Snowflake', 'Firebolt', 'Databricks SQL'], '**BigQuery**: Serverless + AI/ML (BigQuery ML).'))
it.append(('Nền tảng nào nhấn mạnh việc đưa trải nghiệm Data Warehouse vào kiến trúc Lakehouse?', 'Databricks SQL',
           ['Firebolt', 'Google BigQuery', 'Snowflake'], '**Databricks SQL** mang Warehouse vào Lakehouse.'))
it.append(('Nền tảng nào tập trung vào tốc độ truy vấn cực nhanh cho ứng dụng phân tích thời gian thực?', 'Firebolt',
           ['Snowflake', 'Databricks SQL', 'Google BigQuery'], '**Firebolt** tập trung vào tốc độ truy vấn.'))
it.append(('Cơ chế lưu kết quả truy vấn đã tính để lần sau trả ngay mà không phải tính lại (giảm chi phí) gọi là:', 'Caching',
           ['Clustering', 'Sharding', 'Mirroring'], '**Caching** tránh tính toán lại kết quả cũ.'))
it.append(('Thông tin nào mô tả đúng Data Catalog?', 'Thư viện chứa thông tin (metadata) và vị trí của mọi nguồn dữ liệu trong tổ chức',
           ['Kho lưu trữ toàn bộ dữ liệu thô', 'Công cụ vẽ biểu đồ BI', 'Cơ chế mã hóa dữ liệu khi truyền'],
           '**Data Catalog** = danh mục tìm kiếm dữ liệu nhờ metadata.'))
it.append(('Data Fabric tập trung vào mục tiêu nào?', 'Kết nối và ảo hóa (virtualization) các nguồn dữ liệu rời rạc',
           ['Sao chép toàn bộ dữ liệu về một nơi', 'Chỉ lưu dữ liệu phi cấu trúc', 'Chỉ mã hóa dữ liệu'],
           '**Data Fabric** kết nối & ảo hóa dữ liệu, không bắt buộc di chuyển dữ liệu.'))
it.append(('Chính sách nào quy định quyền truy cập cho toàn bộ Data Container (bucket) từ bên ngoài?', 'Bucket Policies',
           ['IAM Policies gắn với từng người dùng', 'Row-level Security', 'Column-level Masking'],
           '**Bucket Policies** gắn vào bucket; IAM Policies gắn vào danh tính.'))
it.append(('Micro-partition trong Snowflake thường có kích thước nén khoảng:', '50MB – 500MB',
           ['1KB – 10KB', '5GB – 50GB', '1TB trở lên'], 'Mỗi micro-partition ≈ **50–500MB** dữ liệu nén.'))
it.append(('Clustering Key được chọn dựa trên đối tượng nào?', 'Cột (column) thường dùng để lọc/sắp xếp',
           ['Hàng (row) đầu tiên', 'Tên bảng', 'Kích thước file'], 'Clustering Key là một hoặc nhiều **cột**.'))
it.append(('Loại Fact Table nào phù hợp để theo dõi một quy trình nhiều giai đoạn (đặt hàng → giao → thanh toán) và được cập nhật dần theo từng mốc?',
           'Accumulating Snapshot', ['Transaction Fact Table', 'Periodic Snapshot', 'Factless Fact Table'],
           '**Accumulating Snapshot** theo dõi vòng đời quy trình, phù hợp tối ưu chuỗi cung ứng/vận hành.'))
it.append(('Loại Fact Table nào ghi lại tình trạng (ví dụ tồn kho cuối ngày) theo chu kỳ cố định?', 'Periodic Snapshot',
           ['Accumulating Snapshot', 'Transaction Fact Table', 'Bridge Table'], '**Periodic Snapshot** chụp trạng thái theo định kỳ.'))
it.append(('Bridge Table dùng để giải quyết loại quan hệ nào giữa Fact và Dimension?', 'Quan hệ nhiều-nhiều (M-M)',
           ['Quan hệ một-một', 'Quan hệ một-nhiều đơn giản', 'Quan hệ phân cấp (hierarchy) không giới hạn'], '**Bridge Table** là bảng trung gian cho quan hệ M-M.'))
it.append(('Fact table được kết hợp với Dimension table bằng phép toán nào?', 'Join', ['Union', 'Intersect', 'Pivot'],
           'Fact – Dimension kết hợp bằng **Join** (Star Schema).'))
it.append(('Schema Evolution của Snowflake cho phép:', 'Tự động điều chỉnh cấu trúc bảng khi nguồn dữ liệu thay đổi (ví dụ thêm cột)',
           ['Chỉ đọc dữ liệu mà không đổi schema', 'Tự xóa toàn bộ dữ liệu cũ', 'Chuyển bảng sang dạng file CSV'],
           'Giảm công sức bảo trì khi schema nguồn đổi.'))
it.append(('Test nào của dbt là một câu SQL riêng biệt kiểm tra tình huống nghiệp vụ đặc thù?', 'Singular Test',
           ['Schema Test (unique, not_null…)', 'Freshness Test', 'Snapshot Test'],
           '**Singular Test**: SQL tùy biến; Schema/Generic Test: khai báo sẵn (unique, not null…).'))
it.append(('Kiểm tra cột order_id không trùng lặp và không rỗng trong dbt thường dùng loại test nào?', 'Schema Test (generic test: unique, not_null)',
           ['Singular Test', 'Jinja Macro', 'Snowpipe'], 'unique/not_null khai báo trong file schema → Schema Test.'))
it.append(('Jinja trong dbt dùng để:', 'Viết SQL động (biến, vòng lặp, macro) giúp giảm code lặp',
           ['Lưu trữ dữ liệu', 'Vẽ dashboard', 'Mã hóa cột nhạy cảm'], 'Jinja + Dynamic SQL giảm đáng kể số dòng code dư thừa.'))
it.append(('Apache Airflow theo tư duy nào?', 'Task-centric: giám sát các tác vụ (task) đang chạy',
           ['Asset-centric: quản lý tài sản dữ liệu', 'Storage-centric: quản lý lưu trữ', 'Model-centric: quản lý mô hình ML'],
           'Airflow = Task-centric; **Dagster** = Asset-centric.'))
it.append(('Công cụ orchestration nào theo tư duy Asset-centric (quản lý theo tài sản dữ liệu)?', 'Dagster',
           ['Apache Airflow', 'Looker', 'Firebolt'], '**Dagster** là Asset-centric.'))
it.append(('Storage Mirroring có đặc điểm nào?', 'Nhận bản sao dữ liệu từ hệ thống nguồn và liên tục cập nhật theo thay đổi ở tầng lưu trữ',
           ['Chỉ sao chép một lần duy nhất', 'Mã hóa dữ liệu bằng khóa riêng', 'Xóa dữ liệu nguồn sau khi sao chép'],
           'Mirroring = nhân bản liên tục ở tầng lưu trữ.'))
T.append(('Biến thể: Kiến trúc, mô hình hóa & pipeline (câu 1–15)', it))

# ---------- 9. Graph / AI / Bảo mật ----------
it = []
it.append(('Cần tìm đường đi NGẮN NHẤT giữa hai thực thể trong Knowledge Graph. Nên dùng thuật toán duyệt nào?', 'BFS (duyệt theo cấp, dùng Queue)',
           ['DFS (duyệt sâu, dùng Stack)', 'Quick Sort', 'K-Means'], '**BFS** duyệt theo từng cấp nên tìm đường ngắn nhất (theo số cạnh).'))
it.append(('Cần duyệt ontology để tìm mọi khái niệm con, xây taxonomy. Nên dùng:', 'DFS (duyệt sâu, dùng Stack/đệ quy)',
           ['BFS (duyệt theo cấp, dùng Queue)', 'Binary Search', 'PCA'], '**DFS** đi sâu một nhánh rồi quay lui.'))
it.append(('BFS sử dụng cấu trúc dữ liệu nào để quản lý thứ tự duyệt?', 'Queue (FIFO)', ['Stack (LIFO)', 'Heap', 'Hash Table'],
           'BFS: Queue; DFS: Stack/đệ quy.'))
it.append(('Đồ thị vô hướng: A–B, A–D, A–G, B–E, G–E, G–F, D–F, F–C. BFS từ A, ưu tiên theo bảng chữ cái, thứ tự thăm là:', 'A, B, D, G, E, F, C',
           ['A, B, E, G, F, C, D', 'A, D, G, B, E, F, C', 'A, B, E, F, C, D, G'],
           'Mức 1: B, D, G. Mức 2: E (từ B), F (từ D). Mức 3: C. → **A, B, D, G, E, F, C**.'))
it.append(('Cùng đồ thị trên, DFS từ A (ưu tiên bảng chữ cái) cho thứ tự thăm:', 'A, B, E, G, F, C, D',
           ['A, B, D, G, E, F, C', 'A, B, E, F, C, D, G', 'A, D, F, C, G, E, B'],
           'A → B → E → G → F → C, quay lui → D. → **A, B, E, G, F, C, D**.'))
it.append(('Dữ liệu thô trên Blockchain tồn tại ở dạng nào?', 'byte/hex (phi cấu trúc)',
           ['Bảng quan hệ chuẩn hóa', 'JSON có schema cố định', 'Star Schema'], 'Cần dùng **ABI** để giải mã Hex thành hàm/tham số dễ đọc.'))
it.append(('Công cụ nào dịch chuỗi Hex trong Logs của Smart Contract thành tên hàm và tham số?', 'ABI (Application Binary Interface)',
           ['Merkle Root', 'Predicate Pushdown', 'Embeddings'], '**ABI** là bảng đặc tả giao diện hàm.'))
it.append(('Cơ chế Anchoring ghi lên Blockchain thông tin nào để chứng minh audit log không bị sửa?', 'Merkle Root Hash của lô nhật ký (không ghi toàn bộ dữ liệu thô)',
           ['Toàn bộ dữ liệu thô của nhật ký', 'Mật khẩu của DBA', 'Bản sao của CSDL'],
           'Băm log (SHA-256) → Merkle Root → ghi lên chain qua Smart Contract.'))
it.append(('IVFFLAT là khái niệm liên quan đến:', 'Vector Index (Inverted File) cho tìm kiếm vector',
           ['Row-level Security', 'Blockchain', 'Chuẩn hóa dữ liệu'], '**IVFFLAT/IVF** chia không gian vector thành các phân vùng (Voronoi cells).'))
it.append(('Cấu trúc đồ thị phân cấp (small world) giúp tìm láng giềng gần nhất rất nhanh trong vector search là:', 'HNSW',
           ['IVFFLAT', 'Product Quantization', 'FP-Tree'], '**HNSW**: đồ thị phân cấp; IVF: phân cụm; PQ: nén vector.'))
it.append(('Kỹ thuật nén vector để đưa chỉ mục vào RAM, tiết kiệm lưu trữ, gọi là:', 'Product Quantization',
           ['HNSW', 'Z-Score', 'Anchoring'], '**Product Quantization** nén kích thước vector.'))
it.append(('Kỹ thuật CLM (Column-level Masking) liên quan đến:', 'Bảo mật ở mức cột (che/mã hóa dữ liệu nhạy cảm như số điện thoại)',
           ['Bảo mật ở mức dòng', 'Tối ưu tốc độ truy vấn', 'Sao lưu dữ liệu'], 'CLM = cột; **RLS** = dòng.'))
it.append(('Nhân viên chi nhánh A chỉ nhìn thấy khách hàng của chi nhánh A. Đây là kỹ thuật nào?', 'Row-level Security (RLS)',
           ['Column-level Masking (CLM)', 'Differential Privacy', 'Zero-copy Data Sharing'], 'Giới hạn theo **dòng** dựa trên danh tính → RLS.'))
it.append(('Số điện thoại hiển thị là 091xxxx888. Đây là kỹ thuật nào?', 'Column-level Masking (CLM)',
           ['Row-level Security (RLS)', 'k-anonymity', 'Anchoring'], 'Che một phần giá trị trong **cột** → CLM.'))
it.append(('Theo AI Act, hệ thống chấm điểm công dân xã hội (social scoring) thuộc mức rủi ro nào?', 'Unacceptable Risk (bị cấm)',
           ['High Risk', 'Transparent/Limited Risk', 'Minimal Risk'], 'Unacceptable → **cấm hoàn toàn**.'))
it.append(('Theo AI Act, AI chấm điểm tín dụng trong Fintech thuộc mức rủi ro nào?', 'High Risk (kiểm soát nghiêm ngặt)',
           ['Unacceptable Risk', 'Transparent/Limited Risk', 'Minimal Risk'], 'Tín dụng ảnh hưởng quyền lợi → **High Risk**.'))
it.append(('Theo AI Act, Chatbot và Deepfake thuộc mức rủi ro nào?', 'Transparent/Limited Risk (phải dán nhãn rõ ràng)',
           ['Unacceptable Risk', 'High Risk', 'Minimal Risk'], 'Yêu cầu **minh bạch**/dán nhãn.'))
it.append(('Theo AI Act, bộ lọc Spam và AI trong trò chơi thuộc mức rủi ro nào?', 'Minimal Risk (tự do vận hành)',
           ['High Risk', 'Unacceptable Risk', 'Transparent/Limited Risk'], '**Minimal Risk**.'))
it.append(('AI Act phân loại hệ thống AI thành bao nhiêu mức độ rủi ro?', '4 mức', ['2 mức', '3 mức', '5 mức'],
           'Unacceptable, High, Transparent/Limited, Minimal.'))
it.append(('Hệ thống multimodal xử lý Text, Table, Image và dạng dữ liệu cần truy vấn theo quan hệ giữa các thực thể (GraphRAG). Dạng dữ liệu đó là:',
           'Graph', ['Audio', 'Time-series', 'Key-Value'], 'GraphRAG dùng **Graph** (Knowledge Graph).'))
it.append(('Looker thuộc nhóm nào?', 'BI Tool',
           ['Mô hình ngôn ngữ lớn (LLM)', 'Cơ sở dữ liệu vector', 'Công cụ orchestration'], 'Looker = BI Tool; ChatGPT, Gemini, DeepSeek là LLM.'))
it.append(('Trong các lựa chọn sau, cái nào KHÔNG phải là BI Tool?', 'Gemini', ['Looker', 'Power BI', 'Tableau'], 'Gemini là mô hình LLM.'))
T.append(('Biến thể: Graph, Blockchain, Vector, bảo mật & AI Act (câu 40–47)', it))

if __name__ == '__main__':
    for name, items in T:
        for q, c, w, e in items:
            assert len(w) == 3 and len({c, *w}) == 4, (q, c, w)
        print(len(items), name)
