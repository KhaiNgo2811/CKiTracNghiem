// Sinh tài liệu lý thuyết ôn tập ERP2 -> data/ERP2/ERP2_Theory_Review.docx
// Chạy: NODE_PATH=<thư mục chứa node_modules/docx> node scripts/build-erp2-theory.js
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType,
  LevelFormat, BorderStyle, ImageRun, WidthType, ShadingType, PageBreak, Footer, PageNumber,
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


// Chèn sơ đồ (tạo bằng scripts/make-erp2-figs.py) kèm chú thích
function fig(name, caption, width = 600) {
  const data = fs.readFileSync(path.join(__dirname, 'erp2-figs', name + '.png'));
  const height = Math.round(width * data.readUInt32BE(20) / data.readUInt32BE(16));
  C.push(new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120 }, children: [new ImageRun({ data, transformation: { width, height } })] }));
  C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: caption, italics: true, size: 18, color: '555555', font: FONT })] }));
}

// Hình cắt từ giáo trình (scripts/crop-erp2-bookfigs.py); bỏ qua nếu máy không có
function book(name, caption, width = 580) {
  if (!fs.existsSync(path.join(__dirname, '..', 'data', 'ERP2', 'book-figs', name + '.png'))) return;
  const src = name[0] === 'B' ? 'Business Process Configuration with SAP ERP, Fig. ' : 'SAP TS410, Fig. ';
  fig('../../data/ERP2/book-figs/' + name, caption + ' (' + src + name.slice(1) + ')', width);
}

