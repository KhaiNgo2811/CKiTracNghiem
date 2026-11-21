# -*- coding: utf-8 -*-
"""Vẽ đồ thị vô hướng cho câu BFS/DFS (C9_T2_Q7, C9_T2_Q8)."""
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Circle

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img')
COL = ['#cfdcd9', '#d4e2f2', '#ead3e1', '#f0cccc', '#fae1c8', '#e3f0cf', '#e8dcf5']


def draw(name, pos, edges):
    fig, ax = plt.subplots(figsize=(5.6, 4.6), dpi=130)
    ax.set_aspect('equal')
    ax.axis('off')
    for a, b in edges:
        (x1, y1), (x2, y2) = pos[a], pos[b]
        ax.plot([x1, x2], [y1, y2], color='#404040', lw=1.8, zorder=1)
    for i, (n, (x, y)) in enumerate(pos.items()):
        ax.add_patch(Circle((x, y), 0.26, facecolor=COL[i % len(COL)], edgecolor='#808080', lw=1.6, zorder=2))
        ax.text(x, y, n, ha='center', va='center', fontsize=18, zorder=3)
    xs = [p[0] for p in pos.values()]
    ys = [p[1] for p in pos.values()]
    ax.set_xlim(min(xs) - 0.7, max(xs) + 0.7)
    ax.set_ylim(min(ys) - 0.7, max(ys) + 0.7)
    fig.savefig(os.path.join(OUT, name), bbox_inches='tight', facecolor='white')
    plt.close(fig)


# Q7: A–{B,D,G}; B–{E,F}; D–{F}; G–{E}; E–{C}; F–{C}
draw('graph_bfs.png',
     {'A': (2.0, 3.0), 'B': (0.4, 2.0), 'D': (2.0, 2.0), 'G': (3.6, 2.0), 'E': (3.0, 1.0), 'F': (1.0, 1.0), 'C': (2.0, 0.0)},
     [('A', 'B'), ('A', 'D'), ('A', 'G'), ('B', 'E'), ('B', 'F'), ('D', 'F'), ('G', 'E'), ('E', 'C'), ('F', 'C')])
# Q8: A–{B,D,G}; B–{E,F}; E–{G}; F–{C,D}
draw('graph_dfs.png',
     {'A': (2.0, 3.0), 'B': (0.4, 2.0), 'D': (2.0, 2.0), 'G': (3.6, 2.0), 'E': (3.0, 1.0), 'F': (1.0, 1.0), 'C': (1.0, 0.0)},
     [('A', 'B'), ('A', 'D'), ('A', 'G'), ('B', 'E'), ('B', 'F'), ('E', 'G'), ('F', 'C'), ('F', 'D')])
# Biến thể BFS/DFS: A–B, A–D, A–G, B–E, G–E, G–F, D–F, F–C
draw('graph_bfs2.png',
     {'A': (2.0, 3.0), 'B': (0.4, 2.0), 'D': (2.0, 2.0), 'G': (3.6, 2.0), 'E': (1.0, 1.0), 'F': (3.0, 1.0), 'C': (3.0, 0.0)},
     [('A', 'B'), ('A', 'D'), ('A', 'G'), ('B', 'E'), ('G', 'E'), ('G', 'F'), ('D', 'F'), ('F', 'C')])
print('ok')
