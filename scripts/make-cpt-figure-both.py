# -*- coding: utf-8 -*-
"""Hình CPT+ kết hợp FSC (x = AB) và SBC (gộp nhánh đơn BE, EF).
Tập huấn luyện: s1=<A,B,C>, s2=<A,B,D>, s3=<E,F>, s4=<B,E>"""
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse, Rectangle, FancyArrowPatch

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img')
GREEN = '#2e9e4f'
INDEX = {'A': '1100', 'B': '1101', 'C': '1000', 'D': '0100', 'E': '0011', 'F': '0010'}


def node(ax, x, y, label, w=0.95, fc='white'):
    ax.add_patch(Ellipse((x, y), w, 0.8, facecolor=fc, edgecolor='#404040', lw=2, zorder=3))
    ax.text(x, y, label, ha='center', va='center', fontsize=17, zorder=4)


def edge(ax, p, q):
    ax.add_patch(FancyArrowPatch(p, q, arrowstyle='-|>', mutation_scale=14, lw=1.6, color=GREEN, shrinkA=17, shrinkB=17, zorder=1))


fig, ax = plt.subplots(figsize=(13, 8.5), dpi=100)
ax.set_xlim(0, 13)
ax.set_ylim(0, 8.5)
ax.axis('off')
ax.text(0.7, 8.1, 'Prediction Tree', fontsize=17, fontweight='bold', va='center')

root, x, be, ef = (3.3, 7.0), (1.2, 4.9), (3.6, 4.9), (5.8, 4.9)
node(ax, *root, 'root', fc='#f0f0f0')
node(ax, *x, 'x', fc='#ffe9a8')
node(ax, *be, 'BE', w=1.4, fc='#d6e8ff')
node(ax, *ef, 'EF', w=1.4, fc='#d6e8ff')
C, D = (0.4, 2.9), (2.1, 2.9)
node(ax, *C, 'C')
node(ax, *D, 'D')
for q in (x, be, ef):
    edge(ax, root, q)
edge(ax, x, C)
edge(ax, x, D)
ax.text(0.1, 6.35, '(A,B → x)', fontsize=13, color='#9a6a00', va='center')
ax.text(3.0, 4.15, '(B,E → BE)', fontsize=12, color='#2a5fa0', va='center')
ax.text(5.1, 4.15, '(E,F → EF)', fontsize=12, color='#2a5fa0', va='center')
ax.text(1.0, 1.6, 'x = AB', fontsize=17, fontweight='bold', color='#9a6a00', va='center')

ax.text(7.4, 8.1, 'Inverted Index', fontsize=17, fontweight='bold', va='center')
x0, y0, cw, ch = 8.1, 7.1, 1.0, 0.72
for j, h in enumerate(['s1', 's2', 's3', 's4']):
    ax.add_patch(Rectangle((x0 + j * cw, y0), cw, ch, facecolor='#7f7f7f', edgecolor='#c0c0c0', lw=1.5))
    ax.text(x0 + j * cw + cw / 2, y0 + ch / 2, h, ha='center', va='center', color='white', fontsize=16)
for i, (item, bits) in enumerate(INDEX.items()):
    y = y0 - (i + 1) * ch
    ax.text(x0 - 0.45, y + ch / 2, item, ha='center', va='center', fontsize=16, fontweight='bold')
    for j, b in enumerate(bits):
        ax.add_patch(Rectangle((x0 + j * cw, y), cw, ch, facecolor='#e8edf7' if i % 2 == 0 else 'white', edgecolor='#c0c0c0', lw=1.5))
        ax.text(x0 + j * cw + cw / 2, y + ch / 2, b, ha='center', va='center', fontsize=16)

ax.text(7.4, 1.55, 'Lookup Table', fontsize=17, fontweight='bold', va='center')
for j, h in enumerate(['s1', 's2', 's3', 's4']):
    ax.add_patch(Rectangle((x0 + j * cw, 0.35), cw, 0.75, facecolor='#2c9f4b', edgecolor='white', lw=2))
    ax.text(x0 + j * cw + cw / 2, 0.72, h, ha='center', va='center', color='white', fontsize=16)

fig.savefig(os.path.join(OUT, 'cpt_plus_both.png'), facecolor='white', bbox_inches='tight')
print('ok')
