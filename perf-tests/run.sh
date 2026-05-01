#!/usr/bin/env bash
# Wazefne performance test runner
# Usage:
#   export CLERK_TOKEN="your_clerk_session_token"
#   bash perf-tests/run.sh

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PERF_DIR="$ROOT/perf-tests"

# ── Check token ─────────────────────────────────────────────────────────────
if [ -z "$CLERK_TOKEN" ]; then
  echo ""
  echo " ERROR: CLERK_TOKEN is not set."
  echo " Get it from: DevTools → Network → any /api request → Authorization header"
  echo ""
  echo " Then run:"
  echo "   export CLERK_TOKEN=your_token"
  echo "   bash perf-tests/run.sh"
  echo ""
  exit 1
fi

# ── Install tools if missing ─────────────────────────────────────────────────
if ! command -v autocannon &>/dev/null; then
  echo "Installing autocannon..."
  npm install -g autocannon
fi

if ! command -v artillery &>/dev/null; then
  echo "Installing artillery..."
  npm install -g artillery
fi

echo ""
echo "======================================"
echo "  Wazefne API Performance Tests"
echo "  Target: ${API_URL:-http://localhost:3000}"
echo "======================================"

# ── Step 1: autocannon per-endpoint benchmarks ───────────────────────────────
echo ""
echo "[1/2] Running autocannon endpoint benchmarks..."
node "$PERF_DIR/autocannon-tests.mjs"

# ── Step 2: Artillery load test with HTML report ─────────────────────────────
echo ""
echo "[2/2] Running Artillery load test..."

REPORT_JSON="$PERF_DIR/artillery-report.json"
REPORT_HTML="$PERF_DIR/artillery-report.html"

CLERK_TOKEN="$CLERK_TOKEN" artillery run "$PERF_DIR/artillery.yml" --output "$REPORT_JSON"
artillery report "$REPORT_JSON" --output "$REPORT_HTML"

echo ""
echo "======================================"
echo "  Done!"
echo ""
echo "  autocannon results : perf-tests/results.json"
echo "  Artillery HTML     : perf-tests/artillery-report.html"
echo "======================================"
echo ""
echo " Open the HTML report:"
echo "   start perf-tests/artillery-report.html   (Windows)"
echo "   open  perf-tests/artillery-report.html   (Mac)"
