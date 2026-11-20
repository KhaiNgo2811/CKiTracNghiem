# -*- coding: utf-8 -*-
"""Tạo chương CD (Nhà kho): gom câu hỏi từ C1..C9 + HOT theo 40 câu hỏi chẩn đoán."""
import json, re, io, sys
D = 'data/Nhà kho/'
def load(f): return json.load(open(D + f, encoding='utf-8-sig'))
src = []
for cid in ['HOT','C1','C2','C3','C4','C5','C6','C7','C8','C9']:
    for t in load(cid + '.json')['topics']:
        for q in t['questions']:
            src.append((cid, q))

# (tên chủ đề, regex từ khóa)
TOPICS = [
 ('1. Firebolt & các nền tảng Cloud Data Warehouse', r'firebolt|bigquery|snowflake|redshift|databricks sql|modern data warehouse'),
 ('2. Chiến lược chi phí: Caching, tránh tính toán lại', r'caching|cache|auto-?suspend|pruning|materialized'),
 ('3. Data Fabric & Data Mesh', r'data fabric|data mesh|virtualiz'),
 ('4. Data Catalog & Metadata', r'data catalog|metadata|business glossary|semantic search|trust score|data swamp'),
 ('5. Bucket Policies, IAM & kiểm soát truy cập', r'bucket polic|iam|rbac|phân quyền|access control|rls|clm|row-level|column-level'),
 ('6. Micro-partitioning & lưu trữ cột', r'micro-?partition|columnar|parquet|lưu trữ cột|partition'),
 ('7. Clustering & Clustering Key', r'clustering key|clustering|cluster key'),
 ('8. Fact table: Snapshot, Transaction, Accumulating', r'accumulating|periodic snapshot|transaction fact|fact table|snapshot'),
 ('9. Bridge Table & quan hệ nhiều-nhiều', r'bridge|nhiều-nhiều|many-to-many|m-m'),
 ('10. Flat tables, Star/Snowflake Schema & phép Join', r'flat table|one big table|obt|star schema|snowflake schema|join|denormal'),
 ('11. Schema Evolution & Snowflake', r'schema evolution|evolution|schema drift|tự động điều chỉnh'),
 ('12. dbt Tests: Schema Test & Singular Test', r'dbt|schema test|singular test|generic test|data test'),
 ('13. Jinja, Macro & Dynamic SQL', r'jinja|macro|dynamic sql|template'),
 ('14. Orchestration: Airflow, Dagster, Task vs Asset', r'airflow|dagster|orchestrat|dag\b|task-centric|asset-centric|prefect'),
 ('15. Mirroring, CDC, Replication', r'mirroring|cdc|change data capture|replicat|nhân bản|sao chép'),
 ('16. Entropy, Information Gain, Decision Tree', r'entropy|information gain|gain ratio|id3|c4\.5|decision tree|cây quyết định'),
 ('17. Chuẩn hóa: Min-Max, Z-Score, Decimal Scaling', r'min-?max|z-?score|decimal scaling|chuẩn hóa|normaliz'),
 ('18. Binning: Equal-width, Equal-frequency, Discretization', r'binning|equal-width|equal-frequency|discretiz|rời rạc hóa'),
 ('19. Giảm chiều & PCA', r'pca|principal component|giảm chiều|dimensionality|feature selection'),
 ('20. Dữ liệu chuỗi thời gian: SMA, EMA', r'\bsma\b|\bema\b|moving average|trung bình trượt|time series|chuỗi thời gian'),
 ('21. Association Rules: Support, Confidence, Lift, Leverage', r'support|confidence|lift|leverage|antecedent|consequent|minsup|minconf'),
 ('22. Apriori & Frequent Itemset', r'apriori|frequent itemset|itemset|anti-monotone'),
 ('23. FP-Growth, FP-Tree & Condition Pattern Base', r'fp-?growth|fp-?tree|condition pattern|header table'),
 ('24. PageRank & Damping factor', r'pagerank|damping|out-degree|\bε\b|epsilon.*pagerank'),
 ('25. CPT, Prediction Tree & nén cây (FSC, SBC, PNR)', r'\bcpt\b|prediction tree|inverted index|lookup table|\bfsc\b|\bsbc\b|\bpnr\b|compact prediction'),
 ('26. Clustering: K-Means, K-Medoids, DBSCAN, Hierarchical', r'k-?means|k-?medoids|k-?modes|k-?prototypes|dbscan|hierarchical|dendrogram|grid-based|outlier'),
 ('27. Naive Bayes & Bayesian Network', r'naive bayes|bayes'),
 ('28. Graph: BFS, DFS, Knowledge Graph, GraphRAG', r'\bbfs\b|\bdfs\b|graph|knowledge graph|traversal|ontology|nodes|edges'),
 ('29. Blockchain, Anchoring & ABI', r'blockchain|merkle|anchoring|\babi\b|smart contract|on-chain|wei'),
 ('30. Vector, Embeddings, IVFFLAT, HNSW, RAG', r'ivf|hnsw|embedding|vector|\brag\b|retrieval|product quantization|hallucination'),
 ('31. Bảo mật dữ liệu: CLM, RLS, Masking, Zero-copy', r'\bclm\b|\brls\b|masking|zero-copy|data sharing|revoke'),
 ('32. Privacy: Differential Privacy, k-anonymity', r'differential privacy|epsilon|k-anonymity|quasi-identifier|generalization|suppression'),
 ('33. AI Act & AI Governance', r'ai act|unacceptable|high risk|human-in-the-loop|explainable|bias|traceability|lineage'),
 ('34. In-Database ML & Feature Store', r'in-database|bigquery ml|create model|ml\.predict|ml\.evaluate|snowpark|cortex|feature store|model registry|drift|automl'),
 ('35. Analytics & BI hiện đại: Looker, Agentic BI, Data Storytelling', r'looker|agentic|storytelling|auto-sql|chat-with|descriptive|actionable|real-time insight|llm'),
 ('36. Polyglot Persistence, NoSQL & CAP', r'polyglot|nosql|document store|key-value|\bcap\b|eventual|acid|schema-less'),
 ('37. Federated Query, Optimizer & Predicate Pushdown', r'federated|presto|trino|omni|pushdown|cost-based|broadcast join|optimizer'),
 ('38. DR: RTO, RPO, Failover', r'\brto\b|\brpo\b|failover|health check|disaster|dự phòng|bất đồng bộ'),
 ('39. Data Audit Trail & Continuous Auditing', r'audit|immutable'),
 ('40. Data Lake, Lakehouse, Medallion', r'lakehouse|data lake|medallion|delta lake|iceberg|hudi'),
]

