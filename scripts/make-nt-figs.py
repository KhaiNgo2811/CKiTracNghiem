# -*- coding: utf-8 -*-
"""Vẽ các hình minh họa cho tài liệu lý thuyết Nền tảng -> scripts/nt-figs/*.png"""
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Rectangle, Circle, FancyArrowPatch

OUT = os.path.join(os.path.dirname(__file__), 'nt-figs')
os.makedirs(OUT, exist_ok=True)
plt.rcParams['font.family'] = 'DejaVu Sans'
NAVY, BLUE, GREEN, ORANGE, RED, GREY = '#1F3A5F', '#3B82F6', '#3E9B4F', '#E0A800', '#D64545', '#6B7280'


def box(ax, x, y, w, h, text, fc='#E8F3FF', ec=NAVY, fs=10, bold=False, color='black', r=0.08):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle=f'round,pad=0.02,rounding_size={r}', fc=fc, ec=ec, lw=1.4))
    ax.text(x + w / 2, y + h / 2, text, ha='center', va='center', fontsize=fs, fontweight='bold' if bold else 'normal', color=color)


def arrow(ax, p, q, color=NAVY, style='-|>', lw=1.6, ls='-'):
    ax.add_patch(FancyArrowPatch(p, q, arrowstyle=style, mutation_scale=14, color=color, lw=lw, linestyle=ls))


def canvas(w, h, xl, yl):
    fig, ax = plt.subplots(figsize=(w, h))
    ax.set_xlim(0, xl); ax.set_ylim(0, yl); ax.axis('off')
    return fig, ax


def save(fig, name):
    fig.savefig(os.path.join(OUT, name), dpi=170, bbox_inches='tight', facecolor='white')
    plt.close(fig)


# 1 ---------------------------------------------------------------- OSI
def osi():
    fig, ax = canvas(10, 6.4, 20, 13.4)
    ax.set_ylim(1.2, 14)
    layers = [
        (7, 'Application', 'Giao diện cho ứng dụng', 'Data', 'HTTP, DNS, FTP, SMTP', '—', '#F8C9C9'),
        (6, 'Presentation', 'Mã hóa/giải mã, nén, định dạng', 'Data', 'SSL/TLS, JPEG', '—', '#F9D9B5'),
        (5, 'Session', 'Thiết lập – duy trì – kết thúc phiên', 'Data', 'NetBIOS, RPC', '—', '#FBEBA6'),
        (4, 'Transport', 'Tin cậy, cổng (port), thứ tự', 'Segment', 'TCP, UDP', 'Host (end system)', '#CDEBC0'),
        (3, 'Network', 'Định tuyến, địa chỉ IP', 'Packet', 'IP, ICMP, RIP', 'Router', '#BFE3EE'),
        (2, 'Data Link', 'Địa chỉ MAC, frame, kiểm lỗi', 'Frame', 'Ethernet, ARP', 'Switch, Bridge', '#C5D2F4'),
        (1, 'Physical', 'Truyền bit thô qua môi trường', 'Bit', 'Cáp, sóng, RJ45', 'Hub, Repeater', '#DCCBF0'),
    ]
    heads = [(0.4, 'Tầng'), (4.9, 'Chức năng'), (10.9, 'PDU'), (13.0, 'Giao thức'), (16.6, 'Thiết bị')]
    for x, t in heads:
        ax.text(x, 12.6, t, fontsize=10, fontweight='bold', color=NAVY)
    top = 12.2
    for i, (n, name, fn, pdu, proto, dev, col) in enumerate(layers):
        y = top - (i + 1) * 1.5
        ax.add_patch(FancyBboxPatch((0.2, y), 19.6, 1.3, boxstyle='round,pad=0.02,rounding_size=0.12', fc=col, ec='#555', lw=1))
        ax.text(0.7, y + 0.65, str(n), fontsize=15, fontweight='bold', va='center', color=NAVY)
        ax.text(1.5, y + 0.65, name, fontsize=11, fontweight='bold', va='center')
        ax.text(4.9, y + 0.65, fn, fontsize=8.3, va='center')
        ax.text(10.9, y + 0.65, pdu, fontsize=9.5, va='center', fontweight='bold')
        ax.text(13.0, y + 0.65, proto, fontsize=8, va='center')
        ax.text(16.6, y + 0.65, dev, fontsize=8, va='center')
    # TCP/IP bracket
    ax.text(10, 13.7, 'MÔ HÌNH OSI (7 tầng)', ha='center', fontsize=12, fontweight='bold', color=NAVY)
    save(fig, 'osi.png')


