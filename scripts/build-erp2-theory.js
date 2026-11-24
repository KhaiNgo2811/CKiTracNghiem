// Sinh tài liệu lý thuyết ôn tập ERP2 -> data/ERP2/ERP2_Theory_Review.docx
// Chạy: NODE_PATH=<thư mục chứa node_modules/docx> node scripts/build-erp2-theory.js
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
const tip = (lines) => box('Exam tip / trap', lines, 'FFF6DD', 'E0A800');
const note = (lines) => box('Key points', lines, 'E8F3FF', '3B82F6');
const formula = (lines) => box('Example / formula', lines, 'EEF8EE', '3E9B4F');


// ================= COVER =================
C.push(new Paragraph({ spacing: { before: 2600, after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'THEORY REVIEW GUIDE', bold: true, size: 40, font: FONT, color: '1F3A5F' })] }));
C.push(new Paragraph({ spacing: { after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ERP 2 – BUSINESS PROCESS CONFIGURATION WITH SAP', bold: true, size: 34, font: FONT })] }));
C.push(new Paragraph({ spacing: { after: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Chapters 1–5: Introduction, FI, CO, MM, SD  |  TS410: PS, EAM)', italics: true, size: 26, font: FONT })] }));
C.push(new Paragraph({ spacing: { after: 100 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Written for the multiple-choice AND essay parts of the final exam', size: 22, font: FONT })] }));
C.push(new Paragraph({ spacing: { after: 100 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Compiled from the configuration textbook, the TS410 course material and the question bank', size: 22, font: FONT })] }));
pb();

h1('How to use this guide');
bl([
  'The final exam covers exactly **seven blocks**: the configuration textbook **Chapters 1–5** (Introduction, **FI**, **CO**, **MM**, **SD**) plus **PS** (Project System) and **EAM** (Enterprise Asset Management). The guide follows that order.',
  'Each block has: **core concepts**, **enterprise structure / master data**, **process steps with accounting consequences**, **configuration objects**, and a closing section of **likely essay questions with answer outlines**.',
  '**Key terms are in bold English** so you can reuse them literally in essays. Boxes: **Key Points** = definitions to memorise; **Example / Formula** = worked numbers; **Exam Tip / Trap** = frequent mistakes.',
  '**How to write an essay answer** (apply to every block): (1) one-sentence definition, (2) list the steps or elements in order, (3) explain the **system consequence** of each step (documents, postings), (4) give the **GBI example**, (5) finish with one benefit/risk or the link to another module.',
  'After each block, go back to the quiz app and practise the matching chapter (ERP2_C1 … ERP2_C7).',
]);
h2('Content map');
table(['Block', 'Topic', 'Key words'], [
  ['Ch. 1', 'Introduction to Business Process Configuration', 'Configuration vs customization, ASAP, four types of data, master data, testing'],
  ['Ch. 2', 'Financial Accounting (FI)', 'G/L, chart of accounts, company code, fiscal year, field status, posting keys, tolerance groups, Universal Journal'],
  ['Ch. 3', 'Overhead Management (CO)', 'Cost centers, cost elements, allocation, internal orders, settlement, controlling area, profit center'],
  ['Ch. 4', 'Procurement (MM) – Procure to Pay', 'Purchasing org, plant, valuation, MAP/standard price, GR/IR, three-way match, tolerances'],
  ['Ch. 5', 'Fulfillment (SD) – Order to Cash', 'Sales area, shipping point, pricing (condition technique), availability check, account determination'],
  ['PS', 'Project System (TS410 Unit 10)', 'Project definition, WBS, network, budget, results analysis, settlement'],
  ['EAM', 'Enterprise Asset Management (TS410 Unit 11)', 'Maintenance notification/order, functional location, completion, settlement'],
], [1.2, 5, 8]);
pb();

// ================= CHAPTER 1 =================
h1('Chapter 1. Introduction to Business Process Configuration');
h2('1.1 Configuration, customization and implementation');
table(['Term', 'Meaning', 'Remember'], [
  ['**Configuration**', 'Selecting **options** and specifying **parameters** so the delivered system runs the processes the way the organisation wants', 'No code is changed'],
  ['**Customization**', 'Adding or modifying **programming code** (ABAP) of the delivered software', 'Two options: **modification** and **enhancement**'],
  ['**Modification**', 'Changes the **existing** underlying code', 'Needs ABAP; may conflict with vendor code at **upgrade**'],
  ['**Enhancement**', 'Adds capabilities **without changing** standard code (for example via a **user exit**)', 'Preferred: upgrade-safe'],
  ['**Implementation**', 'Selecting capabilities, setting up the system, **training users**', 'Configuration is only one part'],
], [3, 7, 4]);
note([
  '**User exit** = an identified place in the program code where the ERP connects to an external program/system: it passes data out, waits for the result, then continues.',
  'Example: approval of purchase orders above **$5,000** is **configuration** – choose the approval option and enter $5,000 as the parameter.',
]);
h2('1.2 ASAP methodology – six phases');
table(['#', 'Phase', 'What happens'], [
  ['1', '**Project preparation**', 'Goals, scope, team, plan'],
  ['2', '**Business blueprint**', 'Business-process requirements **documented**; common understanding of the processes'],
  ['3', '**Realization**', 'The blueprint is applied to the system – **configuration** is performed here'],
  ['4', '**Final preparation**', '**Testing, end-user training**, system management, **cutover** from the old system'],
  ['5', '**Go-live**', 'The system is productive'],
  ['6', '**Operation (support)**', 'Managing the system so the supported processes keep performing'],
], [1, 4, 9]);
h2('1.3 The four types of data');
table(['Type', 'Description', 'GBI example'], [
  ['**Enterprise structure data** (organisational elements)', 'The legal, functional and business components of the enterprise', 'Client, company code (US00, DE00), plants (Dallas = factory, Miami/San Diego = DCs; Hamburg = factory, Heidelberg = DC)'],
  ['**Business rules and parameters**', '**Rules** = business practices; **parameters** = boundaries for data values', 'Accept partial deliveries; manager approval above a limit; production capacity limits'],
  ['**Master data**', 'The **core data** about customers, vendors, materials and financial accounts', 'Customer address, vendor payment terms, material weight, G/L account description'],
  ['**Transaction data**', 'Reflect the **consequences of executing** process steps; the **most common** type', 'Sales order (type **OR** standard / **SO** rush), quantity, requested date'],
], [4, 6, 6]);
bl([
  '**Configuration order:** enterprise structure → business rules and parameters → master data → **testing**. Master data cannot be created before the structure and parameters exist.',
  '**Transaction data** = enterprise structure + master data + **situational data** (who, what, when, where, how many – typed by the user). Documents created: **FI document** (general ledger), **CO document** (management accounting), **MM / material document** (material movement).',
]);
h2('1.4 Master data');
bl([
  'Levels: **general data** = client level (all company codes and plants); **financial** data = company code; **process** data = process-specific organisational element (plant, purchasing org, sales area).',
  'A vendor is defined **separately per company code** because each company may have different terms (for example payment terms).',
  'A **master data-cleaning project** removes inaccurate/redundant data **before** migration from the legacy system.',
  'Vendor/customer records contain: **general data**, data defining the **terms** of the relationship, and data recording the **financial consequences** (reconciliation account).',
]);
table(['Material type', 'Bought?', 'Made?', 'Sold?', 'Example'], [
  ['**Raw material**', 'Yes', 'No', 'Normally no', 'Tyres, frames'],
  ['**Trading good**', 'Yes', 'No', 'Yes (no value added)', 'Water bottles'],
  ['**Semifinished good**', 'No', 'Yes', 'No', 'Wheel assembly'],
  ['**Finished product**', 'No', 'Yes', 'Yes', 'Bicycle'],
], [3.5, 2, 2, 3.5, 3]);
bl([
  '**BOM** = components needed to make a material; **routing** = operations/activities; **work center** = physical location where operations happen; **capacity** = output per time unit (labour and machine).',
]);
h2('1.5 Testing');
table(['Test', 'Purpose'], [
  ['**Unit test**', 'Lowest level – each individual transaction/process step works'],
  ['**Scenario test**', 'Interaction of several related transactions, including tests **expected to fail** (erroneous input)'],
  ['**Integration test**', 'End-to-end processes across modules, possibly non-SAP interfaces'],
  ['**User acceptance test**', 'Close to go-live; usability; often embedded in user training'],
  ['**Regression test**', 'After enhancement packages, configuration changes or large master-data changes – also checks processes that should **not** have changed'],
  ['**Performance (load) test**', 'The system handles the **expected volume** efficiently'],
], [4, 10]);
note([
  'The five core processes: **Financial accounting**, **Management accounting**, **Procurement (procure to pay)**, **Fulfillment (order to cash)**, **Production**. Human resources is **not** one of them.',
  'Financial accounting serves **external** parties (regulators, shareholders); management accounting serves **internal** management.',
]);
h2('1.6 Likely essay questions – Chapter 1');
tip([
  '**Q: Distinguish configuration and customization; why are enhancements preferred?** → definitions (options/parameters vs code), the two customization options, upgrade conflict of modifications, user exit example, $5,000 approval example.',
  '**Q: Describe the four types of data and the order in which they are configured.** → list four types with GBI examples, state the dependency chain, close with testing.',
  '**Q: Describe the testing types in an ERP project.** → unit → scenario → integration → user acceptance, plus regression and performance; state when each is used.',
  '**Q: Explain the ASAP phases and where configuration fits.** → six phases, configuration is in **realization**, testing/training/cutover in **final preparation**.',
]);
pb();

// ================= CHAPTER 2 =================
h1('Chapter 2. Financial Accounting (FI)');
h2('2.1 Purpose and general ledger');
note([
  '**FI** posts all financially relevant transactions, keeps them unchanged for reporting and produces the legal **balance sheet** and **profit & loss** statement (GAAP, IFRS, HGB). Audience: **external** stakeholders.',
  'The **general ledger (G/L)** is managed at **company-code level** and structured by a **chart of accounts**. Logistics and HR postings reach FI in **real time** through **automatic account determination**.',
]);
bl([
  'Five G/L categories: **assets, liabilities, equity, revenue, expenses**. **Accounts payable** = owed in < 1 year; **notes payable** = > 1 year (mortgage). **Retained earnings** = running total of earnings (revenue − expenses − dividends).',
  '**Contra account**: sales discount is a negative amount against sales revenue. **Cost of goods sold** = total cost of manufacturing/purchasing the products sold.',
  '**Balance sheet accounts** are **permanent** (ending balance carried forward); **P&L accounts** are **temporary** – closed at year end into **retained earnings**. Revenue > expenses → net income → retained earnings **increase**.',
  '**Period closing** = adjusting entries (e.g. depreciation) at month/quarter/year end.',
  'Four statements: **balance sheet** (Assets = Liabilities + Equity), **income statement** (net income = revenue − expenses), **statement of retained earnings**, **statement of cash flows** (operating, investing, financing).',
]);
h2('2.2 Subledgers and reconciliation accounts');
bl([
  'A **subledger** tracks individual **customers, vendors, assets**. The G/L holds a **control (total) account** – in SAP called a **reconciliation account**.',
  'Posting to a vendor: the **vendor account** is posted **directly**, the **A/P reconciliation account** **indirectly**, simultaneously. **Manual postings to reconciliation accounts are not allowed** – this guarantees subledger total = reconciliation account.',
  '**Accounts payable** → vendors, part of **procurement**. **Accounts receivable** → customers, part of **fulfillment**. Their configuration is very similar.',
]);
h2('2.3 Company code and chart of accounts');
table(['Object', 'Key facts'], [
  ['**Company code**', 'A separate **legal entity** for financial accounting; **4-character** key (US00, DE00); parameters: **currency**, **language**, **country**, **tax jurisdiction code** (US)'],
  ['**Chart of accounts (CoA)**', 'List of accounts from which the G/L is created; defined at **client level**; account numbers up to **10 digits** (GBI: 6)'],
  ['**Operating CoA**', 'Day-to-day operations'],
  ['**Country-specific CoA**', 'Local legal requirements'],
  ['**Group CoA**', 'Consolidated statements across company codes without manual mapping'],
  ['**Parallel ledgers**', 'Several sets of books (different accounting principles)'],
], [4, 10]);
h2('2.4 Posting periods and fiscal year');
bl([
  'A fiscal year has **12 normal periods** and up to **4 special periods** (13–16) for accruals/corrections (e.g. August–July year: August = 01 … July = 12, special period 1 = **13**).',
  '**Fiscal year variant** (2-character key) defines start/end of the fiscal year and the number of posting periods (0–999) – e.g. **K1** = calendar year with 12 + 1 special; **V9** = Oct–Sep with 4 special; **24** = 24 half-month periods.',
  '**Posting period variant** states which periods are **open**; defined by **account type** (A assets, D customer, K vendor, M materials, S G/L; **+** = all types), account interval and validity. Postings generally only in **open** periods → internal control.',
  'Both variants must be **assigned to the company code**.',
]);
h2('2.5 Field status, account groups, field groups');
bl([
  '**Account group**: bundles accounts with similar characteristics (code, description, **number range**); subgroups such as fixed assets, liquid assets, materials, reconciliation accounts need different options.',
  '**G/L master fields** are organised in **field groups** (account control, account management…); each field has a **field status**: **required, optional, display, suppress**. A G/L account **inherits** its statuses from its **account group**; leaving a required field blank → account cannot be created.',
  '**Transaction fields** have **three** statuses (suppress, required, optional – **no display**): fields → **field groups → field status groups → field status variant** (e.g. **GL00**: ZEXP expenses, ZREV revenue, ZGBS, ZMMA, ZRAA) assigned to the company code.',
  '**Conflict priority** between posting key and field status group: **suppressed > required > optional > display**; an **error** only occurs if one source suppresses and the other requires.',
]);
h2('2.6 Documents, number ranges, tolerance groups');
bl([
  'Each document gets a unique number from a **number range** (e.g. 49: 4900000000–4999999999; next after 4900000122 is **4900000123**). Year **9999** = not year-specific.',
  '**Document type** identifies the business step: **DR** = customer invoice, **DZ** = customer payment; it defines permitted **account types** and the **number range**.',
  '**Employee tolerance groups** limit the amount an employee can post (GBI: **$500,000** per document, **$100,000** per line item) and permitted payment differences (**10% or $100**, whichever is smaller; up to $10 auto-posted as discount within 5%). Exceed the limit → **the system will not post**.',
  '**Sending / paying company code**: which one processes vendor invoices and which one pays.',
]);
h2('2.7 Posting keys and automatic account determination');
table(['Item', 'Key facts'], [
  ['**Posting key**', '**2-digit** code at **client level**; determines **debit/credit** and the permitted **account type**; other parameters: sales-related, **special G/L**, **reversal key**, payment transaction'],
  ['01', 'Debit **customer** (invoice)'],
  ['31', 'Credit **vendor** (invoice)'],
  ['19', '**Down payment** received (special G/L) – a liability until delivery/invoice'],
  ['40 / 50', 'Debit / credit **G/L** (journal entries); 89 / 99 = stock in / out'],
], [4, 10]);
bl([
  'Posting key and document type must **agree** on the account type (e.g. DR and key 01 both permit customer) – otherwise an **error** at posting.',
  '**Automatic account determination** records accounting consequences "behind the scenes"; it relies on document types, account types and posting keys.',
]);
h2('2.8 G/L master data');
table(['Segment', 'Contents'], [
  ['**Chart of accounts segment**', 'Account number, long/short text, **account group**, balance-sheet / P&L indicator (same for all company codes)'],
  ['**Company code segment**', '**Currency**, tax data, **field status group**, **open item management**, **line item display**, **reconciliation account for account type**, **post automatically only**'],
], [4, 10]);
bl([
  '**Open item management**: for **clearing** accounts (offsetting entries matched); bank/tax/inventory are not open-item managed; A/P is.',
  '**Line item display**: drill down to all activity; **not** used for reconciliation accounts (items live in the subledger).',
  '**Post automatically only**: blocks manual postings to inventory / material-consumption accounts.',
  'A rudimentary FI test = **manual postings** to the G/L before other processes exist; a full test needs automatic account determination from the other processes.',
]);
h2('2.9 TS410 additions – S/4HANA FI');
bl([
  '**Document** = header + line items (entry view up to **999** items); identified by **document number + company code + fiscal year**; controlled by **document type** (header) and **posting key** (line: account type, debit/credit, field status).',
  '**Business partner** (transaction **BP**) is the single point of entry for customers and vendors; **roles** (FI Vendor, FI Customer, Supplier) give the context; **category** (person/group/organisation) is fixed; **grouping** determines the number range and cannot be changed.',
  '**Company-code data of a vendor**: reconciliation account, payment terms/methods, dunning, posting blocks.',
  '**Parallel accounting**: **accounts solution** vs **ledger solution** (recommended for new S/4HANA; one **leading ledger** per client).',
  '**Universal Journal – table ACDOCA**: common line-item store for FI and CO; data stored once, **no reconciliation needed**, fast multidimensional reporting.',
  '**Organisational levels**: **controlling area** (same operating CoA and fiscal year variant as its company codes), **operating concern** (market segments, CO-PA), **company code** (smallest unit with a full legal set of books), **segment** (business or geographical reporting dimension; **document splitting** gives a balanced balance sheet per segment).',
  '**Cost elements** are G/L accounts of type **primary costs/revenue** or **secondary costs** (internal flows: activity allocation, overhead, settlement).',
]);
h2('2.10 Likely essay questions – Chapter 2');
tip([
  '**Q: Explain the relationship between subledgers and the general ledger.** → subledger purpose, reconciliation (control) account, direct vs indirect posting, ban on manual postings, A/P and A/R examples.',
  '**Q: Describe how a company code, chart of accounts and fiscal year variant are configured for GBI.** → company-code parameters, three CoA types, variant keys (K1, V9), special periods, posting period variant, assignment.',
  '**Q: How does the system control data entry in G/L accounts and postings?** → account group → field groups → statuses (4 types) → transaction statuses (3 types) → priority rule.',
  '**Q: Explain posting keys, document types and number ranges.** → give DR/DZ and keys 01/31, how they must agree, how numbers are assigned.',
  '**Q: What is the Universal Journal and why does it matter?** → ACDOCA, FI+CO single source, no reconciliation, real-time reporting.',
]);
pb();

// ================= CHAPTER 3 =================
h1('Chapter 3. Overhead Management (CO)');
h2('3.1 Management accounting overview');
note([
  '**Management accounting** (cost accounting / controlling) is **internal**, more flexible, includes **forward-looking** data; techniques must pass a **cost–benefit** test.',
  'Three key processes: **product costing**, **overhead management**, **profitability analysis** (the only one that also uses **revenues**).',
  '**Cost of goods manufactured = direct material + direct labour + indirect (overhead) cost.** Support-department overhead (HR, accounting, purchasing, marketing, IT) is **not** assigned to COGM.',
  '**Cost center accounting** = ongoing indirect costs; **internal order accounting** = temporary costs (trade show, picnic).',
]);
h2('3.2 Cost elements and controlling objects');
bl([
  '**Cost center** = **responsibility center**; created by location, function or activity; **standard hierarchy** must contain **all** cost centers; master record is time-dependent; assigned to a **profit center**.',
  '**Cost elements** link FI and CO: **primary** cost elements = G/L accounts (same number and name); **secondary** cost elements = internal transfers, **no** G/L account.',
  'FI → CO postings are **one-sided** (debit to the cost center, no credit); FI postings are two-sided.',
  '**Controlling objects**: **real** objects (cost center, internal order, production order, WBS, sales order, profitability segment) accumulate costs; a **statistical posting** is informational and **not** in the balance. Real-posting priority: **profitability segment → make-to-order sales order → WBS element → internal order → cost center**. A posting can name **up to four** objects. **Profit centers** receive statistical postings only.',
  '**Cost element group**, **cost center group**, **cost center category** (permitted postings), **default account assignment** (auto-post an expense to a cost center/order), **statistical key figure** (employees, building area – allocation basis; category **Fixed** = period total is the average).',
]);
h2('3.3 Allocation techniques');
table(['Technique', 'How it works', 'Cost element category'], [
  ['**Periodic allocation – distribution**', 'Costs accumulate, then are allocated at **period end**; **primary costs, each individually** (receivers see the original element); sender credited, receivers debited', 'Original primary element'],
  ['**Periodic allocation – assessment**', 'Allocates **multiple costs combined** as **one secondary cost**; receivers cannot see the makeup', 'Secondary **42**'],
  ['**Internal activity allocation**', '**No accumulation**; charged by **activity type × quantity** when performed (IT: $100/h × 12 h = **$1,200**)', 'Secondary **43**'],
], [4.5, 7, 3.5]);
formula([
  '**Distribution example:** $5,000 of supplies split by employees: A 10, B 20, C 20 (total 50) → A receives 5,000 × 10/50 = **$1,000**.',
  'Valid **senders** for distribution/assessment: **cost centers only**.',
]);
h2('3.4 Internal orders and settlement');
bl([
  'An **internal order** collects **temporary** costs for an activity with a finite life; costs are allocated by **settlement**. A closed order accepts no more costs.',
  '**Settlement rule** = how accumulated costs go to receivers; each **distribution rule** has a **receiver, an amount (percentage or equivalence number) and timing** (2/3 and 1/3 → equivalence numbers **2 and 1**). Receivers: **cost center, G/L account, another order**. Timing: **periodic** or **full** (once, at end of life).',
  '**Internal settlement** to cost centers; **external settlement** to FI (e.g. a building to an asset) uses primary category **22**. Primary category **01** brings costs from FI into cost centers/orders.',
  '**Settlement parameters**: **allocation structure** (cost types, method, valid receivers – assessment cost elements combine everything into one secondary element), **source structure**, **settlement profile** (inherited by the order; types of settlement: **full** needs a **zero balance** to close, **not for settlement**; **100% validation**; maximum number of distribution rules; **strategy sequences** that auto-generate rules).',
  '**Order type** simplifies creating orders; a **model order** holds default values. Status **created** allows planning only; **technically complete** can still be settled; **closed** cannot be settled.',
  'Settlement also appears in other processes, e.g. a **maintenance order** settled to the owning cost center.',
]);
h2('3.5 Controlling area and enterprise structure');
table(['Topic', 'Key facts'], [
  ['**Controlling area**', '4-character key; overhead management and product costing are completed **at controlling-area level**; company codes must be assigned to it'],
  ['**Cross-company-code cost accounting**', 'Centralised model – company codes must share **fiscal year variant and chart of accounts**'],
  ['**"Controlling area same as company code"**', '1:1 decentralised model'],
  ['**Currencies**', '**Controlling area currency**, **object currency** (of the cost center/order), **transaction currency**'],
  ['**Number ranges**', 'Document number ranges are unique per **controlling area**; "Ext" = number chosen manually'],
], [5, 9]);
h2('3.6 TS410 additions');
bl([
  'CO collects revenue/expenses by **area of responsibility**; main data source is **FI** (most expense postings create a cost posting). **Product cost controlling**, **CO-PA**, **cost center accounting**, **internal orders**, **activity types** (valued with a price).',
  '**Profit center accounting**: a "company within the company"; the only account assignment object that can take **balance sheet** as well as P&L postings. **Profitability segment** = combination of characteristics (customer, product, plant, channel) – no master record.',
  'FI level is set by **law per country**; CO analyses across country boundaries.',
]);
h2('3.7 Likely essay questions – Chapter 3');
tip([
  '**Q: Compare distribution, assessment and activity allocation.** → table above: accumulation, element used, visibility, category 42/43, example numbers.',
  '**Q: Explain internal orders and how they are settled.** → purpose, settlement rule/distribution rule, receivers, timing, internal vs external settlement, status rules.',
  '**Q: Describe the link between FI and CO.** → primary cost elements = G/L accounts, one-sided postings, secondary elements, Universal Journal.',
  '**Q: Explain controlling-area configuration options.** → centralised vs decentralised, shared CoA/fiscal year, three currencies, standard hierarchy.',
]);
pb();

// ================= CHAPTER 4 =================
h1('Chapter 4. The Procurement Process (MM) – Procure to Pay');
h2('4.1 Process steps');
table(['Step', 'Description', 'FI consequence?'], [
  ['1. **Purchase requisition**', 'Internal "request to buy": material, quantity, desired date; can be generated by **MRP, fulfillment, production, maintenance orders, networks**', 'No'],
  ['2. **Source determination / RFQ**', 'Buyer finds the best supplier by **quotations**', 'No'],
  ['3. **Purchase order (PO)**', 'Approval to purchase; converted from requisitions; price and terms. **External** procurement = to a vendor; **internal** = to another plant', 'No'],
  ['4. **PO monitoring**', 'Track delivery status', 'No'],
  ['5. **Goods receipt (GR)**', 'Updates stock quantity and value, G/L; creates **material, FI and CO documents**; movement type **101**', '**Yes**'],
  ['6. **Invoice verification**', '**Three-way match** (PO ↔ goods receipt ↔ invoice); LIV completes MM part, excluding payment', '**Yes**'],
  ['7. **Payment**', 'Amount calculated from PO terms; automatic payment program, **Payment Medium Workbench**', '**Yes**'],
], [4, 8, 2.5]);
note(['Names: **procure to pay**, **P2P**, **source to pay**. Steps with a financial accounting consequence: **goods receipt, invoice verification, vendor payment**.']);
h2('4.2 Enterprise structure');
table(['Element', 'Key facts'], [
  ['**Client**', 'Highest level, 3-digit key, legally and organisationally self-contained'],
  ['**Company code**', '4-character; can have several plants'],
  ['**Plant**', 'Facility for manufacturing, maintenance or storage; belongs to **exactly one** company code; MRP, stock and production are at plant level; has a **factory calendar** (client level; GBI = 365 working days)'],
  ['**Storage location**', 'Area **within one plant** (a plant has many); **inventory management** is at this level; plant parameter "create SLoc automatically" at first GR'],
  ['**Material valuation level**', '**Company code** or **plant** level; cannot be changed; defined before plants are assigned; must be **plant** level to use production planning/product costing; with company-code level the price is the same across plants'],
  ['**Purchasing organisation**', 'Legally responsible for purchasing, negotiates with vendors'],
  ['**Purchasing group**', 'People doing day-to-day buying; **no legal authority**'],
], [4.5, 9.5]);
table(['Purchasing model', 'Description'], [
  ['**Plant-specific**', 'One purchasing org per plant (assigned to that plant and its company code)'],
  ['**Cross-plant**', 'One purchasing org for all plants of one company code'],
  ['**Enterprise-level / cross-company-code**', 'Not assigned to a company code (plants in several); company code identified at PO creation'],
  ['**GBI = hybrid**', 'Central purchasing org **GL00** plus country orgs **US00, DE00**'],
], [5, 9]);
h2('4.3 Tax, material types and price control');
bl([
  '**Tax version** defines how many tax codes/amounts can be entered on a vendor invoice (**0804** = up to four). **Tax code** = 2 digits, percentage rate per jurisdiction. **Input tax** is tax paid on purchases and is posted to an input tax account (it does **not** change inventory value).',
  '**Material type** classifies use (bought/made/sold); the material master is grouped in **views** by department. Finished products have **no** purchasing data; trading goods **do**.',
  '**Valuated (stock)** materials track quantity and value; **non-stock** materials are expenses (pens); **non-valuated** track quantity only.',
  '**Price control**: **Moving Average Price (MAP)** for purchased materials; **Standard price** for in-house produced (finished/semifinished).',
]);
h2('4.4 Accounting consequences and MAP');
table(['Event', 'Posting'], [
  ['**Goods receipt** (100 × $75)', 'Debit **Inventory** $7,500; credit **GR/IR** $7,500'],
  ['**Invoice verification** (no variance)', 'Debit **GR/IR** (cleared); credit **Vendor / A/P**'],
  ['**Tax on invoice**', 'Input tax account (not inventory)'],
  ['**Small difference** (typo $7,502 vs $7,500)', 'Temporary **price/small difference** account'],
  ['**Surcharge after sale**', '**Price difference** account'],
  ['**Payment**', 'Debit vendor, credit bank; differences within tolerance to **ZDI** account'],
], [6, 8]);
formula([
  '**MAP:** inventory 200 items = $12,000; receive 100 items × $75 = $7,500 → ($12,000 + $7,500) / 300 = **$65**.',
  'Invoice of **$8,500** (including a $1,000 fuel surcharge) with all 300 items in stock → ($12,000 + $8,500) / 300 = **$68.33**.',
  'MAP is recalculated at **goods receipt and invoice receipt**, **not** at goods issue. If goods are already sold, the surcharge goes to a **price-difference** account instead.',
]);
h2('4.5 Account determination');
bl([
  '**Valuation class** groups materials with the same G/L account; the **account category reference** links valuation class and material type; a valuation class belongs to **one** account category reference.',
  '**Valuation grouping code** lets plants share rules (all plants → same code requires the **same chart of accounts**); a plant has **one** code.',
  'Transaction keys: **BSX** inventory, **WRX** GR/IR, **DIF** small differences, **ZDI** payment differences within tolerance (vendor), **PRD** price differences. The **posting key** says debit (stock increase) or credit. A/P reconciliation account comes from the **vendor master**. Produced materials use the **production variance** account, not purchase price difference.',
]);
h2('4.6 Tolerance limits');
bl([
  'Tolerances state how the system reacts to deviations: **warn and continue**, or **error and stop**. They apply at **PO creation, goods receipt, invoice verification, vendor payment**.',
  '**PE** purchase price tolerance; **SE** maximum discount. Example: valuation price $25, upper **10%**, lower **20%** → PO price $27.60 exceeds $27.50 → **warning**.',
  '**Under delivery** beyond tolerance → warning, treated as partial delivery; **delivery complete** indicator stops further deliveries; **over delivery** beyond tolerance → **error**; **unlimited** overrides the limit.',
  'MAP change at GR: **B1** (error, no PO) / **B2** (warning, PO allowed). **Two-way match** = invoice vs PO; **three-way match** adds the goods receipt.',
  'Invoice tolerances: **DQ** quantity variance, **PP** price variance, **VP** MAP change (warning only). Exceeding DQ/PP → invoice recorded with a **payment block**.',
  '**Vendor-payment tolerance group**: permitted differences as **gain (underpayment)** or loss, absolute or percent.',
  'Delivery tolerance priority: **PO → info record → material master**.',
]);
h2('4.7 Master data');
table(['Master data', 'Levels / content'], [
  ['**Material master**', 'Basic data (**client**), purchasing data (**plant**), storage data (temperature, shelf life), accounting data (**plant**: valuation class, price control, MAP, quantity, value)'],
  ['**Vendor master**', 'General data (client), purchasing data (**purchasing org**), accounting data (**company code**: reconciliation account, payment tolerance group)'],
  ['**Purchasing info record**', 'One material from one vendor: typical/minimum quantities, price conditions, history; **optional** but links material and vendor'],
], [4, 10]);
h2('4.8 TS410 additions');
bl([
  '**Account assignment category**: **K** = cost center (+ G/L consumption account); **A** = asset (G/L automatic); needed for **consumables, materials without master, services**. Stock materials need **no** account assignment. A consumable on a cost object creates a **commitment** in CO.',
  '**PO structure**: header (document type, supplier, purchasing org/group, company code, currency, payment terms) + items; **item category** (consignment, subcontracting, stock transfer); **stock transport order** when the source is your own plant.',
  '**Goods movements**: movement type **101** posts a GR; stock types **unrestricted, quality inspection, blocked**; a movement creates a **material document** and, if valuation-relevant, an **accounting document**; an error is corrected by **cancelling** and re-posting. A transfer within one plant has **no FI posting**; GR of a consumable creates a **CO document** and clears the commitment.',
  '**Invoice posting** creates an accounting document, **clears GR/IR**, updates PO history and posts an **open vendor item**; deviations beyond tolerance → **blocked for payment**.',
  '**S/4HANA changes**: stock calculated on the fly from **MATDOC**; **Material Ledger** is obligatory; deactivating statistical MAP removes exclusive locks (not reversible); foreign trade moved to **SAP GTS**; **SAP Ariba** connects to the business network; output by e-mail, print, XML.',
  'Transaction **BP**: FI Vendor role (company code level) and Supplier role (purchasing org level).',
]);
h2('4.9 Likely essay questions – Chapter 4');
tip([
  '**Q: Describe the procure-to-pay process and the accounting entry of each step.** → seven steps, GR (Dr inventory/Cr GR-IR), IV (Dr GR-IR/Cr vendor), payment; mention three-way match.',
  '**Q: Explain the procurement enterprise structure and the three purchasing models.** → client, company code, plant, storage location, valuation level, purchasing org/group, GBI hybrid (GL00/US00/DE00).',
  '**Q: Explain moving average price vs standard price with a calculation.** → use the $65 and $68.33 example; when MAP changes.',
  '**Q: How do tolerance limits protect the procurement process?** → four steps, warning vs error, keys PE/SE/B1/B2/DQ/PP/VP, payment block.',
  '**Q: Explain automatic account determination in MM.** → valuation class, account category reference, grouping code, BSX/WRX/DIF/ZDI, posting key.',
]);
pb();

// ================= CHAPTER 5 =================
h1('Chapter 5. The Fulfillment Process (SD) – Order to Cash');
h2('5.1 Process steps');
table(['Step', 'Description', 'FI consequence?'], [
  ['1. **Customer inquiry**', 'Request for information; **no obligation**', 'No'],
  ['2. **Sales quote**', '**Legally binding** offer, valid for a limited time', 'No'],
  ['3. **Customer purchase order**', 'Links customer procurement to vendor fulfillment', 'No'],
  ['4. **Sales order**', 'Internal document; system performs **availability check** and **material reservation**', 'No'],
  ['5. **Shipping**', '**Outbound delivery** (authorises preparation) → pick → pack → **goods issue** (material leaves the plant); transportation planning', '**Yes** (goods issue)'],
  ['6. **Billing**', 'Customer invoice (billing type **F2**)', '**Yes**'],
  ['7. **Customer payment**', 'Clears customer/A-R, debits bank; closes the process (belongs to FI)', '**Yes**'],
], [4, 8, 2.5]);
note(['**Order to cash** (also inquiry to cash). Online retail may require **payment before shipping**. **Lead to Cash** (TS410) = Contact to Lead → Lead to Opportunity → Opportunity to Quote → Quote to Order → **Order to Cash**.']);
h2('5.2 Enterprise structure');
table(['Element', 'Key facts'], [
  ['**Sales organisation**', 'Market segmented by geography/strategy; **one** company code (a company code can have **several** sales orgs); highest aggregation for sales reports'],
  ['**Distribution channel**', 'Path to the customer (wholesale, retail, internet); client level; can serve several sales orgs; one per document'],
  ['**Distribution chain**', 'Sales organisation + distribution channel; assigned to a plant → **delivering plant**'],
  ['**Division**', 'Product line (group of similar products); assigned to sales orgs'],
  ['**Sales area**', '**Sales org + distribution channel + division**; belongs to one company code; create only the needed combinations; **cannot be changed** in a document'],
  ['**Shipping point**', 'Physical location in the delivering plant; **one** delivery ships from **one** shipping point; **express** shipping point for rush/pick-up; optional **loading points**; a plant can have several shipping points and vice versa'],
], [4.5, 9.5]);
h2('5.3 Shipping point determination and pricing');
bl([
  '**Shipping point determination** = **plant + shipping condition** (Standard, Pick up, Immediately, **Returns**) **+ loading group** (materials with the same loading requirements).',
  '**Pricing – condition technique:** **condition type** (PR00 gross price, SKTO cash discount, KF00 freight) → **condition record** (the actual value, e.g. $50; KF00 by Incoterms and sales area) → **condition table** (fields that define a record: sales org, channel, material…) → **access sequence** (order of searching, **specific before general**; for PR00: tables 005, 006, 004) → **pricing procedure** (condition types and their sequence; **RVAJUS** for GBI U.S.; the simple **PR0000** has only PR00).',
  'The pricing procedure is selected from **sales area + document pricing procedure + customer pricing procedure**. Missing record for a **required** condition type → price determination **terminates with an error**.',
  'Net price = gross price ± discounts, surcharges, freight (condition types).',
]);
h2('5.4 Availability check');
bl([
  'Determined by the **checking rule** (which process step, e.g. sales order / delivery) and the **checking group** (level of detail: **daily** vs **individual** requirements). A **requirement** = each sales-order item.',
  '**Scope of check**: stock, **inward movements** (purchase and production orders), outward movements, and **replenishment lead time (RLT)**.',
  '**Check without RLT**: unavailable → check fails, no delivery proposal. **Check with RLT**: requested date **before** the lead time ends → **alternative date proposed**; date **beyond** the RLT → assumes procurement possible → **order confirmed**.',
  'TS410: **backorders**, **Backorder Processing (BOP)** – segments, variants, runs; strategies **Win / Lose / Gain / Redistribute**.',
]);
h2('5.5 Automatic account determination');
table(['Event', 'Posting (50 units, MAP $60, price $100)'], [
  ['**Goods issue**', 'Credit **Inventory** 50 × $60 = **$3,000**, debit **Cost of goods sold** (posting key **99** out; modifier **VAX**)'],
  ['**Billing**', 'Debit **Customer/A-R** $5,000, credit **Revenue** $5,000'],
  ['**Customer payment**', 'Credit customer (clear A/R), debit **Bank**'],
], [4, 10]);
bl([
  'MAP does **not** change at goods issue. Accounts needing determination: **inventory, COGS, revenue**. Inventory offset depends on **valuation modifier, valuation class, general modifier**: **VAX** goods issue for sales order, **BSA** initial stock entry (suspense account), **VBR** consumption.',
  '**Revenue account determination** is more complex: process **application (V = SD)**, **account key** (revenue type, discounts), conditioned by sales org, material, customer; the **most specific** rule wins (table 001 specific; 004/005 general).',
]);
h2('5.6 Customer account groups and document types');
bl([
  '**Partner functions**: **sold-to** (orders), **ship-to** (receives goods), **bill-to** (receives invoice), **payer** (pays); all four mandatory. **One-time customer** account group = template data entered on the document.',
  '**Account groups** define field status of the customer master; only required field in the example: **reconciliation account**.',
  '**Sales document types**: rush order, **cash sale** (no A/R), **returns** (goods receipt, not goods issue), complaints. Standard order → delivery type **LF**, returns → **LR**, invoice **F2**; **pro-forma** is not a true invoice.',
  '**Delivery block** (e.g. credit limit); **incompletion procedure** (required fields checked per step – missing Incoterms → error at delivery); **pricing date** controls valid prices; shipping condition in the **document type** beats the customer master.',
]);
h2('5.7 Master data and testing');
table(['Master data', 'Content'], [
  ['**Material master**', 'General sales data (distribution-chain level), **sales plant data** (**checking group, loading group, transportation group**); delivering plant: material master beats distribution chain'],
  ['**Customer master**', 'General, **sales** (per sales area: Incoterms, delivery priority) and **accounting** (reconciliation account, payment terms, tolerance group)'],
  ['**Condition records**', 'Prices, surcharges, discounts, freight, taxes'],
  ['**Customer-material info record**', 'Customer + material specific data (customer\'s own material number); **preferred** over customer and material master'],
], [4.5, 9.5]);
bl(['Testing: **scenario, integration, user acceptance** of: create quote → sales order → pick/pack/ship → invoice → receive payment.']);
h2('5.8 TS410 additions');
bl([
  'A sales document has **header, item and schedule line** (quantities and dates); deliveries have header and item only. **Mandatory partner functions**: sold-to, ship-to, payer, bill-to. Manual change of an address in a document does not change the master record.',
  'Delivering plant proposal order: **customer-material info record → ship-to customer master → material master**.',
  '**Incompletion log** lists missing required fields on saving. **Output** = order confirmation by mail/EDI/fax.',
  'Items can be combined into one delivery if **shipping point, due date and ship-to address** match. **Goods issue** needs completely **picked** items; it posts material and accounting documents, a CO document and updates the **billing due list** and document flow. **Billing** posts debit receivables / credit revenue. The **document flow** shows all preceding/subsequent documents.',
  '**SAP TM** supports transportation planning, carrier selection and charge calculation.',
]);
h2('5.9 Likely essay questions – Chapter 5');
tip([
  '**Q: Describe the order-to-cash process and the accounting at each step.** → steps 1–7, goods issue (Dr COGS/Cr inventory), billing (Dr A-R/Cr revenue), payment (Dr bank/Cr A-R).',
  '**Q: Explain the sales enterprise structure.** → sales org, distribution channel, division, sales area, distribution chain, shipping point, delivering plant.',
  '**Q: Explain pricing in SAP (condition technique).** → condition type, record, table, access sequence, pricing procedure, required type and error.',
  '**Q: Explain the availability check and replenishment lead time.** → rule + group, scope, three cases (no RLT, before RLT, beyond RLT).',
  '**Q: How does the system determine the shipping point and the delivering plant?** → plant + shipping condition + loading group; priority rules.',
]);
pb();

// ================= PS =================
h1('Project System (PS) – TS410 Unit 10');
h2('PS.1 Projects and phases');
note([
  'A **project** is an undertaking whose general conditions and constraints are **unique**: **objectives, time frame, financial and capacity-related restrictions**. Typical traits: complex, unique, high risk, limited in time and cost, capacity-intensive, several departments, strategic significance.',
  'Examples: R&D, investment measures, **make-to-order production**, extensive maintenance. Targets are agreed between the **contractor** and the **sold-to party**. For **customer projects** the planned **finish date** matters most; for **investment projects** the **budgeted costs**.',
  'Project structures are **hierarchies**: aggregate data, allocate budgets, define responsibilities and plan/control **dates, resources, costs, budgets, payments** transparently.',
]);
h2('PS.2 Structures: WBS and network');
table(['Object', 'Meaning'], [
  ['**Project definition**', 'Framework for all project objects: **start/finish dates**, organisational data, planning parameters, default values; the **controlling area is set once** here'],
  ['**WBS (Work Breakdown Structure)**', 'Hierarchical model of the **required activities**; basis for planning **costs, revenues, payments, scheduling, budgeting**; each **WBS element** = a work package'],
  ['**Network**', 'The **activities** with their **temporal and logical relationships** (the project flow)'],
  ['**Activity**', 'Operative basis for planning dates, costs and resources; assigned to WBS elements so dates/costs **aggregate** at WBS level'],
], [5, 9]);
bl([
  'WBS elements can take **plan costs/revenues, actual postings, budget, purchase requisitions, payments** and be scheduled manually. Each element has **its own company code**, so projects can span companies; **profit centre**, business area, responsible person, partner and cost centre can be assigned (reporting).',
  '**Project Builder**: fast creation/editing tool with **structure overview, worklist, work area**; context menus, drag-and-relate, templates (operative or standard projects, standard WBS/network); copy includes all lower objects.',
]);
h2('PS.3 WBS operative indicators, networks, milestones');
table(['Indicator', 'Use'], [
  ['**Planning element**', 'Costs can be **planned manually**'],
  ['**Account assignment element**', '**Actual costs** can be posted'],
  ['**Billing element**', '**Revenues** posted; **results analysis** usually here'],
  ['**Statistic**', 'Statistical only – no real costs'],
], [5, 9]);
bl([
  'Planning is carried out only on elements flagged as planning elements (level-3 elements are not planning elements if planning stops at level 2).',
  '**Network header** = control data and defaults (exactly **one** per network). **Activity categories**: **internal processing, external processing, service, cost activities**.',
  '**Milestones**: document important events, drive **milestone billing** in SD, trigger workflow tasks. Networks drive **scheduling, costing, resource and material requirements**.',
  '**Texts** managed in a **text catalog**; original documents via **SAP DMS** (document info records).',
]);
h2('PS.4 Planning resources, dates, costs');
bl([
  '**Internally processed activity**: planned work inside the company; needs **work center, work, duration, activity type** → capacity requirements and costs (activity type price × work, cost center from the work center).',
  '**Externally processed activity**: services by other companies → automatically creates a **purchase requisition** (info record data usable); processed via goods receipt.',
  '**Service activity**: service specifications and value limits; **service entry sheet** instead of goods receipt; two steps – **entry** and **acceptance**.',
  '**Project Planning Board** levels work-center capacities.',
]);
h2('PS.5 Budgeting and execution');
bl([
  '**Cost plan** = best estimate; **budget** = **binding**, approved by management. **Maintain original budget** assigns funds (budget profile: lump values or by year). After freezing via user status, changes only by **supplement, return, transfer**.',
  '**Budget release** makes funds available during a year; **budget carry forward** moves unused funds into the new fiscal year.',
  '**Material components** link PS with **SD, MM, PP**. **Stock item** (warehouse / project / sales-order stock, reservations); **non-stock item (category N)** → purchase requisition created by the activity, goods posted to the activity. Requirements planning creates a **planned order** (in-house) or **purchase requisition** (external).',
  '**Actual costs/revenues** arise from material withdrawals, goods receipts, vendor invoices, customer billing, internal activity allocations, and **confirmation** of network activities.',
]);
h2('PS.6 Period-end closing and settlement');
table(['Function', 'Purpose'], [
  ['**Progress analysis**', 'Planned vs actual **progress values**; early corrective action'],
  ['**Results analysis**', 'Periodic valuation of capitalised costs/provisions, usually in the **billing element**'],
  ['**Cost forecast**', 'Cost to complete = actual + commitment + updated remaining cost'],
  ['**Overhead costing**', 'Percentage- or quantity-based overhead rates; template allocation'],
  ['**Interest calculation**', 'Values fund commitments to get the best payment flow'],
  ['**Settlement**', 'Transfers costs/revenues (or results-analysis data) to **receivers**: G/L accounts, fixed assets, cost-accounting / **CO-PA** objects, PS objects'],
], [4.5, 9.5]);
bl(['**Settlement rules** (distribution rules + parameters) are stored in the sender objects; created manually in the Project Builder, with the Create Settlement Rule transaction/Fiori app, or via **strategies**.']);
h2('PS.7 Likely essay questions – PS');
tip([
  '**Q: Explain the structure of a project in SAP PS.** → project definition, WBS (hierarchy, elements, operative indicators), network (activities, relationships), assignment of activities to WBS, aggregation of dates and costs.',
  '**Q: Describe how costs and budget are planned and controlled in a project.** → cost planning vs binding budget, budget profile, release/carry forward, supplements/returns/transfers, commitments and actuals.',
  '**Q: Describe period-end closing in PS.** → progress analysis, results analysis, forecast, overhead, interest, **settlement** with rules and receivers.',
  '**Q: Compare internal, external and service activities.** → resources needed, purchase requisition, service entry sheet/acceptance.',
]);
pb();

// ================= EAM =================
h1('Enterprise Asset Management (EAM) – TS410 Unit 11');
h2('EAM.1 Business process and strategies');
note([
  '**Corrective maintenance** has **five phases**: **Notification → Planning → Control → Execution → Completion**. Workflows can control/automate it.',
]);
table(['Phase', 'What happens'], [
  ['**Notification**', 'Malfunction/requirement recorded in a **notification**'],
  ['**Planning**', 'Order created: steps, **materials, tools** (measuring devices, cranes)'],
  ['**Control**', 'Checks (**material availability, capacity**), **release**, shop papers printed'],
  ['**Execution**', 'Work done, material withdrawn (also **unplanned** material – with reference to the order number)'],
  ['**Completion**', '**Time confirmation, technical confirmation, technical completion**; settlement before or after TECO'],
], [3.5, 10.5]);
bl([
  'A planner can: create notification then order; create an **order with a combined notification**; or use a **Fiori malfunction report**.',
  '**Reactive** = repair after failure; **preventive** = overhauls at fixed periods and inspections; **predictive** = uses **device/sensor data** (IoT, digital twin) to predict failures.',
]);
h2('EAM.2 Organisational levels');
bl([
  '**Maintenance plant**: plant where the operational systems are installed. **Maintenance planning plant**: where requirements are planned (own plant or assigned maintenance plants); planners via **maintenance planner groups**.',
  '**Maintenance work centers** = capacity units (workshops). **Plant section** = production-responsibility subdivision (**plant engineer**); **locations** subdivide by site, building, coordinates.',
  '**Plant-specific planning**: one maintenance plant ↔ one planning plant, same plant plans and executes. **Cross-plant planning**: several maintenance plants assigned to one planning plant that plans, executes and supplies spare parts.',
]);
h2('EAM.3 Master data');
bl([
  '**Functional location**: hierarchical structure of a **technical system, building or part**; structured by **spatial, technical, functional/process** criteria; identified by a **structure indicator** (coding template + hierarchy levels, **max 40 characters**). Views: **general, location, organisation (company code, cost centre, planning plant), structure**. Use: represent structures, record tasks, store technical data, **monitor maintenance costs**.',
  '**Notification**: header (valid for the whole notification), **items** (problem/damage), **causes**, **activities** (work performed – proof for inspections), **tasks** (pending work). Reference objects: **functional location, equipment (with/without assembly), material + serial number**; also none for unmanaged objects or investment requests. Entering an assembly transfers data of equipment **and** functional location.',
]);
h2('EAM.4 Maintenance orders');
bl([
  'An order **does not require** a notification (a breakdown order can be created directly); it can come from a notification, combined notifications, or automatically from a **maintenance item of a maintenance plan**.',
  'Order elements: **header, object list, operations, material (component) list, production resources/tools (PRT), settlement rule, costs**. The **object list** does not control cost distribution (exit IWO10027 can distribute proportionally). **PRT** are not consumed (tools, protective clothing, trucks); spare parts belong to the **component list**.',
  '**Stock materials** are **reserved**; **availability check** can be called when components are added and runs at **release** (the order can still be released without availability). Planned goods issue refers to the **reservation**; unplanned to the **order number** (check with **IW13**).',
  '**Non-stock materials**: purchase requisition (on save/release) → purchase order assigned to the order → goods receipt **debits the order** with the PO value; invoice differences credit/debit the order.',
  'Only after **release**: print shop papers, withdraw material, post goods receipts, enter time confirmations, complete tasks.',
  '**Settlement rule** (proposed from the reference object master record) says **who bears the costs**.',
]);
h2('EAM.5 Confirmation, completion and settlement');
table(['Topic', 'Key facts'], [
  ['**Time confirmation**', 'Individually per operation, collectively, **overall completion confirmation**, or **CATS**'],
  ['**Statuses**', '**PCNF** partially confirmed operation; **CNF** all operations confirmed; **TECO** technically completed; notification: **OSTS** outstanding tasks, **NOCO** completed (locked)'],
  ['**Confirmation of an internal operation**', 'Triggers **internal activity allocation** (work time × activity price) from the work-center cost center to the order'],
  ['**After TECO**', 'Can still lock/unlock, set deletion flag, post outstanding goods movements, confirmations, invoices, change the settlement rule; **TECO can be reversed** (status, capacity and reservations rebuilt)'],
  ['**Settlement**', 'The order **collects all costs** of planning and execution and settles them to the **actual originator** (allocation by cause) – generally the **cost center** of the maintenance object; afterwards the **order balance is zero** and the cost center is debited'],
], [4.5, 9.5]);
h2('EAM.6 Likely essay questions – EAM');
tip([
  '**Q: Describe the corrective maintenance process.** → five phases with the activity and document of each, completion sub-steps and settlement.',
  '**Q: Explain functional locations and their role in plant maintenance.** → hierarchy, structuring criteria, structure indicator, master record views, cost monitoring, relation to equipment and notifications.',
  '**Q: Explain the structure of a maintenance order and how its costs reach FI/CO.** → order elements, reservations/PR, goods issue, activity allocation on confirmation, settlement to the cost center.',
  '**Q: Compare reactive, preventive and predictive maintenance.** → definitions plus IoT/sensor data and digital twin.',
]);
pb();

// ================= APPENDIX =================
h1('Appendix – Essay toolkit');
h2('A. Cross-module comparison table');
table(['', 'Procurement (MM)', 'Fulfillment (SD)', 'Project (PS)', 'Maintenance (EAM)'], [
  ['**Trigger**', 'Purchase requisition', 'Customer inquiry / PO', 'Project definition', 'Notification'],
  ['**Document**', 'Purchase order', 'Sales order', 'WBS / network', 'Maintenance order'],
  ['**Physical step**', 'Goods receipt', 'Goods issue', 'Confirmation / material withdrawal', 'Execution / confirmation'],
  ['**Invoice**', 'Vendor invoice (Dr GR/IR, Cr A/P)', 'Billing (Dr A/R, Cr revenue)', 'Billing (billing element)', '—'],
  ['**Closing**', 'Vendor payment', 'Customer payment', '**Settlement**', '**Settlement** to cost center'],
], [2.5, 3.5, 3.5, 3.5, 3.5]);
h2('B. Accounting entries to memorise');
table(['Step', 'Debit', 'Credit'], [
  ['Goods receipt (PO)', 'Inventory', 'GR/IR'],
  ['Invoice verification', 'GR/IR (+ input tax)', 'Vendor (A/P reconciliation)'],
  ['Vendor payment', 'Vendor (A/P)', 'Bank'],
  ['Goods issue (sales)', 'Cost of goods sold', 'Inventory'],
  ['Billing', 'Customer (A/R reconciliation)', 'Revenue'],
  ['Customer payment', 'Bank', 'Customer (A/R)'],
  ['Internal activity allocation', 'Receiver cost center/order', 'Sender cost center'],
], [4.5, 5, 5]);
h2('C. Essay answer template');
note([
  '**1. Define** the concept in one sentence. **2. List** the steps/elements in order. **3. Explain** what the system does at each step (documents, postings, checks). **4. Give the GBI example** (US00/DE00, Dallas, bicycles…). **5. Conclude** with the integration (FI/CO impact) or a benefit/risk.',
  'Use the textbook terms exactly (reconciliation account, GR/IR, three-way match, sales area, WBS element, TECO). Draw a small flow diagram when asked for a process.',
]);
tip([
  'Typical trap questions: **configuration vs customization**; **distribution vs assessment**; **MAP vs standard price**; **sales area** = sales org + channel + division; **valuation class vs material type**; **WBS** (hierarchy) vs **network** (flow); **notification** (what is wrong) vs **order** (how it is fixed).',
]);
C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [new TextRun({ text: '— End — Good luck with the exam!', italics: true, font: FONT, color: '555555' })] }));

// ---------- DOCUMENT ----------
const doc = new Document({
  creator: 'ERP2 study notes',
  title: 'ERP2 theory review guide',
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
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ERP2 – Theory review   |   Page ', size: 18, font: FONT, color: '777777' }), new TextRun({ children: [PageNumber.CURRENT], size: 18, font: FONT, color: '777777' })] })] }) },
    children: C,
  }],
});

const outDir = path.join(__dirname, '..', 'data', 'ERP2');
Packer.toBuffer(doc).then((buf) => {
  const out = path.join(outDir, 'ERP2_Theory_Review.docx');
  fs.writeFileSync(out, buf);
  console.log('written', out, buf.length);
});
