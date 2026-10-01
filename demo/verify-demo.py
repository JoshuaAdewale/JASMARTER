#!/usr/bin/env python3
"""Verify JASMARTA-demo.html — standalone AND inside a sandboxed iframe.

The second pass mirrors the workspace preview exactly: sandbox="allow-scripts"
(opaque origin → localStorage throws), served via about:srcdoc (→ HashRouter's
`new URL()` would throw), with the network disabled.

Everything is driven by clicking the real UI, so a pass means the demo is
genuinely usable, not just rendering.

    python3 demo/verify-demo.py
"""
import html
import pathlib
import subprocess
import sys

from playwright.sync_api import sync_playwright

DEMO = pathlib.Path("/home/user/JASMARTA-demo.html")
HERE = pathlib.Path(__file__).resolve().parent
SHOTS = HERE / "screens"
SHOTS.mkdir(exist_ok=True)
WRAPPER = HERE / "_sandbox_wrapper.html"

results: list[tuple[str, bool, str]] = []


def check(name, ok, detail=""):
    results.append((name, bool(ok), str(detail)[:200]))
    print(f"  {'PASS' if ok else 'FAIL'}  {name}" + (f"  — {str(detail)[:110]}" if not ok else ""))


def shot(page, name, scale="1400"):
    png = SHOTS / f"{name}.png"
    page.screenshot(path=str(png), full_page=False)
    subprocess.run(["convert", str(png), "-strip", "-resize", f"{scale}x>", "-quality", "88",
                    str(SHOTS / f"{name}.jpg")], check=True)
    png.unlink()


def dismiss_toasts(ui):
    """Toasts are fixed at the top-right, directly over the navbar buttons."""
    ui.evaluate("""() => {
        document.querySelectorAll('[role="status"], [aria-live]').forEach((n) => {
            if (n.className && String(n.className).includes('toast')) n.remove();
        });
    }""")


def pause(ui, ms=900):
    ui.wait_for_timeout(ms)


def reset_state(page, get_ui):
    """Fresh demo data + signed-out app.

    Reloads the page (a Frame has no reload) and re-acquires the UI handle, since
    reloading a wrapper page rebuilds its iframe.
    """
    get_ui().evaluate("try{localStorage.clear()}catch(e){}")
    page.reload()
    page.wait_for_timeout(900)
    ui = get_ui()
    ui.wait_for_selector("text=Your Property, Managed", timeout=25000)
    pause(ui, 500)
    return ui


def login(ui, email):
    ui.locator('header a:has-text("Sign in")').first.click(force=True)
    pause(ui)
    ui.fill('input[type="email"]', email)
    ui.fill('input[type="password"]', "password")
    ui.locator('button:has-text("Sign in")').first.click()
    pause(ui, 1500)


def logout(ui):
    dismiss_toasts(ui)
    pause(ui, 200)
    ui.locator('header button:has-text("Logout")').first.click(force=True)
    pause(ui, 700)


def nav(ui, label, ms=1200):
    dismiss_toasts(ui)
    ui.locator(f'header a:has-text("{label}")').first.click(force=True)
    pause(ui, ms)


