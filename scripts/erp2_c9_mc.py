# -*- coding: utf-8 -*-
"""Viết lại các câu Yes/No của ERP2_C9 thành trắc nghiệm ABCD.
Mỗi mục: (câu hỏi, đáp án đúng, nhiễu 1, nhiễu 2, nhiễu 3). None = bỏ vì trùng ý câu khác."""
import random, zlib

MC = {
 'T1_Q2': ('Which test is the lowest level, executing each individual transaction or process step?', 'Unit testing', 'User acceptance testing', 'Integration testing', 'Scenario testing'),
 'T1_Q3': ('Which statement about business rules and parameters is correct?', 'They are set during configuration and seldom change', 'They change with every transaction', 'They are typed by users while processing orders', 'They are reset at each posting period'),
 'T1_Q4': ('Payment terms offered to vendors are an example of which type of configuration element?', 'Business rules and parameters', 'Transaction data', 'Enterprise structure', 'Situational data'),
 'T1_Q5': ('Which type of data is expected to change least often?', 'Enterprise structure', 'Transaction data', 'Sales order data', 'Goods movement data'),
 'T1_Q6': ('How are the client and company codes related?', 'One client can have several company codes', 'One client can have only one company code', 'One company code contains several clients', 'Clients and company codes are not related'),
 'T1_Q7': ('A US company and a German company buy from the same vendor with different payment terms. How is the vendor handled?', 'Company code data are maintained separately for each company', 'One set of payment terms applies to both companies', 'The vendor is defined only for the first company that buys', 'Payment terms are stored in the chart of accounts'),
 'T2_Q5': ('What do GAAP and IFRS / IAS provide?', 'Rules for applying accounting concepts', 'Methods for configuring purchasing groups', 'Standards for testing SAP software', 'Formats for sales order documents'),
 'T2_Q6': ('Accounts receivable accounting, which manages customer transactions, is an integral part of which process?', 'Fulfillment', 'Procurement', 'Production', 'Maintenance'),
 'T2_Q7': ('Which organizational unit represents an independent legal accounting entity?', 'Company code', 'Controlling area', 'Plant', 'Business area'),
 'T2_Q8': None,
 'T2_Q9': ('What is true of a field with the status "Display"?', 'Its value is shown but cannot be changed', 'It must be filled before saving', 'It is hidden from the user', 'It may be filled or left empty'),
 'T2_Q10': ('How are subledgers and reconciliation accounts posted?', 'The subledger is posted directly, the reconciliation account automatically', 'The reconciliation account is posted directly, the subledger automatically', 'Both accounts must be posted manually by the user', 'Only the reconciliation account is ever posted'),
 'T2_Q11': ('Which chart of accounts helps a company meet the legal requirements of each country?', 'Country-specific chart of accounts', 'Operating chart of accounts', 'Group chart of accounts', 'Sample chart of accounts'),
 'T2_Q12': ('Which master data are most important for a basic financial accounting setup?', 'General ledger accounts', 'Purchasing info records', 'Condition records', 'Functional locations'),
 'T2_Q13': None,
 'T2_Q14': ('A primary cost element is directly associated with which object?', 'A general ledger account', 'An activity type', 'A statistical key figure', 'A cost center group'),
 'T2_Q15': ('What do employee tolerance groups control?', 'The amounts an employee is allowed to post', 'The number of screens an employee may open', 'The cost centers an employee is paid from', 'The delivery dates an employee can promise'),
 'T2_Q16': None,
 'T2_Q17': ('From where does a G/L account inherit its field statuses?', 'Its account group', 'Its posting period variant', 'Its document number range', 'Its controlling area'),
 'T2_Q18': ('How many posting keys does each line item of an accounting document have?', 'Exactly one', 'Two, one for debit and one for credit', 'None unless the user adds one', 'One for each account segment'),
 'T2_Q19': ('A G/L account record contains data from which two levels?', 'Chart of accounts and company code', 'Client and controlling area', 'Company code and plant', 'Chart of accounts and cost center'),
 'T2_Q20': ('What is the relationship between the general ledger and the chart of accounts?', 'The general ledger is an instance of the chart of accounts', 'The chart of accounts is a subledger of the general ledger', 'The chart of accounts is created from posted documents', 'The two are completely independent lists'),
 'T2_Q21': ('What happens to the document number a posting can receive?', 'It must fall within the assigned number range', 'Any number may be typed if a range is full', 'It is chosen from another company code', 'It repeats the number of the previous document'),
 'T2_Q22': ('When a company receives a payment from a customer, which account is debited?', 'Bank', 'Customer account', 'Sales revenue', 'Accounts payable'),
 'T2_Q23': ('Which chart of accounts supports consolidated reporting for the whole corporate group?', 'Group chart of accounts', 'Country-specific chart of accounts', 'Operating chart of accounts', 'Sample chart of accounts'),
 'T2_Q24': None,
 'T2_Q25': ('What is the primary purpose of general ledger accounting?', 'To capture all data from process steps with a financial impact', 'To plan the material requirements of every plant', 'To record only the internal costs of departments', 'To manage the physical movement of stock'),
 'T2_Q26': ('Which three activities does the statement of cash flows report?', 'Operating, investing and financing', 'Assets, liabilities and equity', 'Revenue, expense and profit', 'Planning, posting and closing'),
 'T3_Q3': ('To how many controlling areas can one company code be assigned?', 'Exactly one', 'Any number', 'One per cost center', 'One per fiscal year'),
 'T3_Q4': ('Which two are overhead management methods?', 'Cost center accounting and internal order accounting', 'Asset accounting and payroll accounting', 'Accounts payable and accounts receivable', 'Pricing and billing'),
 'T3_Q5': ('Which statement about cost (management) accounting is correct?', 'It is internal and need not follow GAAP or IFRS', 'It must follow GAAP in every country', 'It must follow IFRS for external investors', 'It is audited like the legal financial statements'),
 'T3_Q6': ('What is meant by external settlement?', 'Moving costs from CO to financial accounting, for example to an asset', 'Moving costs from financial accounting into a cost center', 'Moving costs between two cost centers in CO', 'Paying an external vendor invoice'),
 'T3_Q7': ('Which costs make up the cost of production?', 'Direct material, direct labor and overhead', 'Direct material and direct labor only', 'Direct labor and selling expenses only', 'Overhead and income tax only'),
 'T3_Q8': ('Which description fits management (cost) accounting?', 'Internal accounting focused on managing costs', 'Legal reporting to shareholders and tax authorities', 'Recording amounts owed to vendors only', 'Recording the physical count of inventory'),
 'T3_Q9': ('How can a controlling area relate to company codes?', 'One controlling area can include several company codes', 'One controlling area can include only one company code', 'Each company code contains several controlling areas', 'Controlling areas are assigned to plants only'),
 'T3_Q10': ('Which description fits overhead costs?', 'Costs that cannot be traced directly to products or services', 'Costs that are traced directly to one product', 'Revenue earned from internal services', 'Costs that never appear in controlling'),
 'T3_Q11': ('Where do primary cost elements originate?', 'In FI general ledger accounts', 'In CO internal allocations', 'In the material master', 'In the sales order'),
 'T3_Q12': ('Where are actual cost transactions posted?', 'To individual cost centers', 'To cost center groups', 'To the standard hierarchy node', 'To the controlling area header'),
 'T3_Q13': ('Which pair is basic to setting up overhead accounting in CO?', 'Cost elements and cost centers', 'Shipping points and loading points', 'Condition types and access sequences', 'Vendors and info records'),
 'T4_Q1': ('Which statement about posting a goods receipt is correct?', 'It can be posted without reference to an order', 'It always needs a reference purchase order', 'It always needs a reference sales order', 'It can only follow an invoice'),
 'T4_Q2': ('Which documents can a goods issue create?', 'Material, FI and CO documents', 'Material documents only', 'FI documents only', 'A purchase order and an invoice'),
 'T4_Q3': None,
 'T4_Q4': ('What is the effect of a goods issue on inventory?', 'It decreases inventory', 'It increases inventory', 'It leaves quantity unchanged but raises value', 'It only changes the storage bin name'),
 'T4_Q19': ('Which of these is a step of the procurement process?', 'Purchase requisition', 'Sales order processing', 'Customer billing', 'Customer quotation'),
 'T4_Q20': ('Creating a purchase order is a step in which process?', 'Procurement', 'Fulfillment', 'Maintenance completion', 'Financial closing'),
 'T4_Q21': ('Which accounting impact does the invoice receipt step in procurement normally have?', 'An FI impact without a CO impact', 'A CO impact without an FI impact', 'Neither an FI nor a CO impact', 'Only a change in material quantity'),
 'T4_Q22': ('In which step is a purchase requisition converted into a purchase order?', 'Purchase order processing', 'Goods receipt', 'Invoice verification', 'Requirements determination'),
 'T4_Q23': ('In internal procurement, which price is used to value the goods issue posting?', 'Valuation price at the sending plant', 'Valuation price at the receiving plant', 'Sales price charged to customers', 'Price on the last vendor quotation'),
 'T4_Q24': ('In internal procurement between plants (two-step), what is created at goods receipt?', 'A material document but no FI document', 'An FI document but no material document', 'Both a material and an FI document', 'No document at all'),
 'T4_Q25': ('At goods receipt in external procurement for one material, how many line items does the material document have?', 'One', 'Two', 'Three', 'None'),
 'T4_Q26': ('What is posted to the GR/IR account when a vendor invoice is received?', 'A debit', 'A credit', 'Both a debit and a credit', 'No entry'),
 'T4_Q27': ('Which step typically starts the procurement process?', 'Creating a purchase requisition', 'Posting the vendor payment', 'Verifying the vendor invoice', 'Receiving the goods'),
 'T4_Q28': None,
 'T4_Q29': ('What does valuation at plant level allow?', 'The same material can have different values in different plants', 'The material must have one price in all plants', 'Only the company code can hold stock', 'Materials are no longer valuated'),
 'T4_Q30': ('Which organizational unit negotiates purchasing conditions with vendors and is responsible for procurement?', 'Purchasing organization', 'Plant', 'Storage location', 'Shipping point'),
 'T5_Q10': ('During fulfillment, which process can the availability check trigger when stock is insufficient?', 'Procurement', 'Payroll', 'Asset depreciation', 'Customer payment'),
 'T5_Q11': None,
 'T5_Q12': ('Which fulfillment step has a controlling (CO) impact when goods leave the warehouse?', 'Goods issue', 'Customer inquiry', 'Quotation', 'Sales order creation'),
 'T5_Q13': None,
 'T5_Q14': ('Which document does the shipping step create first?', 'Outbound delivery document', 'Purchase requisition', 'Vendor invoice', 'Customer inquiry'),
 'T5_Q15': ('What is the purpose of an outbound delivery document?', 'To authorize picking, packing and shipping to a customer', 'To request moving materials from one plant to another', 'To request materials from the purchasing department', 'To record the payment from the customer'),
 'T5_Q16': ('The amount posted at goods issue in fulfillment is based on which price?', 'Current moving average price of the material', 'Sales price on the customer order', 'Price on the latest customer quotation', 'List price including freight'),
 'T5_Q17': ('When a customer payment is received, which account is updated automatically?', 'Accounts receivable reconciliation account', 'Accounts payable reconciliation account', 'GR/IR clearing account', 'Sales revenue account'),
 'T5_Q25': ('Which set of organizational elements is essential to the fulfillment process?', 'Client, company code, sales area, plant', 'Client, purchasing group, work center, plant', 'Controlling area, cost center, asset class', 'Company code, purchasing organization, payroll area'),
 'T5_Q46': ('How many loading points can one shipping point have?', 'None, one or several', 'Exactly one', 'Exactly two', 'One for each sales area only'),
 'T5_Q47': ('What makes up a sales area?', 'Sales organization, distribution channel and division', 'Company code, plant and storage location', 'Purchasing organization and purchasing group', 'Shipping point and loading point'),
 'T5_Q48': ('To how many company codes can one sales organization be assigned?', 'Only one', 'Any number', 'One for each division', 'One for each distribution channel'),
 'T5_Q49': ('What does the standard SAP system provide for its standard condition types?', 'Predefined access sequences', 'Fixed prices for all materials', 'Predefined customer master records', 'Automatic vendor payments'),
}


def apply(chapter):
    for topic in chapter['topics']:
        out = []
        for q in topic['questions']:
            key = q['id'].replace('ERP2_C9_', '')
            if list(q['options'].values()) != ['Yes', 'No']:
                out.append(q)
                continue
            item = MC[key]  # KeyError = còn câu Yes/No chưa viết lại
            if item is None:
                continue
            stem, right, *wrong = item
            opts = [right] + wrong
            random.Random(zlib.crc32(q['id'].encode())).shuffle(opts)
            out.append({'id': q['id'], 'question': stem, 'options': dict(zip('ABCD', opts)),
                        'correctAnswer': 'ABCD'[opts.index(right)],
                        'explanation': f'Correct answer: <b>{right}</b>.'})
        topic['questions'] = out
