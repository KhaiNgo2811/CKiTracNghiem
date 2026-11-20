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

# ---- Bổ sung: các đồ thị PageRank mới (có hình minh họa) ----
def prx(edges, d=0.85, iters=1):
    nodes = sorted({n for e in edges.items() for n in ([e[0]] + e[1])})
    r = {p: 1.0 for p in nodes}
    for _ in range(iters):
        r = {p: (1 - d) + d * sum(r[q] / len(edges[q]) for q in edges if p in edges[q]) for p in nodes}
    return r


def edges_txt(edges):
    return '; '.join(f'{a}→' + ', '.join(f'{a}→{b}' if False else str(b) for b in bs) for a, bs in sorted(edges.items()))


def dtxt(d):
    return str(d).replace('.', ',')


def pr_item(prefix, edges, d, page, iters):
    r = prx(edges, d, iters)
    val = r[page]
    c, w = nums(val, 4, extra=[1 - d, 1.0, val + d, val * d])

    def tz(x):
        x = x.rstrip('0')
        return x + '0' if x.endswith(',') else x
    c, w = tz(c), [tz(x) for x in w]
    inl = [q for q in sorted(edges) if page in edges[q]]
    it_txt = 'đầu tiên' if iters == 1 else f'thứ {iters}'
    if iters == 1:
        if inl:
            expr = ' + '.join(f'1/{len(edges[q])}' for q in inl)
            ex = f'Page {page} nhận từ ' + ', '.join(f'Page {q}' for q in inl) + f' → PR = {dtxt(round(1 - d, 2))} + {dtxt(d)}×({expr}) = **{c}**.'
        else:
            ex = f'Page {page} không có liên kết đến → PR = 1 − d = **{c}**.'
    else:
        ex = f'Tính lặp {iters} vòng theo PR(p) = (1 − d) + d·Σ PR(q)/C(q) → PR(Page {page}) = **{c}**.'
    it.append((f'{prefix} Giá trị PageRank của Page {page} ở vòng lặp {it_txt} là bao nhiêu?', c, w, ex))


G2 = {1: [2, 3], 2: [3], 3: [1], 4: [3]}
G3 = {1: [2, 3], 2: [3], 3: [1]}
P2 = 'Đồ thị liên kết 2: 1→2, 1→3; 2→3; 3→1; 4→3. PageRank khởi tạo bằng 1, d = 0,85.'
P3 = 'Đồ thị liên kết 3: 1→2, 1→3; 2→3; 3→1. PageRank khởi tạo bằng 1, d = 0,85.'
P3b = 'Đồ thị liên kết 3: 1→2, 1→3; 2→3; 3→1. PageRank khởi tạo bằng 1, d = 0,5.'
for pg in (1, 2, 3, 4):
    pr_item(P2, G2, 0.85, pg, 1)
for pg in (1, 2, 3):
    pr_item(P3, G3, 0.85, pg, 1)
pr_item(P3b, G3, 0.5, 3, 1)
pr_item(P3b, G3, 0.5, 2, 1)
it.append((P2 + ' Sau vòng lặp đầu tiên, trang nào có PageRank CAO NHẤT?', 'Page 3 (≈ 2,275)', ['Page 1 (≈ 1,000)', 'Page 2 (≈ 0,575)', 'Page 4 (≈ 0,150)'],
           'Page 3 nhận từ 3 trang (1, 2, 4): PR = 0,15 + 0,85×(1/2 + 1/1 + 1/1) = 2,275.'))
it.append((P2 + ' Vì sao Page 4 luôn có PageRank thấp nhất (0,15) ở mọi vòng lặp?', 'Không có trang nào liên kết đến Page 4 nên chỉ nhận phần (1 − d) = 0,15',
           ['Vì Page 4 có nhiều liên kết đi ra nhất', 'Vì Page 4 nằm ở cuối đồ thị', 'Vì d = 0,85 làm PageRank của mọi trang giảm đi'],
           'Page 4 không có in-link → PR = (1 − d) + d×0 = **0,15** mãi mãi.'))
it.append((P2 + ' Tổng PageRank của 4 trang sau vòng lặp đầu tiên bằng bao nhiêu?', '4', ['1', '3,4', '2,275'],
           '1 + 0,575 + 2,275 + 0,15 = **4** (bằng số trang N khi khởi tạo mỗi trang = 1).'))
it.append((P2 + ' Số liên kết đi ra của Page 1, ký hiệu C(1), bằng bao nhiêu?', '2', ['1', '3', '0'],
           'Page 1 liên kết đến Page 2 và Page 3 → **C(1) = 2**.'))
it.append((P3 + ' Page 3 nhận liên kết từ những trang nào?', 'Page 1 và Page 2', ['Chỉ Page 1', 'Chỉ Page 2', 'Page 2 và Page 3'],
           'Cạnh 1→3 và 2→3 → Page 3 có 2 in-link (từ 1 và 2).'))

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


# ---- Bổ sung: hình CPT+ với SBC (nhánh đơn gộp thành một nút) ----
SBC_PRE = 'Cho cấu trúc CPT+ gồm Prediction Tree, Inverted Index và Lookup Table như hình (nén nhánh đơn). '
NONE_PRE = 'Cho cấu trúc CPT+ gồm Prediction Tree, Inverted Index và Lookup Table như hình (chưa nén). '
SBC_DATA = 'Hình CPT+ nén nhánh đơn: s1 = ⟨A,B,C⟩; s2 = ⟨D,E⟩; s3 = ⟨D,B⟩; s4 = ⟨F⟩. '
# Câu chính: đáp án đúng ở vị trí C (SBC) như đề mẫu -> pos = 2
it.append((SBC_PRE + 'Trên cây, nhánh root → A → B → C không rẽ nhánh: A chỉ có một con là B, B chỉ có một con là C, và cả chuỗi đã được gộp thành một nút duy nhất "ABC". '
           'Hình ảnh minh họa cho chiến lược nén/tối ưu nào đã được áp dụng?',
           'SBC (Simple Branches Compression)',
           ['PNR (Prediction with improved Noise Reduction)', 'FSC (Frequent Subsequence Compression)', 'Không áp dụng chiến lược nào'],
           'Chuỗi nút chỉ có một con (A → B → C, không rẽ nhánh) được gộp thành một nút → **SBC**. '
           'FSC thì thay chuỗi con thường xuyên bằng một ký hiệu mới (như x = AB); PNR thuộc giai đoạn dự đoán.', 2))
