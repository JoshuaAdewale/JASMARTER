#!/usr/bin/env bash
# Boot the full JASMARTA stack locally and (optionally) capture live screenshots.
#
#   ./live/run-live.sh              boot + capture
#   ./live/run-live.sh boot         boot only (servers stay up until you stop them)
#
# Requires: mongod on $PATH or at ~/.local/mongodb/bin/mongod, node deps installed.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MONGOD_BIN="${MONGOD_BIN:-$(command -v mongod || echo "$HOME/.local/mongodb/bin/mongod")}"
DBPATH="${DBPATH:-/tmp/mongo-data}"
MONGO_PORT="${MONGO_PORT:-27017}"
API_PORT="${API_PORT:-5000}"
WEB_PORT="${WEB_PORT:-5173}"
LOGS="${LOGS:-/tmp}"

log() { printf '\n\033[1;34m▸ %s\033[0m\n' "$*"; }

# ---------- 1 · MongoDB ----------
if ! (echo > /dev/tcp/127.0.0.1/$MONGO_PORT) 2>/dev/null; then
  log "starting mongod ($MONGOD_BIN)"
  mkdir -p "$DBPATH"
  "$MONGOD_BIN" --dbpath "$DBPATH" --port "$MONGO_PORT" --bind_ip 127.0.0.1 \
    --logpath "$LOGS/mongod.log" --fork --quiet >/dev/null
  for _ in $(seq 1 40); do (echo > /dev/tcp/127.0.0.1/$MONGO_PORT) 2>/dev/null && break; sleep 0.5; done
else
  log "mongod already listening on :$MONGO_PORT"
fi

# ---------- 2 · seed (must run from backend/ so dotenv finds backend/.env) ----------
log "seeding demo data"
(cd "$ROOT/backend" && node src/utils/seed.js | tail -6)

# ---------- 3 · API ----------
log "starting Express API on :$API_PORT"
(cd "$ROOT/backend" && setsid nohup node src/server.js > "$LOGS/api.log" 2>&1 < /dev/null &)
for _ in $(seq 1 40); do curl -sf "http://localhost:$API_PORT/api/health" >/dev/null 2>&1 && break; sleep 0.5; done
curl -sf "http://localhost:$API_PORT/api/health" && echo

# ---------- 4 · Web ----------
log "starting Vite dev server on :$WEB_PORT"
(cd "$ROOT/web" && setsid nohup npx vite --port "$WEB_PORT" --strictPort > "$LOGS/web.log" 2>&1 < /dev/null &)
for _ in $(seq 1 60); do curl -sf "http://localhost:$WEB_PORT" >/dev/null 2>&1 && break; sleep 0.5; done
echo "web: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:$WEB_PORT)"

# ---------- 5 · smoke test ----------
log "API smoke test"
TOKEN=$(curl -s -X POST "http://localhost:$API_PORT/api/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"owner@jasmarta.app","password":"password"}' | python3 -c 'import sys,json; print(json.load(sys.stdin)["token"])')
echo "  JWT issued for owner@jasmarta.app: ${TOKEN:0:28}…"
echo "  /api/properties -> $(curl -s "http://localhost:$API_PORT/api/properties" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(len(d), "listings:", ", ".join(p["title"] for p in d))')"
echo "  /api/admin/dashboard -> $(curl -s "http://localhost:$API_PORT/api/admin/dashboard" -H "Authorization: Bearer $TOKEN" | head -c 120)"

if [ "${1:-capture}" = "boot" ]; then
  log "stack is up — API :$API_PORT · web :$WEB_PORT (Ctrl-C / pkill to stop)"
  exit 0
fi

# ---------- 6 · live screenshots ----------
log "capturing live screenshots"
python3 "$ROOT/live/capture.py"

log "stopping servers"
pkill -f "[n]ode src/server.js" 2>/dev/null || true   # bracket stops pkill matching itself
pkill -f "[v]ite --port $WEB_PORT" 2>/dev/null || true
sleep 1
echo "done — screenshots in live/screens/"
