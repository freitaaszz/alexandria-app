"""Baixa modelos glTF (1k) da Poly Haven (CC0) para design/modelos/<id>/.
Uso: python design/baixar_polyhaven.py id1 id2 ...
"""
import json, os, sys, urllib.request

BASE = os.path.join(os.path.dirname(__file__), "modelos")
UA = {"User-Agent": "alexandria-design-script"}

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA)).read()

for asset in sys.argv[1:]:
    files = json.loads(get(f"https://api.polyhaven.com/files/{asset}"))
    g = files["gltf"]["1k"]["gltf"]
    pasta = os.path.join(BASE, asset); os.makedirs(pasta, exist_ok=True)
    destino = os.path.join(pasta, os.path.basename(g["url"]))
    open(destino, "wb").write(get(g["url"]))
    for rel, info in g.get("include", {}).items():
        p = os.path.join(pasta, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
        open(p, "wb").write(get(info["url"]))
    print(asset, "->", destino)