import zlib
FORMULA = [
 ("Trong công thức Info_A(D) = Σ_{j=1..v} (|Dj|/|D|) × Info(Dj), ký hiệu v là gì?",
  "Số giá trị khác nhau của thuộc tính A (số phân vùng D1…Dv sau khi chia theo A)",
  ["Số lớp (class) của biến mục tiêu", "Tổng số bản ghi trong tập dữ liệu D", "Số thuộc tính của tập dữ liệu"],
  "**v** = số giá trị khác nhau của thuộc tính **A** → D được chia thành **v phân vùng** D1…Dv. Số lớp mới là **m** trong Info(D)."),
 ("Trong Info_A(D), thành phần |Dj|/|D| có ý nghĩa gì?",
  "Trọng số: tỉ lệ số mẫu của phân vùng Dj trên tổng số mẫu của D",
  ["Xác suất một mẫu thuộc lớp Ci", "Độ lợi thông tin (Information Gain) của thuộc tính A", "Entropy của phân vùng Dj"],
  "|Dj|/|D| là **trọng số** của phân vùng Dj; Info_A(D) là **trung bình có trọng số** entropy của các phân vùng."),
 ("Info_A(D) cho biết điều gì?",
  "Lượng thông tin (entropy) còn cần để phân lớp D sau khi đã chia D theo thuộc tính A",
  ["Lượng thông tin của D trước khi chia", "Số phân vùng tạo ra bởi thuộc tính A", "Xác suất xuất hiện của thuộc tính A"],
  "**Info_A(D)** = entropy kỳ vọng sau khi chia theo A. Càng nhỏ → A chia càng tốt (Gain(A) = Info(D) − Info_A(D))."),
 ("Trong công thức Info(Dj) nằm trong Info_A(D), Info(Dj) là gì?",
  "Entropy của phân vùng Dj, tính theo công thức Info với các lớp bên trong Dj",
  ["Entropy của toàn bộ tập D", "Số mẫu của phân vùng Dj", "Gain Ratio của thuộc tính A"],
  "**Info(Dj)** là entropy của riêng phân vùng Dj (cùng dạng −Σ pi·log2 pi nhưng tính trên Dj)."),
 ("Trong công thức Info(D) = −Σ_{i=1..m} pi·log2(pi), ký hiệu m là gì?",
  "Số lượng lớp (class) của biến mục tiêu",
  ["Số giá trị khác nhau của thuộc tính A", "Số bản ghi trong tập D", "Số phân vùng sau khi chia"],
  "**m** = **số lượng lớp**. Đừng nhầm với **v** (số giá trị của thuộc tính A) trong Info_A(D)."),
 ("Trong Info(D), pi là gì?",
  "Xác suất một mẫu bất kỳ trong D thuộc lớp Ci, pi = |Ci,D| / |D|",
  ["Số mẫu thuộc lớp Ci", "Entropy của lớp Ci", "Tỉ lệ số thuộc tính được chọn"],
  "**pi** = xác suất một mẫu thuộc lớp Ci = số mẫu lớp Ci chia tổng số mẫu."),
 ("Info(D) = −Σ pi·log2(pi) đo đại lượng nào của tập dữ liệu D?",
  "Entropy – mức độ hỗn loạn/không chắc chắn về nhãn lớp của D",
  ["Độ lợi thông tin (Information Gain)", "Độ tin cậy (Confidence) của luật", "Phương sai của dữ liệu"],
  "**Info(D)** chính là **Entropy** của D (đơn vị **bit** do dùng log2)."),
 ("Vì sao công thức Info(D) có dấu trừ phía trước tổng?",
  "Vì log2(pi) ≤ 0 (pi ≤ 1) nên dấu trừ làm entropy luôn ≥ 0",
  ["Để entropy luôn nhỏ hơn 0", "Để đổi đơn vị từ bit sang byte", "Để chuẩn hóa pi về đoạn [0, 1]"],
  "pi ≤ 1 ⇒ log2(pi) ≤ 0, nên thêm dấu trừ để Info(D) ≥ 0."),
 ("Information Gain của thuộc tính A được tính theo công thức nào?",
  "Gain(A) = Info(D) − Info_A(D)",
  ["Gain(A) = Info(D) + Info_A(D)", "Gain(A) = Info_A(D) − Info(D)", "Gain(A) = Info(D) × Info_A(D)"],
  "**Gain(A) = Info(D) − Info_A(D)**: entropy trước khi chia trừ entropy sau khi chia theo A."),
 ("Khi nào Info(D) = 0?",
  "Khi mọi mẫu trong D đều thuộc cùng một lớp (tập thuần nhất)",
  ["Khi các lớp phân bố đều nhau", "Khi D có đúng 2 lớp", "Khi thuộc tính A có nhiều giá trị nhất"],
  "Nếu một lớp có p = 1 thì Info(D) = −1·log2(1) = **0** (không còn bất định)."),
 ("Với tập D có 2 lớp, Info(D) đạt giá trị lớn nhất khi nào?",
  "Khi hai lớp cân bằng (p1 = p2 = 0,5), Info(D) = 1 bit",
  ["Khi một lớp chiếm 100% số mẫu", "Khi p1 = 0,9 và p2 = 0,1", "Khi số mẫu của D bằng 0"],
  "Entropy cực đại với 2 lớp khi p = 0,5 → **1 bit**."),
 ("Thuộc tính nào được chọn để chia nút trong thuật toán ID3 dựa trên Info(D) và Info_A(D)?",
  "Thuộc tính có Information Gain lớn nhất (tương đương Info_A(D) nhỏ nhất)",
  ["Thuộc tính có Info_A(D) lớn nhất", "Thuộc tính có nhiều giá trị nhất", "Thuộc tính đầu tiên trong bảng"],
  "ID3 chọn thuộc tính có **Gain lớn nhất** = Info_A(D) nhỏ nhất."),
 ("Tập D có 14 mẫu: 9 mẫu lớp Yes và 5 mẫu lớp No. Info(D) xấp xỉ bao nhiêu?",
  "0,940 bit",
  ["0,500 bit", "1,000 bit", "0,647 bit"],
  "Info(D) = −(9/14·log2 9/14 + 5/14·log2 5/14) ≈ **0,940**."),
]
def mk(i, item):
    qid = f'CD_F{i}'
    text, correct, wrongs, expl = item
    pos = zlib.crc32(qid.encode()) % 4
    opts = wrongs[:]
    opts.insert(pos, correct)
    letters = 'ABCD'
    return {'id': qid, 'question': text, 'options': {letters[k]: opts[k] for k in range(4)},
            'correctAnswer': letters[pos], 'explanation': expl}