# 2 ---------------------------------------------------------------- Encapsulation
def encap():
    fig, ax = canvas(11, 5.2, 22, 10.4)
    ax.set_ylim(-0.4, 10.4)
    ax.text(11, 9.9, 'Đóng gói dữ liệu (Encapsulation) – đi xuống các tầng', ha='center', fontsize=12, fontweight='bold', color=NAVY)
    rows = [
        ('Application', 'DATA', None, None, 'Data'),
        ('Transport', 'DATA', 'TCP/UDP header\n(port, seq)', None, 'Segment'),
        ('Network', 'DATA', 'TCP/UDP header', 'IP header\n(IP nguồn/đích)', 'Packet'),
        ('Data Link', 'DATA', 'TCP/UDP header', 'IP header', 'Frame'),
    ]
    y = 8.0
    for i, (lay, d, h1, h2, pdu) in enumerate(rows):
        x = 4.2
        ax.text(0.3, y + 0.6, lay, fontsize=10, fontweight='bold', va='center')
        if i == 3:
            box(ax, x, y, 2.4, 1.2, 'MAC header', '#C5D2F4', fs=8); x += 2.4
        if i >= 2:
            box(ax, x, y, 2.8, 1.2, 'IP header', '#BFE3EE', fs=8)
            x += 2.8
        if i >= 1:
            box(ax, x, y, 3.0, 1.2, 'TCP/UDP header', '#CDEBC0', fs=8); x += 3.0
        box(ax, x, y, 4.0, 1.2, 'DATA', '#F8C9C9', fs=10, bold=True); x += 4.0
        if i == 3:
            box(ax, x, y, 1.8, 1.2, 'FCS', '#C5D2F4', fs=8); x += 1.8
        ax.text(18.6, y + 0.6, f'PDU: {pdu}', fontsize=10, va='center', fontweight='bold', color=RED)
        y -= 1.9
    box(ax, 4.2, 0.0, 12.0, 1.0, 'Physical: chuỗi BIT 0101… truyền qua cáp / sóng', '#DCCBF0', fs=10, bold=True)
    arrow(ax, (2.2, 9.4), (2.2, 1.0), RED)
    save(fig, 'encapsulation.png')


# 3 ---------------------------------------------------------------- Topology
def topo():
    fig, axs = plt.subplots(1, 5, figsize=(13, 3.0))
    names = ['Bus', 'Star', 'Ring', 'Mesh', 'Tree']
    import math
    for ax, nm in zip(axs, names):
        ax.set_xlim(-1.5, 1.5); ax.set_ylim(-1.5, 1.5); ax.axis('off'); ax.set_aspect('equal')
        ax.set_title(nm, fontsize=12, fontweight='bold', color=NAVY)
        def node(x, y, c=BLUE, r=0.17):
            ax.add_patch(Circle((x, y), r, fc=c, ec='white', lw=1.5, zorder=3))
        if nm == 'Bus':
            ax.plot([-1.3, 1.3], [0, 0], color=NAVY, lw=3)
            for x in (-0.9, -0.3, 0.3, 0.9):
                ax.plot([x, x], [0, 0.6], color=GREY, lw=1.5); node(x, 0.6)
            for x in (-0.6, 0.6):
                ax.plot([x, x], [0, -0.6], color=GREY, lw=1.5); node(x, -0.6)
            ax.text(-1.4, -0.3, 'terminator', fontsize=7, color=RED); ax.text(0.7, -1.0, 'dây chính', fontsize=7)
        if nm == 'Star':
            node(0, 0, ORANGE, 0.28); ax.text(0, 0, 'Hub/\nSwitch', ha='center', va='center', fontsize=6, zorder=4)
            for k in range(6):
                a = k * math.pi / 3; x, y = 1.1 * math.cos(a), 1.1 * math.sin(a)
                ax.plot([0, x], [0, y], color=GREY, lw=1.5); node(x, y)
        if nm == 'Ring':
            ax.add_patch(Circle((0, 0), 1.0, fill=False, ec=NAVY, lw=2.5))
            for k in range(6):
                a = k * math.pi / 3 + 0.5; node(math.cos(a), math.sin(a))
        if nm == 'Mesh':
            pts = [(math.cos(k * 2 * math.pi / 5 + 1.57), math.sin(k * 2 * math.pi / 5 + 1.57)) for k in range(5)]
            for i in range(5):
                for j in range(i + 1, 5):
                    ax.plot([pts[i][0], pts[j][0]], [pts[i][1], pts[j][1]], color=GREY, lw=1)
            for p in pts: node(*p)
        if nm == 'Tree':
            node(0, 1.1, ORANGE)
            for x in (-0.8, 0.8):
                ax.plot([0, x], [1.1, 0.2], color=GREY, lw=1.5); node(x, 0.2, GREEN)
                for dx in (-0.4, 0.4):
                    ax.plot([x, x + dx], [0.2, -0.9], color=GREY, lw=1.5); node(x + dx, -0.9)
    save(fig, 'topology.png')


