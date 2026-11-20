# -*- coding: utf-8 -*-
"""Vẽ hình CPT+ minh họa (Prediction Tree + Inverted Index + Lookup Table), cùng phong cách assets/img/cpt_plus_fsc.png.
 - cpt_plus_sbc.png : nhánh đơn A→B→C đã được gộp thành một nút "ABC" (SBC)
 - cpt_plus_none.png: cùng dữ liệu nhưng chưa nén gì
Tập huấn luyện: s1=<A,B,C>, s2=<D,E>, s3=<D,B>, s4=<F>"""
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse, Rectangle, FancyArrowPatch

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img')
GREEN = '#2e9e4f'
INDEX = {'A': '1000', 'B': '1010', 'C': '1000', 'D': '0110', 'E': '0100', 'F': '0001'}


def node(ax, x, y, label, w=0.95, h=0.8, fc='white'):
    ax.add_patch(Ellipse((x, y), w, h, facecolor=fc, edgecolor='#404040', lw=2, zorder=3))
    ax.text(x, y, label, ha='center', va='center', fontsize=17, zorder=4)


def edge(ax, p, q, w1=0.95, h1=0.8, w2=0.95, h2=0.8):
    ax.add_patch(FancyArrowPatch(p, q, arrowstyle='-|>', mutation_scale=14, lw=1.6, color=GREEN,
                                 shrinkA=17, shrinkB=17, zorder=1))


def make(path, compressed):
    fig, ax = plt.subplots(figsize=(13, 8.5), dpi=100)
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 8.5)
    ax.axis('off')
    ax.text(0.7, 8.1, 'Prediction Tree', fontsize=17, fontweight='bold', va='center')

    node(ax, 3.1, 7.0, 'root', fc='#f0f0f0')
    D, E, B2, F = (3.4, 4.9), (2.6, 3.0), (4.3, 3.0), (5.6, 4.9)
    if compressed:
        abc = (1.1, 4.9)
        node(ax, *abc, 'ABC', w=1.5, fc='#ffe9a8')
        edge(ax, (3.1, 7.0), abc)
        ax.text(0.2, 6.2, '(A,B,C → ABC)', fontsize=13, color='#9a6a00', va='center')
        lookup = {'s1': 'ABC'}
    else:
        A, Bn, C = (1.1, 4.9), (1.1, 3.4), (1.1, 1.9)
        for p, lab in ((A, 'A'), (Bn, 'B'), (C, 'C')):
            node(ax, *p, lab)
        edge(ax, (3.1, 7.0), A)
        edge(ax, A, Bn)
        edge(ax, Bn, C)
    node(ax, *D, 'D')
    node(ax, *E, 'E')
    node(ax, *B2, 'B')
    node(ax, *F, 'F')
    edge(ax, (3.1, 7.0), D)
    edge(ax, (3.1, 7.0), F)
    edge(ax, D, E)
    edge(ax, D, B2)

    # Inverted Index
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

    # Lookup Table
    ax.text(7.4, 1.55, 'Lookup Table', fontsize=17, fontweight='bold', va='center')
    for j, h in enumerate(['s1', 's2', 's3', 's4']):
        ax.add_patch(Rectangle((x0 + j * cw, 0.35), cw, 0.75, facecolor='#2c9f4b', edgecolor='white', lw=2))
        ax.text(x0 + j * cw + cw / 2, 0.72, h, ha='center', va='center', color='white', fontsize=16)

    fig.savefig(path, facecolor='white', bbox_inches='tight')
    plt.close(fig)


make(os.path.join(OUT, 'cpt_plus_sbc.png'), True)
make(os.path.join(OUT, 'cpt_plus_none.png'), False)
print('ok')
