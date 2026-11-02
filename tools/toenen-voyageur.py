"""Chloés Fotos für Teil 3 braun tönen (P16 bis P19, Klassenfoto): Helligkeit auf Brauntöne, leichte Vignette, feines Korn.
Aufruf: python3 tools/toenen-voyageur.py <farbig.png> voyageur/assets/img/<name>.jpg   (braucht Pillow und numpy)"""
import sys
import numpy as np
from PIL import Image, ImageFilter

src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
a = np.asarray(im).astype(np.float32) / 255.0
lum = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
# sanfte S-Kurve, Lichter etwas zurück, damit es nicht glänzt wie neu
lum = np.clip(lum, 0, 1)
lum = 0.04 + 0.90 * (lum * lum * (3 - 2 * lum)) * 0.55 + 0.90 * lum * 0.45
# Vignette
h, w = lum.shape
yy, xx = np.mgrid[0:h, 0:w]
r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
lum = lum * (1 - 0.13 * np.clip(r - 0.55, 0, 1) ** 1.5)
# Korn
rng = np.random.default_rng(1900)
grain = rng.normal(0, 0.028, size=(h, w)).astype(np.float32)
grain = np.asarray(Image.fromarray(((grain + 0.5) * 255).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32) / 255 - 0.5
lum = np.clip(lum + grain, 0, 1)
# Verlauf: dunkles Braun -> Sepia -> Creme
stops = np.array([0.0, 0.5, 1.0])
cols = np.array([[44, 28, 17], [152, 112, 72], [240, 224, 192]], dtype=np.float32)
out = np.stack([np.interp(lum, stops, cols[:, c]) for c in range(3)], axis=-1)
Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(dst, quality=86, optimize=True, progressive=True)
