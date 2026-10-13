"""Self-host every Google font the app uses.

For each family/weight/style the code asks for:
  1. read Google's modern CSS to learn the exact unicode-range of each subset (latin, latin-ext, ...);
  2. download Google's complete font file for that weight (served whole to an old browser UA);
  3. cut it down to latin + latin-ext (+ any extra subset the code requests, e.g. devanagari)
     and save it as woff2.
One file per weight/style, no unicode-range needed — so next/font/local can serve it.

usage (needs `pip install fonttools brotli`):
  python3 scripts/self-host-fonts.py fonts.json assets/fonts manifest.json

fonts.json lists the calls to cover, e.g.
  [{"fam": "Caveat", "opts": "{ subsets: [\"latin\"], weight: [\"400\", \"700\"] }"}]
then point the new localFont() call's `src` at the written files (see any existing call).
"""
import json, re, sys, os, io, urllib.request, urllib.parse
from fontTools.ttLib import TTFont
from fontTools import subset

INV, OUT, MANIFEST = sys.argv[1], sys.argv[2], sys.argv[3]
MODERN = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
OLD = "Mozilla/5.0 (Windows NT 6.1; rv:38.0) Gecko/20100101 Firefox/38.0"
os.makedirs(OUT, exist_ok=True)


def get(url, ua):
    req = urllib.request.Request(url, headers={"User-Agent": ua})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def as_list(m):
    if not m:
        return None
    v = m.group(1).strip()
    return re.findall(r'"([^"]+)"', v) if v.startswith("[") else [v.strip('"')]


calls = [c for c in json.load(open(INV)) if c["fam"] != "?"]
need = {}  # family -> {"combos": set((weight, style)), "subsets": set(), "variable": bool}
for c in calls:
    o = c["opts"]
    weights = as_list(re.search(r"weight:\s*(\[[^\]]*\]|\"[^\"]*\")", o))
    styles = as_list(re.search(r"style:\s*(\[[^\]]*\]|\"[^\"]*\")", o)) or ["normal"]
    subsets = as_list(re.search(r"subsets:\s*(\[[^\]]*\])", o)) or ["latin"]
    n = need.setdefault(c["fam"], {"combos": set(), "subsets": set(), "variable": False})
    n["subsets"].update(subsets)
    if weights is None:
        n["variable"] = True
        weights = ["variable"]
    for w in weights:
        for s in styles:
            n["combos"].add((w, s))

manifest = {}
total = 0
for fam, n in sorted(need.items()):
    name = fam.replace("_", " ")
    slug = fam.lower().replace("_", "-")
    combos = sorted(n["combos"])
    has_italic = any(s == "italic" for _, s in combos)
    if n["variable"]:
        # The one variable call asks for the whole weight axis (next/font/google's default for no weight).
        q = "wght@200..800"
    elif has_italic:
        q = "ital,wght@" + ";".join(sorted({f"{1 if s == 'italic' else 0},{w}" for w, s in combos}))
    else:
        q = "wght@" + ";".join(sorted({w for w, _ in combos}, key=int))
    url = f"https://fonts.googleapis.com/css2?family={urllib.parse.quote(name)}:{q}&display=swap"

    # 1. subset ranges from the modern CSS
    css = get(url, MODERN).decode()
    ranges = {}
    for sub, block in re.findall(r"/\*\s*([\w-]+)\s*\*/\s*@font-face\s*\{([^}]*)\}", css):
        ur = re.search(r"unicode-range:\s*([^;]+);", block)
        if ur:
            ranges.setdefault(sub, set()).update(x.strip() for x in ur.group(1).split(","))
    # Exactly the subsets the code asks for (what pages preload today), plus the rupee sign:
    # prices are written in these fonts and U+20B9 lives in latin-ext, which would otherwise
    # double every file for glyphs this site's visitors almost never type.
    keep = set(n["subsets"])
    unicodes = sorted(set().union(*(ranges.get(s, set()) for s in keep)) | {"U+20B9"})
    missing = [s for s in keep if s not in ranges]

    # 2. whole files from the old-UA CSS
    old = get(url, OLD).decode()
    faces = re.findall(r"@font-face\s*\{([^}]*)\}", old)
    manifest[fam] = {"slug": slug, "files": []}
    for f in faces:
        style = re.search(r"font-style:\s*(\w+)", f).group(1)
        weight = re.search(r"font-weight:\s*([\d ]+);", f).group(1).strip()
        src = re.search(r"url\(([^)]+)\)", f).group(1)
        raw = get(src, OLD)
        font = TTFont(io.BytesIO(raw))
        is_var = "fvar" in font
        # 3. subset to the kept ranges, woff2
        opts = subset.Options()
        opts.flavor = "woff2"
        opts.layout_features = ["*"]
        opts.name_IDs = ["*"]
        opts.notdef_outline = True
        opts.glyph_names = False
        opts.hinting = False  # Google serves modern browsers unhinted files; hints only bloat them
        opts.desubroutinize = True
        sub = subset.Subsetter(opts)
        sub.populate(unicodes=subset.parse_unicodes(",".join(u.replace("U+", "") for u in unicodes)))
        sub.subset(font)
        wtag = weight.replace(" ", "-")
        fname = f"{slug}-{wtag}-{style}.woff2"
        buf = io.BytesIO()
        font.flavor = "woff2"
        font.save(buf)
        data = buf.getvalue()
        open(os.path.join(OUT, fname), "wb").write(data)
        total += len(data)
        manifest[fam]["files"].append({"file": fname, "weight": weight, "style": style, "bytes": len(data), "variable": is_var, "src_bytes": len(raw)})
    got = {(x["weight"], x["style"]) for x in manifest[fam]["files"]}
    print(f"{fam:24s} faces {len(faces):2d} kept {sorted(keep)} missing-subsets {missing} var={n['variable']} "
          f"files {[(x['weight'], x['style'], x['bytes']//1024) for x in manifest[fam]['files']]}")

json.dump(manifest, open(MANIFEST, "w"), indent=1)
print("TOTAL KB", total // 1024, "families", len(manifest))
