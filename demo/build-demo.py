#!/usr/bin/env python3
"""Build JASMARTA-demo.html — the whole React app in one offline file.

Steps:
  1. `vite build --config vite.config.demo.js`  (aliases services/api → offline mock)
  2. inline the emitted JS + CSS into a single HTML document
  3. write JASMARTA-demo.html next to this repo

    python3 demo/build-demo.py
"""
import pathlib
import re
import shutil
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
WEB = HERE.parent / "web"
DIST = WEB / "dist-demo"
OUT_CANDIDATES = [HERE.parent.parent / "JASMARTA-demo.html", HERE.parent / "JASMARTA-demo.html"]


def build() -> pathlib.Path:
    print("▸ building demo bundle…")
    subprocess.run(
        ["npx", "vite", "build", "--config", "vite.config.demo.js"],
        cwd=WEB, check=True, capture_output=True, text=True,
    )
    html_files = sorted(DIST.glob("*.html"))
    if not html_files:
        sys.exit("no HTML emitted — build failed")
    return html_files[0]


def inline(entry: pathlib.Path) -> str:
    html = entry.read_text(encoding="utf-8")

    # --- stylesheets -------------------------------------------------------
    for link in re.findall(r'<link[^>]+rel="stylesheet"[^>]*>', html):
        m = re.search(r'href="([^"]+)"', link)
        if not m:
            continue
        css_path = (entry.parent / m.group(1)).resolve()
        if css_path.exists():
            css = css_path.read_text(encoding="utf-8")
            html = html.replace(link, f"<style>\n{css}\n</style>")

    # --- module scripts ----------------------------------------------------
    for script in re.findall(r'<script[^>]+src="[^"]+"[^>]*></script>', html):
        m = re.search(r'src="([^"]+)"', script)
        if not m:
            continue
        js_path = (entry.parent / m.group(1)).resolve()
        if not js_path.exists():
            continue
        js = js_path.read_text(encoding="utf-8")
        # avoid premature </script> termination inside the bundle
        js = js.replace("</script>", "<\\/script>")
        html = html.replace(script, f'<script type="module">\n{js}\n</script>')

    return html


def main() -> None:
    entry = build()
    html = inline(entry)

    leftovers = re.findall(r'(?:src|href)="(?!data:|https?:|#)([^"]+)"', html)
    if leftovers:
        print(f"  note: {len(leftovers)} unresolved relative asset(s): {sorted(set(leftovers))[:5]}")

    for out in OUT_CANDIDATES:
        try:
            out.write_text(html, encoding="utf-8")
            print(f"✓ wrote {out}  ({out.stat().st_size/1024:,.0f} KB)")
            break
        except OSError:
            continue

    shutil.rmtree(DIST, ignore_errors=True)


if __name__ == "__main__":
    main()
