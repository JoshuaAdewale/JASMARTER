#!/usr/bin/env python3
"""Render JASMARTA-ui-preview.html into PNG/JPEG screenshots.

    python3 preview/screens.py

Writes into preview/screens/ :
  web-*.jpg       one shot per web screen (browser frame)
  mobile-*.jpg    one shot per phone screen, plus mobile-row-a/b.jpg contact sheets
  section-*.jpg   page sections (hero intro, API & stack)
  full-page.jpg   the entire walkthrough, scaled
"""
import pathlib
import subprocess

from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent
SRC = (HERE / "JASMARTA-ui-preview.html").as_uri()
OUT = HERE / "screens"
OUT.mkdir(exist_ok=True)

VIEWPORT = {"width": 1440, "height": 1000}


def shot_el(el, name, *, scale_to=1500):
    png = OUT / f"{name}.png"
    el.screenshot(path=str(png))
    jpg = OUT / f"{name}.jpg"
    subprocess.run(
        ["convert", str(png), "-strip", "-resize", f"{scale_to}x>", "-quality", "87", str(jpg)],
        check=True,
    )
    png.unlink()
    return jpg


def shot(page, selector, name, *, scale_to=1500):
    el = page.query_selector(selector)
    if el is None:
        raise SystemExit(f"selector not found: {selector}")
    return shot_el(el, name, scale_to=scale_to)


def main() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport=VIEWPORT, device_scale_factor=2)
        page.goto(SRC)
        page.wait_for_timeout(600)
        # kill the sticky bar so it never overlays element shots
        page.add_style_tag(content=".topbar{position:static !important}")

        # ---- page sections -------------------------------------------------
        shot(page, ".intro", "section-hero", scale_to=1400)
        shot(page, "#system", "section-system", scale_to=1400)

        # ---- web screens (browser frames) ---------------------------------
        frames = page.query_selector_all(".frame")
        names = [
            "web-1-landing",
            "web-2-browse",
            "web-3-property-detail",
            "web-4-dashboard",
            "web-5-my-properties",
            "web-6-my-leases",
            "web-7-maintenance",
            "web-8-admin",
            "web-9-login",
        ]
        assert len(frames) == len(names), f"expected {len(names)} frames, found {len(frames)}"
        for el, name in zip(frames, names):
            shot_el(el, name, scale_to=1500)

        # ---- mobile screens ------------------------------------------------
        wraps = page.query_selector_all(".phone-wrap")
        mob = [
            "mobile-1-login",
            "mobile-2-home",
            "mobile-3-browse",
            "mobile-4-property-detail",
            "mobile-5-leases",
            "mobile-6-maintenance",
            "mobile-7-profile",
        ]
        assert len(wraps) == len(mob), f"expected {len(mob)} phones, found {len(wraps)}"
        for el, name in zip(wraps, mob):
            shot_el(el, name, scale_to=660)

        # ---- mobile contact sheets ----------------------------------------
        for label, group in (("a", mob[:4]), ("b", mob[4:])):
            subprocess.run(
                ["convert", *(str(OUT / f"{m}.jpg") for m in group), "+append",
                 "-strip", "-resize", "1600x>", "-quality", "88", str(OUT / f"mobile-row-{label}.jpg")],
                check=True,
            )

        # ---- whole page ----------------------------------------------------
        full = OUT / "full-page.png"
        page.screenshot(path=str(full), full_page=True)
        subprocess.run(
            ["convert", str(full), "-strip", "-resize", "1000x>", "-quality", "84",
             str(OUT / "full-page.jpg")],
            check=True,
        )
        full.unlink()

        browser.close()

    files = sorted(OUT.glob("*.jpg"))
    for f in files:
        print(f"{f.name:32} {f.stat().st_size/1024:8,.0f} KB")
    print(f"\n{len(files)} screenshots -> {OUT}")


if __name__ == "__main__":
    main()