# 4 ---------------------------------------------------------------- Hub vs Switch
def hubsw():
    fig, axs = plt.subplots(1, 2, figsize=(11, 3.8))
    for ax, ttl in zip(axs, ['HUB (tầng 1): sao chép ra MỌI cổng', 'SWITCH (tầng 2): chỉ gửi đúng cổng đích (theo MAC)']):
        ax.set_xlim(0, 10); ax.set_ylim(0, 7); ax.axis('off')
        ax.set_title(ttl, fontsize=10.5, fontweight='bold', color=NAVY)
    pcs = [(1.2, 5.5, 'A'), (1.2, 1.5, 'B'), (8.8, 5.5, 'C'), (8.8, 1.5, 'D')]
    for ax, hub in ((axs[0], True), (axs[1], False)):
        box(ax, 3.6, 2.9, 2.8, 1.2, 'HUB' if hub else 'SWITCH', ORANGE if hub else GREEN, fs=11, bold=True, color='white')
        for x, y, n in pcs:
            box(ax, x - 0.7, y - 0.5, 1.4, 1.0, f'PC {n}', '#E8F3FF', fs=9)
            ax.plot([x + (0.7 if x < 5 else -0.7), 4.5 if x < 5 else 5.5], [y, 3.5], color=GREY, lw=1.2, zorder=0)
        arrow(axs[0] if hub else axs[1], (1.9, 5.3), (3.7, 3.9), RED, lw=2)
    for x, y in ((1.9, 1.7), (8.1, 5.3), (8.1, 1.7)):
        arrow(axs[0], (6.3 if x > 5 else 3.7, 3.4), (x, y), RED, lw=1.6)
    arrow(axs[1], (6.3, 3.7), (8.1, 5.3), GREEN, lw=2.2)
    axs[0].text(5, 0.3, 'Cả hệ thống = 1 collision domain', ha='center', fontsize=9, color=RED, fontweight='bold')
    axs[1].text(5, 0.3, 'Mỗi cổng = 1 collision domain', ha='center', fontsize=9, color=GREEN, fontweight='bold')
    axs[1].text(7.0, 6.4, 'A → C', fontsize=8, color=GREEN)
    save(fig, 'hub_switch.png')


# 5 ---------------------------------------------------------------- TCP handshake
def handshake():
    fig, ax = canvas(9, 5.6, 18, 11.2)
    ax.text(3, 10.6, 'CLIENT', ha='center', fontsize=12, fontweight='bold', color=NAVY)
    ax.text(15, 10.6, 'SERVER', ha='center', fontsize=12, fontweight='bold', color=NAVY)
    ax.plot([3, 3], [0.3, 10.2], color=GREY, lw=2); ax.plot([15, 15], [0.3, 10.2], color=GREY, lw=2)
    steps = [(9.2, 'SYN', 'seq = x', 3, 15, BLUE), (7.7, 'SYN + ACK', 'seq = y, ack = x+1', 15, 3, GREEN), (6.2, 'ACK', 'ack = y+1', 3, 15, BLUE)]
    for y, t, s, a, b, c in steps:
        arrow(ax, (a, y), (b, y - 0.9), c, lw=2.2)
        ax.text(9, y - 0.3, t, ha='center', fontsize=11, fontweight='bold', color=c, bbox=dict(fc='white', ec='none', pad=1))
        ax.text(9, y - 0.95, s, ha='center', fontsize=8, color=GREY)
    ax.text(9, 4.5, '— Kết nối được thiết lập, truyền dữ liệu (full duplex) —', ha='center', fontsize=9, style='italic')
    for y, t, a, b in [(3.6, 'FIN', 3, 15), (2.1, 'ACK (+ FIN)', 15, 3)]:
        arrow(ax, (a, y), (b, y - 0.9), RED, lw=2)
        ax.text(9, y - 0.35, t, ha='center', fontsize=10, fontweight='bold', color=RED, bbox=dict(fc='white', ec='none', pad=1))
    ax.text(9, 0.2, 'Đóng kết nối: cờ FIN   |   Cổng đóng/từ chối: server trả cờ RST', ha='center', fontsize=8.5)
    save(fig, 'handshake.png')


