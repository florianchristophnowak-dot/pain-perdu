# Platzhalter für Teil 3 (voyageur/assets/ph/*.svg): einfache Skizzen, die Fundpunkte liegen an denselben Stellen wie in voyageur/js/data.js
# (Koordinaten in % des Bildes). Aufruf: python3 tools/platzhalter-voyageur.py
import os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "voyageur", "assets", "ph")

class S:
    def __init__(s, W, H, bg):
        s.W, s.H, s.o = W, H, []
        s.rect(0, 0, 100, 100, bg)
    def X(s, x): return round(x * s.W / 100, 1)
    def Y(s, y): return round(y * s.H / 100, 1)
    def rect(s, x, y, w, h, fill, extra=""):
        s.o.append(f'<rect x="{s.X(x)}" y="{s.Y(y)}" width="{s.X(w)}" height="{s.Y(h)}" fill="{fill}" {extra}/>')
    def ell(s, cx, cy, rx, ry, fill, extra=""):
        s.o.append(f'<ellipse cx="{s.X(cx)}" cy="{s.Y(cy)}" rx="{s.X(rx)}" ry="{s.Y(ry)}" fill="{fill}" {extra}/>')
    def poly(s, pts, fill, extra=""):
        p = " ".join(f"{s.X(a)},{s.Y(b)}" for a, b in pts)
        s.o.append(f'<polygon points="{p}" fill="{fill}" {extra}/>')
    def line(s, x1, y1, x2, y2, col, w):
        s.o.append(f'<line x1="{s.X(x1)}" y1="{s.Y(y1)}" x2="{s.X(x2)}" y2="{s.Y(y2)}" stroke="{col}" stroke-width="{w}" stroke-linecap="round"/>')
    def raw(s, t): s.o.append(t)
    def save(s, name, sepia=False):
        flt = '<filter id="sep"><feColorMatrix type="matrix" values="0.393 0.769 0.189 0 0 0.349 0.686 0.168 0 0 0.272 0.534 0.131 0 0 0 0 0 1 0"/></filter>' if sepia else ""
        body = "\n".join(s.o)
        g = f'<g filter="url(#sep)">{body}</g>' if sepia else body
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {s.W} {s.H}" width="{s.W}" height="{s.H}"><defs>{flt}</defs>{g}</svg>\n'
        open(os.path.join(OUT, name + ".svg"), "w").write(svg)

INK = "#2b2420"
def person(s, x, w, top, bottom, coat, skin="#e8c9a6", hair="#b8b8b0", mustache=False, hat=None):
    """Figur zwischen x und x+w, Kopf oben (top), Füße unten (bottom)"""
    cx = x + w / 2
    hh = (bottom - top) * 0.2   # Kopfhöhe
    s.rect(cx - w * 0.28, top + hh * 2.2 + (bottom - top) * 0.45, w * 0.18, (bottom - top) * 0.33, "#3d3530")
    s.rect(cx + w * 0.1, top + hh * 2.2 + (bottom - top) * 0.45, w * 0.18, (bottom - top) * 0.33, "#3d3530")
    s.poly([(cx - w * 0.42, top + hh * 1.05), (cx + w * 0.42, top + hh * 1.05), (cx + w * 0.5, top + (bottom - top) * 0.78), (cx - w * 0.5, top + (bottom - top) * 0.78)], coat, f'stroke="{INK}" stroke-width="3"')
    s.ell(cx, top + hh * 0.55, w * 0.22, hh * 0.55, skin, f'stroke="{INK}" stroke-width="3"')
    s.ell(cx, top + hh * 0.18, w * 0.23, hh * 0.22, hair)
    if mustache: s.ell(cx, top + hh * 0.78, w * 0.12, hh * 0.08, "#8f8f88")
    if hat == "toque": s.rect(cx - w * 0.2, top - hh * 0.55, w * 0.4, hh * 0.65, "#f6f2ea", f'stroke="{INK}" stroke-width="3"')
    if hat == "melon": s.ell(cx, top + hh * 0.02, w * 0.26, hh * 0.18, "#4a3b30")

# ---------- Orsay: Fassade mit den großen Uhren ----------
def facade(s, dx=0):
    s.rect(0, 62, 100, 38, "#cdb795")            # Kai
    s.rect(0, 8, 100, 56, "#c9ad80")              # Fassade
    s.rect(0, 6, 100, 4, "#a88b5e")
    for i in range(5):
        ax = 4 + i * 20 + dx
        s.rect(ax, 22, 14, 38, "#8e7350")
        s.ell(ax + 7, 22, 7, 7, "#8e7350")
    for cx in (24 + dx, 64 + dx):
        s.ell(cx, 16, 5.5, 8, "#efe6cf", f'stroke="{INK}" stroke-width="4"')
        s.line(cx, 16, cx, 11, INK, 4); s.line(cx, 16, cx + 2.5, 17, INK, 4)

