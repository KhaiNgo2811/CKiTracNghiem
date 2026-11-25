# -*- coding: utf-8 -*-
"""Sinh data/ERP2/ERP2_C8.json: câu tự luận (đề tiếng Anh, gợi ý trả lời tiếng Việt, giữ thuật ngữ SAP)."""
import json

OUT = 'data/ERP2/'


def g(flow, *paragraphs):
    return (f'<p class="mb-2"><b>Mạch ý:</b> {flow}</p><p class="mb-2"><b>Bài trả lời tham khảo:</b></p>'
            + ''.join(f'<p class="mb-2">{x}</p>' for x in paragraphs))


# Thứ tự topic và câu giữ nguyên với bản trước để id không đổi
TOPICS = [
    ('Core business processes', [
        ('Describe the <b>procure-to-pay process</b> in SAP. For each step, explain its purpose, the documents created and the effect on accounting.',
         g('Nhu cầu → chọn nguồn → purchase order → goods receipt → invoice verification → payment → kiểm soát và tích hợp.',
           'Procure-to-pay bao gồm toàn bộ công việc từ khi phát sinh nhu cầu vật tư đến khi trả tiền cho nhà cung cấp. Quy trình bắt đầu bằng <b>purchase requisition</b>, là đề nghị nội bộ nêu cần mua gì, bao nhiêu và khi nào. Bộ phận mua hàng xác định nguồn cung, có thể yêu cầu báo giá, rồi lập <b>purchase order</b> là cam kết chính thức với nhà cung cấp. Các bước này chưa tạo bút toán vì công ty chưa nhận hàng và chưa phát sinh nợ.',
           'Khi <b>goods receipt</b>, kho nhận hàng, hệ thống tạo material document và accounting document: Nợ Inventory, Có <b>GR/IR clearing account</b>. Khi <b>invoice verification</b>, hóa đơn được đối chiếu với purchase order và phiếu nhận hàng (<b>three-way match</b>); GR/IR được xóa, ghi Có tài khoản nhà cung cấp và reconciliation account tự cập nhật. Cuối cùng <b>payment</b> ghi Nợ nhà cung cấp, Có Bank.',
           'Quy trình thể hiện tính tích hợp: MM thực hiện phần hậu cần, FI tự nhận tác động tài chính nhờ automatic account determination. Tolerance limit và three-way match giúp công ty tránh trả thừa và gian lận.')),
        ('Describe the <b>order-to-cash process</b>. How does it integrate sales, warehouse and finance?',
         g('Inquiry, quotation → sales order → delivery và goods issue → billing → payment → tích hợp.',
           'Order-to-cash biến nhu cầu của khách hàng thành tiền thu về. Khách có thể gửi <b>inquiry</b>, công ty trả lời bằng <b>quotation</b> là lời chào hàng có giá trị ràng buộc trong một thời hạn. Khi khách đồng ý, <b>sales order</b> được lập; lúc này hệ thống xác định giá bằng condition technique, kiểm tra hàng sẵn có (availability check) và đề xuất ngày giao.',
           'Tiếp theo công ty tạo <b>outbound delivery</b>, kho lấy hàng và đóng gói. <b>Goods issue</b> ghi nhận hàng rời công ty: Nợ Cost of goods sold, Có Inventory, đây là tác động kế toán đầu tiên. <b>Billing</b> lập hóa đơn: Nợ phải thu khách hàng, Có Revenue. Quy trình kết thúc khi nhận <b>payment</b>: Nợ Bank, Có phải thu.',
           'Bán hàng, kho và tài chính dùng chung dữ liệu, document flow nối các bước nên nhân viên tra được tình trạng đơn hàng bất cứ lúc nào. Nhờ account determination, người làm hậu cần không phải tự chọn tài khoản kế toán.')),
        ('A bicycle company receives a large customer order but does not have enough stock. Explain <b>how ERP processes work together</b> from the order until the money is collected.',
         g('Sales order và availability check → bổ sung hàng (mua linh kiện, sản xuất) → giao, lập hóa đơn → trả nhà cung cấp, thu tiền → vai trò FI, CO.',
           'Phòng kinh doanh nhập sales order trong SD. <b>Availability check</b> cho thấy tồn kho và hàng sắp về không đủ cho ngày khách yêu cầu, nên hệ thống đề xuất ngày khác hoặc giao từng phần. Nếu phải chia hàng giữa nhiều khách, backorder processing giúp ưu tiên đơn quan trọng.',
           'Để bù phần thiếu, công ty sản xuất thêm xe và mua linh kiện còn thiếu. Nhu cầu dẫn đến purchase requisition, purchase order và goods receipt trong MM, sau đó là invoice verification và thanh toán cho nhà cung cấp. Sản xuất tiêu hao linh kiện và nhập thành phẩm vào kho.',
           'Kho lấy hàng, đóng gói và ghi goods issue; SD lập hóa đơn; FI ghi nhận phải thu và sau đó là tiền thu về. Suốt quá trình, FI ghi tác động tài chính còn CO theo dõi chi phí và trách nhiệm. Vì mọi module dùng chung cơ sở dữ liệu nên thay đổi ở một nơi được nhìn thấy ngay ở nơi khác, giảm chậm trễ và nhập liệu trùng.')),
    ]),
    ('Accounting and controlling', [
        ('Explain how <b>financial accounting</b> receives and controls data from other processes. Include the general ledger, subledgers, reconciliation accounts and automatic account determination.',
         g('Vai trò FI → G/L và subledger → reconciliation account → account determination → kiểm soát.',
           'Financial accounting ghi nhận mọi sự kiện có tác động tài chính để công ty lập báo cáo theo luật định. Trọng tâm là <b>general ledger</b>, được xây dựng từ chart of accounts và duy trì theo từng company code. Chi tiết của từng khách hàng, nhà cung cấp, tài sản nằm trong <b>subledger</b>.',
           'Mỗi subledger gắn với một <b>reconciliation account</b>. Khi ghi hóa đơn vào tài khoản nhà cung cấp, reconciliation account được cập nhật đồng thời và không cho ghi tay, nên chi tiết và tổng luôn khớp.',
           'Các sự kiện hậu cần đến FI qua <b>automatic account determination</b>: goods receipt, goods issue hay billing tự sinh bút toán. Chất lượng dữ liệu và kiểm soát nội bộ được đảm bảo bằng posting period, document type, field status và tolerance group. Kết quả là báo cáo kịp thời, nhất quán và truy ngược được về chứng từ gốc.')),
        ('Describe the <b>overhead management process</b> in CO. How are costs collected and allocated, and why does it matter to managers?',
         g('Chi phí từ FI → tập hợp trên đối tượng chi phí → phân bổ → settlement → giá trị cho quản lý.',
           'Overhead là chi phí không truy được trực tiếp cho từng sản phẩm, nên CO trước hết tập hợp chúng tại nơi phát sinh. Khi một khoản chi gắn primary cost element được ghi trong FI, CO cũng nhận trên <b>cost center</b> hoặc <b>internal order</b>.',
           'Các cost center phục vụ sau đó chuyển chi phí cho đơn vị hưởng lợi. <b>Distribution</b> phân bổ cuối kỳ và giữ nguyên cost element gốc. <b>Assessment</b> gộp nhiều chi phí vào một secondary cost element. <b>Activity allocation</b> tính theo lượng dịch vụ thực dùng, ví dụ giờ hỗ trợ IT. Chi phí tạm thời như hội chợ được gom trên internal order rồi chuyển đi bằng <b>settlement</b>.',
           'Nhờ vậy nhà quản lý thấy chi phí thật của từng bộ phận và hoạt động, so sánh kế hoạch với thực tế, quy trách nhiệm, định giá sản phẩm chính xác hơn và quyết định nên cắt giảm ở đâu.')),
    ]),
    ('Projects and maintenance', [
        ('Describe the <b>life cycle of a project</b> in SAP PS, from definition to settlement.',
         g('Project definition → WBS, network → hoạch định → budget và release → thực hiện → cuối kỳ và settlement.',
           'Dự án là công việc mang tính duy nhất, giới hạn thời gian và ngân sách. Trong SAP PS, dự án bắt đầu bằng <b>project definition</b>. <b>Work breakdown structure (WBS)</b> chia dự án thành các gói công việc, còn <b>network</b> liệt kê các hoạt động và quan hệ phụ thuộc.',
           'Giai đoạn hoạch định xác định thời gian, nguồn lực, vật tư và chi phí. Cấp quản lý phê duyệt <b>budget</b> là giới hạn bắt buộc và release dự án. Khi thực hiện, công việc nội bộ được confirm, vật tư được xuất hoặc mua, dịch vụ ngoài được nhận. Commitment và chi phí thực tế được so với budget; milestone thể hiện tiến độ và có thể kích hoạt lập hóa đơn cho dự án khách hàng.',
           'Cuối kỳ, progress analysis và results analysis đánh giá phần dở dang. Cuối cùng <b>settlement</b> chuyển chi phí và doanh thu đến đối tượng nhận như tài sản, tài khoản hay profitability analysis. PS vì thế liên kết SD, MM, HR, FI và CO quanh một cấu trúc dự án.')),
        ('A production machine suddenly breaks down. Describe the <b>corrective maintenance process</b> in SAP EAM and its integration with other modules.',
         g('Notification → planning → control → execution → completion, settlement → tích hợp và lợi ích.',
           'Người vận hành tạo <b>maintenance notification</b> mô tả sự cố, thiết bị hoặc functional location bị ảnh hưởng và mức khẩn cấp. Ở bước <b>planning</b>, người lập kế hoạch tạo <b>maintenance order</b> gồm công đoạn, phụ tùng, dụng cụ và chi phí dự kiến; trường hợp khẩn cấp có thể tạo order ngay.',
           'Ở bước <b>control</b>, hệ thống kiểm tra vật tư, năng lực và order được release. Khi <b>execution</b>, kỹ thuật viên sửa máy và xuất phụ tùng; phụ tùng không có trong kho được mua qua MM và tính vào order. Ở <b>completion</b>, kỹ thuật viên xác nhận giờ công, ghi nguyên nhân, việc đã làm, rồi order được đặt technically completed.',
           'Order tập hợp toàn bộ chi phí và <b>settle</b> về cost center chịu trách nhiệm trong CO, FI ghi nhận bút toán liên quan. Lịch sử bảo trì giúp công ty phân tích lỗi lặp lại và tiến tới bảo trì phòng ngừa hoặc dự đoán.')),
    ]),
    ('Implementation and enterprise structure', [
        ('A company is going to implement SAP. Describe the <b>steps of the implementation</b>, the role of configuration, and how the company should test the system.',
         g('ASAP → configuration và customization → thứ tự dữ liệu → các mức testing → yếu tố thành công.',
           'Theo ASAP, trước hết công ty chuẩn bị dự án: mục tiêu, phạm vi, đội ngũ. Ở <b>business blueprint</b> công ty mô tả quy trình mong muốn. Ở <b>realization</b> hệ thống được cấu hình. <b>Final preparation</b> gồm kiểm thử, đào tạo, chuyển đổi, sau đó là <b>go-live</b> và hỗ trợ.',
           'Configuration là chọn tùy chọn và giá trị mà không sửa mã. Customization là sửa hoặc thêm mã, chỉ nên làm khi bắt buộc và ưu tiên enhancement để nâng cấp an toàn. Enterprise structure được thiết lập trước, rồi business rules, rồi master data; dữ liệu cũ phải được làm sạch trước khi chuyển.',
           'Kiểm thử đi từ <b>unit test</b> đến <b>scenario</b>, <b>integration</b> rồi <b>user acceptance</b>, kèm regression và performance test khi cần. Sự ủng hộ của lãnh đạo, yêu cầu rõ ràng và người dùng được đào tạo rất quan trọng, vì hệ thống thay đổi cách làm việc chứ không chỉ thay phần mềm.')),
        ('Explain how you would design the <b>enterprise structure</b> for a company with several countries, factories and sales channels.',
         g('Client → company code → controlling area → plant, storage location → mua hàng, bán hàng → đánh đổi.',
           'Enterprise structure là hình ảnh của công ty trong hệ thống nên phải thiết kế trước master data và giao dịch. Cả tập đoàn là một <b>client</b>. Mỗi pháp nhân, thường mỗi quốc gia một pháp nhân, là một <b>company code</b> có sổ sách và đồng tiền riêng. Một <b>controlling area</b> có thể bao nhiều company code để quản trị có cái nhìn chung, với điều kiện chúng dùng chung các thiết lập kế toán cần thiết.',
           'Nhà máy và trung tâm phân phối là các <b>plant</b>, mỗi plant thuộc một company code, bên trong có <b>storage location</b>. Mua hàng có thể tổ chức tập trung để tăng sức đàm phán hoặc theo plant để linh hoạt. Bán hàng tổ chức theo <b>sales organization</b>, <b>distribution channel</b> và <b>division</b>, ghép thành sales area; shipping point phụ trách giao hàng.',
           'Thiết kế cần phản ánh yêu cầu pháp lý và trách nhiệm thực tế nhưng càng đơn giản càng tốt. Cấu trúc quá chi tiết làm tăng công bảo trì, còn quá đơn giản thì không ra được báo cáo nhà quản lý cần.')),
    ]),
    # ---- Câu tự luận lấy từ file "TEST ERP2 tổng hợp"
    ('FI essays – accounts and statements (from review file)', [
        ('Define <b>operating chart of accounts</b>.',
         g('Chart of accounts là gì → operating dùng để làm gì → so với loại khác.',
           'Chart of accounts là danh sách các tài khoản có thể dùng để tạo general ledger. <b>Operating chart of accounts</b> là bộ tài khoản dùng cho hoạt động ghi sổ hằng ngày của công ty. Ngoài ra còn có country-specific chart of accounts để đáp ứng quy định từng nước và group chart of accounts để lập báo cáo hợp nhất toàn tập đoàn.')),
        ('Describe briefly the G/L account categories: <b>assets, liabilities, equity, revenue and expenses</b>.',
         g('Ba loại trên balance sheet → hai loại trên income statement.',
           '<b>Assets</b> là nguồn lực có giá trị do công ty sở hữu, có thể dùng để thực hiện nghĩa vụ tài chính. <b>Liabilities</b> là các khoản công ty còn nợ, như nợ nhà cung cấp hay vay ngân hàng. <b>Equity</b> là phần còn lại thuộc chủ sở hữu sau khi lấy tài sản trừ nợ. Ba loại này nằm trên balance sheet.',
           '<b>Revenue</b> là tiền công ty kiếm được từ bán sản phẩm, dịch vụ. <b>Expenses</b> là chi phí để mua, sản xuất và bán chúng. Hai loại này nằm trên income statement.')),
        ('How do the <b>chart of accounts</b> and <b>general ledger accounts</b> work together in FI configuration?',
         g('CoA là danh mục → chọn tài khoản cho company code → bổ sung dữ liệu riêng.',
           'Chart of accounts là danh mục tài khoản dùng chung, còn general ledger là bộ tài khoản thực sự dùng cho một company code. Công ty chọn trong chart of accounts những tài khoản cần thiết, rồi bổ sung dữ liệu riêng của company code như currency, tax category và reconciliation account. Do đó một tài khoản gồm <b>chart of accounts segment</b> dùng chung và <b>company code segment</b> riêng.')),
        ('What are the <b>four key financial statements</b>, and how does <b>net income</b> flow between them?',
         g('Bốn báo cáo → net income từ income statement → retained earnings → cash flow.',
           'Bốn báo cáo gồm <b>balance sheet</b>, <b>income statement</b>, <b>statement of retained earnings</b> và <b>statement of cash flows</b>.',
           'Net income là dòng cuối của income statement. Nó chuyển vào vốn chủ sở hữu trên balance sheet qua retained earnings: retained earnings cuối kỳ bằng số đầu kỳ cộng net income trừ dividends. Trên cash flow statement, net income là dòng đầu để tính dòng tiền từ hoạt động kinh doanh, sau đó điều chỉnh các khoản không dùng tiền như depreciation và amortization.')),
        ('Which G/L accounts are <b>temporary</b> and closed at year end, and which are <b>permanent</b>?',
         g('Tài khoản tạm thời → đóng sổ vào retained earnings → tài khoản thường xuyên.',
           'Tài khoản <b>revenue</b> và <b>expense</b> là tạm thời: chúng chỉ tích lũy trong một năm, cuối năm được kết chuyển vào retained earnings qua period closing. Tài khoản trên balance sheet gồm <b>assets, liabilities và equity</b> là thường xuyên: không bị đóng, số dư được mang sang năm sau.')),
        ('What are the key <b>enterprise structure elements</b> and <b>master data</b> necessary for financial accounting?',
         g('Cơ cấu tổ chức → master data → vai trò của general ledger.',
           'Về cơ cấu tổ chức, FI cần <b>client</b>, <b>company code</b> và <b>chart of accounts</b>. Về master data, quan trọng nhất là <b>general ledger accounts</b>. General ledger là cấu trúc chính của kế toán tài chính ở cấp company code; mọi giao dịch, hay ít nhất tác động tài chính của chúng, đều chảy qua đây nên nó cho cái nhìn tổng thể về hoạt động công ty.')),
    ]),
    ('FI essays – configuration and control (from review file)', [
        ('Describe the purpose of <b>subsidiary ledgers</b>.',
         g('Theo dõi chi tiết → tổng hợp lên control account → quy tắc trong SAP.',
           'Subsidiary ledger theo dõi dữ liệu chi tiết cho từng khách hàng, nhà cung cấp và tài sản. Tổng số của chúng được phản ánh trong các tài khoản kiểm soát trên general ledger, SAP gọi là <b>reconciliation account</b>. Không được ghi trực tiếp vào reconciliation account; nghiệp vụ ghi vào subledger và tài khoản này tự cập nhật.')),
        ('Discuss the relationship among <b>posting key, document type and field status group</b>.',
         g('Mỗi thành phần kiểm soát gì → phải thống nhất → xử lý xung đột.',
           '<b>Document type</b> cho biết bước nghiệp vụ tạo ra chứng từ, loại tài khoản được phép ghi và number range. <b>Posting key</b> quyết định ghi Nợ hay Có, loại tài khoản và trạng thái trường. <b>Field status group</b> gắn với G/L account bị ảnh hưởng cũng quy định trường nào bắt buộc, tùy chọn hay ẩn.',
           'Vì nhiều nguồn cùng chi phối một giao dịch nên chúng phải thống nhất. Nếu không khớp, hệ thống phải xử lý xung đột theo mức ưu tiên và báo lỗi khi một nguồn ẩn trường còn nguồn kia bắt buộc nhập.')),
        ('What is the purpose of <b>field status</b>? Explain the four statuses and how G/L master data differ from transactions.',
         g('Mục đích → bốn trạng thái → khác biệt với giao dịch.',
           'Field status quy định dữ liệu nào cần có khi tạo bản ghi hoặc thực hiện giao dịch, nhằm đảm bảo chất lượng dữ liệu. <b>Required</b> là bắt buộc nhập; <b>Optional</b> là có thể nhập hoặc không; <b>Display</b> chỉ xem, không sửa được; <b>Suppressed</b> là ẩn hoàn toàn. Với giao dịch chỉ có ba trạng thái, không có Display.')),
        ('Explain the differences among <b>field groups, fields and field status</b>, and between <b>field status groups and field status variants</b>.',
         g('Master data: field group → field → status. Giao dịch: field group → field status group → variant → company code.',
           'Với G/L master data, <b>field group</b> là nhóm các trường dùng để định nghĩa tài khoản, ví dụ account control, account management, document entry. Mỗi nhóm gồm nhiều <b>field</b> như currency, tax category, reconciliation account, và mỗi trường phải được gán một <b>field status</b>. Thiết lập này đi theo account group.',
           'Với chứng từ giao dịch, các field group được gom thành <b>field status group</b>, rồi nhiều field status group gom thành <b>field status variant</b>. Variant được gán cho một hoặc nhiều company code để company code đó sử dụng.')),
        ('What is the primary purpose of <b>account groups</b>, and how do account groups for balance sheet accounts and reconciliation accounts differ?',
         g('Gom tài khoản cùng đặc điểm → ví dụ GBI → khác biệt về field status.',
           'Account group gom các tài khoản có đặc điểm giống nhau và kiểm soát number range cũng như field status của chúng. Ví dụ có các nhóm như Balance Sheet Accounts, Fixed Assets, Liquid Assets, Material Accounts, Profit &amp; Loss Accounts và Reconciliation Accounts.',
           'Khác biệt lớn nhất là field status. Ví dụ ở field group account control, nhóm reconciliation accounts có trường bắt buộc, vài trường tùy chọn và phần còn lại bị ẩn, trong khi nhóm balance sheet accounts không có trường bắt buộc ở phần này.')),
        ('What is the importance of <b>posting periods</b> and the <b>fiscal year variant</b>? What does “year dependent” mean?',
         g('Posting period → special period → open period → fiscal year variant → year dependent.',
           'Mỗi bút toán FI thuộc một <b>posting period</b>, thường là 12 kỳ ứng với 12 tháng. Có thêm tối đa 4 <b>special period</b> để tách kỳ cuối cho việc khóa sổ và bút toán điều chỉnh. Chỉ những kỳ đang mở mới cho ghi sổ, đây là một kiểm soát nội bộ.',
           '<b>Fiscal year variant</b> xác định ngày bắt đầu, kết thúc năm tài chính, số kỳ thường, số kỳ đặc biệt và cách hệ thống suy ra kỳ khi ghi sổ. <b>Year dependent</b> nghĩa là phải khai báo việc phân kỳ theo ngày riêng cho từng năm, cần thiết khi cuối kỳ không rơi vào một ngày lịch cố định.')),
        ('What is the purpose of <b>number ranges</b>, and how do they serve as an internal control?',
         g('Number range gắn document type → số duy nhất → kiểm soát và truy vết.',
           'Document number range gắn với từng <b>document type</b>, trong đó document type cho biết bước nghiệp vụ nào tạo ra chứng từ và loại tài khoản được ghi. Mỗi chứng từ nhận một số duy nhất trong khoảng cho phép.',
           'Nhờ vậy chứng từ không trùng số, dễ phân loại và truy vết; khoảng trống hoặc bất thường trong dãy số giúp kiểm toán phát hiện thiếu sót hay gian lận.')),
        ('Explain the purpose of <b>tolerance groups for employees</b>.',
         g('Giới hạn theo người dùng → ví dụ → lợi ích kiểm soát.',
           'Tolerance group cho nhân viên đặt giới hạn trên về số tiền mà một người được phép ghi sổ, ví dụ số tiền tối đa cho một chứng từ, một dòng và mức chênh lệch thanh toán được chấp nhận. Vượt giới hạn thì hệ thống không cho ghi. Đây là cách phân quyền theo cấp bậc, giảm rủi ro sai sót và gian lận.')),
        ('What is <b>automatic account determination</b>, and how can an organization test that financial configuration is correct?',
         g('Cơ chế → thành phần cấu hình → cách kiểm thử và giới hạn.',
           '<b>Automatic account determination</b> là cơ chế giúp hệ thống tự ghi tác động kế toán vào general ledger khi các bước nghiệp vụ được thực hiện. Nó dựa trên các quy tắc cấu hình như document type, account type, posting key và những quy tắc riêng của từng quy trình.',
           'Để kiểm tra cấu hình FI, công ty có thể nhập tay các bút toán vào general ledger rồi xác minh kết quả. Tuy nhiên chưa thể kiểm thử đầy đủ accounts payable và accounts receivable cho đến khi quy trình mua hàng và bán hàng được cấu hình.')),
        ('Why is it usually best <b>not to change the source code</b> of an ERP system?',
         g('Rủi ro khi nâng cấp → chi phí → phương án thay thế.',
           'Sửa mã nguồn gốc (modification) khiến công ty gặp khó khi nâng cấp lên phiên bản SAP mới, vì phần đã sửa có thể bị ghi đè hoặc xung đột với mã của hãng. Việc này còn tốn công lập trình, kiểm thử và bảo trì. Vì vậy nên ưu tiên configuration; nếu vẫn chưa đủ thì dùng enhancement như user exit để bổ sung chức năng mà không đụng vào mã chuẩn.')),
    ]),
]

