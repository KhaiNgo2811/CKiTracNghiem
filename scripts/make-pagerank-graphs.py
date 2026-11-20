# -*- coding: utf-8 -*-
"""Vẽ thêm các đồ thị PageRank minh họa (cùng phong cách với assets/img/pagerank_graph.png)."""
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, FancyArrowPatch

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img')
COLORS = ['#cfdcd9', '#d4e2f2', '#ead3e1', '#f0cccc', '#fae1c8']
R = 0.28


def draw(path, pos, edges, size=(6.4, 4.6)):
    fig, ax = plt.subplots(figsize=size, dpi=130)
    ax.set_aspect('equal')
    ax.axis('off')
    pairs = set(edges)
    for (a, b) in edges:
        (x1, y1), (x2, y2) = pos[a], pos[b]
        rad = 0.28 if (b, a) in pairs else 0.0
        arr = FancyArrowPatch((x1, y1), (x2, y2), connectionstyle=f'arc3,rad={rad}', arrowstyle='-|>', mutation_scale=18,
                              lw=1.8, color='#404040', shrinkA=R * 62, shrinkB=R * 62, zorder=1)
        ax.add_patch(arr)
    for i, (n, (x, y)) in enumerate(pos.items()):
        ax.add_patch(Circle((x, y), R, facecolor=COLORS[i % len(COLORS)], edgecolor='#808080', lw=1.6, zorder=2))
        ax.text(x, y, str(n), ha='center', va='center', fontsize=20, zorder=3)
    xs = [p[0] for p in pos.values()]
    ys = [p[1] for p in pos.values()]
    ax.set_xlim(min(xs) - 0.8, max(xs) + 0.8)
    ax.set_ylim(min(ys) - 0.8, max(ys) + 0.8)
    fig.savefig(path, bbox_inches='tight', facecolor='white')
    plt.close(fig)


# Đồ thị 2 (4 trang): 1→2, 1→3, 2→3, 3→1, 4→3
draw(os.path.join(OUT, 'pagerank_graph2.png'),
     {1: (0, 2), 2: (2.4, 2), 3: (1.2, 0), 4: (3.6, 0)},
     [(1, 2), (1, 3), (2, 3), (3, 1), (4, 3)])
# Đồ thị 3 (3 trang): 1→2, 1→3, 2→3, 3→1
draw(os.path.join(OUT, 'pagerank_graph3.png'),
     {1: (1.2, 2.2), 2: (0, 0), 3: (2.4, 0)},
     [(1, 2), (1, 3), (2, 3), (3, 1)])
print('ok')