// ================= COVER =================
C.push(new Paragraph({ spacing: { before: 2600, after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'THEORY REVIEW GUIDE', bold: true, size: 40, font: FONT, color: '1F3A5F' })] }));
C.push(new Paragraph({ spacing: { after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ERP 2 – BUSINESS PROCESS CONFIGURATION WITH SAP', bold: true, size: 34, font: FONT })] }));
C.push(new Paragraph({ spacing: { after: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Concepts and terminology  |  Introduction, FI, CO, MM, SD, PS, EAM', italics: true, size: 26, font: FONT })] }));
pb();

const terms = (rows) => table(['Term', 'What it means and why it matters'], rows.map(([t, d]) => ['**' + t + '**', d]), [3.5, 10.5]);
const essay = (q, paras) => { h3(q); paras.forEach(p); };

h1('How to use this guide');
bl([
  'Each block gives the **big idea**, the **key terms**, the **process logic** and **model essay answers**.',
  'Do not memorise configuration codes. Be able to say **what** an object is, **why** it exists and **how** it connects to other modules.',
  'Write essays as paragraphs: **definition → explanation → example → effect on other modules**.',
]);
h2('The big picture');
p('An ERP system integrates business processes on one shared database. A business event is entered once, and its consequences reach every area that needs them. **Configuration** is how a company adapts the standard system to its own structure and rules.');
fig('integration', 'All modules work on one shared database', 480);
h2('Words used in every chapter');
p('These five ideas build on each other: the structure describes the company, master data describes the things it works with, and transactions use both and leave documents behind.');
terms([
  ['Enterprise structure', 'The organisational units that represent the company in the system. Everything else is built on it.'],
  ['Master data', 'Relatively stable core records (material, customer, vendor, account) reused by many transactions.'],
  ['Transaction data', 'Records of business events, created each time a process step is executed.'],
  ['Document', 'The system evidence of an event. It gives traceability for control and audit.'],
  ['Process integration', 'One transaction updates logistics and accounting at the same time, avoiding re-entry and inconsistencies.'],
]);
pb();

// ================= CH 1 =================
h1('Chapter 1. Introduction to Business Process Configuration');
h2('Adapting the system');
p('A company can fit SAP to its needs in two ways. Settings are tried first; program code is the exception. The terms below move from the safest option to the riskiest and then to the project as a whole.');
terms([
  ['Configuration', 'Choosing options and setting values in the delivered system, without changing program code.'],
  ['Customization', 'Adding or changing program code to meet a need that configuration cannot cover.'],
  ['Enhancement', 'Adding capability beside the standard code, so the system remains easier to upgrade.'],
  ['Modification', 'Changing existing standard code. Risky, because upgrades may overwrite or conflict with it.'],
  ['User exit', 'A predefined point in the standard program where additional logic can be plugged in.'],
]);
h2('Running the implementation');
p('Configuration is only one activity inside a larger project, which also has to define company rules and move old data into the new system.');
terms([
  ['Implementation', 'The whole project of choosing, setting up, testing and training. Configuration is only one part.'],
  ['Business rules and parameters', 'Rules express company practices; parameters set the limits within which data and actions are valid.'],
  ['Data migration and cleansing', 'Moving data from the legacy system after removing wrong and duplicated records.'],
]);
book('B1-2', 'Enterprise structure across modules', 460);
h2('Implementation phases (ASAP)');
p('The project goes from **project preparation** to **business blueprint**, **realization**, **final preparation**, **go-live** and **operation**. The idea is to agree on the processes before building them.');
fig('asap', 'ASAP implementation phases', 520);
h2('Four types of data');
p('**Enterprise structure data** comes first, then **business rules and parameters**, then **master data**; **transaction data** appears only when processes run. Each type depends on the previous one.');
fig('data', 'Order in which the types of data are created', 520);
h2('Testing');
p('Testing goes from the smallest piece to the whole system. The first four terms follow that order; the last two protect the system after changes and under heavy use.');
terms([
  ['Unit test', 'Checks one single step or transaction.'],
  ['Scenario test', 'Checks a chain of related steps, including wrong input.'],
  ['Integration test', 'Checks end-to-end processes across modules and external systems.'],
  ['User acceptance test', 'Real users confirm the system supports their work.'],
  ['Regression test', 'After a change, confirms that things which worked before still work.'],
  ['Performance test', 'Confirms the system copes with the expected workload.'],
]);
h2('Model essay answers');
essay('Distinguish configuration and customization.', [
  'Configuration adapts the standard system by selecting options and entering parameters, while customization changes or adds program code. For example, requiring a manager to approve large purchase orders can be configured: the company switches on approval and sets the limit. Customization is only needed when the standard functions cannot express the requirement.',
  'Configuration is preferred because it is cheaper, faster and safe when the software is upgraded. If code is required, an enhancement is better than a modification since it leaves the original program untouched.',
]);
essay('Why does testing matter in an ERP project?', [
  'Because processes are integrated, a single wrong setting can spread errors to stock and financial statements. Testing therefore goes from small to large: unit tests, then scenario and integration tests, and finally user acceptance. Regression and performance tests protect the system when it changes or grows.',
]);
pb();

// ================= CH 2 =================
h1('Chapter 2. Financial Accounting (FI)');
p('FI records every financially relevant event and produces legal financial statements, mainly for **external** users such as shareholders, banks and tax authorities.');
h2('Structure of the books');
p('These terms answer who keeps the books, which accounts they may use and for which time period.');
terms([
  ['Company code', 'An independent legal entity with its own set of books.'],
  ['Chart of accounts', 'The structured list of G/L accounts a company may use. It can be operating, country-specific or group level.'],
  ['General ledger (G/L)', 'The complete set of accounts from which financial statements are built.'],
  ['Fiscal year and posting period', 'The accounting year and its sub-periods. Only open periods accept postings; special periods hold year-end adjustments.'],
]);
book('T38', 'Organisational levels in financials and logistics', 480);
h2('Subledgers: detail behind the totals');
p('The general ledger shows totals, while subledgers keep the detail per customer, vendor or asset. The reconciliation account is the bridge between them.');
terms([
  ['Subledger', 'Detailed records for individual customers, vendors or assets.'],
  ['Reconciliation account', 'The G/L account that automatically summarises a subledger. Manual posting is blocked so both always agree.'],
  ['Accounts payable / receivable', 'Amounts owed to vendors (procurement) and amounts owed by customers (fulfillment).'],
  ['Business partner', 'One master record with roles for a party acting as customer, vendor, or both.'],
]);
fig('subledger', 'Subledgers feed the general ledger through reconciliation accounts', 480);
book('B2-8', 'Subledger and reconciliation account postings', 520);
h2('Controlling data entry');
p('These settings decide what a user may enter and how much. Together they act as internal control.');
terms([
  ['Account group', 'Groups similar accounts and controls their number range and which master fields are needed.'],
  ['Field status', 'Whether a field is required, optional, displayed or suppressed. It protects data quality.'],
  ['Document type', 'Classifies the business transaction and controls its numbering and permitted accounts.'],
  ['Posting key', 'Controls whether a line item is a debit or credit and which kind of account it can use.'],
  ['Tolerance group', 'Limits how much a user may post and how large a payment difference may be accepted. An internal control.'],
]);
h2('Clearing and automation');
p('Once entries are posted, the system has to match them and, for logistics events, choose accounts without help from an accountant.');
terms([
  ['Open item management', 'Items stay open until matched (cleared) by an offsetting entry, for example invoice and payment.'],
  ['Automatic account determination', 'The system chooses the G/L accounts itself when a logistics transaction occurs.'],
  ['Universal Journal', 'In S/4HANA, one line-item store shared by FI and CO, so data does not need to be reconciled.'],
]);
h2('Financial statements');
p('The **balance sheet** shows assets, liabilities and equity at a point in time (Assets = Liabilities + Equity). The **income statement** shows revenue and expenses over a period. Profit or loss moves to **retained earnings** at year end. The **cash flow statement** explains changes in cash.');
h2('Model essay answers');
essay('Explain the relationship between subledgers and the general ledger.', [
  'The general ledger gives the overall financial picture, but it would be unreadable if every customer and vendor had its own G/L account. Subledgers therefore keep the detail, and each is linked to a reconciliation account in the G/L. When a vendor invoice is posted, the vendor account is updated directly and the reconciliation account is updated at the same moment. Because users cannot post to the reconciliation account by hand, the totals stay consistent.',
]);
essay('How does FI integrate with logistics?', [
  'Logistics events with a financial effect create accounting documents automatically. A goods receipt increases inventory, a goods issue records cost of goods sold, and billing records revenue and a receivable. Account determination makes this possible, so warehouse and sales staff do not need accounting knowledge, and financial reports reflect operations in real time.',
]);
pb();

// ================= CH 3 =================
h1('Chapter 3. Management Accounting / Overhead (CO)');
p('CO provides information for **internal** managers: where costs arise, why, and who is responsible. It is more flexible than FI and also looks forward through planning.');
h2('Who is responsible for costs');
p('CO first divides the company into areas of responsibility. A cost center answers for costs only, a profit center for costs and revenues.');
terms([
  ['Controlling area', 'The organisational unit within which management accounting is carried out. It may cover one or several company codes.'],
  ['Cost center', 'A unit of responsibility that incurs costs, such as a department.'],
  ['Standard hierarchy', 'The tree containing all cost centers of the controlling area.'],
  ['Profit center', 'A unit judged on both revenue and cost, like a company within the company.'],
]);
h2('Kinds of cost');
p('Next, CO classifies what was spent. Primary elements bring costs in from FI; secondary elements only move them around inside CO.');
terms([
  ['Primary cost element', 'A cost coming from outside, linked to FI expense accounts (salaries, supplies).'],
  ['Secondary cost element', 'A cost used only for internal flows, such as allocations between cost centers.'],
  ['Overhead (indirect cost)', 'Cost that cannot be traced directly to one product.'],
  ['Real vs statistical posting', 'A real posting carries the cost; a statistical posting is only for information.'],
]);
book('B3-2', 'Costs flowing from FI to CO', 520);
h2('Allocating overhead');
p('Support departments pass their costs to those who benefit. The three methods differ in timing and in how much detail the receiver sees.');
terms([
  ['Distribution', 'Period-end allocation that keeps the original cost element, so receivers see what the cost was.'],
  ['Assessment', 'Period-end allocation that combines several costs under one secondary cost element; simpler but less detailed.'],
  ['Activity allocation', 'Charges receivers according to the quantity of a service actually used (activity type × rate).'],
  ['Statistical key figure', 'A non-money measure, such as headcount or floor area, used as an allocation basis.'],
]);
fig('allocation', 'How overhead moves in CO', 480);
book('B3-5', 'Periodic allocation: distribution', 520);
book('B3-6', 'Periodic allocation: assessment', 520);
book('B3-8', 'Internal activity allocation', 520);
h2('Temporary costs');
p('Costs for a one-off job are collected separately and moved to their final destination when appropriate.');
terms([
  ['Internal order', 'Collects the costs of a temporary job or event with a defined end.'],
  ['Settlement', 'Moves the costs collected in an order to their final receivers according to settlement rules.'],
]);
h2('Model essay answers');
essay('Compare distribution, assessment and activity allocation.', [
  'All three move overhead from the unit that incurred it to the units that benefit. Distribution and assessment happen at period end after costs have accumulated: distribution preserves the original cost type, while assessment merges them into one allocation cost. Activity allocation does not wait; it charges according to the service consumed, for example IT support hours. The more precise the cause-and-effect link, the fairer the result, but the more data must be recorded.',
]);
essay('How do FI and CO differ and connect?', [
  'FI follows legal rules and reports to outsiders; CO follows management needs and reports to insiders. They connect through cost elements: when an expense is posted in FI, CO also receives it together with an object such as a cost center that shows responsibility. In S/4HANA both use the Universal Journal.',
]);
pb();

// ================= CH 4 =================
h1('Chapter 4. Procurement (MM) – Procure to Pay');
h2('Process logic');
p('The company expresses a need, orders, receives, checks the invoice and pays. Only the last three steps change the accounts.');
table(['Step', 'Purpose', 'Accounting effect'], [
  ['**Purchase requisition**', 'Internal request to buy', 'None'],
  ['**Source determination / RFQ**', 'Choose the supplier', 'None'],
  ['**Purchase order**', 'Formal commitment to the supplier', 'None'],
  ['**Goods receipt**', 'Accept the material into stock', 'Debit inventory, credit GR/IR'],
  ['**Invoice verification**', 'Check the invoice before accepting the debt', 'Debit GR/IR, credit vendor'],
  ['**Payment**', 'Settle the debt', 'Debit vendor, credit bank'],
], [4, 5, 5]);
fig('p2p', 'Procure-to-pay (green steps post to accounting)', 540);
book('T172', 'Source-to-pay cycle', 500);
h2('Who buys and where goods go');
p('These organisational units define where material is kept and who is allowed to buy it.');
terms([
  ['Plant and storage location', 'A plant produces, stores or maintains; storage locations are places inside a plant where stock is kept.'],
  ['Purchasing organisation / group', 'The organisation negotiates with vendors and is responsible; the group is the buyers doing daily work.'],
  ['Purchasing models', 'Plant-specific, cross-plant or enterprise-wide: a trade-off between local flexibility and bargaining power.'],
]);
book('T177', 'Procurement organisational levels', 480);
book('B4-7', 'Enterprise-level purchasing model', 520);
h2('Checking before paying');
p('Several records protect the company from paying the wrong amount. The GR/IR account holds the value while the documents are not yet complete.');
terms([
  ['Purchasing info record', 'Information linking one material with one vendor, such as price and delivery terms.'],
  ['Material document', 'Evidence of a goods movement, usually accompanied by an accounting document.'],
  ['GR/IR clearing account', 'Temporary account bridging the time between receiving goods and receiving the invoice.'],
  ['Three-way match', 'Comparing purchase order, goods receipt and invoice before payment.'],
  ['Tolerance limit', 'Acceptable deviation; beyond it the system warns, blocks or rejects.'],
]);
fig('threeway', 'Three-way match', 420);
h2('Valuing the material');
p('Every receipt must be given a money value and an account. These terms control both.');
terms([
  ['Material valuation', 'Assigning money value to stock, at plant or company code level.'],
  ['Moving average price', 'Stock price that adjusts as purchase prices change; typical for bought materials.'],
  ['Standard price', 'A fixed planned price; differences are recorded as variances. Typical for produced goods.'],
  ['Valuation class', 'Groups materials that post to the same G/L accounts.'],
  ['Account assignment', 'Says which cost object pays for a purchase that does not go into stock.'],
]);
book('B4-16', 'Accounting consequences of procurement', 520);
h2('Model essay answers');
essay('Describe procure-to-pay and its accounting consequences.', [
  'The process begins with a purchase requisition expressing a need, followed by choosing a source and issuing a purchase order. None of these changes the books, since nothing has been received or owed yet. At goods receipt the company owns the material, so inventory increases and the GR/IR account holds the not-yet-invoiced amount. Invoice verification checks the three documents, clears GR/IR and records the debt to the vendor. Payment then removes the debt and reduces cash.',
]);
essay('Why are three-way match and tolerances important?', [
  'They ensure the company pays only for what it ordered and actually received, at the agreed price. Small differences are accepted to avoid delaying work, while large ones are warned about or block payment until someone investigates. This reduces errors and fraud.',
]);
pb();

// ================= CH 5 =================
h1('Chapter 5. Fulfillment (SD) – Order to Cash');
h2('Process logic');
p('The customer asks, orders, receives the goods, is billed and pays. Accounting starts at goods issue.');
table(['Step', 'Purpose', 'Accounting effect'], [
  ['**Inquiry and quotation**', 'Customer asks; seller makes a binding offer', 'None'],
  ['**Sales order**', 'Confirm what, how many, when and at what price', 'None'],
  ['**Delivery, picking, packing**', 'Prepare the shipment', 'None'],
  ['**Goods issue**', 'Goods leave the company', 'Debit cost of goods sold, credit inventory'],
  ['**Billing**', 'Invoice the customer', 'Debit receivable, credit revenue'],
  ['**Payment**', 'Receive the money', 'Debit bank, credit receivable'],
], [4, 5, 5]);
fig('o2c', 'Order-to-cash (green steps post to accounting)', 540);
book('T373', 'Lead to cash: process, roles and system steps', 540);
h2('Sales structure and customer roles');
p('These terms describe which part of the company sells, from where it ships and which role each customer party plays.');
terms([
  ['Sales organisation', 'Unit responsible for selling; belongs to one company code.'],
  ['Distribution channel / division', 'How products reach customers / which product line they belong to.'],
  ['Sales area', 'Combination of sales organisation, distribution channel and division.'],
  ['Delivering plant and shipping point', 'Where goods come from and the place that handles the shipment.'],
  ['Partner functions', 'Roles of a customer: sold-to, ship-to, bill-to and payer.'],
]);
book('T377', 'Enterprise structure in sales', 480);
book('B5-11', 'Sales areas', 520);
h2('Price');
p('The price of a sales order is built from separate parts that the system searches for automatically.');
terms([
  ['Condition technique', 'Flexible pricing method: condition types (price, discount, freight), records with values, an access sequence for searching, and a pricing procedure that sets the calculation order.'],
  ['Customer-material info record', 'Data specific to one customer and one material.'],
]);
fig('pricing', 'Condition technique: from procedure to the stored value', 520);
book('B5-27', 'Price determination flow', 520);
h2('Can we deliver?');
p('Before promising a date, the system checks supply, and if stock is short it decides who receives it.');
terms([
  ['Availability check', 'Tests whether goods can be supplied by the requested date, considering stock, planned receipts and issues.'],
  ['Replenishment lead time', 'Time needed to obtain or produce the material again.'],
  ['Backorder processing', 'Redistributes limited stock among open orders according to priority.'],
]);
h2('Following the documents');
p('These help users find missing information and trace an order from start to finish.');
terms([
  ['Incompletion log', 'Lists required information still missing from a document.'],
  ['Document flow', 'The chain linking preceding and following documents, used to track an order.'],
]);
book('T403', 'Sales document structure', 480);
book('B5-37', 'Revenue account determination', 520);
h2('Model essay answers');
essay('Describe order-to-cash and its integration with FI.', [
  'The process turns a customer need into cash. After inquiry and quotation, the sales order records the agreement and the system checks availability and determines price. The goods are then picked, packed and issued. Goods issue is the first accounting event because ownership of stock leaves the company. Billing records revenue and a receivable, and the process ends when payment clears that receivable.',
]);
essay('Explain pricing with the condition technique.', [
  'Instead of one fixed price, SAP builds the price from separate conditions such as a base price, discounts and freight. For each condition type the system follows an access sequence, searching from the most specific record to the most general one. The pricing procedure arranges the conditions into the final amount. The benefit is that prices can differ by customer, material or channel without changing any program.',
]);
pb();

// ================= PS =================
h1('Project System (PS)');
p('A **project** is a unique, time-limited and budget-limited undertaking, often involving several departments. PS plans, executes and controls it and connects with SD, MM, PP, HR and CO.');
h2('Project structure');
p('A project is described from two sides: the WBS says what must be delivered, and the network says how and when.');
terms([
  ['Project definition', 'The frame of the project: general data such as dates and organisational assignment.'],
  ['Work breakdown structure (WBS)', 'Hierarchy dividing the project into manageable parts, used for costs and budget.'],
  ['WBS element', 'One work package; it may be used for planning, actual posting or billing.'],
  ['Network and activity', 'The tasks and their dependencies; used for scheduling, resources and materials.'],
  ['Milestone', 'An important event that can mark progress or trigger billing.'],
]);
fig('wbs', 'Example: WBS (what) and activities (how)', 480);
book('T481', 'Networks and activities', 520);
h2('Money and control');
p('Costs are estimated, approved, spent and finally passed on. The terms follow that order.');
terms([
  ['Cost plan vs budget', 'The plan is an estimate; the budget is the approved, binding limit.'],
  ['Commitment', 'Money already promised but not yet recorded as actual cost.'],
  ['Confirmation', 'Reporting the work actually done.'],
  ['Results analysis', 'Values unfinished work at period end so profit is reported in the right period.'],
  ['Settlement', 'Transfers collected costs and revenues to receivers such as accounts, assets or profitability analysis.'],
]);
book('T471', 'Project phases', 520);
book('T521', 'Project settlement', 520);
h2('Model essay answers');
essay('Explain the structure of a project in SAP PS.', [
  'A project begins with the project definition. The work breakdown structure then answers what must be delivered by dividing the project into levels of work packages. The network answers how and when the work is done by listing activities and their order. Linking activities to WBS elements lets dates and costs add up through the hierarchy, giving managers control at each level.',
]);
essay('How are project costs controlled?', [
  'Costs are first estimated, then a budget is approved and released. During execution, commitments and actual costs are compared with the budget so overruns are noticed early. Changes are made through formal supplements, returns or transfers. At period end, analysis and settlement pass the results to accounting.',
]);
pb();

// ================= EAM =================
h1('Enterprise Asset Management (EAM)');
p('EAM keeps technical assets available and safe, records their history and shows what maintenance costs.');
h2('Maintenance strategies');
p('The three strategies differ in when the work happens relative to the failure.');
terms([
  ['Corrective maintenance', 'Repair after a fault occurs.'],
  ['Preventive maintenance', 'Scheduled work to avoid faults.'],
  ['Predictive maintenance', 'Uses condition or sensor data to act before a likely failure.'],
]);
h2('Objects and organisation');
p('These terms say what is maintained and who plans and performs the work.');
terms([
  ['Functional location', 'Hierarchical place or function where maintenance is performed.'],
  ['Equipment', 'An individual physical object that is maintained and has its own history.'],
  ['Maintenance planning plant', 'The unit that plans maintenance, for itself or for other plants.'],
  ['Maintenance work center', 'The team or workshop supplying capacity.'],
]);
book('T529', 'Organisational levels in EAM', 480);
book('T535', 'Functional location structure', 480);
h2('From fault report to cost');
p('The notification describes the problem, the order organises the solution, and completion and settlement close it.');
terms([
  ['Notification', 'Reports what is wrong or requested.'],
  ['Maintenance order', 'Plans and controls how the work is done: operations, materials, tools and costs.'],
  ['Technical completion', 'Confirms the technical work is finished; accounting follow-up may still happen.'],
  ['Settlement', 'Passes order costs to whoever is responsible, usually a cost center.'],
]);
book('T561', 'Elements of a maintenance order', 480);
h2('Process logic');
p('**Notification** records the problem. **Planning** creates the order. **Control** checks material and capacity and releases it. **Execution** performs the work. **Completion** records findings, closes the work technically and settles the costs to the responsible cost center.');
fig('eam', 'Corrective maintenance and settlement', 520);
book('T525', 'Corrective maintenance process', 520);
h2('Model essay answers');
essay('Describe the corrective maintenance process and its integration.', [
  'When equipment fails, a notification captures the problem. A planner turns it into a maintenance order, and after availability checks the order is released and carried out. Materials come from stock or are bought through MM, labour is confirmed as internal activity, and CO collects these costs on the order. After completion the costs are settled to the responsible cost center, and the history helps prevent the next failure.',
]);
pb();

// ================= APPENDIX =================
h1('Appendix – Pairs that are often confused');
p('Read each row aloud and give one example for both sides; essay and multiple-choice questions often test exactly these differences.');
table(['Pair', 'Difference'], [
  ['**Configuration / customization**', 'Settings / program code'],
  ['**Master / transaction data**', 'Stable core records / individual business events'],
  ['**FI / CO**', 'External legal reporting / internal management'],
  ['**Cost center / profit center**', 'Responsible for costs / for costs and revenues'],
  ['**Distribution / assessment**', 'Keeps original cost element / combines under a secondary element'],
  ['**Moving average / standard price**', 'Follows actual purchases / fixed, with variances'],
  ['**Sales area / plant**', 'Selling structure / production and storage site'],
  ['**WBS / network**', 'What is delivered / how and when it is done'],
  ['**Notification / order**', 'What is wrong / how it is fixed'],
], [5, 9]);
h2('Answer template');
p('Define the concept, explain why the business needs it, describe the steps or parts, give one example, and finish with the effect on another module.');

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