chapter = {'chapterId': 'ERP2_C8', 'chapterName': 'Essay practice – tự luận (gợi ý tiếng Việt)', 'topics': []}
for ti, (tname, items) in enumerate(TOPICS, 1):
    qs = [{'id': f'ERP2_C8_T{ti}_Q{k}', 'type': 'essay', 'question': q, 'options': {}, 'explanation': a}
          for k, (q, a) in enumerate(items, 1)]
    chapter['topics'].append({'topicId': f'ERP2_C8_T{ti}', 'topicName': tname, 'questions': qs})

with open(OUT + 'ERP2_C8.json', 'w', encoding='utf-8') as f:
    json.dump(chapter, f, ensure_ascii=False, indent=2)

with open(OUT + 'manifest.json', encoding='utf-8-sig') as f:
    m = json.load(f)
entry = {'chapterId': 'ERP2_C8', 'chapterName': chapter['chapterName'], 'topicCount': len(chapter['topics']),
         'questionCount': sum(len(t['questions']) for t in chapter['topics'])}
m['chapters'] = [c for c in m['chapters'] if c['chapterId'] != 'ERP2_C8'] + [entry]
m['chapters'].sort(key=lambda c: int(c['chapterId'].split('_C')[1]))
m['totalQuestions'] = sum(c['questionCount'] for c in m['chapters'])
m['totalTopics'] = sum(c['topicCount'] for c in m['chapters'])
with open(OUT + 'manifest.json', 'w', encoding='utf-8') as f:
    json.dump(m, f, ensure_ascii=False, indent=2)
print(entry['questionCount'], 'essays;', m['totalQuestions'], 'total')
