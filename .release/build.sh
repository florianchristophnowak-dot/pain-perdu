#!/usr/bin/env bash
# Baut die beiden Offline-Pakete aus einem Stand des Repositorys und prüft sie gegen die Manifeste.
# Aufruf: build.sh QUELLORDNER ZIELORDNER   (QUELLORDNER = Checkout des Release-Stands)
set -euo pipefail
SRC=$(cd "$1" && pwd)
mkdir -p "$2"
OUT=$(cd "$2" && pwd)
HERE=$(cd "$(dirname "$0")" && pwd)
WORK=$(mktemp -d)

# Französisch: Teil 1 und Teil 2, ohne deutsche Fassung, Werkzeuge und Lösungsblatt
mkdir -p "$WORK/fr/pain-perdu"
git -C "$SRC" ls-files \
  | grep -Ev '^(\.github/|\.claude/|\.release/|de/|tools/|\.gitignore$|\.nojekyll$|CLAUDE\.md$|druck/Quiz_mit_Loesungen\.pdf$)' \
  > "$WORK/fr_files"
tar -C "$SRC" -cf - -T "$WORK/fr_files" | tar -C "$WORK/fr/pain-perdu" -xf -
(cd "$WORK/fr" && zip -qr -X "$OUT/pain-perdu_offline.zip" pain-perdu)

# Deutsch: Teil 1 aus tools/build_de.js, dazu das Ermittlungsblatt
(cd "$SRC" && node tools/build_de.js --zip "$OUT/pain-perdu_deutsch_offline.zip")
mkdir -p "$WORK/de/pain-perdu-deutsch/druck"
cp "$HERE/Ermittlungsblatt.pdf" "$WORK/de/pain-perdu-deutsch/druck/"
(cd "$WORK/de" && zip -qr -X "$OUT/pain-perdu_deutsch_offline.zip" pain-perdu-deutsch)

# Inhalt muss Datei für Datei mit den geprüften Paketen übereinstimmen
for p in fr:pain-perdu_offline de:pain-perdu_deutsch_offline; do
  key=${p%%:*}; zip=${p#*:}.zip
  mkdir -p "$WORK/check_$key"
  unzip -q "$OUT/$zip" -d "$WORK/check_$key"
  (cd "$WORK/check_$key" && find . -type f | sed 's#^\./##' | LC_ALL=C sort | xargs -d '\n' sha256sum) > "$WORK/manifest_$key"
  diff -u "$HERE/manifest_$key.sha256" "$WORK/manifest_$key"
  echo "$zip: $(wc -l < "$WORK/manifest_$key") Dateien, Inhalt wie erwartet"
done
rm -rf "$WORK"
