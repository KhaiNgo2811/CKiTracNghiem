# Vẽ sơ đồ quy trình cho tài liệu lý thuyết ERP2 -> scripts/erp2-figs/*.png
import os, textwrap
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'erp2-figs')
os.makedirs(OUT, exist_ok=True)
BLUE, GREEN, YELLOW, GREY, RED = '#DCEAFB', '#DDF2E0', '#FFF0C9', '#EEF0F4', '#FBE0E0'


def canvas(w, h):
    fig = plt.figure(figsize=(w / 10, h / 10), dpi=200)
    ax = fig.add_axes([0, 0, 1, 1]); ax.set_xlim(0, w); ax.set_ylim(0, h); ax.axis('off')
    return fig, ax


def box(ax, x, y, w, h, text, color=BLUE, size=9, bold=False):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle='round,pad=0,rounding_size=0.9', fc=color, ec='#3B5B85', lw=1))
    ax.text(x + w / 2, y + h / 2, text, ha='center', va='center', fontsize=size, fontweight='bold' if bold else 'normal', linespacing=1.3)


def arrow(ax, a, b):
    ax.annotate('', xy=b, xytext=a, arrowprops=dict(arrowstyle='-|>', color='#3B5B85', lw=1.2, shrinkA=0, shrinkB=0))


def save(fig, name):
    fig.savefig(os.path.join(OUT, name + '.png'), dpi=200); plt.close(fig)


def flow(name, steps, per_row=3, notes=None):
    """Chuỗi bước đánh số, xuống hàng; notes = dòng bút toán dưới mỗi bước."""
    rows = (len(steps) + per_row - 1) // per_row
    bw, bh, gx, gy, nh = 20, 9, 4, 6, 6 if notes else 0
    W = per_row * bw + (per_row - 1) * gx + 2
    H = rows * (bh + nh) + (rows - 1) * gy + 2
    fig, ax = canvas(W, H)
    for i, s in enumerate(steps):
        r, c = divmod(i, per_row)
        x, y = 1 + c * (bw + gx), H - 1 - bh - r * (bh + nh + gy)
        n = notes[i] if notes else None
        box(ax, x, y, bw, bh, f'{i + 1}. {s}', GREEN if n else BLUE, bold=True)
        if n:
            ax.text(x + bw / 2, y - 0.8, n, ha='center', va='top', fontsize=7.5, color='#8A5A00', linespacing=1.3)
        if i + 1 < len(steps):
            if c + 1 < per_row:
                arrow(ax, (x + bw, y + bh / 2), (x + bw + gx, y + bh / 2))
            else:  # bẻ góc xuống đầu hàng kế tiếp
                mid = y - nh - gy / 2
                ax.plot([x + bw / 2, x + bw / 2] if not n else [x + bw, x + bw + 0.7], [y, mid] if not n else [y + bh / 2, y + bh / 2], color='#3B5B85', lw=1.2)
                if n:
                    ax.plot([x + bw + 0.7, x + bw + 0.7], [y + bh / 2, mid], color='#3B5B85', lw=1.2)
                    ax.plot([x + bw + 0.7, 1 + bw / 2], [mid, mid], color='#3B5B85', lw=1.2)
                else:
                    ax.plot([x + bw / 2, 1 + bw / 2], [mid, mid], color='#3B5B85', lw=1.2)
                arrow(ax, (1 + bw / 2, mid), (1 + bw / 2, y - nh - gy))
    save(fig, name)


def tree(name, levels, links, W, H, bw=18, bh=8):
    """levels: {id: (cx, cy, text, color)}; links: [(cha, con)]"""
    fig, ax = canvas(W, H)
    for a, b in links:
        x1, y1 = levels[a][:2]; x2, y2 = levels[b][:2]
        m = (y1 - bh / 2 + y2 + bh / 2) / 2
        ax.plot([x1, x1, x2, x2], [y1 - bh / 2, m, m, y2 + bh / 2], color='#3B5B85', lw=1)
    for cx, cy, t, col in levels.values():
        box(ax, cx - bw / 2, cy - bh / 2, bw, bh, t, col)
    save(fig, name)


# 1. Bức tranh tích hợp
fig, ax = canvas(80, 46)
box(ax, 28, 18, 24, 10, 'One shared\nERP database', YELLOW, 10, True)
for (x, y, t) in [(2, 34, 'MM\nProcurement'), (30, 34, 'SD\nFulfillment'), (58, 34, 'PS\nProjects'),
                  (2, 2, 'FI\nExternal reporting'), (30, 2, 'CO\nInternal control'), (58, 2, 'EAM\nMaintenance')]:
    box(ax, x, y, 20, 9, t, GREEN if y < 10 else BLUE, bold=True)
    arrow(ax, (x + 10, y if y > 10 else y + 9), (40 + (x - 30) * 0.3, 28 if y > 10 else 18))
save(fig, 'integration')