it.append((NONE_PRE + 'Trên cây, nhánh root → A → B → C gồm các nút riêng lẻ A, B, C; không có nút nào gộp hoặc thay bằng ký hiệu mới. '
           'Hình ảnh minh họa cho chiến lược nén/tối ưu nào đã được áp dụng?',
           'Không áp dụng chiến lược nào',
           ['SBC (Simple Branches Compression)', 'FSC (Frequent Subsequence Compression)', 'PNR (Prediction with improved Noise Reduction)'],
           'Cây vẫn giữ nguyên từng nút A, B, C → **chưa nén** (nếu gộp A → B → C thành "ABC" mới là SBC).', 3))
it.append((SBC_DATA + 'Trong hình, nhánh nào đã được gộp thành một nút?', 'Nhánh root → A → B → C (mỗi nút chỉ có một con) thành nút "ABC"',
           ['Nhánh D → E và D → B thành nút "DEB"', 'Nhánh root → F thành nút "root-F"', 'Không có nhánh nào được gộp'],
           'Chỉ có chuỗi A → B → C không rẽ nhánh được gộp thành "ABC".'))
it.append((SBC_DATA + 'Vì sao nút D (con của root) không thể gộp với E hoặc B bằng SBC?', 'Vì D rẽ thành 2 nhánh con (E và B), SBC chỉ gộp các nút chỉ có một con',
           ['Vì D là nút lá của cây', 'Vì D không xuất hiện trong Inverted Index', 'Vì D có số lần xuất hiện nhỏ nhất'],
           'SBC chỉ gộp các **nhánh đơn** (không rẽ nhánh). D có 2 con nên giữ nguyên.'))
it.append((SBC_DATA + 'Chưa nén, Prediction Tree có bao nhiêu nút (không tính root)?', '7 nút',
           ['5 nút', '6 nút', '8 nút'],
           'A, B, C (3) + D, E, B (3) + F (1) = **7**.'))
it.append((SBC_DATA + 'Sau khi gộp A → B → C thành "ABC" (SBC), Prediction Tree có bao nhiêu nút (không tính root)?', '5 nút',
           ['7 nút', '6 nút', '3 nút'],
           'ABC, D, E, B, F = **5** (giảm 2 nút so với 7).'))
it.append((SBC_DATA + 'Lookup Table trỏ chuỗi s1 tới nút nào?', 'Nút "ABC" (nút cuối của chuỗi s1 sau khi nén)',
           ['Nút root', 'Nút D', 'Nút F'],
           's1 = ⟨A,B,C⟩ đã gộp thành "ABC" nên Lookup Table trỏ tới nút **ABC**.'))
it.append((SBC_DATA + 'Các chuỗi nào chứa item B (theo Inverted Index)?', 's1 và s3',
           ['Chỉ s1', 's2 và s3', 's1, s2 và s3'],
           'Hàng B: 1 ở cột s1 và s3 → **{s1, s3}**.'))
it.append(('Dấu hiệu nào trên hình cho thấy SBC đã được áp dụng?', 'Một chuỗi các nút chỉ có một con (không rẽ nhánh) được gộp thành một nút duy nhất (ví dụ "ABC")',
           ['Một chuỗi con thường xuyên được thay bằng ký hiệu mới (ví dụ x = AB)', 'Các item nhiễu bị loại khỏi chuỗi truy vấn', 'Inverted Index có thêm nhiều cột mới'],
           '**SBC**: gộp nhánh đơn. Thay chuỗi con bằng ký hiệu (x = AB) là **FSC**; loại nhiễu khi dự đoán là **PNR**.'))
it.append(('Phân biệt: hình có nút x và chú thích "x = AB" là dấu hiệu của chiến lược nào, còn hình có nút "ABC" gộp từ nhánh đơn A → B → C là chiến lược nào?', 'x = AB là FSC; nút "ABC" gộp từ nhánh đơn là SBC',
           ['x = AB là SBC; nút "ABC" là FSC', 'Cả hai đều là PNR', 'Cả hai đều là FSC'],
           '**FSC**: thay chuỗi con thường xuyên bằng ký hiệu mới. **SBC**: gộp các nút chỉ có một con.'))


# ---- Bổ sung đợt 2: các dạng câu hỏi cấu trúc CPT+ (đọc Inverted Index, đọc chuỗi, Lookup Table, đường đi, nút nén, nhận diện nén, dự đoán, lý do) ----
# Hình 1 (x = AB): dùng FIG; hình 2 (SBC): SBC_DATA; hình 3 (FSC + SBC): BOTH_DATA
BOTH_PRE = 'Cho cấu trúc CPT+ gồm Prediction Tree, Inverted Index và Lookup Table như hình (nén kết hợp). '
BOTH_DATA = 'Hình CPT+ nén kết hợp: s1 = ⟨A,B,C⟩; s2 = ⟨A,B,D⟩; s3 = ⟨E,F⟩; s4 = ⟨B,E⟩. Cây: root → x → C; x → D; root → BE; root → EF (x = AB). '


def q(text, correct, wrongs, expl, pos=None):
    it.append((text, correct, wrongs, expl) if pos is None else (text, correct, wrongs, expl, pos))


# ===== Dạng 1: đọc Inverted Index (hình x = AB) =====
q(FIG + 'C xuất hiện trong những chuỗi nào?', 's1, s3 và s4', ['s1, s2 và s3', 's3 và s4', 's1, s3 và s5'],
  'Hàng C của Inverted Index có 1 ở cột s1, s3, s4.')
q(FIG + 'Item E xuất hiện trong bao nhiêu chuỗi?', '1 chuỗi (s5)', ['2 chuỗi', '3 chuỗi', '5 chuỗi'],
  'Hàng E chỉ có số 1 ở cột s5.')
q(FIG + 'Item nào xuất hiện trong NHIỀU chuỗi nhất?', 'B (5 chuỗi)', ['A (4 chuỗi)', 'C (3 chuỗi)', 'E (1 chuỗi)'],
  'Hàng B toàn số 1 → B có trong cả 5 chuỗi.')
q(FIG + 'Những item nào chỉ xuất hiện trong đúng một chuỗi?', 'D (chỉ s3) và E (chỉ s5)', ['C và D', 'A và E', 'B và D'],
  'D chỉ ở s3, E chỉ ở s5; A có 4 chuỗi, B có 5, C có 3.')
q(FIG + 'Item A xuất hiện trong bao nhiêu chuỗi và đó là chuỗi nào?', '4 chuỗi: s1, s2, s3, s5', ['5 chuỗi: s1 đến s5', '3 chuỗi: s1, s3, s5', '4 chuỗi: s1, s2, s3, s4'],
  'Hàng A có 1 ở s1, s2, s3, s5 (s4 = ⟨B,C⟩ không có A).')