def p17(name, decoy=False):
    s = S(1500, 1000, "#d8c3a0")
    facade(s)
    if decoy:
        person(s, 57, 16, 24, 94, "#4a3b30", mustache=True, hat="melon")          # dunkler Mantel, andere Stelle
    else:
        person(s, 37, 14, 26, 92, "#d9c8a4", mustache=True, hat="melon")          # Lucien, heller Reisemantel
        s.rect(46.5, 58, 6, 4, "#e8c9a6", f'stroke="{INK}" stroke-width="2"')     # Hand
        s.ell(51, 64.5, 1.6, 2.4, "#e0b23c", f'stroke="{INK}" stroke-width="3"')  # goldene Uhr
        person(s, 80, 14, 34, 93, "#7d6a58", hair="#5a4636")                       # die Assistentin (am Rand)
        s.rect(82.5, 45.5, 5, 8.5, "#1f1f22", f'stroke="{INK}" stroke-width="2"') # Smartphone
        s.rect(83.2, 46.6, 3.6, 6.3, "#9ab8c9")
    s.save(name, sepia=True)

# ---------- Pont Alexandre III ----------
def bridge(s, col_x, lamps, today=False):
    s.rect(0, 0, 100, 52, "#a9c7dc" if today else "#d9c6a0")
    s.rect(0, 46, 100, 16, "#b7a98a" if not today else "#9aa58f")              # anderes Ufer
    s.rect(0, 60, 100, 18, "#c2a878" if not today else "#c9b38a")              # Geländer
    for i in range(26): s.rect(i * 4 + 0.6, 63, 1.4, 13, "#8f774f")
    s.rect(0, 76, 100, 24, "#bfae8c" if not today else "#8fb0c4")               # Gehweg (B) oder Seine (heute)
    cx, cy, cw, ch = col_x
    s.rect(cx, cy, cw, ch, "#b59a68", f'stroke="{INK}" stroke-width="3"')       # Säule
    s.rect(cx - 1, cy, cw + 2, 3, "#9c8152")
    sx = cx + cw / 2                                                            # Statue mit Flügeln
    s.poly([(sx - 7, cy - 2), (sx - 2, cy - 13), (sx, cy - 6), (sx + 2, cy - 14), (sx + 7, cy - 2)], "#d6b04a", f'stroke="{INK}" stroke-width="3"')
    for lx, top in lamps:                                                       # Lampadaires
        s.rect(lx, top + 8, 2, 76 - top - 8, "#3f3a33")
        for d in (-2.6, 0, 2.6): s.ell(lx + 1 + d, top + 4, 1.6, 2.6, "#f0e3b8", f'stroke="{INK}" stroke-width="2"')
        s.rect(lx - 3, top + 6.5, 8, 1, "#3f3a33")

def p18():
    s = S(1500, 1000, "#d8c3a0")
    bridge(s, (65.5, 22, 9, 50), [(55, 18), (24, 26)])
    s.rect(2, 18, 12, 18, "#f7f3e6", f'stroke="{INK}" stroke-width="4"')        # LED-Lampe auf dem Stativ (Rand)
    s.rect(3.5, 20, 9, 14, "#fffdf4")
    s.line(8, 36, 8, 79, INK, 7)
    s.line(8, 79, 1.5, 95, INK, 6); s.line(8, 79, 9, 96, INK, 6); s.line(8, 79, 18.5, 93, INK, 6)   # der dritte Fuß reicht ins Album
    person(s, 34, 17, 30, 94, "#f2ece0", hair="#6b5642", hat="toque")           # Marcel als Bäcker
    s.rect(36, 55, 17, 5, "#d9a85f", f'stroke="{INK}" stroke-width="3" rx="12"')  # Baguette
    s.poly([(35.2, 54.6), (37, 55.6), (35.6, 57), (37.4, 58.3), (35.4, 59.8), (39, 60.3), (40.4, 54.4)], "#d9a85f", f'stroke="{INK}" stroke-width="3"')  # gezacktes Ende
    for tx in (41.2, 43.3, 45.4): s.rect(tx, 53.4, 1.4, 8, "#fbf7e8", f'stroke="{INK}" stroke-width="2"')   # drei Stück Klebeband
    s.ell(50.5, 58.5, 3, 4, "#ffffff", f'stroke="{INK}" stroke-width="3"')      # weißer Handschuh
    s.save("doc_p18", sepia=True)

