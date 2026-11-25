# Cắt hình từ 2 giáo trình ERP2 (chỉ dùng trên máy, thư mục kết quả được gitignore)
import os, re, pymupdf
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'ERP2')
OUT = os.path.join(ROOT, 'book-figs'); os.makedirs(OUT, exist_ok=True)
BOOK, TS = 'BusinessProcessConfigurationWithSAPERP.pdf', 'TS410.pdf'
WANT = {BOOK: [('1-2',33),('2-8',61),('3-2',113),('3-5',117),('3-6',119),('3-8',121),('4-1',167),('4-7',176),('4-16',186),('5-1',224),('5-11',236),('5-27',253),('5-37',267)],
        TS: [('38',53),('172',299),('177',307),('373',630),('377',635),('403',666),('471',753),('481',760),('521',823),('525',829),('529',834),('535',840),('561',878)]}
for f, items in WANT.items():
    doc = pymupdf.open(os.path.join(ROOT, f))
    for num, page in items:
        pg = doc[page - 1]
        blocks = pg.get_text('blocks')
        cap = [b for b in blocks if re.search(r'(?m)^\s*Figure\s*%s\s*:' % re.escape(num), b[4])]
        if not cap: print('no caption', f, num); continue
        cy = cap[-1][1]
        W, H = pg.rect.width, pg.rect.height
        rects = [pymupdf.Rect(i['bbox']) for i in pg.get_image_info()] + [d['rect'] for d in pg.get_drawings()]
        rects = [r & pg.rect for r in rects]
        rects = [r for r in rects if r.y1 <= cy + 8 and r.y0 > H * 0.06 and r.height < H * 0.9 and (r.width > 3 or r.height > 3)
                 and not (r.width > W * 0.97 and r.height > H * 0.8)]
        if not rects: print('no graphics', f, num); continue
        # gom cụm từ dưới lên: dừng khi gặp khoảng trống lớn
        rects.sort(key=lambda r: -r.y1)
        clip = pymupdf.Rect(rects[0])
        for r in rects[1:]:
            if r.y1 >= clip.y0 - 45: clip |= r
        # lấy thêm chữ nằm trong/sát vùng hình
        for b in blocks:
            br = pymupdf.Rect(b[:4])
            if br.y1 <= cy and br.intersects(clip) and len(b[4]) < 120: clip |= br
        clip = (clip + (-4, -4, 4, 4)) & pg.rect
        clip.y1 = min(clip.y1, cy - 1)
        pg.get_pixmap(clip=clip, dpi=170).save(os.path.join(OUT, ('B' if f == BOOK else 'T') + num + '.png'))
print(len(os.listdir(OUT)), 'figures')