# ===== Dạng 2: đọc chuỗi (hình x = AB) =====
q(FIG + 'Chuỗi s3 chứa những item nào?', 'A, B, C, D', ['A, B, C', 'B, C, D', 'A, B, D'],
  'Cột s3: A = 1, B = 1, C = 1, D = 1, E = 0.')
q(FIG + 'Chuỗi s5 chứa những item nào?', 'A, B, E', ['A, B, C', 'B, C, E', 'A, B, D'],
  'Cột s5: A = 1, B = 1, E = 1.')
q(FIG + 'Chuỗi s4 chứa những item nào?', 'B, C', ['A, B', 'A, B, C', 'B, C, D'],
  'Cột s4: chỉ B và C có số 1.')
q(FIG + 'Chuỗi nào dài nhất (nhiều item nhất)?', 's3 (4 item)', ['s1 (3 item)', 's5 (3 item)', 's2 (2 item)'],
  's3 = ⟨A,B,C,D⟩ có 4 item; s1 và s5 có 3; s2 có 2; s4 có 2.')

# ===== Dạng 3: Lookup Table (hình x = AB) =====
q(FIG + 'Lookup Table: chuỗi nào có nút cuối là nút D?', 's3', ['s1', 's4', 's5'],
  'Đường x → C → D ứng với s3 = ⟨A,B,C,D⟩ nên Lookup Table của s3 trỏ tới D.')
q(FIG + 'Lookup Table: chuỗi nào có nút cuối là nút x?', 's2 = ⟨A,B⟩', ['s1', 's4', 's5'],
  's2 = ⟨A,B⟩ chính là x → nút cuối là x.')
q(FIG + 'Chuỗi s5 được lưu (nút cuối) ở nút nào trên cây?', 'Nút E (con của x)', ['Nút x', 'Nút C', 'Nút D'],
  's5 = ⟨A,B,E⟩ = x → E.')
q(FIG + 'Chuỗi s1 được lưu (nút cuối) ở nút nào trên cây?', 'Nút C nằm dưới x (x → C)', ['Nút C nằm dưới B', 'Nút D', 'Nút x'],
  's1 = ⟨A,B,C⟩ = x → C.')
q(FIG + 'Chuỗi s4 được lưu (nút cuối) ở nút nào trên cây?', 'Nút C nằm dưới B (root → B → C)', ['Nút C nằm dưới x', 'Nút B', 'Nút x'],
  's4 = ⟨B,C⟩ không chứa AB nên đi theo nhánh root → B → C.')

# ===== Dạng 4: đường đi trên cây (hình x = AB) =====
q(FIG + 'Đường đi từ root tới nút D qua những nút nào?', 'root → x → C → D', ['root → B → C → D', 'root → x → E → D', 'root → A → B → D'],
  'D là con của C, C là con của x, x là con của root.')
q(FIG + 'Những chuỗi nào đi qua nút x?', 's1, s2, s3 và s5', ['s1, s2, s3, s4 và s5', 's3 và s5', 'Chỉ s4'],
  'Các chuỗi chứa AB (s1, s2, s3, s5) đều đi qua x; s4 đi theo nhánh B.')
q(FIG + 'Những chuỗi nào đi qua nút B nằm trực tiếp dưới root?', 'Chỉ s4', ['s1 và s4', 's2 và s3', 'Tất cả các chuỗi'],
  'Nút B (con của root) chỉ thuộc s4 = ⟨B,C⟩.')
q(FIG + 'Nút E là con trực tiếp của nút nào?', 'x', ['B', 'C', 'root'],
  's5 = ⟨A,B,E⟩ = x → E.')
q(FIG + 'Những chuỗi nào đi qua nút C nằm dưới x?', 's1 và s3', ['s1 và s4', 's3 và s4', 's1, s3 và s4'],
  'x → C thuộc s1 = ⟨A,B,C⟩ và s3 = ⟨A,B,C,D⟩. s4 có nút C nhưng dưới B.')

# ===== Dạng 5: ý nghĩa nút nén (hình x = AB) =====
q(FIG + 'Nút x trong cây (x = AB) đại diện cho gì?', 'Chuỗi con A rồi B (xuất hiện thường xuyên)', ['Một item mới hoàn toàn trong dữ liệu gốc', 'Item A hoặc item B', 'Chuỗi con B rồi A'],
  'x là ký hiệu thay cho chuỗi con thường xuyên AB.')
q(FIG + 'Việc nén bằng x = AB có tác dụng gì?', 'Giảm số nút của cây vì 4 chuỗi cùng dùng một nút x thay cho hai nút A, B riêng', ['Tăng số nút của cây để dự đoán chính xác hơn', 'Loại bỏ item B khỏi dữ liệu', 'Thay thế hoàn toàn Inverted Index'],
  'Nén giúp tiết kiệm bộ nhớ và duyệt cây nhanh hơn.')
q(FIG + 'Trên đường đi của s5 = ⟨A,B,E⟩, số nút trước và sau khi nén là:', 'Trước nén: 3 nút (A, B, E); sau nén: 2 nút (x, E)', ['Trước nén: 2 nút; sau nén: 3 nút', 'Trước nén: 3 nút; sau nén: 3 nút', 'Trước nén: 3 nút; sau nén: 1 nút'],
  'A, B thay bằng x nên 3 nút → 2 nút.')

# ===== Dạng 7: dự đoán (hình x = AB) =====
q(FIG + 'Dùng Inverted Index dự đoán với truy vấn ⟨A, C⟩. Item nào được dự đoán?', 'D', ['B', 'E', 'Không dự đoán được'],
  'Chuỗi chứa A và C: s1, s3. Phần đuôi: s1 rỗng; s3 = ⟨D⟩ → **D**.')
q(FIG + 'Dự đoán với truy vấn ⟨A, B, E⟩ thì kết quả là gì?', 'Không dự đoán được (chuỗi khớp s5 có phần đuôi rỗng)', ['C', 'D', 'E'],
  'Chỉ s5 chứa cả A, B, E và sau E không còn item nào.')
q(FIG + 'Các bước dự đoán với truy vấn ⟨A, B⟩ theo CPT theo thứ tự nào?',
  'Inverted Index: lấy giao các chuỗi chứa A và B → lấy phần đuôi của các chuỗi đó → chọn item có điểm cao nhất',
  ['Lấy phần đuôi → Inverted Index tìm chuỗi → chọn item có điểm cao nhất', 'Duyệt toàn bộ cây từ root cho mọi chuỗi → đếm item A và B', 'Chọn ngẫu nhiên một item trong Inverted Index'],
  'Inverted Index trước (tìm chuỗi khớp), sau đó tính điểm trên phần đuôi.')

