#!/usr/bin/env python3
"""Bersihkan atlas sprite: buang sisa chroma-key hijau, potongan frame tetangga, lalu pack ulang atlas + tulis js/sprites.js baru.
Jalankan dari root project:  python3 tools/clean_sprites.py   (butuh pillow, numpy, scipy)
Sumber asli dibaca dari tools/original/ (otomatis dibuat dari assets/sprites saat pertama kali jalan)."""
import json, os, re, shutil, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPR = os.path.join(ROOT, 'assets', 'sprites'); ORIG = os.path.join(ROOT, 'tools', 'original')
META_JSON = os.path.join(ORIG, 'smeta.json')
GREEN_OK = {'w', 'ooo', 'decade', 'exaid'}      # rider yang memang punya warna hijau di desainnya
ATLAS_W = 1536; PAD = 2; FX_RATIO = 1e9   # penggantian frame ber-efek DIMATIKAN: efek bawaan sprite dipertahankan
S8 = np.ones((3, 3), bool)

if not os.path.isdir(ORIG):
    os.makedirs(ORIG); [shutil.copy(os.path.join(SPR, f), ORIG) for f in os.listdir(SPR)]
    import subprocess
    src = open(os.path.join(ROOT, 'js', 'sprites.js'), encoding='utf8').read()
    shutil.copy(os.path.join(ROOT, 'js', 'sprites.js'), os.path.join(ORIG, 'sprites.js'))
if not os.path.exists(META_JSON):
    src = open(os.path.join(ORIG, 'sprites.js'), encoding='utf8').read()
    body = src[src.index('{'):src.rindex('}') + 1]
    json.dump(json.loads(body), open(META_JSON, 'w'))
SMETA = json.load(open(META_JSON))

def keymask(a):
    r, g, b, al = [a[..., i].astype(int) for i in range(4)]
    return (al > 0) & (g >= 200) & (r <= 110) & (b <= 110) & (g - r >= 120) & (g - b >= 120)

def greenhue(a):
    r, g, b, al = [a[..., i].astype(int) for i in range(4)]
    return (al > 0) & (g > r + 22) & (g > b + 22)