# 6 ---------------------------------------------------------------- Client/Server vs P2P
def cs_p2p():
    fig, axs = plt.subplots(1, 2, figsize=(10, 3.6))
    for ax in axs:
        ax.set_xlim(0, 10); ax.set_ylim(0, 7); ax.axis('off')
    axs[0].set_title('Client/Server (tập trung)', fontsize=11, fontweight='bold', color=NAVY)
    box(axs[0], 3.6, 2.8, 2.8, 1.4, 'SERVER', ORANGE, fs=11, bold=True, color='white')
    for x, y in [(0.8, 5.6), (0.8, 0.8), (8.2, 5.6), (8.2, 0.8), (4.6, 5.8)]:
        box(axs[0], x, y, 1.6, 0.9, 'Client', '#E8F3FF', fs=9)
        arrow(axs[0], (x + 0.8, y + (0 if y > 3 else 0.9)), (5 if abs(x - 4.6) < 1 else (4.4 if x < 4 else 5.6), 4.2 if y > 3 else 2.8), GREY, '<|-|>', 1.3)
    axs[1].set_title('Peer-to-Peer (ngang hàng)', fontsize=11, fontweight='bold', color=NAVY)
    pts = [(2, 5.5), (8, 5.5), (1.5, 1.5), (8.5, 1.5), (5, 3.5)]
    for i in range(5):
        for j in range(i + 1, 5):
            axs[1].plot([pts[i][0], pts[j][0]], [pts[i][1], pts[j][1]], color=GREY, lw=1, zorder=0)
    for x, y in pts:
        box(axs[1], x - 0.8, y - 0.45, 1.6, 0.9, 'Peer', '#DDF1DD', fs=9)
    axs[1].text(5, 0.1, 'Mỗi máy vừa là client vừa là server (≈ 10–20 máy)', ha='center', fontsize=8.5)
    save(fig, 'cs_p2p.png')


# 7 ---------------------------------------------------------------- Firewall / DMZ
def fw():
    fig, ax = canvas(11, 4.4, 22, 8.8)
    box(ax, 0.2, 3.3, 3.0, 2.2, 'INTERNET', '#EEE', fs=11, bold=True)
    box(ax, 4.2, 3.5, 3.0, 1.8, 'Router lọc\ngói (ngoài)', '#F9D9B5', fs=9)
    ax.add_patch(Rectangle((8.2, 0.8), 6.4, 7.0, fc='#FFF6DD', ec=ORANGE, lw=2, ls='--'))
    ax.text(11.4, 7.3, 'DMZ', ha='center', fontsize=12, fontweight='bold', color=ORANGE)
    box(ax, 8.7, 4.4, 2.6, 1.7, 'Bastion host\n(proxy)', '#FBC4C4', fs=9, bold=True)
    box(ax, 11.7, 4.4, 2.6, 1.7, 'Web / Mail\nserver', '#E8F3FF', fs=9)
    box(ax, 8.7, 1.3, 5.6, 1.6, 'Dual-homed: 2 card mạng', '#FFFFFF', fs=8.5)
    box(ax, 15.6, 3.5, 3.0, 1.8, 'Router lọc\ngói (trong)', '#F9D9B5', fs=9)
    box(ax, 19.2, 3.3, 2.6, 2.2, 'Mạng\nnội bộ', '#CDEBC0', fs=10, bold=True)
    for a, b in [((3.2, 4.4), (4.2, 4.4)), ((7.2, 4.4), (8.2, 4.4)), ((14.6, 4.4), (15.6, 4.4)), ((18.6, 4.4), (19.2, 4.4))]:
        arrow(ax, a, b, NAVY, '<|-|>')
    ax.text(11, 0.2, 'Screened-Subnet Firewall: tách vùng công cộng (DMZ) khỏi mạng nội bộ', ha='center', fontsize=9.5, fontweight='bold', color=NAVY)
    save(fig, 'firewall_dmz.png')


