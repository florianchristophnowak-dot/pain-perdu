#!/usr/bin/env python3
"""Aufdrucke auf Bildern: Schrift auf einer gewölbten, schrägen oder gefalteten Fläche im Bild wird hier perspektivisch und mit der
Schattierung des Untergrunds ins Bild gesetzt, statt vom Spiel als HTML darübergelegt zu werden. HTML-Schrift lässt sich nur drehen;
sie folgt weder einem durchhängenden Banner noch der Perspektive einer Tüte und läuft über Falten hinweg. Gerade, frontale Schilder
(« Information », « Les Images de Paris », « Stand 6 », « Paris en 1900 ») beschriftet das Spiel weiterhin selbst.

  bg_orsay          Teil 3: « Brocante du quai » auf dem Banner über Delmas' Stand. Das Banner hängt durch und ist rechts höher
                    aufgehängt; Grundlinie und Höhe der Schrift folgen Ober- und Unterkante des Tuchs (unten gemessen). Die Schrift
                    steht in der Mitte des Banners und hält Abstand zu Delmas' Mütze, die rechts unten vor dem Tuch steht.
  doc_photo_groupe  Teil 2: « Galeries Lafayette » auf der Tüte von M. Beaumont, nur auf der Vorderseite (rechts vom Falz zum
                    schmalen Seitenteil) und in deren Perspektive.

Aufruf: python3 tools/aufdrucke.py <bild> <original.png> <ziel.jpg>
  Die Originale ohne Schrift liegen in den Projektdateien unter pain-perdu/teil3_bilder/bg_orsay.png und
  pain-perdu/teil2_bilder/doc_photo_groupe.png. Gespeichert wird wie die übrigen Bilder als progressives JPEG mit Qualität 86
  (die Bilder im Repository waren genau die Originale mit diesen Einstellungen). Beispiele:
  python3 tools/aufdrucke.py bg_orsay …/teil3_bilder/bg_orsay.png voyageur/assets/img/bg_orsay.jpg
  python3 tools/aufdrucke.py doc_photo_groupe …/teil2_bilder/doc_photo_groupe.png guide-fantome/assets/img/doc_photo_groupe.jpg
Schrift: Gelasio Bold (tools/fonts/, SIL Open Font License), mit denselben Maßen wie Georgia, der Schrift der Schilder im Spiel.
Die Linien und Ecken unten sind an den Umrisslinien der Originale abgelesen (Pixel); ein neues Original braucht neue Werte.
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(HERE, "fonts", "Gelasio-Bold.ttf")
SS = 4   # Überabtastung beim Verzerren (Kantenglättung)


def text_mask(lines, size, leading=1.12):
    """Zentrierte Zeilen als Graustufen-Maske mit Rand; liefert die Maske, darin die Oberkante der Großbuchstaben und die
    Grundlinie der ersten Zeile, und die Breite des Rands auf jeder Seite."""
    font = ImageFont.truetype(FONT, size)
    boxes = [font.getbbox(t, anchor="ls") for t in lines]
    pad = size // 4
    asc, desc = -min(b[1] for b in boxes), max(b[3] for b in boxes)
    w = max(b[2] - b[0] for b in boxes) + 2 * pad
    h = int(asc + desc + (len(lines) - 1) * size * leading) + 2 * pad
    im = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(im)
    base = pad + asc
    for i, (t, b) in enumerate(zip(lines, boxes)):
        d.text(((w - (b[2] - b[0])) / 2 - b[0], base + i * size * leading), t, font=font, fill=255, anchor="ls")
    cap = -font.getbbox("H", anchor="ls")[1]
    return np.asarray(im, dtype=np.float32) / 255.0, base - cap, base, pad


def bilinear(img, x, y):
    """Maske an Gleitkomma-Stellen abtasten (außerhalb: 0)."""
    h, w = img.shape
    x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int)
    fx = x - x0; fy = y - y0
    out = np.zeros_like(x, dtype=np.float32)
    for dy, wy in ((0, 1 - fy), (1, fy)):
        for dx, wx in ((0, 1 - fx), (1, fx)):
            xi = x0 + dx; yi = y0 + dy
            ok = (xi >= 0) & (xi < w) & (yi >= 0) & (yi < h)
            v = np.zeros_like(out)
            v[ok] = img[yi[ok], xi[ok]]
            out += v * wx * wy
    return out


def grid(x0, x1, y0, y1):
    """Mittelpunkte der überabgetasteten Pixel im Rechteck x0..x1, y0..y1."""
    return np.meshgrid(x0 + (np.arange((x1 - x0) * SS) + 0.5) / SS, y0 + (np.arange((y1 - y0) * SS) + 0.5) / SS)


def downsample(a):
    h, w = a.shape
    return a[: h - h % SS, : w - w % SS].reshape(h // SS, SS, w // SS, SS).mean(axis=(1, 3))


def soften(a, radius):
    return np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius)), dtype=np.float32) / 255.0


def blend(base, alpha, ink, multiply):
    """Druckfarbe auf den Untergrund: multiply = Anteil, der die Schattierung des Untergrunds übernimmt (1 = reines Multiplizieren)."""
    ink = np.array(ink, dtype=np.float32)
    b = base.astype(np.float32)
    printed = (1 - multiply) * ink + multiply * b * ink / 255.0
    a = alpha[..., None]
    return np.clip(b * (1 - a) + printed * a, 0, 255).astype(np.uint8)


def smooth01(v, lo, hi):
    t = np.clip((v - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)


def curve(points, x):
    xs, ys = zip(*points)
    return np.interp(x, xs, ys)


# ---------- Teil 3: Banner der Brocante ----------
# Umrisslinien des Banners in Pixeln des Originals (1672 × 941): die dunkle Linie über bzw. unter dem Tuch. Unter der Mütze
# (x 880 bis 1000) ist die Unterkante verdeckt; dort gilt die Gerade zwischen den sichtbaren Stücken.
BANNER_TOP = [(435, 222), (480, 225), (520, 227), (560, 228), (600, 226), (640, 225), (700, 225), (740, 223), (780, 221),
              (820, 218), (860, 216), (900, 214), (940, 211), (980, 208), (1020, 204), (1060, 200), (1100, 194)]
BANNER_BOTTOM = [(455, 319), (500, 316), (540, 317), (600, 318), (640, 317), (700, 315), (740, 313), (780, 311), (820, 310),
                 (875, 308), (1005, 299), (1050, 296), (1100, 294)]
# center_x: Mitte der Schrift (Pixel); cap: Höhe der Großbuchstaben, mid: Mitte zwischen ihrer Oberkante und der Grundlinie,
# beides als Anteil der Tuchhöhe an jeder Stelle. Etwas über der Mitte, weil die Kleinbuchstaben unten Gewicht haben und die
# Mütze sonst an das « ai » stößt.
BANNER = dict(text=["Brocante du quai"], center_x=762, cap=0.42, mid=0.46, ink=(52, 36, 24), multiply=0.55)


def print_banner(img):
    arr = np.asarray(img.convert("RGB"))
    lum = np.asarray(img.convert("L"), dtype=np.float32)
    m, cap_y, base_y, _ = text_mask(BANNER["text"], 320)
    mw = m.shape[1]
    top = lambda x: curve(BANNER_TOP, x) + 3.0            # erste Stoffzeile unter bzw. über der Umrisslinie
    bot = lambda x: curve(BANNER_BOTTOM, x) - 2.0
    # Die Tuchhöhe an der Mitte bestimmt die Schriftgröße, die Breite folgt aus dem Seitenverhältnis der Buchstaben
    cx = BANNER["center_x"]
    scale = BANNER["cap"] * float(bot(cx) - top(cx)) / (base_y - cap_y)   # Pixel im Bild je Pixel der Maske
    half = mw * scale / 2
    x0, x1 = int(cx - half) - 2, int(cx + half) + 3
    y0, y1 = int(min(top(np.arange(x0, x1)))) - 2, int(max(bot(np.arange(x0, x1)))) + 3
    X, Y = grid(x0, x1, y0, y1)
    t, hh = top(X), bot(X) - top(X)
    ycap = t + hh * (BANNER["mid"] - BANNER["cap"] / 2)    # Oberkante der Großbuchstaben und Grundlinie folgen dem Tuch
    ybase = t + hh * (BANNER["mid"] + BANNER["cap"] / 2)
    u = (X - (cx - half)) / (2 * half) * mw
    v = cap_y + (Y - ycap) / (ybase - ycap) * (base_y - cap_y)
    a = downsample(bilinear(m, u, v))
    a = soften(a * smooth01(lum[y0:y1, x0:x1], 150, 185), 0.35)   # nur auf dem Stoff, nicht auf Umrisslinie und Mütze
    out = arr.copy()
    out[y0:y1, x0:x1] = blend(arr[y0:y1, x0:x1], a, BANNER["ink"], BANNER["multiply"])
    return Image.fromarray(out)


# ---------- Teil 2: Tüte auf dem Gruppenfoto ----------
# Vorderseite der Tüte in Pixeln des Originals (1448 × 1086): links der Falz zum schmalen Seitenteil, rechts, oben und unten die
# Umrisslinie (jeweils die erste helle Papierzeile). Die Fläche wird nach unten etwas breiter (Perspektive).
BAG_FACE = [(1321.5, 691.0), (1398.0, 691.5), (1406.0, 799.0), (1323.0, 799.0)]   # oben links, oben rechts, unten rechts, unten links
# width: Breite der Schrift (längste Zeile) als Anteil der Fläche; center_t: Mitte der Schrift von oben (0) nach unten (1)
BAG = dict(text=["Galeries", "Lafayette"], width=0.76, center_t=0.42, ink=(27, 42, 74), multiply=0.5)


def homography(src, dst):
    A = []
    for (x, y), (X, Y) in zip(src, dst):
        A.append([x, y, 1, 0, 0, 0, -X * x, -X * y, -X])
        A.append([0, 0, 0, x, y, 1, -Y * x, -Y * y, -Y])
    _, _, vt = np.linalg.svd(np.array(A, dtype=np.float64))
    H = vt[-1].reshape(3, 3)
    return H / H[2, 2]


def print_bag(img):
    arr = np.asarray(img.convert("RGB"))
    lum = np.asarray(img.convert("L"), dtype=np.float32)
    m, _, _, pad = text_mask(BAG["text"], 240, leading=1.08)
    mh, mw = m.shape
    # Maske (mit Rand) in Flächenkoordinaten (s, t von 0 bis 1): Breite aus der Breite der Schrift, Höhe nach dem
    # Seitenverhältnis der Fläche
    face_w = (BAG_FACE[1][0] - BAG_FACE[0][0] + BAG_FACE[2][0] - BAG_FACE[3][0]) / 2
    face_h = (BAG_FACE[3][1] - BAG_FACE[0][1] + BAG_FACE[2][1] - BAG_FACE[1][1]) / 2
    bw = BAG["width"] * mw / (mw - 2 * pad)
    bh = bw * face_w / face_h * mh / mw
    s0, t0 = 0.5 - bw / 2, BAG["center_t"] - bh / 2
    Hi = np.linalg.inv(homography([(0, 0), (1, 0), (1, 1), (0, 1)], BAG_FACE))   # Bild -> Fläche (s, t)
    x0, x1 = int(min(p[0] for p in BAG_FACE)) - 1, int(max(p[0] for p in BAG_FACE)) + 2
    y0, y1 = int(min(p[1] for p in BAG_FACE)) - 1, int(max(p[1] for p in BAG_FACE)) + 2
    X, Y = grid(x0, x1, y0, y1)
    P = Hi @ np.stack([X.ravel(), Y.ravel(), np.ones(X.size)])
    s = (P[0] / P[2]).reshape(X.shape); t = (P[1] / P[2]).reshape(X.shape)
    a = bilinear(m, (s - s0) / bw * mw, (t - t0) / bh * mh)
    a = downsample(a * ((s > 0) & (s < 1) & (t > 0) & (t < 1)))          # nur die Vorderseite
    a = soften(a * smooth01(lum[y0:y1, x0:x1], 170, 205), 0.3)            # nicht auf Falz und Umrisslinie
    out = arr.copy()
    out[y0:y1, x0:x1] = blend(arr[y0:y1, x0:x1], a, BAG["ink"], BAG["multiply"])
    return Image.fromarray(out)


JOBS = {"bg_orsay": print_banner, "doc_photo_groupe": print_bag}

if __name__ == "__main__":
    if len(sys.argv) != 4 or sys.argv[1] not in JOBS:
        sys.exit(__doc__)
    name, src, dst = sys.argv[1:]
    out = JOBS[name](Image.open(src))
    if dst.lower().endswith((".jpg", ".jpeg")):
        out.save(dst, "JPEG", quality=86, progressive=True)
    else:
        out.save(dst)
    print(dst, out.size)