def despill(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    m = (a[..., 3] > 0) & (g > np.maximum(r, b))
    a[..., 1] = np.where(m, np.maximum(r, b), a[..., 1])

def clean_frame(crop, name, is_fx, stats):
    a = crop.copy(); h, w = a.shape[:2]
    if name in GREEN_OK:
        # hanya buang "genangan" hijau key yang nempel di dasar frame (di bawah kaki) & blob key besar yang solid
        m = keymask(a); lab, n = ndi.label(m, structure=S8); removed_any = False
        for i, s in enumerate(ndi.find_objects(lab), 1):
            comp = lab[s] == i; ar = comp.sum(); bw = s[1].stop - s[1].start; bh = s[0].stop - s[0].start
            low = s[0].stop >= h - 10 and s[0].start > .5 * h
            if ar >= (50 if low and not is_fx else 120) and bw >= (14 if low and not is_fx else 22) and ar / (bw * bh) > .35 and ((low and not is_fx) or ar / (bw * bh) > .9):
                yy, xx = np.nonzero(comp); a[yy + s[0].start, xx + s[1].start, 3] = 0; stats['puddle'] += ar; removed_any = not is_fx
        if removed_any:
            # sisa garis tepi gelap dari genangan: hijau yang menempel ke area yang dihapus, maksimal 3 piksel
            for _ in range(3):
                near = ndi.binary_dilation(a[..., 3] == 0, structure=S8)
                r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
                fr = near & (a[..., 3] > 0) & (g > r + 12) & (g > b + 12) & ~ndi.binary_dilation(np.zeros_like(near), iterations=0) & (np.arange(h)[:, None] > .55 * h)
                stats['rim'] += fr.sum(); a[fr, 3] = 0
        # fringe: piksel hijau terang yang menempel ke area yang baru dihapus
        for _ in range(2):
            gone = (a[..., 3] == 0); near = ndi.binary_dilation(gone, structure=S8)
            r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
            fr = near & (a[..., 3] > 0) & (g > 190) & (g - r > 90) & (g - b > 90)
            stats['fringe'] += fr.sum(); a[fr, 3] = 0
    else:
        m = greenhue(a); stats['green'] += m.sum(); a[m, 3] = 0
        # sisa anti-alias: piksel yang masih condong hijau
        despill(a)
    if not is_fx:
        al = a[..., 3] > 0
        if al.any():
            lab, n = ndi.label(ndi.binary_dilation(al, structure=S8, iterations=2), structure=S8)
            lab = lab * al                      # label hanya di piksel asli
            sizes = ndi.sum(al, lab, range(1, n + 1))
            if len(sizes) > 1:
                main = int(np.argmax(sizes)) + 1; sl = ndi.find_objects(lab)
                ms = sl[main - 1]
                for i, s in enumerate(sl, 1):
                    if s is None or i == main: continue
                    gx = max(s[1].start - ms[1].stop, ms[1].start - s[1].stop, 0); gy = max(s[0].start - ms[0].stop, ms[0].start - s[0].stop, 0)
                    ar = sizes[i - 1]
                    if max(gx, gy) > 10 or ar < 6:
                        a[lab == i, 3] = 0; stats['frag'] += int(ar)
    return a

def trim(a):
    ys, xs = np.nonzero(a[..., 3] > 0)
    if not len(ys): return a, 0, 0
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    return a[y0:y1, x0:x1], x0, y0

out_meta = {}; total = {}
for idx in sorted(SMETA, key=int):
    nm = SMETA[idx]['f']; m = SMETA[idx]['m']
    atlas = np.array(Image.open(os.path.join(ORIG, nm + '.png')).convert('RGBA'))
    stats = dict(green=0, puddle=0, rim=0, fringe=0, frag=0, fxframes=0)
    items = []  # (kind, key, entry-dict, array)
    for sec, arr in m['frames'].items():
        for k, e in enumerate(arr):
            crop = atlas[e['y']:e['y'] + e['h'], e['x']:e['x'] + e['w']]
            c = clean_frame(crop, nm, False, stats)
            items.append(('f', (sec, k), e, c))
    # --- frame yang tercemar efek bawaan (pusaran api, teks 'Obake!', percikan, frame tetangga yang numpuk) diganti frame bersih ---
    FALLBACK = {'ULT': 'KICK', 'DASH': 'PUNCH', 'BURST': 'PUNCH', 'RISING': 'KICK', 'WIN': 'IDLE', 'KICK': 'PUNCH', 'PUNCH': 'IDLE'}
    cnt = {(it[1]): int((it[3][..., 3] > 0).sum()) for it in items}
    idle_med = float(np.median([cnt[('IDLE', k)] for k in range(len(m['frames']['IDLE']))]))
    bad = {k for k, v in cnt.items() if v > FX_RATIO * idle_med}
    byk = {it[1]: it for it in items}
    def good(sec, k): return (sec, k) in byk and (sec, k) not in bad
    nrep = 0
    for i, (kind, key, e, c) in enumerate(items):
        if key not in bad: continue
        sec, k = key; src = None
        if sec == 'ULT' and k == 4:   # titik tumbukan ULT: pakai tendangan terpanjang
            cands = [(byk[('KICK', j)][3].shape[1], j) for j in range(len(m['frames'].get('KICK', []))) if good('KICK', j)]
            if cands: src = byk[('KICK', max(cands)[1])]
        if src is None:
            near = sorted((abs(j - k), j) for j in range(len(m['frames'][sec])) if good(sec, j))
            if near: src = byk[(sec, near[0][1])]
        s2 = sec
        while src is None and s2 in FALLBACK:
            s2 = FALLBACK[s2]
            near = [j for j in range(len(m['frames'].get(s2, []))) if good(s2, j)]
            if near: src = byk[(s2, near[min(len(near) - 1, k)])]
        if src is not None:
            items[i] = (kind, key, src[2], src[3], src[1]); nrep += 1
    stats['fxframes'] = nrep
    for fxn, e in m['fx'].items():
        crop = atlas[e['y']:e['y'] + e['h'], e['x']:e['x'] + e['w']]
        items.append(('x', fxn, e, clean_frame(crop, nm, True, stats)))
    # pack (shelf), tinggi terbesar dulu; frame pengganti berbagi piksel dengan sumbernya
    items = [(it[0], it[1], it[2], it[3], it[4] if len(it) > 4 else it[1]) for it in items]
    uniq = {}
    for it in items: uniq.setdefault((it[0], it[4]) if it[0] == 'f' else ('x', it[1]), it)
    ukeys = sorted(uniq, key=lambda k: -uniq[k][3].shape[0])
    pos = {}; x = y = rowh = 0
    for uk in ukeys:
        h, w = uniq[uk][3].shape[:2]
        if x + w + PAD > ATLAS_W: x = 0; y += rowh + PAD; rowh = 0
        pos[uk] = (x, y); x += w + PAD; rowh = max(rowh, h)
    H = y + rowh + PAD
    new = np.zeros((H, ATLAS_W, 4), np.uint8)
    for uk in ukeys:
        px, py = pos[uk]; c = uniq[uk][3]; h, w = c.shape[:2]; new[py:py + h, px:px + w] = c
    nm_meta = {'frames': {s_: [None] * len(v) for s_, v in m['frames'].items()}, 'fx': {}}
    for kind, key, e, c, uid in items:
        px, py = pos[(kind, uid) if kind == 'f' else ('x', key)]
        ne = dict(e); ne['x'] = px; ne['y'] = py
        if kind == 'f': nm_meta['frames'][key[0]][key[1]] = ne
        else: nm_meta['fx'][key] = ne
    im = Image.fromarray(new)
    ncol = len(np.unique(new.reshape(-1, 4), axis=0))
    if ncol <= 256: im = im.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)   # palet PNG: file kecil, warna tetap
    im.save(os.path.join(SPR, nm + '.png'), optimize=True)
    out_meta[idx] = {'f': nm, 'm': nm_meta}
    print(f'{idx:>2} {nm:8} {H:5}px  ', stats)
js = 'const SMETA=' + json.dumps(out_meta, separators=(',', ':')) + ';\n'
open(os.path.join(ROOT, 'js', 'sprites.js'), 'w', encoding='utf8').write(js)
print('ok')