topics = []
used_ids = set()
total = 0
for i, (name, rx) in enumerate(TOPICS, 1):
    pat = re.compile(rx, re.I)
    qs = []
    seen = set()
    for cid, q in src:
        if q['id'] in seen: continue
        hay = q['question'] + ' ' + q.get('explanation', '')
        if pat.search(hay):
            seen.add(q['id'])
            qs.append(q)
    topics.append({'topicId': f'CD_T{i}', 'topicName': name, 'questions': qs})
    used_ids |= seen
    total += len(qs)
    print(i, len(qs), name, file=sys.stderr)
    if name.startswith('16.'):
        fq = [mk(k, it) for k, it in enumerate(FORMULA, 1)]
        by = {q['id']: q for _, q in src}
        fq += [by[x] for x in ('HOT_Q19', 'HOT_Q20') if x in by]
        topics.append({'topicId': 'CD_F', 'topicName': 'Công thức Info(D) & Info_A(D): v, m, pi là gì? (câu 19–20)', 'questions': fq})
        total += len(fq)
allq = sum(len(c) for c in [[1]])  # noop
import re as _re
sys.path.insert(0, 'scripts')
import zlib as _z
import nk_variants as _nv
for _i, (_name, _items) in enumerate(_nv.T, 1):
    _qs = []
    for _k, (_q, _c, _w, _e) in enumerate(_items, 1):
        _id = f'CDV{_i}_{_k}'
        _pos = _z.crc32(_id.encode()) % 4
        _o = list(_w); _o.insert(_pos, _c)
        _qs.append({'id': _id, 'question': _q, 'options': {'ABCD'[j]: _o[j] for j in range(4)}, 'correctAnswer': 'ABCD'[_pos], 'explanation': _e})
    topics.append({'topicId': f'CD_V{_i}', 'topicName': _name, 'questions': _qs})
    total += len(_qs)
for n, t in enumerate(topics, 1):
    t['topicName'] = f"{n}. " + _re.sub(r'^\d+\.\s*', '', t['topicName'])
data = {'chapterId': 'CD', 'chapterName': 'Tổng hợp theo câu hỏi chẩn đoán', 'topics': topics}
with io.open(D + 'CD.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print('topics', len(topics), 'questions(with repeats)', total, 'distinct', len(used_ids), 'of', len({q['id'] for _, q in src}), file=sys.stderr)