# ===== Dạng 8: lý do cấu trúc =====
q('Vì sao CPT cần Inverted Index?', 'Để tìm nhanh các chuỗi chứa mọi item của truy vấn (lấy giao), không phải duyệt lại toàn bộ cây', ['Để nén các nhánh đơn của cây', 'Để lưu điểm PageRank', 'Để thay chuỗi con bằng ký hiệu mới'],
  'Inverted Index: item → tập chuỗi chứa nó.')
q('Vì sao CPT cần Lookup Table?', 'Để truy cập thẳng nút cuối của từng chuỗi trên cây, không phải dò từ root', ['Để đếm số lần xuất hiện của item', 'Để nén các nhánh đơn của cây', 'Để loại bỏ item nhiễu khỏi truy vấn'],
  'Lookup Table: chuỗi → nút cuối trong Prediction Tree.')
q('Prediction Tree trong CPT có lợi gì so với lưu từng chuỗi riêng lẻ?', 'Các chuỗi có tiền tố chung dùng chung các nút nên tiết kiệm bộ nhớ', ['Giúp tính PageRank nhanh hơn', 'Tự động loại bỏ mọi item hiếm', 'Không cần Inverted Index nữa'],
  'Cây (trie) chia sẻ tiền tố chung.')
q('Ba thành phần của CPT phối hợp thế nào khi dự đoán?', 'Inverted Index tìm chuỗi khớp, Lookup Table đưa tới nút cuối, Prediction Tree cho phần đuôi (consequent)', ['Prediction Tree tìm chuỗi khớp, Inverted Index tính điểm, Lookup Table nén cây', 'Lookup Table tìm chuỗi khớp, Prediction Tree nén cây, Inverted Index loại nhiễu', 'Chỉ dùng Prediction Tree, hai thành phần còn lại không cần thiết'],
  'Mỗi thành phần có vai trò riêng; kết hợp lại giúp dự đoán nhanh mà không duyệt toàn bộ dữ liệu.')

# ===== Hình 2 (SBC) =====
q(SBC_DATA + 'Truy vấn ⟨D⟩ khớp với những chuỗi nào (dùng Inverted Index)?', 's2 và s3', ['s1 và s2', 's3 và s4', 'Chỉ s2'],
  'Hàng D: 1 ở cột s2 và s3.')
q(SBC_DATA + 'Chuỗi nào chứa item F?', 'Chỉ s4', ['s1', 's2 và s3', 's3 và s4'],
  'Hàng F chỉ có số 1 ở cột s4.')
q(SBC_DATA + 'Item nào xuất hiện trong nhiều chuỗi nhất?', 'B và D (mỗi item 2 chuỗi)', ['A (3 chuỗi)', 'C và F (mỗi item 2 chuỗi)', 'E (3 chuỗi)'],
  'B: s1, s3; D: s2, s3; còn lại chỉ 1 chuỗi.')
q(SBC_DATA + 'Chuỗi s3 được lưu (nút cuối) ở nút nào?', 'Nút B nằm dưới D (root → D → B)', ['Nút "ABC"', 'Nút B nằm dưới ABC', 'Nút E'],
  's3 = ⟨D,B⟩ = root → D → B.')
q(SBC_DATA + 'Đường đi từ root tới nút E là:', 'root → D → E', ['root → ABC → E', 'root → F → E', 'root → D → B → E'],
  's2 = ⟨D,E⟩.')
q(SBC_DATA + 'Chuỗi s4 gồm những item nào và nằm ở nút nào?', 'Chỉ item F, nút F nằm trực tiếp dưới root', ['Item D và F, nút F dưới D', 'Item F và E, nút E dưới F', 'Item A, B, C'],
  'Cột s4 chỉ có F = 1.')

# ===== Hình 3 (FSC + SBC kết hợp) =====
q(BOTH_PRE + 'Trên cây có nút x (x = AB) và các nút gộp "BE", "EF" từ các nhánh đơn. Hình minh họa chiến lược nén nào đã được áp dụng?', 'Cả FSC và SBC',
  ['Chỉ FSC', 'Chỉ SBC', 'Không áp dụng chiến lược nào'],
  'x = AB là **FSC**; BE (B → E) và EF (E → F) là nhánh đơn gộp lại → **SBC**. Có cả hai.', 2)
q(BOTH_DATA + 'Nút "EF" trên cây là kết quả của chiến lược nào?', 'SBC (gộp nhánh đơn E → F thành một nút)', ['FSC (thay chuỗi con thường xuyên bằng ký hiệu)', 'PNR (giảm nhiễu khi dự đoán)', 'Không phải kết quả của chiến lược nào'],
  'E chỉ có một con là F nên gộp lại → SBC.')
q(BOTH_DATA + 'Nút x trên cây là kết quả của chiến lược nào?', 'FSC (x thay cho chuỗi con thường xuyên AB)', ['SBC (gộp nhánh đơn)', 'PNR (giảm nhiễu khi dự đoán)', 'Không áp dụng chiến lược nào'],
  'AB xuất hiện ở s1 và s2 → thay bằng x → FSC.')
q(BOTH_DATA + 'Vì sao nút x không bị gộp với C hoặc D bằng SBC?', 'Vì x rẽ thành 2 nhánh con (C và D)', ['Vì x là nút lá', 'Vì x không có trong Inverted Index', 'Vì C và D không xuất hiện trong dữ liệu'],
  'SBC chỉ gộp các nút chỉ có một con.')
q(BOTH_DATA + 'Chuỗi s3 được lưu (nút cuối) ở nút nào?', 'Nút "EF"', ['Nút "BE"', 'Nút x', 'Nút D'], 's3 = ⟨E,F⟩ đã gộp thành "EF".')
q(BOTH_DATA + 'Chuỗi s4 được lưu (nút cuối) ở nút nào?', 'Nút "BE"', ['Nút "EF"', 'Nút x', 'Nút C'], 's4 = ⟨B,E⟩ đã gộp thành "BE".')
q(BOTH_DATA + 'Những chuỗi nào đi qua nút x?', 's1 và s2', ['s3 và s4', 's1 và s4', 'Cả 4 chuỗi'], 's1 = ⟨A,B,C⟩ và s2 = ⟨A,B,D⟩ cùng chứa AB.')
q(BOTH_DATA + 'Item E xuất hiện trong những chuỗi nào (Inverted Index)?', 's3 và s4', ['s1 và s2', 'Chỉ s3', 's2 và s4'], 'Hàng E: 1 ở cột s3 và s4.')
q(BOTH_DATA + 'Chưa nén, Prediction Tree có bao nhiêu nút (không tính root)?', '8 nút', ['5 nút', '6 nút', '10 nút'],
  'A, B, C, D (4) + E, F (2) + B, E (2) = **8**.')
