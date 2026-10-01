#!/usr/bin/env python3
"""JASMARTA end-to-end API test suite.

Exercises every route against a live, seeded API and prints a PASS/FAIL table.
No dependencies — stdlib only.

    python3 live/api-e2e.py            # expects API on :5000
    API=http://localhost:5000/api python3 live/api-e2e.py
"""
import json
import os
import sys
import urllib.error
import urllib.request

API = os.environ.get("API", "http://localhost:5000/api")
results: list[tuple[str, bool, str]] = []
ctx: dict[str, str] = {}


def call(method, path, body=None, token=None, raw=False):
    url = f"{API}{path}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            payload = r.read().decode()
            return r.status, (payload if raw else (json.loads(payload) if payload else None))
    except urllib.error.HTTPError as e:
        payload = e.read().decode()
        try:
            return e.code, json.loads(payload) if payload else None
        except json.JSONDecodeError:
            return e.code, payload
    except Exception as e:  # connection refused etc.
        return 0, {"error": str(e)}


def check(name, condition, detail=""):
    results.append((name, bool(condition), detail))
    print(f"  {'PASS' if condition else 'FAIL'}  {name}" + (f"  — {detail}" if detail and not condition else ""))


# ───────────────────────────── public ─────────────────────────────
print("\nPublic endpoints")
s, r = call("GET", "/health")
check("GET /health returns ok", s == 200 and r.get("status") == "ok", f"{s} {r}")

s, r = call("POST", "/auth/register", {
    "firstName": "Test", "lastName": "Owner", "email": "e2e.owner@jasmarta.app",
    "password": "secret123", "role": "owner",
})
if s == 409:  # already registered from a previous run
    s, r = call("POST", "/auth/login", {"email": "e2e.owner@jasmarta.app", "password": "secret123"})
check("POST /auth/register issues a JWT", s in (200, 201) and "token" in (r or {}), f"{s} {r}")
ctx["owner_token"] = (r or {}).get("token", "")
ctx["owner_id"] = (r or {}).get("user", {}).get("_id", "")

s, r = call("POST", "/auth/register", {"firstName": "X", "lastName": "Y", "email": "bad-email", "password": "123"})
check("register rejects bad payload (400)", s == 400, f"{s} {r}")

s, r = call("POST", "/auth/register", {
    "firstName": "Test", "lastName": "Tenant", "email": "e2e.tenant@jasmarta.app",
    "password": "secret123", "role": "tenant",
})
if s == 409:
    s, r = call("POST", "/auth/login", {"email": "e2e.tenant@jasmarta.app", "password": "secret123"})
check("tenant account available", s in (200, 201) and "token" in (r or {}), f"{s} {r}")
ctx["tenant_token"] = (r or {}).get("token", "")

s, r = call("POST", "/auth/login", {"email": "admin@jasmarta.app", "password": "password"})
check("POST /auth/login (seeded admin)", s == 200 and "token" in (r or {}), f"{s} {r}")
ctx["admin_token"] = (r or {}).get("token", "")

s, r = call("POST", "/auth/login", {"email": "admin@jasmarta.app", "password": "wrong"})
check("login rejects wrong password (401)", s == 401, f"{s} {r}")

s, r = call("GET", "/auth/me", token=ctx["owner_token"])
check("GET /auth/me with token", s == 200 and r.get("user", {}).get("email") == "e2e.owner@jasmarta.app", f"{s} {r}")

s, r = call("GET", "/auth/me")
check("GET /auth/me without token → 401", s == 401, f"{s} {r}")

s, r = call("GET", "/properties")
check("GET /properties lists seeded listings", s == 200 and len(r) >= 2, f"{s} {r}")
ctx["seed_property"] = next((p["_id"] for p in r if p["status"] == "available"), "")

s, r = call("GET", "/properties?city=Lagos")
check("filter ?city=Lagos", s == 200 and len(r) == 1 and "Lekki" in r[0]["title"], f"{s} {r}")