def pont_today():
    s = S(1500, 1000, "#a9c7dc")
    bridge(s, (61.5, 18, 10, 52), [(49, 16), (18.5, 24)], today=True)
    s.poly([(28, 80), (62, 80), (58, 90), (32, 90)], "#c8322a", f'stroke="{INK}" stroke-width="4"')   # rotes Boot
    s.rect(38, 75, 12, 5, "#f4f4f4", f'stroke="{INK}" stroke-width="3"')
    for wx in (72, 84): s.ell(wx, 88, 3, 4.5, "none", f'stroke="{INK}" stroke-width="6"')             # Fahrrad
    s.line(72, 88, 78, 78, "#2c6db0", 6); s.line(78, 78, 84, 88, "#2c6db0", 6); s.line(76, 74, 80, 74, INK, 6); s.line(78, 78, 77, 74, "#2c6db0", 5)
    s.save("doc_pont")

# ---------- Invalides ----------
def p19():
    s = S(1500, 1000, "#d8c3a0")
    s.rect(0, 0, 100, 40, "#dccaa8")
    s.rect(20, 28, 60, 26, "#c9ad80", f'stroke="{INK}" stroke-width="3"')       # Gebäude
    s.ell(50, 26, 11, 14, "#d6b04a", f'stroke="{INK}" stroke-width="4"')        # Kuppel
    s.rect(48.8, 6, 2.4, 8, "#b8923a")
    s.rect(0, 54, 100, 46, "#c8b48f")                                           # Esplanade
    person(s, 29, 14, 22, 74, "#d9c8a4", mustache=True, hat="melon")            # Lucien
    person(s, 57, 14, 22, 74, "#f2ece0", hair="#6b5642", hat="toque")          # Marcel
    s.rect(42, 55, 14, 17, "#8a6a3e", f'stroke="{INK}" stroke-width="4"')       # Requisitenkiste
    s.line(42, 63.5, 56, 63.5, INK, 3)
    s.rect(40, 79, 20, 15, "#222222", f'stroke="{INK}" stroke-width="3"')       # Filmklappe (Text vom Spiel)
    s.poly([(40, 79), (60, 77), (60, 73.5), (40, 75.5)], "#f2f2f2", f'stroke="{INK}" stroke-width="3"')
    for k in range(5): s.poly([(42 + k * 4, 75.3), (44 + k * 4, 75.1), (42.5 + k * 4, 78.8), (40.5 + k * 4, 79)], "#222222")
    s.save("doc_p19", sepia=True)

def baguette():
    s = S(2000, 1000, "#b98a5a")
    for i in range(9): s.rect(0, i * 11.5, 100, 0.6, "#a2774c")                  # Tisch
    s.rect(15, 40, 78, 20, "#e2a95a", f'stroke="{INK}" stroke-width="5" rx="90"')
    for k in range(6): s.line(46 + k * 7, 43, 50 + k * 7, 57, "#b9803c", 6)
    s.poly([(5.5, 40), (8, 43), (5.8, 47), (8.6, 51), (5.6, 55), (8.2, 58.5), (6, 61), (16.5, 61), (16.5, 39.5)], "#e2a95a", f'stroke="{INK}" stroke-width="5"')   # Bruchstelle
    for tx in (20, 26.5, 33): s.rect(tx, 36, 4.2, 28, "#fbf7e8", f'stroke="{INK}" stroke-width="3" opacity=".95"')   # Klebeband
    s.save("doc_baguette")

