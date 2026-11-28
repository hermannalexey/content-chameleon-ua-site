#!/usr/bin/env python3
"""Writes the menu and footer from js/main.js straight into every page's HTML.

js/main.js stays the single source of the NAV and FOOTER templates. This script copies
them into <div id="site-header"> and <div id="site-footer"> so the links are in the raw
HTML that search and AI crawlers read without running JavaScript. main.js only injects
when a placeholder is still empty, so pages look the same either way.

Run after editing the menu or footer in js/main.js, or after adding a page:
    python3 _setup/render-chrome.py          # rewrite pages
    python3 _setup/render-chrome.py --check  # exit 1 if any page is out of date
"""
import pathlib, re, sys

root = pathlib.Path(__file__).resolve().parent.parent
js = (root / "js/main.js").read_text(encoding="utf-8")

def template(name):
    m = re.search(r"const " + name + r" = \(b\) => `\n(.*?)`;", js, re.S)
    if not m:
        sys.exit(f"ERROR: {name} template not found in js/main.js")
    return m.group(1)

NAV, FOOTER = template("NAV"), template("FOOTER")

def fill(tpl, b):
    out = tpl.replace("${b || './'}", b or "./").replace("${b}", b)
    if "${" in out:
        sys.exit("ERROR: unhandled template expression: " + re.search(r"\$\{[^}]*\}", out).group(0))
    return out

def slot(div_id, inner):
    return f'<div id="{div_id}"><!-- rendered from js/main.js by _setup/render-chrome.py -->\n{inner}\n</div>'

check = "--check" in sys.argv
stale, done = [], 0
for page in sorted(root.rglob("*.html")):
    rel = page.relative_to(root)
    if rel.parts[0].startswith((".", "_")) or rel.parts[0] == "node_modules":
        continue
    s = page.read_text(encoding="utf-8")
    if 'id="site-header"' not in s:
        continue  # link-only pages (e.g. algorytmy/) have no shared menu
    m = re.search(r"window\.BASE_PATH = '([^']*)'", s)
    if not m:
        sys.exit(f"ERROR: {rel} has a menu placeholder but no BASE_PATH")
    b = m.group(1)
    new = s
    for div_id, tpl in (("site-header", NAV), ("site-footer", FOOTER)):
        pat = re.compile(r'<div id="' + div_id + r'">(?:<!-- rendered from js/main\.js.*?-->\n.*?\n)?</div>', re.S)
        if len(pat.findall(new)) != 1:
            sys.exit(f"ERROR: {rel}: expected exactly one #{div_id} placeholder")
        new = pat.sub(lambda _: slot(div_id, fill(tpl, b)), new)
    if new != s:
        stale.append(str(rel))
        if not check:
            page.write_text(new, encoding="utf-8")
    done += 1

if check:
    if stale:
        print("Out of date:", *stale, sep="\n  ")
        sys.exit(1)
    print(f"OK: menu and footer up to date on {done} pages")
else:
    print(f"Rendered menu and footer on {done} pages ({len(stale)} changed)")