q(BOTH_DATA + 'Sau khi nén (x = AB, BE, EF), Prediction Tree có bao nhiêu nút (không tính root)?', '5 nút', ['8 nút', '6 nút', '4 nút'],
  'x, C, D, BE, EF = **5**.')
q(BOTH_DATA + 'Dự đoán với truy vấn ⟨A⟩, item nào có điểm cao nhất?', 'B (có trong phần đuôi của cả s1 và s2)', ['C (chỉ s1)', 'D (chỉ s2)', 'E'],
  'Chuỗi chứa A: s1 (đuôi B, C), s2 (đuôi B, D) → B có 2 điểm, C và D 1 điểm.')
q(BOTH_DATA + 'Dự đoán với truy vấn ⟨E⟩, item nào được dự đoán?', 'F', ['B', 'C', 'Không dự đoán được'],
  'Chuỗi chứa E: s3 (đuôi F) và s4 = ⟨B,E⟩ (đuôi rỗng) → chỉ **F**.')
q(BOTH_DATA + 'Dự đoán với truy vấn ⟨A, B⟩, kết quả là:', 'C và D có điểm bằng nhau (1 điểm mỗi item)', ['C có điểm cao nhất', 'D có điểm cao nhất', 'Không dự đoán được'],
  'Chuỗi chứa A và B: s1 (đuôi C), s2 (đuôi D) → hòa.')

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


# =====================================================================
# Biến thể "khác gợi ý": cùng mục kiến thức với gợi ý của thầy nhưng hỏi theo hướng khác
# (giống cách đề năm ngoái hỏi Câu 10, 12, 32 khác với gợi ý)
# =====================================================================
def Q(lst, text, correct, wrongs, expl):
    lst.append((text, correct, wrongs, expl))


# ---------- (1/3) Kiến trúc, mô hình hóa & pipeline (gợi ý 1–15) ----------
it = []
Q(it, 'Ứng dụng nào phù hợp nhất với Firebolt?', 'Dashboard/ứng dụng phân tích tương tác cần phản hồi truy vấn rất nhanh (gần thời gian thực)',
  ['Lưu trữ file sao lưu dài hạn chi phí thấp', 'Huấn luyện mô hình ML quy mô lớn bằng GPU', 'Quản lý danh tính và phân quyền người dùng'],
  '**Firebolt** nổi bật ở tốc độ truy vấn cực nhanh cho phân tích thời gian thực.')
Q(it, 'Result caching hoạt động như thế nào?', 'Khi gặp lại truy vấn giống hệt và dữ liệu nguồn chưa đổi, hệ thống trả kết quả đã lưu thay vì tính lại',
  ['Luôn tính lại từ đầu để bảo đảm kết quả mới nhất', 'Tự động xóa kết quả sau mỗi truy vấn', 'Chỉ lưu kết quả của các truy vấn ghi (INSERT/UPDATE)'],
  '**Caching** lưu kết quả đã tính để tránh tính toán lại, giảm chi phí.')
Q(it, 'Lợi ích chính của caching trong Modern Data Warehouse là gì?', 'Giảm thời gian phản hồi và chi phí tính toán cho các truy vấn lặp lại',
  ['Tăng dung lượng lưu trữ dữ liệu gốc', 'Tự động mã hóa dữ liệu nhạy cảm', 'Thay thế hoàn toàn việc thiết kế mô hình dữ liệu'],
  'Caching tối ưu **chi phí và tốc độ** cho truy vấn lặp.')
Q(it, 'Data Fabric khác cách tiếp cận "sao chép mọi thứ về một kho" ở điểm nào?', 'Kết nối và ảo hóa dữ liệu tại nguồn, không bắt buộc sao chép tất cả về một nơi',
  ['Sao chép toàn bộ dữ liệu về một kho duy nhất rồi mới truy vấn', 'Chỉ hỗ trợ dữ liệu có cấu trúc trong một CSDL', 'Thay thế toàn bộ hệ thống nguồn bằng hệ thống mới'],
  '**Data Fabric** tập trung vào kết nối & ảo hóa các nguồn rời rạc.')
Q(it, 'Mục tiêu nào KHÔNG thuộc Data Fabric?', 'Sao chép vật lý toàn bộ dữ liệu về một kho duy nhất',
  ['Kết nối các nguồn dữ liệu rời rạc', 'Ảo hóa dữ liệu để truy cập thống nhất', 'Quản trị và bảo mật thống nhất trên nhiều nguồn'],
  'Data Fabric là kết nối/ảo hóa, không phải sao chép vật lý toàn bộ.')
Q(it, 'Data Catalog giúp người dùng việc gì?', 'Tìm kiếm và hiểu dữ liệu nhờ metadata (mô tả, vị trí, chủ sở hữu)',
  ['Tăng tốc độ truy vấn bằng cách nén dữ liệu', 'Tự động sửa lỗi dữ liệu nguồn', 'Huấn luyện mô hình dự báo trên dữ liệu'],
  '**Data Catalog** là thư viện thông tin và vị trí của các nguồn dữ liệu.')
Q(it, 'Technical Metadata thường gồm những thông tin nào?', 'Kiểu dữ liệu, schema, tần suất cập nhật (Freshness), chủ sở hữu kỹ thuật',
  ['Định nghĩa khái niệm kinh doanh như Churn', 'Điểm tin cậy do người dùng bình chọn', 'Nội dung báo cáo BI của phòng kinh doanh'],
  'Định nghĩa khái niệm kinh doanh thuộc **Business Glossary**.')
Q(it, 'Business Glossary (từ điển thuật ngữ kinh doanh) do bộ phận nào định nghĩa?', 'Governance Layer (tầng quản trị dữ liệu)',
  ['Mỗi lập trình viên tự đặt tên riêng', 'Công cụ BI tự sinh ra', 'Hệ quản trị CSDL nguồn'],
  '**Governance Layer** thống nhất khái niệm kinh doanh (ví dụ Churn).')