s, r = call("GET", "/properties?minRent=2000")
check("filter ?minRent=2000", s == 200 and all(p["rentAmount"] >= 2000 for p in r) and len(r) >= 1, f"{s} {r}")

s, r = call("GET", f"/properties/{ctx['seed_property']}")
check("GET /properties/:id", s == 200 and r.get("_id") == ctx["seed_property"], f"{s} {r}")

s, r = call("GET", "/does-not-exist")
check("unknown route → JSON 404", s == 404, f"{s} {r}")

# ───────────────────────────── owner CRUD ─────────────────────────────
print("\nProperty management (owner)")
new_prop = {
    "title": "E2E Test Duplex", "description": "Created by the automated test suite.",
    "propertyType": "house", "rentAmount": 1234, "currency": "USD",
    "address": {"street": "1 Test Way", "city": "Abuja", "state": "FCT", "country": "Nigeria", "postalCode": "900001"},
    "bedrooms": 3, "bathrooms": 2, "sizeSqFt": 1200,
    "amenities": ["wifi", "parking"], "status": "available",
    "photos": ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200"],
}
s, r = call("POST", "/properties", new_prop, token=ctx["owner_token"])
check("POST /properties (owner) → 201", s == 201 and r.get("title") == "E2E Test Duplex", f"{s} {r}")
ctx["new_prop"] = (r or {}).get("_id", "")

s, r = call("GET", "/properties/mine/list", token=ctx["owner_token"])
check("GET /properties/mine/list shows it", s == 200 and any(p["_id"] == ctx["new_prop"] for p in r), f"{s} {r}")

s, r = call("PUT", f"/properties/{ctx['new_prop']}", {"rentAmount": 1500}, token=ctx["owner_token"])
check("PUT /properties/:id updates rent", s == 200 and r.get("rentAmount") == 1500, f"{s} {r}")

s, r = call("POST", "/properties", new_prop, token=ctx["tenant_token"])
check("tenant cannot create property → 403", s == 403, f"{s} {r}")

s, r = call("POST", "/properties", new_prop)
check("anonymous cannot create property → 401", s == 401, f"{s} {r}")

# ───────────────────────────── leasing ─────────────────────────────
print("\nLeasing system")
s, r = call("POST", f"/leases/apply/{ctx['new_prop']}",
            {"startDate": "2026-11-01", "endDate": "2027-10-31", "message": "E2E application"}, token=ctx["tenant_token"])
check("tenant applies for lease → 201", s == 201 and r.get("status") == "pending", f"{s} {r}")
ctx["lease"] = (r or {}).get("_id", "")

s, r = call("POST", f"/leases/apply/{ctx['new_prop']}", {"startDate": "2026-11-01"}, token=ctx["tenant_token"])
check("duplicate/again application handled", s in (200, 201, 400, 409), f"{s} {r}")

s, r = call("GET", "/leases/mine", token=ctx["owner_token"])
check("owner sees the application", s == 200 and any(l["_id"] == ctx["lease"] for l in r), f"{s} {r}")

s, r = call("GET", "/leases/mine", token=ctx["tenant_token"])
check("tenant sees their lease", s == 200 and len(r) >= 1, f"{s} {r}")

s, r = call("POST", f"/leases/{ctx['lease']}/decision", {"action": "approve"}, token=ctx["tenant_token"])
check("tenant cannot decide → 403", s == 403, f"{s} {r}")

s, r = call("POST", f"/leases/{ctx['lease']}/decision", {"action": "maybe"}, token=ctx["owner_token"])
check("invalid decision action → 400", s == 400, f"{s} {r}")

s, r = call("POST", f"/leases/{ctx['lease']}/decision", {"action": "approve"}, token=ctx["owner_token"])
check("owner approves lease", s == 200 and r.get("status") in ("approved", "active"), f"{s} {r}")

