#!/usr/bin/env python3
"""Screenshot the LIVE JASMARTA web app (Vite dev server + Express API + MongoDB).

Assumes:
  - API on http://localhost:5000  (seeded)
  - Web on http://localhost:5173

Writes JPGs into live/screens/ and a health report into live/console.log.
"""
import pathlib
import subprocess
import sys

from playwright.sync_api import sync_playwright

BASE = "http://localhost:5173"
API = "http://localhost:5000/api"
HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / "screens"
OUT.mkdir(parents=True, exist_ok=True)

report: list[str] = []
console_errors: list[str] = []
failed_requests: list[str] = []


def shot(page, name, *, scale_to=1500, full=True):
    png = OUT / f"{name}.png"
    page.screenshot(path=str(png), full_page=full)
    jpg = OUT / f"{name}.jpg"
    subprocess.run(
        ["convert", str(png), "-strip", "-resize", f"{scale_to}x>", "-quality", "88", str(jpg)],
        check=True,
    )
    png.unlink()
    print(f"  ✓ {name}.jpg")


def settle(page, ms=900):
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(ms)


def login(page, email):
    page.goto(f"{BASE}/login")
    settle(page)
    page.fill('input[type="email"]', email)
    page.fill('input[type="password"]', "password")
    page.click('button:has-text("Sign in")')
    page.wait_for_url("**/dashboard", timeout=15000)
    settle(page)


def logout(page):
    """Click the navbar Logout button.

    `force=True` ignores hit-target checks — react-hot-toast renders a fixed
    overlay at top-right that can sit on top of the button.
    """
    dismiss_toasts(page)
    page.locator('button:has-text("Logout")').first.click(force=True, timeout=15000)
    page.wait_for_timeout(700)


def dismiss_toasts(page):
    page.evaluate(
        """() => {
            document.querySelectorAll('[role="status"], [aria-live]').forEach((n) => {
                if (n.className && String(n.className).includes('toast')) n.remove();
            });
        }"""
    )


def spa_goto(page, path, ms=1100):
    """Client-side navigation.

    A hard page load would reset the Redux store; the app keeps `user` in memory
    only (the token is in localStorage but there's no rehydrate-on-boot thunk yet),
    so the navbar would fall back to the signed-out state.
    """
    page.evaluate(
        """(p) => { history.pushState({}, '', p); window.dispatchEvent(new PopStateEvent('popstate')); }""",
        path,
    )
    settle(page, ms)


def main() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1440, "height": 1000}, device_scale_factor=2)
        page = ctx.new_page()
        page.on("console", lambda m: console_errors.append(f"{m.type}: {m.text}") if m.type == "error" else None)
        page.on("requestfailed", lambda r: failed_requests.append(f"{r.url} — {r.failure}"))

        # ---------- public ----------
        print("Public pages")
        page.goto(BASE)
        settle(page, 1200)
        shot(page, "live-01-landing")

        page.goto(f"{BASE}/properties")
        settle(page, 1200)
        shot(page, "live-02-browse")

        cards = page.query_selector_all('a[href^="/properties/"]')
        report.append(f"property cards rendered on /properties: {len(cards)}")
        if cards:
            cards[0].click()
            settle(page, 1400)
            shot(page, "live-03-property-detail")
            report.append(f"detail url: {page.url}")

        page.goto(f"{BASE}/login")
        settle(page)
        shot(page, "live-04-login")

        page.goto(f"{BASE}/register")
        settle(page)
        shot(page, "live-05-register")

        # ---------- owner journey ----------
        print("Owner journey")
        login(page, "owner@jasmarta.app")
        shot(page, "live-06-owner-dashboard")

        page.click('a:has-text("My Properties")')
        settle(page, 1100)
        shot(page, "live-07-owner-properties")

        page.click('a:has-text("My Leases")')
        settle(page, 1100)
        shot(page, "live-08-owner-leases")

        page.click('a:has-text("Maintenance")')
        settle(page, 1100)
        shot(page, "live-09-owner-maintenance")

        # ---------- admin journey ----------
        print("Admin journey")
        logout(page)
        login(page, "admin@jasmarta.app")
        page.click('a:has-text("Admin")')
        settle(page, 1400)
        shot(page, "live-10-admin")

        # ---------- tenant journey (mobile-sized viewport) ----------
        print("Tenant journey (responsive)")
        logout(page)
        mob = browser.new_context(viewport={"width": 414, "height": 896}, device_scale_factor=3)
        mp = mob.new_page()
        mp.on("console", lambda m: console_errors.append(f"[mobile] {m.type}: {m.text}") if m.type == "error" else None)
        login(mp, "tenant@jasmarta.app")
        shot(mp, "live-11-mobile-dashboard", scale_to=760, full=False)
        spa_goto(mp, "/properties", ms=1400)
        shot(mp, "live-12-mobile-browse", scale_to=760)
        mcards = mp.query_selector_all('a[href^="/properties/"]')
        if mcards:
            mcards[0].click()
            settle(mp, 1400)
            shot(mp, "live-14-mobile-property", scale_to=760)

        # public mobile landing in a clean context
        pub = browser.new_context(viewport={"width": 414, "height": 896}, device_scale_factor=3)
        pp = pub.new_page()
        pp.goto(BASE)
        settle(pp, 1200)
        shot(pp, "live-13-mobile-landing", scale_to=760)

        browser.close()

    (HERE / "console.log").write_text(
        "\n".join(
            [
                "=== JASMARTA live capture report ===",
                *report,
                "",
                f"console errors: {len(console_errors)}",
                *console_errors[:25],
                "",
                f"failed requests: {len(failed_requests)}",
                *failed_requests[:25],
                "",
            ]
        ),
        encoding="utf-8",
    )
    print(f"\nreport -> {HERE/'console.log'}")


if __name__ == "__main__":
    sys.exit(main())