Q(it, 'Chính sách gắn trực tiếp vào danh tính (user/role) để cấp quyền truy cập chi tiết gọi là:', 'IAM Policies',
  ['Bucket Policies', 'Clustering Key', 'Partition Key'],
  '**IAM Policies** theo danh tính; **Bucket Policies** gắn vào bucket.')
Q(it, 'Bucket Policy được gắn vào đối tượng nào?', 'Bản thân bucket (Data Container), áp dụng cho các đối tượng bên trong',
  ['Từng người dùng riêng lẻ', 'Từng cột của một bảng', 'Từng câu truy vấn SQL'],
  'Bucket Policies quy định quyền cho **toàn bộ Data Container** từ bên ngoài.')
Q(it, 'Partition pruning (bỏ qua phân vùng) trong Snowflake hoạt động dựa trên điều gì?', 'Metadata của từng micro-partition (ví dụ giá trị min/max) để bỏ qua các phân vùng không liên quan',
  ['Xóa các phân vùng ít được dùng', 'Nén mọi phân vùng thành một file duy nhất', 'Sao chép phân vùng sang vùng địa lý khác'],
  'Micro-partition (~50–500MB) có metadata giúp **pruning**.')
Q(it, 'Nên chọn cột nào làm Clustering Key?', 'Cột thường dùng trong điều kiện lọc/sắp xếp của truy vấn (WHERE, JOIN)',
  ['Cột có toàn giá trị NULL', 'Cột lưu hình ảnh nhị phân', 'Cột có kiểu dữ liệu dài nhất'],
  'Clustering Key chọn theo **cột** thường dùng để lọc.')
Q(it, 'Mục đích của Clustering là gì?', 'Đưa dữ liệu liên quan nằm gần nhau để pruning hiệu quả hơn',
  ['Tăng kích thước của micro-partition', 'Mã hóa dữ liệu theo từng cột', 'Sao lưu dữ liệu sang vùng khác'],
  'Cụm dữ liệu liên quan → quét ít partition hơn.')
Q(it, 'Đặc điểm nào đúng với Accumulating Snapshot Fact Table?', 'Mỗi quy trình một dòng, dòng được cập nhật khi quy trình đi qua từng mốc',
  ['Mỗi sự kiện thêm một dòng mới và không bao giờ cập nhật', 'Chụp lại toàn bộ bảng theo chu kỳ cố định', 'Chỉ lưu thuộc tính mô tả, không có số đo'],
  '**Accumulating Snapshot** theo dõi quy trình nhiều giai đoạn.')
Q(it, 'Tình huống nào cần dùng Bridge Table?', 'Một tài khoản ngân hàng có nhiều chủ tài khoản và mỗi khách hàng có nhiều tài khoản',
  ['Mỗi đơn hàng thuộc đúng một khách hàng', 'Mỗi sản phẩm có đúng một mức giá', 'Mỗi ngày có đúng một dòng trong bảng ngày'],
  '**Bridge Table** giải quyết quan hệ nhiều-nhiều (M-M).')
Q(it, 'Bridge Table thường chứa những gì?', 'Khóa của hai bên trong quan hệ nhiều-nhiều (có thể thêm trọng số)',
  ['Chỉ các số đo của Fact', 'Toàn bộ nội dung của bảng Dimension', 'Chỉ khóa chính của bảng Fact'],
  'Bảng trung gian nối hai thực thể M-M.')
Q(it, 'Flat table (bảng phẳng/denormalized) được dùng để giảm thiểu phép toán nào khi truy vấn?', 'Phép Join giữa nhiều bảng',
  ['Phép lọc WHERE', 'Phép sắp xếp ORDER BY', 'Phép mã hóa dữ liệu'],
  'Gộp sẵn dữ liệu vào một bảng nên **giảm Join**.')
Q(it, 'Nhược điểm của flat table là gì?', 'Dư thừa dữ liệu (lặp thông tin), tốn dung lượng và khó cập nhật',
  ['Truy vấn luôn chậm hơn vì phải Join nhiều bảng', 'Không thể lưu số đo', 'Chỉ dùng được với dữ liệu phi cấu trúc'],
  'Denormalize đổi dung lượng/độ phức tạp cập nhật lấy tốc độ truy vấn.')
Q(it, 'Ưu điểm của flat table là gì?', 'Truy vấn nhanh, đơn giản vì không cần Join',
  ['Tiết kiệm dung lượng nhất', 'Không bao giờ dư thừa dữ liệu', 'Dễ cập nhật nhất vì mỗi thông tin chỉ lưu một lần'],
  'Flat table: ít Join, nhưng dư thừa dữ liệu.')
Q(it, 'Ví dụ nào minh họa Schema Evolution của Snowflake?', 'Nguồn thêm cột mới, bảng đích tự thêm cột khi nạp dữ liệu mà không cần sửa tay',
  ['Bảng bị khóa không cho nạp dữ liệu có cột mới', 'Cột cũ bị xóa tự động mỗi ngày', 'Dữ liệu tự chuyển sang kiểu nhị phân'],
  '**Schema Evolution**: tự điều chỉnh cấu trúc bảng khi nguồn thay đổi.')
Q(it, 'Schema Test (generic test) trong dbt dùng để kiểm tra điều gì?', 'Các ràng buộc chuẩn khai báo sẵn như unique, not_null, accepted_values, relationships',
  ['Câu SQL tùy biến riêng cho từng tình huống nghiệp vụ', 'Tốc độ chạy của pipeline', 'Dung lượng lưu trữ của bảng'],
  'Schema Test khai báo sẵn; **Singular Test** là SQL riêng cho nghiệp vụ đặc thù.')
Q(it, 'Test relationships trong dbt kiểm tra điều gì?', 'Mỗi giá trị khóa ngoại phải tồn tại ở bảng tham chiếu',
  ['Giá trị không được trùng lặp', 'Giá trị không được rỗng', 'Giá trị phải thuộc danh sách cho phép'],
  '**relationships** = kiểm tra toàn vẹn tham chiếu (khóa ngoại).')
Q(it, 'Test unique trong dbt kiểm tra điều gì?', 'Cột không có giá trị trùng lặp',
  ['Cột không có giá trị rỗng', 'Cột thuộc danh sách giá trị cho phép', 'Cột tồn tại ở bảng khác'],
  '**unique**: không trùng lặp; **not_null**: không rỗng.')
Q(it, 'Test accepted_values trong dbt kiểm tra điều gì?', 'Giá trị của cột phải nằm trong danh sách cho phép',
  ['Giá trị của cột không được trùng lặp', 'Giá trị của cột không được rỗng', 'Giá trị của cột phải tồn tại ở bảng khác'],
  '**accepted_values**: giới hạn tập giá trị hợp lệ.')