s, r = call("GET", f"/properties/{ctx['new_prop']}")
check("property flips to leased", s == 200 and r.get("status") == "leased", f"status={r.get('status') if isinstance(r, dict) else r}")

# ───────────────────────────── maintenance ─────────────────────────────
print("\nMaintenance tracking")
s, r = call("POST", f"/maintenance/{ctx['new_prop']}",
            {"title": "E2E leaking tap", "description": "Drips constantly.", "category": "plumbing", "priority": "high"},
            token=ctx["tenant_token"])
check("tenant reports issue → 201", s == 201 and r.get("status") == "open", f"{s} {r}")
ctx["maint"] = (r or {}).get("_id", "")

s, r = call("GET", "/maintenance", token=ctx["owner_token"])
check("owner sees the request", s == 200 and any(m["_id"] == ctx["maint"] for m in r), f"{s} {r}")

s, r = call("PUT", f"/maintenance/{ctx['maint']}", {"status": "in_progress"}, token=ctx["tenant_token"])
check("tenant cannot update status → 403", s == 403, f"{s} {r}")

s, r = call("PUT", f"/maintenance/{ctx['maint']}", {"status": "resolved"}, token=ctx["owner_token"])
check("owner resolves & resolvedAt stamped", s == 200 and r.get("status") == "resolved" and bool(r.get("resolvedAt")), f"{s} {r}")

# ───────────────────────────── payments ─────────────────────────────
print("\nPayments (Stripe)")
s, r = call("POST", "/payments/create-intent", {"leaseId": ctx["lease"], "amount": 1500}, token=ctx["tenant_token"])
check("create-intent responds with JSON error, no crash (dummy key)",
      s in (400, 401, 402, 500, 502) and isinstance(r, dict) and "error" in r, f"{s} {r}")

s, r = call("POST", "/payments/confirm", {"leaseId": ctx["lease"], "paymentIntentId": "pi_fake", "status": "succeeded"},
            token=ctx["tenant_token"])
check("confirm rejects unverified payment", s in (400, 402, 404, 500) or (s == 200 and r.get("payment", {}).get("status") != "succeeded"), f"{s} {r}")

s, r = call("POST", "/payments/webhook", {"type": "payment_intent.succeeded"}, raw=True)
check("webhook route reachable", s in (200, 400), f"{s} {r}")

# ───────────────────────────── admin ─────────────────────────────
print("\nAdmin panel")
s, r = call("GET", "/admin/dashboard", token=ctx["admin_token"])
check("admin dashboard counts", s == 200 and "counts" in r, f"{s} {str(r)[:160]}")

s, r = call("GET", "/admin/dashboard", token=ctx["tenant_token"])
check("tenant blocked from admin → 403", s == 403, f"{s} {r}")

s, r = call("GET", "/admin/transactions", token=ctx["admin_token"])
check("admin transactions list", s == 200 and isinstance(r, list), f"{s} {str(r)[:120]}")

s, r = call("GET", "/users", token=ctx["admin_token"])
check("admin lists users", s == 200 and len(r) >= 3, f"{s} {str(r)[:120]}")

s, r = call("GET", "/users", token=ctx["tenant_token"])
check("tenant blocked from user list → 403", s == 403, f"{s} {r}")

# ───────────────────────────── cleanup + summary ─────────────────────────────
s, r = call("DELETE", f"/properties/{ctx['new_prop']}", token=ctx["owner_token"])
check("owner deletes property", s in (200, 204), f"{s} {r}")

s, r = call("GET", f"/properties/{ctx['new_prop']}")
check("deleted property is gone → 404", s == 404, f"{s} {r}")

passed = sum(1 for _, ok, _ in results if ok)
print(f"\n{'='*62}\n  {passed}/{len(results)} checks passed\n{'='*62}")
if passed != len(results):
    print("Failures:")
    for name, ok, detail in results:
        if not ok:
            print(f"  ✗ {name} — {detail}")
sys.exit(0 if passed == len(results) else 1)