# 8 ---------------------------------------------------------------- IP classes + subnet blocks
def ipfig():
    fig, axs = plt.subplots(2, 1, figsize=(10.5, 5.8), gridspec_kw={'height_ratios': [1.2, 1]})
    ax = axs[0]; ax.set_xlim(0, 32.6); ax.set_ylim(0, 9); ax.axis('off')
    ax.set_title('Địa chỉ IPv4 (32 bit = 4 octet) – lớp A, B, C', fontsize=11, fontweight='bold', color=NAVY)
    cls = [('A', 0, 8, 'NetID (8 bit)', 'HostID (24 bit)', '0 – 127', '255.0.0.0 (/8)', 6.6),
           ('B', 0, 16, 'NetID (16 bit)', 'HostID (16 bit)', '128 – 191', '255.255.0.0 (/16)', 3.7),
           ('C', 0, 24, 'NetID (24 bit)', 'HostID (8 bit)', '192 – 223', '255.255.255.0 (/24)', 0.8)]
    for c, _, n, t1, t2, rng, mask, y in cls:
        ax.text(0, y + 0.8, f'Lớp {c}', fontsize=10, fontweight='bold', va='center')
        ax.add_patch(Rectangle((3.4, y), n * 0.55, 1.6, fc='#BFE3EE', ec=NAVY))
        ax.text(3.4 + n * 0.275, y + 0.8, t1, ha='center', va='center', fontsize=8.5)
        ax.add_patch(Rectangle((3.4 + n * 0.55, y), (32 - n) * 0.55, 1.6, fc='#CDEBC0', ec=NAVY))
        ax.text(3.4 + n * 0.55 + (32 - n) * 0.275, y + 0.8, t2, ha='center', va='center', fontsize=8.5)
        ax.text(21.5, y + 0.8, f'octet đầu {rng}', fontsize=8.5, va='center')
        ax.text(21.5, y + 0.0, mask, fontsize=8, va='center', color=GREY)
    ax2 = axs[1]; ax2.set_xlim(-8, 262); ax2.set_ylim(-3.4, 3.6); ax2.axis('off')
    ax2.set_title('Ví dụ: mask 255.255.192.0 (/18) – octet 3 chia thành các khối 64', fontsize=11, fontweight='bold', color=NAVY)
    cols = ['#F3F4F6', '#FFE9A8', '#F3F4F6', '#F3F4F6']
    for k in range(4):
        ax2.add_patch(Rectangle((k * 64, 0), 64, 2, fc=cols[k], ec=NAVY, lw=1.5))
        ax2.text(k * 64 + 32, 1.0, f'{k * 64} – {k * 64 + 63}', ha='center', va='center', fontsize=9, fontweight='bold' if k == 1 else 'normal')
    for v, c in ((73, RED), (97, GREEN)):
        ax2.plot([v, v], [2, 2.7], color=c, lw=2)
        ax2.text(v, 3.0, f'{v}', ha='center', fontsize=9, color=c, fontweight='bold')
    ax2.text(64, -0.7, '133.69.64.0 (NetID)', ha='center', fontsize=8.5, color=NAVY)
    ax2.text(128, -0.7, '133.69.127.255 (Broadcast)', ha='center', fontsize=8.5, color=NAVY)
    ax2.text(130, -2.3, '73 và 97 cùng khối 64–127 ⇒ CÙNG mạng; bước nhảy = 256 − 192 = 64', ha='center', fontsize=9, color=RED, fontweight='bold')
    save(fig, 'ip_subnet.png')


