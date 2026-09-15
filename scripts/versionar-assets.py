#!/usr/bin/env python3
"""Versiona lazza.css y lazza.js en todas las páginas, para que el caché de un
mes no siga sirviendo estilos viejos tras un deploy."""
import pathlib, re

RAIZ = pathlib.Path(__file__).resolve().parent.parent
# Subir esta fecha cada vez que se toque lazza.css o lazza.js, y correr:
#   python3 scripts/versionar-assets.py
VERSION = "20260914"

paginas = sorted(p for p in RAIZ.rglob("*.html") if ".git" not in p.parts)
cambiadas = 0

for p in paginas:
    s = original = p.read_text()
    # css y js, con cualquier profundidad de ruta relativa o absoluta
    s = re.sub(r'(href="[^"]*assets/css/lazza\.css)(\?v=[0-9]+)?(")',
               rf'\1?v={VERSION}\3', s)
    s = re.sub(r'(src="[^"]*assets/js/lazza\.js)(\?v=[0-9]+)?(")',
               rf'\1?v={VERSION}\3', s)
    if s != original:
        p.write_text(s)
        cambiadas += 1

print(f"versionadas {cambiadas} de {len(paginas)} páginas con ?v={VERSION}")
