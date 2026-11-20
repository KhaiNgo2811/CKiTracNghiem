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
allq = sum(len(c) for c in [[1]])  # noop
data = {'chapterId': 'CD', 'chapterName': 'Tổng hợp theo câu hỏi chẩn đoán', 'topics': topics}
with io.open(D + 'CD.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print('topics', len(topics), 'questions(with repeats)', total, 'distinct', len(used_ids), 'of', len({q['id'] for _, q in src}), file=sys.stderr)