Q(it, 'Phân biệt Schema Test và Singular Test trong dbt:', 'Schema Test khai báo sẵn (unique, not_null…); Singular Test là câu SQL riêng cho tình huống nghiệp vụ đặc thù',
  ['Schema Test là câu SQL riêng; Singular Test khai báo sẵn (unique, not_null…)', 'Cả hai đều là câu SQL tùy biến', 'Schema Test chỉ chạy trên dữ liệu phi cấu trúc'],
  'Đây là cặp dễ bị hỏi đảo: **Schema = khai báo sẵn**, **Singular = SQL riêng**.')
Q(it, 'Trong Jinja, cú pháp nào dùng cho biểu thức và câu lệnh điều khiển?', '{{ ... }} cho biểu thức và {% ... %} cho câu lệnh điều khiển',
  ['<% ... %> cho biểu thức và <%= ... %> cho lệnh', '[[ ... ]] cho biểu thức và (( ... )) cho lệnh', '@@ ... @@ cho biểu thức và ## ... ## cho lệnh'],
  'Jinja: `{{ }}` (biểu thức), `{% %}` (câu lệnh).')
Q(it, 'Macro trong dbt/Jinja là gì?', 'Đoạn mã SQL/Jinja tái sử dụng được như một hàm',
  ['Một bảng tạm lưu kết quả truy vấn', 'Một loại index đặc biệt', 'Một chính sách phân quyền'],
  'Jinja + Dynamic SQL giúp giảm code lặp.')
Q(it, 'DAG trong Apache Airflow là gì?', 'Đồ thị có hướng không chu trình mô tả các tác vụ và thứ tự phụ thuộc',
  ['Đồ thị vô hướng có chu trình', 'Bảng chứa kết quả truy vấn', 'Một loại index của CSDL'],
  '**DAG** = Directed Acyclic Graph.')
Q(it, 'Apache Airflow phù hợp nhất để làm gì?', 'Lập lịch, điều phối và giám sát các workflow/pipeline dữ liệu',
  ['Lưu trữ dữ liệu quy mô lớn', 'Vẽ biểu đồ BI', 'Huấn luyện mô hình ngôn ngữ lớn'],
  'Airflow là công cụ **orchestration** theo tư duy Task-centric.')
Q(it, 'Dagster "Asset-centric" nghĩa là gì?', 'Tập trung vào các tài sản dữ liệu (bảng, mô hình) được tạo ra và sự phụ thuộc giữa chúng',
  ['Tập trung vào từng tác vụ đang chạy', 'Tập trung vào lưu trữ file', 'Tập trung vào bảo mật truy cập'],
  'Airflow = Task-centric; Dagster = **Asset-centric**.')
Q(it, 'Lợi ích của Storage Mirroring là gì?', 'Dữ liệu nguồn được nhân bản liên tục sang tầng lưu trữ để phân tích, giảm công sức xây pipeline ETL thủ công',
  ['Dữ liệu chỉ được sao chép một lần duy nhất', 'Dữ liệu nguồn bị xóa sau khi sao chép', 'Tự động mã hóa mọi cột dữ liệu'],
  'Mirroring nhận bản sao từ nguồn và **liên tục cập nhật** theo thay đổi.')
T.append(('Biến thể khác gợi ý (1/3): Kiến trúc, mô hình hóa & pipeline (gợi ý 1–15)', it))

# ---------- (2/3) Tiền xử lý & khai phá dữ liệu (gợi ý 16–30) ----------
it = []
Q(it, 'Dataset có 3 lớp với tỉ lệ mẫu bằng nhau (mỗi lớp 1/3). Entropy Info(D) xấp xỉ bao nhiêu?', '1,585 bit', ['1,000 bit', '2,000 bit', '0,918 bit'],
  'Info(D) = −3·(1/3)·log2(1/3) = log2(3) ≈ **1,585**.')
Q(it, 'Sau khi chuẩn hóa Min-Max về [0, 1], giá trị nhỏ nhất của thuộc tính trở thành bao nhiêu?', '0', ['1', '0,5', '-1'],
  "v′ = (min − min)/(max − min) = **0**.")
Q(it, 'Khách hàng có thu nhập đúng bằng thu nhập cao nhất. Sau Min-Max về [0, 1], thu nhập của họ là:', '1', ['0', '0,5', '10'],
  "v′ = (max − min)/(max − min) = **1**.")
Q(it, 'Giá trị Z-Score bằng 0 nghĩa là gì?', 'Giá trị bằng đúng giá trị trung bình', ['Giá trị bằng độ lệch chuẩn', 'Giá trị là giá trị lớn nhất', 'Giá trị bị thiếu'],
  'Z = (v − μ)/σ = 0 ⇔ v = μ.')
Q(it, 'Z-Score = 2 nghĩa là gì?', 'Giá trị cao hơn trung bình 2 độ lệch chuẩn', ['Giá trị gấp 2 lần giá trị trung bình', 'Giá trị thấp hơn trung bình 2 độ lệch chuẩn', 'Giá trị bằng 2 lần giá trị lớn nhất'],
  'Z đo khoảng cách so với trung bình theo đơn vị độ lệch chuẩn.')
Q(it, 'Ví dụ nào là Discretization (rời rạc hóa)?', 'Chuyển tuổi (số liên tục) thành các nhóm Trẻ / Trung niên / Cao tuổi',
  ['Chuẩn hóa tuổi về đoạn [0, 1]', 'Xóa cột tuổi khỏi dữ liệu', 'Thay mọi giá trị tuổi bằng giá trị trung bình'],
  'Discretization biến thuộc tính liên tục thành các khoảng/nhãn rời rạc.')
Q(it, 'Bản chất của PCA là gì?', 'Biến đổi các thuộc tính ban đầu thành các thành phần chính không tương quan, giữ phần lớn phương sai',
  ['Chọn ngẫu nhiên một số cột và xóa phần còn lại', 'Gom nhóm các bản ghi thành các cụm', 'Sinh luật kết hợp từ tập giao dịch'],
  '**PCA** giảm chiều, giữ tối đa phương sai.')
Q(it, 'Thành phần chính đầu tiên (PC1) của PCA có đặc điểm gì?', 'Là hướng có phương sai lớn nhất của dữ liệu', ['Là hướng có phương sai nhỏ nhất', 'Là hướng trùng với nhãn lớp', 'Là một hướng ngẫu nhiên'],
  'Các thành phần chính sắp theo phương sai giảm dần.')
