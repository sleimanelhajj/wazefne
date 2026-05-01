/**
 * Wazefne API - autocannon performance tests
 * Run: node perf-tests/autocannon-tests.mjs
 *
 * Requires: npm install autocannon  (run this once from the project root)
 * Requires: CLERK_TOKEN env var set to a valid Clerk session token
 */

import autocannon from "autocannon";
import { writeFileSync } from "fs";

const BASE_URL = process.env.API_URL || "http://localhost:3000";
const TOKEN = process.env.CLERK_TOKEN || "";
const DEV_COOKIE = process.env.CLERK_DEV_COOKIE || "";
const DURATION = parseInt(process.env.DURATION || "15", 10);
const CONNECTIONS = parseInt(process.env.CONNECTIONS || "10", 10);

if (!TOKEN) {
  console.error(
    "\n ERROR: CLERK_TOKEN env var is not set.\n" +
      " Get it from DevTools → Network → any /api request → Authorization header.\n" +
      " Then run:\n\n" +
      '   $env:CLERK_TOKEN="your_token"\n' +
      '   $env:CLERK_DEV_COOKIE="your___clerk_db_jwt_cookie_value"\n' +
      "   node perf-tests/autocannon-tests.mjs\n"
  );
  process.exit(1);
}

if (!DEV_COOKIE) {
  console.warn(
    "\n WARN: CLERK_DEV_COOKIE not set. Auth endpoints may return non-2xx in dev mode.\n" +
      " Get it from DevTools → Application → Cookies → localhost:4200 → __clerk_db_jwt\n"
  );
}

const endpoints = [
  {
    name: "Health (baseline — no auth, no DB)",
    url: "/api/health",
    auth: false,
  },
  {
    name: "Browse providers (3 DB queries: users + skills + favorites)",
    url: "/api/users",
    auth: true,
  },
  {
    name: "List open jobs",
    url: "/api/jobs",
    auth: true,
  },
  {
    name: "My profile (joins skills, languages, portfolio)",
    url: "/api/profile/me",
    auth: true,
  },
  {
    name: "My bookings",
    url: "/api/offers/my-bookings",
    auth: true,
  },
  {
    name: "Conversations list",
    url: "/api/messages/conversations",
    auth: true,
  },
  {
    name: "My favorites",
    url: "/api/favorites/users",
    auth: true,
  },
  {
    name: "CV analysis history",
    url: "/api/cv/my-analyses",
    auth: true,
  },
];

function runTest(ep) {
  return new Promise((resolve) => {
    const headers = {
      ...(ep.auth ? { Authorization: `Bearer ${TOKEN}` } : {}),
      ...(DEV_COOKIE ? { Cookie: `__clerk_db_jwt=${DEV_COOKIE}` } : {}),
    };

    const instance = autocannon(
      {
        url: BASE_URL,
        path: ep.url,
        connections: CONNECTIONS,
        duration: DURATION,
        headers,
      },
      (err, result) => {
        if (err) {
          resolve({ endpoint: ep.name, url: ep.url, error: err.message });
          return;
        }
        resolve({
          endpoint: ep.name,
          url: ep.url,
          requests_per_sec: result.requests.average,
          latency_avg_ms: result.latency.average,
          latency_p50_ms: result.latency.p50,
          latency_p95_ms: result.latency.p97_5,
          latency_p99_ms: result.latency.p99,
          latency_max_ms: result.latency.max,
          throughput_mb_per_sec: (result.throughput.average / 1024 / 1024).toFixed(2),
          errors: result.errors,
          non_2xx: result.non2xx,
          status_codes: result.statusCodeStats,
          duration_s: DURATION,
          connections: CONNECTIONS,
        });
      }
    );

    autocannon.track(instance, { renderProgressBar: true });
  });
}

const results = [];

for (const ep of endpoints) {
  console.log(`\n--- Testing: ${ep.name} ---`);
  const result = await runTest(ep);
  results.push(result);

  if (result.error) {
    console.log(`  FAILED: ${result.error}`);
  } else {
    const codes = Object.entries(result.status_codes || {})
      .map(([code, stat]) => `${code}: ${stat.count}`)
      .join(", ") || "none recorded";
    console.log(`  Requests/sec : ${result.requests_per_sec}`);
    console.log(`  Latency avg  : ${result.latency_avg_ms} ms`);
    console.log(`  Latency p95  : ${result.latency_p95_ms} ms`);
    console.log(`  Latency p99  : ${result.latency_p99_ms} ms`);
    console.log(`  Status codes : ${codes}`);
    console.log(`  Errors       : ${result.errors}`);
    console.log(`  Non-2xx      : ${result.non_2xx}`);
  }
}

// Save JSON results
writeFileSync("perf-tests/results.json", JSON.stringify(results, null, 2));
console.log("\n Results saved to perf-tests/results.json");

// Print summary table
console.log("\n=== SUMMARY ===");
console.log(
  "Endpoint".padEnd(55) +
    "Req/s".padStart(8) +
    "Avg(ms)".padStart(10) +
    "p95(ms)".padStart(10) +
    "p99(ms)".padStart(10) +
    "Errors".padStart(8)
);
console.log("-".repeat(101));

for (const r of results) {
  if (r.error) {
    console.log(r.endpoint.padEnd(55) + "FAILED".padStart(8));
  } else {
    console.log(
      r.endpoint.slice(0, 54).padEnd(55) +
        String(r.requests_per_sec).padStart(8) +
        String(r.latency_avg_ms).padStart(10) +
        String(r.latency_p95_ms).padStart(10) +
        String(r.latency_p99_ms).padStart(10) +
        String(r.errors).padStart(8)
    );
  }
}
