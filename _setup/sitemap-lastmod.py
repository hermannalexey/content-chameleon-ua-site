#!/usr/bin/env python3
"""Writes <lastmod> into sitemap.xml from git: the date of the last commit that touched
each page, or today for pages with uncommitted changes. Run before committing page edits:
    python3 _setup/sitemap-lastmod.py
"""
import datetime, pathlib, re, subprocess
root = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://www.content-chameleon.com/"
today = datetime.date.today().isoformat()
def git(*a): return subprocess.run(["git", *a], cwd=root, capture_output=True, text=True).stdout.strip()
def file_for(url):
    path = url[len(BASE):]
    return path + "index.html" if path == "" or path.endswith("/") else path
def date_for(f):
    if git("status", "--porcelain", "--", f): return today
    return git("log", "-1", "--format=%cs", "--", f) or today
sm = root / "sitemap.xml"
s = re.sub(r"\n\s*<lastmod>[^<]*</lastmod>", "", sm.read_text(encoding="utf-8"))
def add(m):
    f = file_for(m.group(2))
    assert (root / f).exists(), f
    return f"{m.group(1)}\n    <lastmod>{date_for(f)}</lastmod>"
s, n = re.subn(r"(<loc>(.*?)</loc>)", add, s)
sm.write_text(s, encoding="utf-8")
print(f"lastmod written for {n} URLs")
