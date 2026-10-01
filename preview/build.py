#!/usr/bin/env python3
"""Build the JASMARTA single-file UI preview.

Inlines the demo photos as base64 data URIs so the preview renders inside
sandboxed iframes (no network access) as well as offline in any browser.

    python3 preview/build.py
"""
import base64
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
OUT = HERE / "JASMARTA-ui-preview.html"

IMAGES = {
    "__HERO__": HERE / "assets" / "hero.jpg",
    "__LEKKI__": HERE / "assets" / "lekki.jpg",
    "__BROOKLYN__": HERE / "assets" / "brooklyn.jpg",
}


def data_uri(path: pathlib.Path) -> str:
    return "data:image/jpeg;base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def main() -> None:
    html = (HERE / "preview.template.html").read_text(encoding="utf-8")
    for token, path in IMAGES.items():
        assert token in html, f"missing token {token}"
        html = html.replace(token, data_uri(path))
    OUT.write_text(html, encoding="utf-8")
    size = OUT.stat().st_size / 1024
    print(f"wrote {OUT.relative_to(ROOT)}  ({size:,.0f} KB)")


if __name__ == "__main__":
    main()