# 9 ---------------------------------------------------------------- Cloud stack
def cloud():
    fig, ax = canvas(10, 4.8, 20, 9.6)
    ax.text(10, 9.1, 'Ai quản lý gì? (xanh = nhà cung cấp, cam = khách hàng)', ha='center', fontsize=11, fontweight='bold', color=NAVY)
    layers = ['Ứng dụng (Applications)', 'Dữ liệu (Data)', 'Runtime / Middleware', 'Hệ điều hành (OS)', 'Ảo hóa – Server – Storage – Network']
    models = [('On-premise', 5), ('IaaS', 4), ('PaaS', 2), ('SaaS', 0)]  # số tầng trên cùng do KHÁCH quản lý
    for j, (m, cust) in enumerate(models):
        x = 0.4 + j * 4.9
        ax.text(x + 2.1, 8.0, m, ha='center', fontsize=11, fontweight='bold')
        for i, l in enumerate(layers):
            y = 6.6 - i * 1.25
            mine = i < cust if m != 'On-premise' else True
            ax.add_patch(Rectangle((x, y), 4.3, 1.1, fc='#FFD8A8' if mine else '#BFE3C8', ec='#555'))
            if j == 0:
                pass
            ax.text(x + 2.15, y + 0.55, l, ha='center', va='center', fontsize=6.3)
    ax.text(10, 0.1, 'IaaS: máy chủ ảo (AWS EC2)  |  PaaS: nền tảng chạy ứng dụng  |  SaaS: phần mềm dùng ngay (Google Docs, M365)', ha='center', fontsize=8.5)
    save(fig, 'cloud_stack.png')


# 10 --------------------------------------------------------------- Internet structure
def internet():
    fig, ax = canvas(10.5, 4.4, 21, 8.8)
    ax.add_patch(Rectangle((0.2, 0.8), 6.0, 7.2, fc='#E8F3FF', ec=BLUE, lw=1.5, ls='--'))
    ax.text(3.2, 7.5, 'Network edge', ha='center', fontsize=10, fontweight='bold', color=BLUE)
    for x, y, t in [(0.8, 5.4, 'PC'), (3.4, 5.4, 'Laptop'), (0.8, 2.6, 'Điện thoại'), (3.4, 2.6, 'Server')]:
        box(ax, x, y, 2.3, 1.2, t, 'white', fs=8.5)
    ax.add_patch(Rectangle((6.8, 0.8), 3.6, 7.2, fc='#FFF6DD', ec=ORANGE, lw=1.5, ls='--'))
    ax.text(8.6, 7.5, 'Access network', ha='center', fontsize=10, fontweight='bold', color=ORANGE)
    for y, t in [(5.6, 'Wi-Fi / Ethernet'), (3.6, 'FTTH / DSL / cáp'), (1.6, '5G / vệ tinh')]:
        box(ax, 7.1, y, 3.0, 1.2, t, 'white', fs=8)
    ax.add_patch(Rectangle((11.0, 0.8), 9.8, 7.2, fc='#EEF8EE', ec=GREEN, lw=1.5, ls='--'))
    ax.text(15.9, 7.5, 'Network core (ISP đa cấp)', ha='center', fontsize=10, fontweight='bold', color=GREEN)
    import random
    random.seed(3)
    pts = [(12.5, 6.0), (15.0, 6.2), (18.0, 6.0), (13.5, 3.6), (16.5, 3.8), (19.2, 3.4), (12.8, 1.6), (16.0, 1.8), (18.8, 1.6)]
    for i, p in enumerate(pts):
        for q in pts[i + 1:]:
            if abs(p[0] - q[0]) + abs(p[1] - q[1]) < 6.8:
                ax.plot([p[0], q[0]], [p[1], q[1]], color=GREY, lw=1, zorder=0)
    for x, y in pts:
        ax.add_patch(Circle((x, y), 0.45, fc=GREEN, ec='white', zorder=3))
    ax.text(15.9, 0.1, 'Router / packet switch nối các ISP (IXP, peering)', ha='center', fontsize=8.5)
    for a, b in [((6.2, 4.4), (6.8, 4.4)), ((10.4, 4.4), (11.0, 4.4))]:
        arrow(ax, a, b, NAVY, '<|-|>')
    save(fig, 'internet_structure.png')


if __name__ == '__main__':
    for f in (osi, encap, topo, hubsw, handshake, cs_p2p, fw, ipfig, cloud, internet):
        f()
    print('ok', sorted(os.listdir(OUT)))