flow('asap', ['Project\npreparation', 'Business\nblueprint', 'Realization\n(configure)', 'Final\npreparation', 'Go-live', 'Operation'])
flow('data', ['Enterprise\nstructure', 'Business rules\n& parameters', 'Master\ndata', 'Transaction\ndata'], per_row=4)

# 3. Subledger -> reconciliation account
tree('subledger', {
    'g': (40, 40, 'General ledger', YELLOW),
    'ap': (22, 24, 'Reconciliation\naccount: Payables', BLUE),
    'ar': (58, 24, 'Reconciliation\naccount: Receivables', BLUE),
    'v1': (11, 6, 'Vendor A', GREY), 'v2': (31, 6, 'Vendor B', GREY),
    'c1': (49, 6, 'Customer X', GREY), 'c2': (69, 6, 'Customer Y', GREY),
}, [('g', 'ap'), ('g', 'ar'), ('ap', 'v1'), ('ap', 'v2'), ('ar', 'c1'), ('ar', 'c2')], 80, 46)

# 4. Phân bổ chi phí CO
fig, ax = canvas(80, 40)
box(ax, 1, 15, 18, 10, 'FI expense\n(salary, supplies)', GREY)
box(ax, 29, 15, 20, 10, 'Sender\ncost center', YELLOW, bold=True)
for y, t in [(29, 'Receiver:\ncost center'), (15, 'Receiver:\ncost center'), (1, 'Internal order\n→ settlement')]:
    box(ax, 61, y, 18, 10, t, GREEN)
    arrow(ax, (49, 20), (61, y + 5))
arrow(ax, (19, 20), (29, 20))
ax.text(24, 22, 'primary\ncost', ha='center', va='bottom', fontsize=7.5)
ax.text(39, 12, 'Distribution / Assessment /\nActivity allocation', ha='center', va='top', fontsize=8, color='#8A5A00')
save(fig, 'allocation')

flow('p2p', ['Purchase\nrequisition', 'Source\ndetermination', 'Purchase\norder', 'Goods\nreceipt', 'Invoice\nverification', 'Vendor\npayment'],
     notes=['', '', '', 'Dr Inventory\nCr GR/IR', 'Dr GR/IR\nCr Vendor', 'Dr Vendor\nCr Bank'])

# 6. Three-way match
fig, ax = canvas(70, 34)
box(ax, 24, 23, 22, 9, 'Purchase order\n(what we ordered)', BLUE)
box(ax, 1, 2, 22, 9, 'Goods receipt\n(what arrived)', GREEN)
box(ax, 47, 2, 22, 9, 'Vendor invoice\n(what we are billed)', YELLOW)
for a, b in [((28, 23), (14, 11)), ((42, 23), (56, 11)), ((23, 6.5), (47, 6.5))]:
    ax.annotate('', xy=b, xytext=a, arrowprops=dict(arrowstyle='<|-|>', color='#3B5B85', lw=1.2))
ax.text(35, 14, 'All three must agree\n(within tolerance)\nbefore payment', ha='center', va='center', fontsize=8.5, fontweight='bold')
save(fig, 'threeway')

flow('o2c', ['Inquiry &\nquotation', 'Sales\norder', 'Delivery,\npick & pack', 'Goods\nissue', 'Billing', 'Customer\npayment'],
     notes=['', '', '', 'Dr COGS\nCr Inventory', 'Dr Receivable\nCr Revenue', 'Dr Bank\nCr Receivable'])

# 8. Cơ cấu bán hàng
tree('salesarea', {
    'cc': (40, 40, 'Company code', YELLOW),
    'so': (40, 28, 'Sales organisation', BLUE),
    'dc': (27, 16, 'Distribution\nchannel', BLUE), 'dv': (53, 16, 'Division', BLUE),
    'sa': (40, 4, 'Sales area', GREEN),
}, [('cc', 'so'), ('so', 'dc'), ('so', 'dv'), ('dc', 'sa'), ('dv', 'sa')], 80, 46, bw=22, bh=7)

flow('pricing', ['Pricing\nprocedure', 'Condition\ntype', 'Access\nsequence', 'Condition\nrecord'], per_row=4)

# 10. WBS + network
tree('wbs', {
    'p': (40, 40, 'Project definition', YELLOW),
    'a': (14, 25, 'WBS: Design', BLUE), 'b': (40, 25, 'WBS: Build', BLUE), 'c': (66, 25, 'WBS: Handover', BLUE),
    'b1': (27, 9, 'Activity:\nbuy material', GREEN), 'b2': (53, 9, 'Activity:\nassemble', GREEN),
}, [('p', 'a'), ('p', 'b'), ('p', 'c'), ('b', 'b1'), ('b', 'b2')], 80, 46, bw=20)

flow('eam', ['Notification', 'Planning\n(order)', 'Control\n(release)', 'Execution', 'Completion\n(TECO)', 'Settlement'])
print('figures written to', OUT, len(os.listdir(OUT)))