# ---------- Hintergründe ----------
def bg_orsay():
    s = S(1600, 900, "#d9c9a8")
    s.rect(0, 0, 100, 60, "#cdb38a")
    for i in range(6):
        s.rect(3 + i * 16.5, 12, 11, 40, "#a4885f"); s.ell(8.5 + i * 16.5, 12, 5.5, 6, "#a4885f")
    for cx in (20, 80): s.ell(cx, 8, 4, 6.5, "#efe6cf", f'stroke="{INK}" stroke-width="4"')
    s.rect(0, 60, 100, 40, "#b9a47f")
    s.rect(50, 26, 24, 8, "#efe2c4", f'stroke="{INK}" stroke-width="3"')        # Schild (Text vom Spiel)
    s.rect(28, 70, 46, 6, "#7a5a36", f'stroke="{INK}" stroke-width="3"')        # Verkaufstisch
    s.rect(30, 74, 4, 18, "#5d4329"); s.rect(68, 74, 4, 18, "#5d4329")
    s.rect(33, 62, 8, 9, "#f2ead6", f'stroke="{INK}" stroke-width="3"')         # Fiche
    s.poly([(45, 71), (58, 71), (57, 58), (46, 58)], "#5a3a22", f'stroke="{INK}" stroke-width="3"')   # Album
    s.rect(51.2, 58, .6, 13, "#e9dcc0")
    person(s, 60, 12, 36, 92, "#6b4a2a", hair="#3d2d22")                         # Delmas
    person(s, 84, 10, 38, 90, "#2f4b5a", hair="#6a6a6a")                         # der Verantwortliche
    s.rect(87.5, 52, 3, 2.2, "#f4f1e8")
    s.save("bg_orsay")

def bg_pont():
    s = S(1600, 900, "#a9c7dc")
    bridge(s, (6, 14, 8, 50), [(30, 14), (56, 18)], today=True)
    s.poly([(18, 82), (50, 82), (46, 92), (22, 92)], "#c8322a", f'stroke="{INK}" stroke-width="4"')
    s.rect(70, 48, 22, 30, "#3c6e8f", f'stroke="{INK}" stroke-width="3"')       # Informationspunkt
    s.rect(70, 42, 20, 7, "#efe2c4", f'stroke="{INK}" stroke-width="3"')
    person(s, 72, 12, 50, 96, "#7d6a58", hair="#5a4636")                         # die Assistentin
    s.save("bg_pont")

def bg_invalides():
    s = S(1600, 900, "#dccaa8")
    s.rect(0, 0, 100, 40, "#cfdce4")
    s.rect(25, 16, 50, 24, "#cbb38a", f'stroke="{INK}" stroke-width="3"')
    s.ell(50, 16, 9, 12, "#d6b04a", f'stroke="{INK}" stroke-width="4"')
    s.rect(0, 40, 100, 60, "#bfcf9e")
    s.rect(36, 36, 28, 7, "#efe2c4", f'stroke="{INK}" stroke-width="3"')        # Banner (Text vom Spiel)
    s.rect(2, 64, 22, 10, "#3f6b3f", f'stroke="{INK}" stroke-width="3"')        # Bücherstand
    person(s, 8, 13, 46, 94, "#3f6b3f", hair="#7a6a5a")                          # die Bouquiniste
    person(s, 44, 12, 44, 94, "#f2ece0", hair="#6b5642")                         # Marcel
    s.rect(58, 66, 20, 6, "#7a5a36", f'stroke="{INK}" stroke-width="3"')        # Tisch mit Requisiten
    s.rect(60, 62, 10, 3, "#d9a85f", 'rx="8"'); s.rect(71, 61, 5, 5, "#8a6a3e")
    s.rect(78, 50, 18, 26, "#e9e3d6", f'stroke="{INK}" stroke-width="3"')       # Stand 6
    s.rect(80, 40, 10, 6, "#efe2c4", f'stroke="{INK}" stroke-width="3"')
    s.save("bg_invalides")                                                      # Stand 6 noch leer: Chloé kommt um 14 h

def cut_dejeuner():
    s = S(1696, 800, "#bfcf9e")
    s.rect(0, 0, 100, 38, "#cfdce4")
    s.ell(50, 30, 8, 12, "#d6b04a", f'stroke="{INK}" stroke-width="4"')
    s.rect(15, 62, 70, 10, "#efe7d6", f'stroke="{INK}" stroke-width="3"')
    for i in range(8): person(s, 12 + i * 10, 7, 40, 80, ["#3b4a6b", "#8a3b3b", "#5a5a5a", "#3a7ab0"][i % 4], hair="#6b5642")
    s.save("cut_dejeuner")

def cut_photo_classe():
    s = S(1696, 800, "#d8c3a0")
    facade(s)
    for i in range(11): person(s, 3 + i * 8.8, 7, 34 + (i % 2) * 6, 88, ["#6b5a45", "#8a7357", "#5a4a3a"][i % 3], hair="#6b5642")
    s.save("cut_photo_classe", sepia=True)

p17("doc_p17"); p17("doc_p16", decoy=True); p18(); pont_today(); p19(); baguette()
bg_orsay(); bg_pont(); bg_invalides(); cut_dejeuner(); cut_photo_classe()
print(sorted(os.listdir(OUT)))