def journey(page, ui, get_ui, label):
    """ui is a Page (standalone) or a Frame (iframe) — same API for clicks/fills."""
    errors: list[str] = []
    page.on("console", lambda m: errors.append(f"{m.type}: {m.text}") if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))

    # ── 1 · landing ───────────────────────────────────────────────────────
    ui.wait_for_selector("text=Your Property, Managed", timeout=25000)
    ui = reset_state(page, get_ui)
    check(f"[{label}] landing renders", True)
    shot(page, f"demo-{label}-1-landing")

    # ── 2 · browse ────────────────────────────────────────────────────────
    nav(ui, "Browse")
    cards = ui.locator('a[href*="/properties/"]').count()
    check(f"[{label}] browse lists seeded properties", cards >= 2, f"{cards} cards")
    shot(page, f"demo-{label}-2-browse")

    # ── 3 · tenant signs in ───────────────────────────────────────────────
    login(ui, "tenant@jasmarta.app")
    body = ui.inner_text("body")
    check(f"[{label}] tenant signs in", "Tunde" in body or "Welcome" in body, body[:90])
    shot(page, f"demo-{label}-3-tenant-dashboard")

    # ── 4 · tenant applies for a lease ────────────────────────────────────
    nav(ui, "Browse")
    # the seeded tenant already has a pending application on the Brooklyn studio
    ui.locator('a[href*="p_lekki"]').first.click()
    pause(ui, 1000)
    ui.locator('button:has-text("Submit application")').first.click()
    pause(ui, 1300)
    toasts = ui.eval_on_selector_all('[role="status"], [aria-live]', "els => els.map(e => e.textContent.trim())")
    check(f"[{label}] tenant applies for a lease", any("submitted" in t.lower() for t in toasts), toasts)
    shot(page, f"demo-{label}-4-applied")

    # ── 5 · application shows in My Leases ────────────────────────────────
    nav(ui, "My Leases")
    body = ui.inner_text("body")
    check(f"[{label}] application appears in My Leases",
          "Modern 2BR Apartment" in body and "pending" in body.lower(), body[:90])

    # ── 6 · owner approves ────────────────────────────────────────────────
    logout(ui)
    ui = reset_state(page, get_ui)   # clears the tenant session (keeps demo data)
    ui.evaluate("try{localStorage.removeItem('jasmarta_token')}catch(e){}")
    login(ui, "owner@jasmarta.app")
    nav(ui, "My Leases")
    has_approve = ui.locator('button:has-text("Approve")').count() > 0
    check(f"[{label}] owner sees pending applications", has_approve)
    shot(page, f"demo-{label}-5-owner-leases")
    if has_approve:
        ui.locator('button:has-text("Approve")').first.click()
        pause(ui, 1400)
        body = ui.inner_text("body")
        check(f"[{label}] owner approves a lease", "active" in body.lower(), body[:90])
        shot(page, f"demo-{label}-6-approved")

    # ── 7 · owner property management ─────────────────────────────────────
    nav(ui, "My Properties", ms=1600)
    body = ui.inner_text("body")
    ok_crud = "Add a new property" in body or "My listings" in body
    check(f"[{label}] owner property CRUD screen", ok_crud, f"len={len(body)} {body[:90]!r}")
    if not ok_crud:
        page.screenshot(path=str(SHOTS / f"{label}-debug-crud.png"), full_page=False)
    shot(page, f"demo-{label}-7-owner-properties")

    # ── 8 · admin dashboard ───────────────────────────────────────────────
    logout(ui)
    ui = reset_state(page, get_ui)
    login(ui, "admin@jasmarta.app")
    nav(ui, "Admin")
    body = ui.inner_text("body")
    check(f"[{label}] admin dashboard renders", "Admin dashboard" in body, body[:90])
    shot(page, f"demo-{label}-8-admin")

    # ── 9 · console hygiene ───────────────────────────────────────────────
    real = [e for e in errors
            if "favicon" not in e.lower() and "ERR_INTERNET_DISCONNECTED" not in e and "ERR_CONNECTION" not in e]
    check(f"[{label}] no console errors", len(real) == 0, real[:3])


def get_frame(page, timeout_ms=10000):
    """The app frame inside the sandbox wrapper (re-acquired after reloads)."""
    waited = 0
    while len(page.frames) < 2 and waited < timeout_ms:
        page.wait_for_timeout(250)
        waited += 250
    return page.frames[1]


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()

        print("\n1 · Standalone file — network disabled")
        ctx = browser.new_context(viewport={"width": 1440, "height": 950}, device_scale_factor=2, offline=True)
        page = ctx.new_page()
        page.goto(DEMO.as_uri())
        journey(page, page, lambda: page, "solo")
        ctx.close()

        print("\n2 · Sandboxed iframe (allow-scripts · about:srcdoc · offline)")
        raw = DEMO.read_text(encoding="utf-8")
        WRAPPER.write_text(
            '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;height:100%;'
            'background:#eef2f7}iframe{border:0;width:100vw;height:100vh;display:block}</style></head><body>'
            f'<iframe sandbox="allow-scripts" srcdoc="{html.escape(raw, quote=True)}"></iframe></body></html>',
            encoding="utf-8",
        )
        ctx2 = browser.new_context(viewport={"width": 1440, "height": 950}, device_scale_factor=2, offline=True)
        page2 = ctx2.new_page()
        page2.goto(WRAPPER.as_uri())
        frame = get_frame(page2) if len(page2.frames) > 1 else None
        if frame is None:
            check("[iframe] frame attached", False, f"frames={len(page2.frames)}")
        else:
            try:
                journey(page2, frame, lambda: get_frame(page2), "iframe")
                # re-acquire: the journey reloads the page, rebuilding the iframe
                live = get_frame(page2)
                check("[iframe] memory-storage shim engaged",
                      live.evaluate("!!window.__JASMARTA_MEMORY_STORAGE__"))
                check("[iframe] form-bridge shim present",
                      live.evaluate("!!document.querySelector('script')"))
            except Exception as exc:  # noqa: BLE001
                check("[iframe] journey completed", False, f"{type(exc).__name__}: {exc}")
                page2.screenshot(path=str(SHOTS / "iframe-failure.png"))
        ctx2.close()
        browser.close()

    WRAPPER.unlink(missing_ok=True)

    passed = sum(1 for _, ok, _ in results if ok)
    print(f"\n{'='*60}\n  {passed}/{len(results)} checks passed\n{'='*60}")
    for name, ok, detail in results:
        if not ok:
            print(f"  ✗ {name} — {detail}")
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    sys.exit(main())