rule(['c'], ['d', 'e'], 'Support')
rule(['c'], ['d', 'e'], 'Confidence')
rule(['c'], ['d', 'e'], 'Lift')
rule(['c'], ['d', 'e'], 'Leverage')
rule(['d', 'e'], ['c'], 'Confidence')
rule(['d', 'e'], ['c'], 'Lift')
Q(it, 'Ngưỡng minconf (độ tin cậy tối thiểu) thông thường được chọn là:', '80%', ['1%', '50%', '100%'], 'minsup thường 1%, **minconf thường 80%**.')
Q(it, 'Có 6 item đơn lẻ phổ biến. Số itemset 2 phần tử chính xác (tổ hợp) là bao nhiêu?', '15', ['18', '12', '36'],
  'C(6,2) = 6×5/2 = **15** (xấp xỉ n²/2 = 18 theo slide).')
T.append(('Biến thể khác gợi ý (2/3): Tiền xử lý & khai phá dữ liệu (gợi ý 16–30)', it))

# ---------- (3/3) Graph, Blockchain, Vector, AI Act & BI (gợi ý 31–40) ----------
it = []
Q(it, 'Gợi ý "bạn bè gần nhất" (cách 1–2 bước) trong mạng xã hội nên dùng thuật toán duyệt nào?', 'BFS', ['DFS', 'Quick Sort', 'K-Means'],
  '**BFS** duyệt theo cấp nên ưu tiên các nút lân cận gần nhất.')
Q(it, 'Thuật toán nào đi sâu hết một nhánh rồi mới quay lui, hợp để tìm chuỗi liên kết dài hoặc duyệt taxonomy?', 'DFS', ['BFS', 'Binary Search', 'PCA'],
  '**DFS**: đi sâu, dùng Stack/đệ quy.')
Q(it, 'Vì sao cần Data Normalization khi chuyển dữ liệu Blockchain thành bảng quan hệ?', 'Để quy đổi đơn vị (Wei → Ether) và đồng bộ Timestamp về UTC',
  ['Để mã hóa dữ liệu bằng SHA-256', 'Để xóa các giao dịch cũ', 'Để sao chép toàn bộ chuỗi khối về CSDL nguồn'],
  'Chuẩn hóa đơn vị/thời gian giúp chạy BI/Fintech trên dữ liệu on-chain.')
Q(it, 'IVFFLAT hoạt động như thế nào?', 'Chia không gian vector thành các phân vùng (cụm/Voronoi cells) và chỉ tìm trong vài phân vùng gần nhất',
  ['Nén vector thành mã ngắn bằng Product Quantization', 'Xây đồ thị phân cấp nhiều tầng (small world)', 'Băm văn bản thành chuỗi hex'],
  'IVF thu hẹp phạm vi tìm bằng phân cụm; HNSW dùng đồ thị phân cấp.')
Q(it, 'Theo slide, AI Act áp dụng toàn diện từ năm nào?', '2026', ['2020', '2023', '2030'], 'Theo slide: áp dụng toàn diện từ **2026**.')
Q(it, 'Ba trụ cột của AI đáng tin cậy được nhấn mạnh là:', 'Transparency, Human Oversight, Data Quality', ['Speed, Cost, Scale', 'Security, Backup, Recovery', 'Volume, Velocity, Variety'],
  'Minh bạch, giám sát của con người, chất lượng dữ liệu.')
Q(it, 'Traceability trong quản trị AI nghĩa là gì?', 'Hệ thống tự động ghi nhật ký để theo dõi và kiểm toán toàn bộ vòng đời vận hành',
  ['Mã hóa toàn bộ dữ liệu huấn luyện', 'Xóa dữ liệu sau khi huấn luyện', 'Tăng tốc độ huấn luyện mô hình'],
  '**Traceability** = truy vết/ghi nhật ký phục vụ kiểm toán.')
Q(it, 'GraphRAG khác RAG thông thường ở điểm nào?', 'Truy vấn theo quan hệ giữa các thực thể trong Knowledge Graph, không chỉ độ tương đồng vector',
  ['Chỉ xử lý dữ liệu dạng bảng', 'Không dùng mô hình ngôn ngữ', 'Thay thế hoàn toàn cơ sở dữ liệu'],
  'GraphRAG dùng dạng dữ liệu **Graph**.')
Q(it, 'Nhóm nào sau đây đều là BI Tool?', 'Looker, Power BI, Tableau', ['ChatGPT, Gemini, DeepSeek', 'Airflow, Dagster, Prefect', 'Snowflake, BigQuery, Redshift'],
  'ChatGPT/Gemini/DeepSeek là LLM; Airflow/Dagster là orchestration; Snowflake/BigQuery là Data Warehouse.')
Q(it, 'Điều kiện dừng của thuật toán PageRank là gì?', 'Chênh lệch PageRank giữa hai vòng lặp liên tiếp nhỏ hơn ngưỡng ε',
  ['Khi mọi trang đều có PageRank bằng 1', 'Sau đúng 1 vòng lặp', 'Khi tổng PageRank bằng 0'],
  'Dừng khi |PR mới − PR cũ| < ε (thường 0,0001).')
Q(it, 'Trong công thức PageRank, phần (1 − d) = 0,15 biểu diễn điều gì?', 'Xác suất người dùng nhảy ngẫu nhiên sang một trang bất kỳ',
  ['Xác suất người dùng tiếp tục bấm liên kết', 'Số vòng lặp tối thiểu', 'Ngưỡng dừng ε'],
  'd = 0,85 là xác suất bấm tiếp liên kết; (1 − d) là xác suất nhảy ngẫu nhiên.')
Q(it, 'Ký hiệu C(q) trong công thức PageRank dùng để làm gì?', 'Chia PageRank của trang q cho số liên kết đi ra của q để phân bổ cho các trang nó trỏ tới',
  ['Đếm số liên kết đi vào của trang p', 'Đặt hệ số damping', 'Đặt ngưỡng dừng ε'],
  'PR(p) = (1 − d) + d·Σ PR(q)/C(q).')
Q(it, 'Số liên kết đi ra của trang p, ký hiệu C(p), còn được gọi là:', 'Out-degree', ['In-degree', 'Damping factor', 'PageRank'],
  'C(p) = out-degree.')
T.append(('Biến thể khác gợi ý (3/3): Graph, Blockchain, Vector, AI Act & BI (gợi ý 31–40)', it))

if __name__ == '__main__':
    for name, items in T:
        for item in items:
            q, c, w = item[0], item[1], item[2]
            assert len(w) == 3 and len({c, *w}) == 4, (q, c, w)
        print(len(items), name)
